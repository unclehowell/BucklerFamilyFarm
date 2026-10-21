"""Static (script-free) v2 header for the WordPress Legal Wiki — header standard v2 (21 Oct 2026, Sion's Tab agent).
The WordPress.com bar is the blank top bar there, so this block starts with the locations bar.
Prints the block that goes in the archivist theme's `header` and `home-header` template parts (a wp:html block).
Order and names come from campus/site_chain.json, so the wiki's ‹ › match every other site."""
import json, os, html, re
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

# ---------- v2.1.0 hybrid theme (21 Oct 2026, Sion's Tab agent) ----------
# Sion, 12:01 21 Oct: "wordpress wiki needs a full screen toggle in top left and burger menu icon in top right (so no more
# menu under search bar)". The free WordPress.com plan runs no scripts and no custom CSS, so both controls are plain
# <details> elements with inline styles:
#   * top left, ⛶ = full screen: a <details open> whose content is the WALES | PATAGONIA | AI bar; tapping ⛶ folds that bar
#     (and the language menu) away, leaving one slim bar; tapping again brings it back. Its <summary> sits absolutely in the
#     left slot of the ‹ › bar (bottom:0 of the wrapper), so it stays put whether the bar above is open or folded.
#   * top right, ☰ = the wiki's whole menu (the same links that sat under the search bar), dropping down at the right in the
#     estate's black Starlink style.
MENU_A = "display:block;padding:12px 18px;color:#fff;text-decoration:none;font-size:15px;line-height:1.3;letter-spacing:.02em;border-bottom:1px solid rgba(255,255,255,.1)"
MENU_SUM = "cursor:pointer;display:block;padding:13px 18px;color:#fff;font-size:12.5px;line-height:1.3;letter-spacing:.12em;text-transform:uppercase;font-weight:500;border-bottom:1px solid rgba(255,255,255,.14)"
MENU_SUB = "cursor:pointer;display:block;padding:11px 18px 11px 30px;color:#cfcfcf;font-size:12px;line-height:1.3;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)"
def style_menu(panel):
    """Inline Starlink styles for the wiki's menu panel (classes alone are unstyled on the free plan)."""
    p = panel
    p = p.replace('<div class="ghf-mobile-menu__panel">', '<div class="ghf-mobile-menu__panel" style="margin:0;padding:0">', 1)
    p = p.replace('<div class="ghf-mobile-menu__plain">', '<div class="ghf-mobile-menu__plain" style="margin:0;padding:0;border-bottom:1px solid rgba(255,255,255,.25)">')
    p = p.replace('<div class="ghf-mobile-menu__children ghf-mobile-menu__nested">', '<div class="ghf-mobile-menu__children ghf-mobile-menu__nested" style="margin:0;padding:0 0 0 12px;background:#141414">')
    p = p.replace('<div class="ghf-mobile-menu__children">', '<div class="ghf-mobile-menu__children" style="margin:0;padding:0 0 0 12px;background:#0b0b0b">')
    p = p.replace('<details class="ghf-mobile-menu__section">', '<details class="ghf-mobile-menu__section" style="margin:0">')
    p = p.replace('<details class="ghf-mobile-menu__subsection">', '<details class="ghf-mobile-menu__subsection" style="margin:0">')
    # summaries: sections vs subsections (a subsection summary follows its own <details ... subsection ...> tag)
    p = re.sub(r'(<details class="ghf-mobile-menu__subsection" style="margin:0">)<summary>', lambda m: m.group(1) + f'<summary style="{MENU_SUB}">', p)
    p = re.sub(r'(<details class="ghf-mobile-menu__section" style="margin:0">)<summary>', lambda m: m.group(1) + f'<summary style="{MENU_SUM}">', p)
    p = re.sub(r'<a href="', f'<a style="{MENU_A}" href="', p)
    return p
