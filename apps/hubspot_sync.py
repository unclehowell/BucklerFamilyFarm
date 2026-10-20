#!/usr/bin/env python3
"""Log app.bucklerfamily.estate leads into HubSpot (contact + deal in the "Apps leads" pipeline).
The Worker can't hold a HubSpot token (the connected HubSpot app's credential stays with the connection provider), so this
runs on Tab's box: it reads new paid enquiries and new subscribers from D1 (cedwyn-apps) through the connected Cloudflare
app's REST API, finds or creates the HubSpot contact by email (duplicate check), creates one deal per enquiry/subscriber
(duplicate check by deal name), then marks the D1 row hubspot=1. Paces every call 5 s and backs off on 429.
Run inside a Tab task (TAB_TASK_ID set): python3 work/apps/hubspot_sync.py [--include-test] [--dry-run]
— Sion's Tab agent, 20 Oct 2026"""
import json, os, subprocess, sys, time, tempfile, secrets, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(os.path.join(HERE, "config.json"), encoding="utf-8"))
ACC = "42a4a8d7bfb96321118ada213638d050"; DB = CFG["d1"]; HS = CFG["hubspot"]
TEST = "--include-test" in sys.argv; DRY = "--dry-run" in sys.argv
_last = [0.0]
def call(toolkit, method, url, query=None, body=None, pace=5):
    for attempt in range(5):
        w = pace - (time.time() - _last[0])
        if w > 0: time.sleep(w)
        r = {"toolkit": toolkit, "method": method, "url": url, "headers": {"X-Tab-Nonce": secrets.token_hex(6)}}
        if query: r["query"] = query
        if body is not None: r["body"] = body
        d = f"/home/user/tab/tasks/{os.environ.get('TAB_TASK_ID', '')}/rq"; os.makedirs(d, exist_ok=True)
        with tempfile.NamedTemporaryFile("w", suffix=".json", dir=d, delete=False) as f: json.dump(r, f); p = f.name
        try: out = subprocess.run(["timeout", "-k", "5", "120", "node", "/home/user/tab/connected-apps-cli.mjs", "connected_apps.request", p], capture_output=True, text=True)
        finally: os.remove(p); _last[0] = time.time()
        try: res = json.loads(out.stdout); res = res.get("result", res)
        except Exception: time.sleep(10 * (attempt + 1)); continue
        st = res.get("status")
        if st == 429 or st is None or (isinstance(st, int) and st >= 500): time.sleep(15 * (attempt + 1)); continue
        b = res.get("body") if "body" in res else res.get("body_head")
        if isinstance(b, str):
            try: b = json.loads(b)
            except Exception: pass
        return st, b
    raise SystemExit(f"gave up on {method} {url}")
def d1(sql, params=None):
    body = {"sql": sql}
    if params is not None: body["params"] = params
    st, b = call("cloudflare", "POST", f"https://api.cloudflare.com/client/v4/accounts/{ACC}/d1/database/{DB}/query", body=body, pace=2)
    if not b.get("success", True) or not b.get("result"): raise SystemExit(f"D1 error: {str(b.get('errors'))[:300]}")
    return b["result"][0]["results"]
def contact(email, name, phone):
    st, b = call("hubspot", "POST", "/crm/v3/objects/contacts/search", body={"filterGroups": [{"filters": [{"propertyName": "email", "operator": "EQ", "value": email}]}], "limit": 1})
    if st == 200 and b.get("results"): return b["results"][0]["id"], False
    first, _, last = (name or "").partition(" ")
    props = {"email": email, "firstname": first[:40], "lastname": last[:60], "lifecyclestage": "lead", "hs_lead_status": "NEW"}
    if phone: props["phone"] = phone[:30]
    st, b = call("hubspot", "POST", "/crm/v3/objects/contacts", body={"properties": props})
    if st == 409:  # created meanwhile
        st, b = call("hubspot", "POST", "/crm/v3/objects/contacts/search", body={"filterGroups": [{"filters": [{"propertyName": "email", "operator": "EQ", "value": email}]}], "limit": 1})
        return b["results"][0]["id"], False
    if st not in (200, 201):
        props.pop("hs_lead_status", None)
        st, b = call("hubspot", "POST", "/crm/v3/objects/contacts", body={"properties": props})
    if st not in (200, 201): raise SystemExit(f"contact create {st} {str(b)[:300]}")
    return b["id"], True
def deal(name, amount, stage, cid, note):
    st, b = call("hubspot", "POST", "/crm/v3/objects/deals/search", body={"filterGroups": [{"filters": [{"propertyName": "dealname", "operator": "EQ", "value": name}]}], "limit": 1})
    if st == 200 and b.get("results"): return b["results"][0]["id"], False
    props = {"dealname": name, "pipeline": HS["pipeline"], "dealstage": stage, "amount": str(amount), "description": note[:5000]}
    body = {"properties": props, "associations": [{"to": {"id": cid}, "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 3}]}]}
    st, b = call("hubspot", "POST", "/crm/v3/objects/deals", body=body)
    if st not in (200, 201): raise SystemExit(f"deal create {st} {str(b)[:300]}")
    return b["id"], True
out = []
tq = "" if TEST else " AND test=0"
for e in d1("SELECT id,ref,contact_name,contact_email,contact_phone,parcel,title_no,status,grade,score,score_notes,session_id,test FROM enquiries WHERE status IN ('paid_claimed','paid_verified') AND hubspot=0" + tq):
    name = f"{'[TEST] ' if e['test'] else ''}Live search {e['ref']} · {e['parcel'][:60]}"
    note = f"Paid live search ({e['status']}). Lead score {e['score']}/100 grade {e['grade']}: {e['score_notes']}. Title {e['title_no'] or '-'}. Stripe session {e['session_id']}. Source: app.bucklerfamily.estate"
    if DRY: out.append(("dry", name)); continue
    cid, cnew = contact(e["contact_email"], e["contact_name"], e["contact_phone"])
    did, dnew = deal(name, CFG["search_price_pence"] / 100, HS["stages"]["paid"], cid, note)
    d1("UPDATE enquiries SET hubspot=1 WHERE id=?", [e["id"]])
    out.append({"enquiry": e["ref"], "contact": cid, "contact_new": cnew, "deal": did, "deal_new": dnew})
for u in d1("SELECT id,name,email,parcel,location,sub_status,sub_session,test FROM users WHERE sub_status IN ('claimed','active') AND hubspot_sub=0" + tq):
    name = f"{'[TEST] ' if u['test'] else ''}Case Agent subscriber u{u['id']} · {u['parcel'][:60]}"
    note = f"Case Agent £49.99/month ({u['sub_status']}). Parcel {u['parcel']}, {u['location']}. Stripe session {u['sub_session']}. Onboard by email. Source: app.bucklerfamily.estate"
    if DRY: out.append(("dry", name)); continue
    cid, cnew = contact(u["email"], u["name"], "")
    did, dnew = deal(name, CFG["sub_price_pence"] / 100, HS["stages"]["sub_onboarding"], cid, note)
    d1("UPDATE users SET hubspot_sub=1 WHERE id=?", [u["id"]])
    out.append({"subscriber": u["id"], "contact": cid, "contact_new": cnew, "deal": did, "deal_new": dnew})
print(json.dumps({"at": datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z", "synced": out}))
