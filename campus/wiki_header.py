"""Static (script-free) v2 header for the WordPress Legal Wiki — header standard v2 (21 Oct 2026, Sion's Tab agent).
The WordPress.com bar is the blank top bar there, so this block starts with the locations bar.
Prints the block that goes in the archivist theme's `header` and `home-header` template parts (a wp:html block).
Order and names come from campus/site_chain.json, so the wiki's ‹ › match every other site."""
import json, os, html
HERE = os.path.dirname(os.path.abspath(__file__))
F = "https://bucklerfamily.estate/brand/flags/"
def block(site_id="wiki", accent="#0F9DF0"):
    C = json.load(open(os.path.join(HERE, "site_chain.json"), encoding="utf-8"))["sites"]
    k = [c["id"] for c in C].index(site_id); n = len(C); pv, me, nx = C[(k - 1) % n], C[k], C[(k + 1) % n]
    def flag(f, w=20, h=12): return f'<img src="{F}{f}.svg" alt="" width="{w}" height="{h}" style="width:{w}px;height:{h}px;display:inline-block;vertical-align:middle;margin:0 1px;border:0;box-shadow:0 0 0 1px rgba(255,255,255,.3)">'
    robot = f'<img src="{F}robot-light.svg" alt="" width="17" height="17" style="width:17px;height:17px;display:inline-block;vertical-align:middle;margin:0 1px;border:0">'
    loc = 'flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:48px;padding:6px 3px;color:#cfcfcf;text-decoration:none;text-align:center;font-size:10.5px;letter-spacing:.12em;line-height:1.15;text-transform:uppercase;font-weight:500'
    ic = 'display:inline-flex;gap:3px;align-items:center;height:17px'
    locs = "".join(f'<a href="https://bucklerfamily.estate/{p}/" style="{loc}"><span style="{ic}">{i}</span><span>{t}</span></a>' for p, i, t in
                   [("wales", flag("wales") + flag("uk"), "Wales"), ("patagonia", flag("wales") + flag("argentina"), "Patagonia"), ("cyberspace", robot, "AI")])
    tr = lambda l: f"https://greathousefarmwiki-wordpress-com.translate.goog/?_x_tr_sl=en&amp;_x_tr_tl={l}&amp;_x_tr_hl=en"
    opt = 'display:block;padding:9px 12px;color:#fff;text-decoration:none;font-size:13px;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,.1)'
    lang = ('<details style="position:relative;flex:0 0 auto;margin:0 4px 0 2px">'
            '<summary style="cursor:pointer;display:flex;align-items:center;gap:4px;height:32px;padding:0 9px;border:1px solid rgba(255,255,255,.4);border-radius:4px;color:#fff;font-size:12px;letter-spacing:.06em">EN <span aria-hidden="true">▾</span></summary>'
            '<div style="position:absolute;right:0;top:36px;z-index:99;min-width:150px;background:#111;border:1px solid rgba(255,255,255,.25);border-radius:6px;overflow:hidden">'
            f'<a href="https://greathousefarmwiki.wordpress.com/" style="{opt}" aria-current="page">English ✓</a>'
            f'<a href="{tr("cy")}" style="{opt}" rel="nofollow">Cymraeg (machine translation)</a>'
            f'<a href="{tr("es")}" style="{opt}" rel="nofollow">Español (traducción automática)</a></div></details>')
    arr = 'flex:0 0 44px;display:flex;align-items:center;justify-content:center;min-height:52px;color:#fff;text-decoration:none;font-size:34px;font-weight:300;line-height:1'
    e = html.escape
    out = (f'<div class="ghf-estate-bar ghf-v2-static" style="margin:0;padding:0;background:#000;color:#fff;font-family:Barlow,\'Helvetica Neue\',Arial,sans-serif;font-size:12px;line-height:1.2">'
           f'<div role="navigation" aria-label="Location" style="display:flex;align-items:center;gap:4px;padding:0 4px 0 2px;border-bottom:1px solid rgba(255,255,255,.14)">{locs}{lang}</div>'
           f'<div role="navigation" aria-label="{e(me["t"])}" style="display:flex;align-items:center;gap:2px;padding:0 4px;background:#000;border-bottom:1px solid {accent};text-align:center">'
           f'<a href="{pv["u"]}" title="Previous site: {e(pv["t"])}" aria-label="Previous site: {e(pv["t"])}" style="{arr}">‹</a>'
           f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:4px 2px">'
           f'<div style="font-weight:500;font-size:15px;letter-spacing:.08em;text-transform:uppercase;line-height:1.15">{e(me["t"])}</div>'
           f'<div style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:{accent};margin-top:3px">{k + 1} of {n}</div></div>'
           f'<a href="{nx["u"]}" title="Next site: {e(nx["t"])}" aria-label="Next site: {e(nx["t"])}" style="{arr}">›</a></div></div>')
    return "<!-- wp:html -->\n" + out + "\n<!-- /wp:html -->"
if __name__ == "__main__":
    print(block())