def block_v3(menu_panel, site_id="wiki", accent="#0F9DF0"):
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
            '<summary style="cursor:pointer;display:flex;align-items:center;gap:4px;height:32px;padding:0 9px;border:1px solid rgba(255,255,255,.4);border-radius:0;color:#fff;font-size:12px;letter-spacing:.06em">EN <span aria-hidden="true">▾</span></summary>'
            '<div style="position:absolute;right:0;top:36px;z-index:1001;min-width:150px;background:#111;border:1px solid rgba(255,255,255,.25);border-radius:0;overflow:hidden">'
            f'<a href="https://greathousefarmwiki.wordpress.com/" style="{opt}" aria-current="page">English ✓</a>'
            f'<a href="{tr("cy")}" style="{opt}" rel="nofollow">Cymraeg (machine translation)</a>'
            f'<a href="{tr("es")}" style="{opt}" rel="nofollow">Español (traducción automática)</a></div></details>')
    arr = 'flex:0 0 40px;display:flex;align-items:center;justify-content:center;min-height:52px;color:#fff;text-decoration:none;font-size:34px;font-weight:300;line-height:1'
    btn = 'display:flex;align-items:center;justify-content:center;width:44px;height:52px;cursor:pointer;color:#fff;font-size:22px;line-height:1'
    e = html.escape
    fs = (f'<details open style="margin:0;padding:0">'
          f'<summary title="Full screen: fold the bars away (tap again to bring them back)" aria-label="Full screen: fold the bars away" style="position:absolute;left:0;bottom:0;z-index:3;{btn}"><span aria-hidden="true">⛶</span></summary>'
          f'<div role="navigation" aria-label="Location" style="display:flex;align-items:center;gap:4px;padding:0 4px 0 2px;border-bottom:1px solid rgba(255,255,255,.14)">{locs}{lang}</div></details>')
    burger = (f'<details style="flex:0 0 44px;margin:0;padding:0">'
              f'<summary title="Menu" aria-label="Menu" style="{btn};font-size:24px"><span aria-hidden="true">☰</span></summary>'
              f'<div style="position:absolute;right:0;top:100%;z-index:1000;width:min(88vw,380px);background:#000;color:#fff;border-left:1px solid {accent};border-bottom:1px solid {accent};text-align:left">'
              f'{style_menu(menu_panel)}</div></details>')
    out = (f'<div class="ghf-estate-bar ghf-v2-static ghf-v21" style="position:relative;z-index:50;margin:0;padding:0;background:#000;color:#fff;font-family:Barlow,\'Helvetica Neue\',Arial,sans-serif;font-size:12px;line-height:1.2">'
           f'{fs}'
           f'<div role="navigation" aria-label="{e(me["t"])}" style="display:flex;align-items:center;gap:2px;padding:0 0 0 44px;background:#000;border-bottom:1px solid {accent};text-align:center">'
           f'<a href="{pv["u"]}" title="Previous site: {e(pv["t"])}" aria-label="Previous site: {e(pv["t"])}" style="{arr}">‹</a>'
           f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:4px 2px">'
           f'<div style="font-weight:500;font-size:15px;letter-spacing:.08em;text-transform:uppercase;line-height:1.15">{e(me["t"])}</div>'
           f'<div style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:{accent};margin-top:3px">{k + 1} of {n}</div></div>'
           f'<a href="{nx["u"]}" title="Next site: {e(nx["t"])}" aria-label="Next site: {e(nx["t"])}" style="{arr}">›</a>'
           f'{burger}</div></div>')
    return "<!-- wp:html -->\n" + out + "\n<!-- /wp:html -->"
def rebuild_part(raw):
    """Template part (header / home-header) → v2.1.0: new bars block with ⛶ and ☰, no menu under the search bar."""
    a = raw.find('<details class="ghf-mobile-menu">'); assert a > 0, "menu not found"
    p0 = raw.find('<div class="ghf-mobile-menu__panel">', a); p1 = raw.find('</details>\n<!-- /wp:html -->', p0)
    panel = raw[p0:p1]
    # 1. the bars block (first wp:html) → v3
    b0 = raw.find("<!-- wp:html -->"); b1 = raw.find("<!-- /wp:html -->", b0) + len("<!-- /wp:html -->")
    assert b0 == 0 or raw[:b0].strip() == "", "bars block is not first"
    out = block_v3(panel) + raw[b1:]
    # 2. drop the desktop navigation block and the mobile menu block from the search row
    out = re.sub(r'<!-- wp:navigation \{"ref":4,[^\n]*?/-->\n?', "", out, count=1)
    m0 = out.find('<!-- wp:html {"metadata":{"blockVisibility":{"viewport":{"desktop":false,"tablet":true,"mobile":true}}}} -->')
    if m0 > 0:
        m1 = out.find("<!-- /wp:html -->", m0) + len("<!-- /wp:html -->")
        assert '<details class="ghf-mobile-menu">' in out[m0:m1]
        out = out[:m0] + out[m1:].lstrip("\n")
    # 3. the search row: black, sharp
    out = out.replace('style="background-color:rgba(255,255,255,0.82);padding-top:6px;padding-bottom:6px;padding-left:8px;padding-right:8px"',
                      'style="background-color:#000000;padding-top:8px;padding-bottom:8px;padding-left:10px;padding-right:10px"')
    out = out.replace('<!-- wp:group {"className":"ghf-mobile-controls"} -->', '<!-- wp:group {"className":"ghf-mobile-controls","style":{"color":{"background":"#000000"},"spacing":{"padding":{"top":"8px","bottom":"8px","left":"10px","right":"10px"}}}} -->')
    out = out.replace('"isSearchFieldHidden":false,"style":{"spacing":{"margin":{"top":"0","bottom":"0","left":"0","right":"0"}}}} /-->',
                      '"isSearchFieldHidden":false,"style":{"spacing":{"margin":{"top":"0","bottom":"0","left":"0","right":"0"}},"border":{"radius":"0px"},"color":{"background":"#ffffff","text":"#000000"}}} /-->')
    # 4. page title: Starlink-style thin uppercase
    out = out.replace('<!-- wp:post-title {"level":1,"isLink":false,"fontSize":"x-large"} /-->',
                      '<!-- wp:post-title {"level":1,"isLink":false,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.05em","fontWeight":"300"}},"fontSize":"x-large"} /-->')
    return out

if __name__ == "__main__":
    print(block())
