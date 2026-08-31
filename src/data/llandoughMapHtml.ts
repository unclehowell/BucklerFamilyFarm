export const LLANDOUGH_INTERACTIVE_MAP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Llandough — Reconstructing a Place, 1106–Present</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
<style>
:root{
  --ink:#151b26;
  --ink-2:#1e2636;
  --ink-3:#293347;
  --line:#3a4459;
  --parchment:#e9e2d0;
  --parchment-dim:#cfc6ac;
  --brass:#b98a44;
  --brass-bright:#d9a95c;
  --teal:#3e7b7f;
  --teal-bright:#5fa3a7;
  --rose:#a85263;
  --moss:#6f8c52;
  --violet:#7b6ba8;
  --ok:#6f9a63;
  --warn:#c98a3a;
  --danger:#b0524f;
  --text-hi:#f2ecdd;
  --text-lo:#a9b0c2;
  --radius:3px;
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;height:100%;background:var(--ink);color:var(--text-hi);font-family:'Inter',sans-serif;}
body{display:flex;flex-direction:column;height:100vh;overflow:hidden;}
::-webkit-scrollbar{width:9px;height:9px;}
::-webkit-scrollbar-track{background:var(--ink-2);}
::-webkit-scrollbar-thumb{background:var(--line);border-radius:5px;}

/* ---------- Header ---------- */
header{
  background:linear-gradient(180deg,var(--ink-2),var(--ink));
  border-bottom:1px solid var(--line);
  padding:10px 18px 12px;
  flex-shrink:0;
}
.title-row{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px 18px;}
h1{
  font-family:'Spectral',serif;
  font-weight:600;
  font-size:1.32rem;
  margin:0;
  letter-spacing:0.2px;
  color:var(--text-hi);
}
h1 em{color:var(--brass-bright);font-style:italic;font-weight:500;}
.subtitle{font-size:0.78rem;color:var(--text-lo);font-family:'IBM Plex Mono',monospace;}
.header-actions{display:flex;gap:8px;flex-wrap:wrap;}
.pillbtn{
  background:var(--ink-3);border:1px solid var(--line);color:var(--text-hi);
  font-family:'Inter',sans-serif;font-size:0.72rem;font-weight:600;
  padding:6px 11px;border-radius:14px;cursor:pointer;transition:background .15s,border-color .15s;
}
.pillbtn:hover{background:var(--line);}
.pillbtn.active{background:var(--brass);color:var(--ink);border-color:var(--brass-bright);}

/* Time slider */
.timeline-wrap{margin-top:12px;}
.timeline-labels{
  display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;
  font-size:0.62rem;color:var(--text-lo);margin-bottom:3px;padding:0 2px;
}
.timeline-labels span{cursor:pointer;padding:2px 3px;border-radius:2px;white-space:nowrap;}
.timeline-labels span.current{color:var(--ink);background:var(--brass-bright);font-weight:700;}
input[type=range]{
  width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:4px;
  background:linear-gradient(90deg,var(--teal),var(--brass) 60%,var(--rose));
  outline:none;
}
input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;
  background:var(--parchment);border:3px solid var(--ink);cursor:pointer;box-shadow:0 0 0 1px var(--brass-bright);
}
.now-badge{
  font-family:'Spectral',serif;font-weight:700;font-size:1rem;color:var(--brass-bright);
  text-align:center;margin-top:5px;
}
.now-badge small{display:block;font-family:'IBM Plex Mono',monospace;font-weight:400;font-size:0.62rem;color:var(--text-lo);margin-top:1px;}

/* ---------- Body layout ---------- */
.app{flex:1;display:flex;min-height:0;}
.sidebar{
  width:290px;flex-shrink:0;background:var(--ink-2);border-right:1px solid var(--line);
  overflow-y:auto;padding:14px;font-size:0.79rem;
}
.sidebar h2{
  font-family:'Spectral',serif;font-size:0.86rem;font-weight:600;margin:0 0 8px;color:var(--brass-bright);
  border-bottom:1px solid var(--line);padding-bottom:5px;
}
.layer-group{margin-bottom:16px;}
.layer-row{display:flex;align-items:center;gap:7px;padding:3px 0;color:var(--text-hi);}
.layer-row label{flex:1;cursor:pointer;font-size:0.76rem;line-height:1.25;}
.layer-row input[type=checkbox]{accent-color:var(--brass);width:14px;height:14px;flex-shrink:0;cursor:pointer;}
.swatch{width:11px;height:11px;border-radius:2px;flex-shrink:0;}
.opacity-row{display:flex;align-items:center;gap:6px;margin:8px 0 2px;}
.opacity-row input{flex:1;height:3px;}
.opacity-row span{font-family:'IBM Plex Mono',monospace;font-size:0.62rem;color:var(--text-lo);width:28px;}

.confidence-switch{display:flex;gap:4px;margin-bottom:14px;}
.confidence-switch button{
  flex:1;background:var(--ink-3);border:1px solid var(--line);color:var(--text-lo);
  font-size:0.65rem;font-family:'Inter',sans-serif;font-weight:600;padding:6px 2px;border-radius:3px;cursor:pointer;
}
.confidence-switch button.on{background:var(--teal);color:var(--text-hi);border-color:var(--teal-bright);}

.res-row{display:flex;gap:4px;margin-bottom:14px;}
.res-row button{flex:1;background:var(--ink-3);border:1px solid var(--line);color:var(--text-lo);font-family:'IBM Plex Mono',monospace;font-size:0.68rem;padding:5px 0;border-radius:3px;cursor:pointer;}
.res-row button.on{background:var(--brass);color:var(--ink);font-weight:700;border-color:var(--brass-bright);}

.legend-note{font-size:0.68rem;color:var(--text-lo);line-height:1.45;margin-top:4px;font-style:italic;}

/* Map */
.map-wrap{flex:1;position:relative;min-width:0;}
#map{width:100%;height:100%;background:#0c0f16;}
.leaflet-popup-content-wrapper{background:var(--parchment);color:#26201a;border-radius:4px;}
.leaflet-popup-tip{background:var(--parchment);}
.map-caption{
  position:absolute;left:10px;bottom:10px;background:rgba(18,23,33,0.96);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  border:1px solid #3a4459;border-radius:6px;font-family:'IBM Plex Mono',monospace;
  color:#c8cfde;width:calc(100% - 20px);max-width:380px;z-index:500;
  box-shadow:0 4px 18px rgba(0,0,0,0.65);transition:all .2s ease;
}
.map-caption.hidden{display:none !important;}
.map-caption-header{
  display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 8px;
  background:#131822;border-bottom:1px solid #2a3344;border-radius:5px 5px 0 0;user-select:none;
}
.map-caption-header-left{display:flex;align-items:center;gap:6px;min-width:0;cursor:pointer;flex:1;}
.map-caption-yr{
  background:#293347;color:#d9a95c;border:1px solid #3a4459;font-weight:700;
  font-size:0.64rem;padding:1px 5px;border-radius:3px;flex-shrink:0;
}
.map-caption-title{
  font-size:0.62rem;color:#f2ecdd;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.map-caption-btns{display:flex;align-items:center;gap:4px;flex-shrink:0;}
.map-caption-btn{
  background:#1e2636;border:1px solid #3a4459;color:#a9b0c2;padding:2px 6px;
  font-size:0.58rem;font-family:'IBM Plex Mono',monospace;border-radius:3px;cursor:pointer;
  display:inline-flex;align-items:center;gap:3px;line-height:1.2;
}
.map-caption-btn:hover{background:#2a364d;color:#f2ecdd;border-color:#5fa3a7;}
.map-caption-body{
  padding:6px 8px 8px;font-size:0.58rem;line-height:1.38;color:#c8cfde;
  max-height:145px;overflow-y:auto;word-break:break-word;
}
.map-caption.collapsed .map-caption-body{display:none;}
.map-caption.collapsed .map-caption-header{border-bottom:none;border-radius:5px;}
.map-caption-reopen{
  display:none;position:absolute;left:10px;bottom:10px;z-index:500;
  background:rgba(18,23,33,0.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  border:1px solid #5fa3a7;color:#f2ecdd;font-family:'IBM Plex Mono',monospace;font-size:0.62rem;
  padding:4px 8px;border-radius:4px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,0.5);
  align-items:center;gap:5px;
}
.map-caption-reopen:hover{background:#222c3e;border-color:#d9a95c;}
.map-caption-reopen.show{display:inline-flex;}
@media (max-width:860px){
  .map-caption{max-width:none;right:10px;width:auto;}
  .map-caption-body{max-height:120px;}
}

/* Right info panel */
.info-panel{
  width:340px;flex-shrink:0;background:var(--ink-2);border-left:1px solid var(--line);
  overflow-y:auto;padding:0;display:flex;flex-direction:column;
}
.tabbar{display:flex;border-bottom:1px solid var(--line);flex-shrink:0;}
.tabbar button{
  flex:1;background:var(--ink-2);border:none;color:var(--text-lo);padding:10px 4px;font-family:'Inter',sans-serif;
  font-size:0.68rem;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;
}
.tabbar button.on{color:var(--brass-bright);border-bottom-color:var(--brass-bright);}
.tab-content{padding:14px;flex:1;overflow-y:auto;font-size:0.8rem;line-height:1.5;}
.tab-content h3{font-family:'Spectral',serif;font-size:1rem;margin:0 0 4px;color:var(--text-hi);}
.tab-content .kicker{font-family:'IBM Plex Mono',monospace;font-size:0.64rem;color:var(--brass-bright);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.field{margin-bottom:9px;}
.field .k{font-size:0.63rem;color:var(--text-lo);text-transform:uppercase;letter-spacing:0.4px;font-family:'IBM Plex Mono',monospace;}
.field .v{font-size:0.82rem;color:var(--text-hi);margin-top:1px;}
.chip{
  display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:0.62rem;font-weight:600;
  padding:2px 7px;border-radius:10px;margin:2px 4px 2px 0;
}
.chip.PRIMARY_SURVEY{background:#274d3a;color:#a8e0bf;}
.chip.HISTORICAL_MAP{background:#2a4a5c;color:#a9d4e8;}
.chip.DOCUMENTARY_LOCATION{background:#4a3f22;color:#e8c988;}
.chip.RECONSTRUCTED{background:#4a2f38;color:#e8a4b9;}
.chip.APPROXIMATE{background:#3f3a22;color:#dfd08a;}
.chip.HYPOTHESIS{background:#3a2740;color:#d3a4e8;}
.confbar{height:5px;border-radius:3px;background:var(--ink-3);overflow:hidden;margin-top:3px;}
.confbar i{display:block;height:100%;}
.conf-high i{background:var(--ok);width:85%;}
.conf-med i{background:var(--warn);width:55%;}
.conf-low i{background:var(--danger);width:25%;}
.acre-compare{background:var(--ink-3);border:1px solid var(--line);border-radius:4px;padding:8px 10px;margin-top:6px;font-family:'IBM Plex Mono',monospace;font-size:0.72rem;}
.acre-compare div{display:flex;justify-content:space-between;padding:1px 0;}
.acre-compare .diff{color:var(--warn);}
.src-box{background:var(--ink-3);border-left:3px solid var(--brass);padding:7px 9px;margin-top:6px;font-size:0.74rem;color:var(--text-lo);}
.placeholder{color:var(--text-lo);font-style:italic;font-size:0.8rem;padding:20px 4px;text-align:center;}

/* Evidence table */
.evtable{width:100%;border-collapse:collapse;font-size:0.68rem;}
.evtable th{
  background:var(--ink-3);color:var(--brass-bright);text-align:left;padding:5px 6px;position:sticky;top:0;
  font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:0.62rem;text-transform:uppercase;letter-spacing:0.3px;
}
.evtable td{padding:5px 6px;border-bottom:1px solid var(--line);vertical-align:top;color:var(--text-hi);}
.evtable tr:hover td{background:var(--ink-3);}
.evfilter{display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap;}
.evfilter input{flex:1;background:var(--ink-3);border:1px solid var(--line);color:var(--text-hi);padding:5px 8px;border-radius:3px;font-size:0.72rem;}

/* Lineage */
.lineage{display:flex;flex-direction:column;gap:0;}
.lineage-step{
  border:1px solid var(--line);border-left:4px solid var(--brass);background:var(--ink-3);
  padding:8px 10px;border-radius:3px;margin-bottom:2px;position:relative;
}
.lineage-step.hyp{border-left-color:var(--violet);}
.lineage-step .yr{font-family:'IBM Plex Mono',monospace;font-weight:700;color:var(--brass-bright);font-size:0.78rem;}
.lineage-step .desc{font-size:0.74rem;margin-top:2px;color:var(--text-hi);}
.lineage-arrow{text-align:center;color:var(--text-lo);font-size:0.9rem;margin:1px 0;}

.know-list{list-style:none;margin:0;padding:0;}
.know-list li{padding:6px 0 6px 20px;position:relative;font-size:0.78rem;border-bottom:1px solid var(--line);}
.know-list li:before{content:"✓";position:absolute;left:0;color:var(--ok);font-weight:700;}
.unproven-list li:before{content:"?";color:var(--warn);}

footer.credits{
  padding:6px 16px;background:var(--ink);border-top:1px solid var(--line);font-family:'IBM Plex Mono',monospace;
  font-size:0.6rem;color:var(--text-lo);flex-shrink:0;
}

/* ---------- Mobile drawer buttons (hidden on desktop) ---------- */
.drawer-toggle{display:none;}
.drawer-backdrop{display:none;}
.panel-close{display:none;}

@media (max-width:860px){
  header{padding:8px 12px 10px;}
  h1{font-size:1.06rem;}
  .subtitle{font-size:0.66rem;}
  .header-actions{display:none;} /* accessed via drawers instead, avoids header overflow */
  .drawer-toggle{
    display:inline-flex;align-items:center;gap:5px;background:var(--ink-3);border:1px solid var(--line);
    color:var(--text-hi);font-family:'Inter',sans-serif;font-size:0.72rem;font-weight:600;
    padding:7px 12px;border-radius:14px;cursor:pointer;
  }
  .drawer-toggle.active{background:var(--brass);color:var(--ink);border-color:var(--brass-bright);}
  .mobile-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;}

  .timeline-labels{overflow-x:auto;-webkit-overflow-scrolling:touch;justify-content:flex-start;gap:2px;padding-bottom:2px;}
  .timeline-labels span{flex-shrink:0;}
  input[type=range]::-webkit-slider-thumb{width:24px;height:24px;}
  .now-badge{font-size:0.9rem;}
  .now-badge small{font-size:0.66rem;}

  .app{position:relative;}
  .map-wrap{width:100%;}

  .sidebar,.info-panel{
    position:fixed;top:0;bottom:0;width:86vw;max-width:340px;z-index:1200;
    box-shadow:0 0 24px rgba(0,0,0,0.55);transition:transform .25s ease;padding-top:52px;
  }
  .sidebar{left:0;transform:translateX(-100%);}
  .info-panel{right:0;transform:translateX(100%);}
  .sidebar.open,.info-panel.open{transform:translateX(0);}

  .panel-close{
    display:block;position:absolute;top:8px;right:10px;background:var(--ink-3);border:1px solid var(--line);
    color:var(--text-hi);width:32px;height:32px;border-radius:16px;font-size:1rem;cursor:pointer;z-index:5;
  }
  .sidebar .panel-close{left:10px;right:auto;}

  .drawer-backdrop{
    display:none;position:fixed;inset:0;background:rgba(10,13,20,0.55);z-index:1100;
  }
  .drawer-backdrop.show{display:block;}

  footer.credits{font-size:0.55rem;padding:5px 10px;}
  .tabbar button{font-size:0.62rem;padding:9px 3px;}
}

@media (max-width:420px){
  h1{font-size:0.95rem;}
  .now-badge{font-size:0.82rem;}
}
</style>
</head>
<body>

<header>
  <div class="title-row">
    <div>
      <h1>Llandough <em>juxta Cardiff</em> — what the name has meant, 1106 → now</h1>
      <div class="subtitle">manor · parish · estate · farm, disentangled · H3 spatial index res <span id="resLabel">9</span></div>
    </div>
    <div class="header-actions">
      <button class="pillbtn" id="btnEvidence">Evidence table</button>
      <button class="pillbtn" id="btnKnow">What we know / don't</button>
      <button class="pillbtn" id="btnLineage">Cydfin → Great House lineage</button>
    </div>
  </div>
  <div class="mobile-actions">
    <button class="drawer-toggle" id="btnOpenLayers">☰ Layers &amp; filters</button>
    <button class="drawer-toggle" id="btnOpenInfo">ⓘ Selected / evidence / lineage</button>
  </div>
  <div class="timeline-wrap">
    <div class="timeline-labels" id="timelineLabels"></div>
    <input type="range" id="timeSlider" min="0" max="15" step="1" value="10">
    <div class="now-badge" id="nowBadge"></div>
  </div>
</header>

<div class="app">
  <div class="drawer-backdrop" id="drawerBackdrop"></div>
  <aside class="sidebar">
    <button class="panel-close" id="closeSidebar">✕</button>
    <h2>Confidence filter</h2>
    <div class="confidence-switch" id="confSwitch">
      <button data-c="all" class="on">All</button>
      <button data-c="evidence">Evidence only</button>
      <button data-c="reconstruction">+ Reconstruction</button>
      <button data-c="hypothesis">+ Hypothesis</button>
    </div>

    <h2>H3 resolution</h2>
    <div class="res-row" id="resRow">
      <button data-r="8">8 — coarse</button>
      <button data-r="9" class="on">9 — parcel</button>
      <button data-r="10">10 — fine</button>
    </div>

    <h2>Layers</h2>
    <div class="layer-group" id="layerList"></div>

    <h2>Opacity</h2>
    <div class="opacity-row"><span>H3</span><input type="range" id="opH3" min="0" max="100" value="35"></div>
    <div class="opacity-row"><span>Zones</span><input type="range" id="opZone" min="0" max="100" value="55"></div>

    <div class="legend-note">H3 hexagons are a common spatial index for comparing evidence across dates — they are <strong>not</strong> asserted historical boundaries. Shaded zones are illustrative extents built from named landmarks and documentary description, graded by confidence; see each feature's info panel for its geometry classification.</div>
  </aside>

  <div class="map-wrap">
    <div id="map"></div>
    <div class="map-caption" id="mapCaption">
      <div class="map-caption-header">
        <div class="map-caption-header-left" id="mapCaptionToggle" title="Click to collapse / expand note">
          <span class="map-caption-yr" id="mapCaptionYr">1793</span>
          <span class="map-caption-title" id="mapCaptionTitle">Milestone Note</span>
        </div>
        <div class="map-caption-btns">
          <button class="map-caption-btn" id="btnToggleCaption" title="Collapse/Expand Note">▾ Min</button>
          <button class="map-caption-btn" id="btnHideCaption" title="Hide Note overlay" style="color:#e8a4b9;">✕ Hide</button>
        </div>
      </div>
      <div class="map-caption-body" id="mapCaptionBody"></div>
    </div>
    <button class="map-caption-reopen" id="mapCaptionReopen" title="Show Milestone Note">
      <span style="color:#d9a95c;">📜</span> <span id="reopenLabel">Milestone Note</span> <span style="color:#5fa3a7;font-weight:700;">▴ Show</span>
    </button>
  </div>

  <aside class="info-panel">
    <button class="panel-close" id="closeInfo">✕</button>
    <div class="tabbar">
      <button class="tabbtn on" data-tab="info">Selected</button>
      <button class="tabbtn" data-tab="evidence">Evidence</button>
      <button class="tabbtn" data-tab="know">Know / Unproven</button>
      <button class="tabbtn" data-tab="lineage">Lineage</button>
    </div>
    <div class="tab-content" id="tabInfo">
      <div class="placeholder">Click a marker or shaded H3 zone on the map to see its full record — name, tenure, owner, occupier, documentary description, source, confidence and geometry classification.</div>
    </div>
    <div class="tab-content" id="tabEvidence" style="display:none;">
      <div class="evfilter"><input id="evSearch" placeholder="Filter evidence table…"></div>
      <div style="overflow:auto;max-height:70vh;">
        <table class="evtable" id="evTable"></table>
      </div>
    </div>
    <div class="tab-content" id="tabKnow" style="display:none;"></div>
    <div class="tab-content" id="tabLineage" style="display:none;"></div>
  </aside>
</div>

<footer class="credits">
  Basemap © OpenStreetMap contributors · H3 spatial indexing (Uber H3) · Reconstruction for research orientation only — not a legal record of title or boundary. Cross-check every claim against the Source field before relying on it.
</footer>

<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://cdn.jsdelivr.net/npm/h3-js@4.1.0/dist/h3-js.umd.js"></script>
<script>
if (typeof L === 'undefined' || typeof h3 === 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.innerHTML = '<div style="padding:40px 20px;color:#e8c988;font-family:IBM Plex Mono,monospace;font-size:0.85rem;line-height:1.6;">'
        + 'Map libraries failed to load from CDN (Leaflet and/or H3-js). This usually means the device has no internet access right now, '
        + 'or a network/ad-blocker is blocking cdn.jsdelivr.net. Reconnect and reload the page — this file makes no other network calls.</div>';
    }
  });
  throw new Error('Leaflet/H3-js failed to load — see on-page message.');
}
</script>
<script>
/* ============================================================================
   DATA LAYER
   Every entry below is either (a) sourced to a named published/archival
   reference discoverable via public search as of Aug 2026, or (b) explicitly
   marked as drawn from the research brief and NOT independently verified,
   with a suggested primary repository to check. Nothing here should be read
   as a verified boundary or a confirmed transcription of an original deed.
   ============================================================================ */

const YEARS = [
  {y:1106, label:'1106'},
  {y:1188, label:'c.1188'},
  {y:1275, label:'1275'},
  {y:1547, label:'1547'},
  {y:1552, label:'1552'},
  {y:1596, label:'1596'},
  {y:1618, label:'1618'},
  {y:1631, label:'1631'},
  {y:1719, label:'1719'},
  {y:1740, label:'1740'},
  {y:1793, label:'1793'},
  {y:1815, label:'1815'},
  {y:1824, label:'1824'},
  {y:1843, label:'1843'},
  {y:1882, label:'1882'},
  {y:2026, label:'modern'}
];

const CHRONICLE = {
1106:"Henry I confirms to Tewkesbury Abbey 'the little vill which is called Landochan' — the earliest documentary form of the name located for this project. The grant is generally attributed back to Robert FitzHamon's original endowment. This is a confirmation of a vill (a settlement/territorial unit), not a definition of a manor or parish in the later legal sense.",
1188:"No primary instrument for c.1188 was located via public search for this project. The brief flags this date; it is carried on the timeline as a placeholder pending archival verification (Cartae et Munimenta de Glamorgan / Tewkesbury cartulary material would be the place to check).",
1275:"Walter Thorgot grants William de Reigny a messuage 'in Landoch', described as lying on the south side of the church of St Doguin (Dochwy), near the cemetery — held of the Abbot of Tewkesbury. The Reigny family went on to buy up dozens of small holdings in Llandough and neighbouring parishes around this date, which is why the parish later carries so many small documentary fragments rather than one coherent estate history.",
1547:"The brief describes a Herbert–Vaughan instrument: a 1,000-year lease of a farm called Cydwin/Cydfin in the manor of Llandough. This project has not located or verified that instrument from public sources — it is carried here as an unverified claim from the research brief, flagged for archival confirmation (Glamorgan Archives / Cardiff University Bute Papers / NLW). Separately and independently verifiable: by 1543 the Crown had granted Llandough manor to Lord Clynton and Say and Robert Turwitt, and by 1545 Sir George Herbert held it (rent-roll evidence) — so a Herbert interest in the manor at this date is plausible and consistent with known manorial descent, even though the specific 1547 lease itself is unverified here.",
1552:"Further Cydfin/Ty Mawr material is referenced in the brief for this date. Not independently located; unverified.",
1596:"Independently corroborated: the manor of 'Landoche-juxta-Cardif' is recorded (Herbert Abbreviate, as summarised in Cardiff Records vol. 2) as having free tenants, demesnes and copyholds — i.e. the lord of the manor did not own every acre within it. This is the single most important structural fact for interpreting every later date on this timeline, and it is the reason this map refuses to shade 'the manor' as uniformly Bute- or Herbert-owned.",
1618:"Cydfin/Ty Mawr material referenced in the brief; not independently located here. (For context, 1618 is independently documented as the year the Crown granted the neighbouring manor of Kibbor and Cardiff to trustees for the Doddington/Herbert interest — showing the wider Herbert estate was being actively reorganised through Crown grants in this period.)",
1631:"Cydfin/Ty Mawr material referenced in the brief; not independently located here.",
1719:"Cydfin/Ty Mawr material referenced in the brief; not independently located here.",
1740:"The brief describes an assignment of the 1547 1,000-year lease, with Cydwin described as a farm in the manor of Llandough. Not independently located here — unverified claim from the brief. (Independently, 1740 is a documented survey year for the separate, adjoining manor of Llandaff, which shows detailed manorial surveys of this kind were being produced regionally at this date — supporting the plausibility of a 1740 Llandough-related instrument existing, without confirming its content.)",
1793:"Independently corroborated at the transaction level: Cardiff Records states plainly that Llandough manor 'was purchased in 1793 by the Earl of Bute.' The National Library of Wales catalogue independently describes 'deeds and documents relating to the Friars estate acquired by John, marquis of Bute, from Calvert Richard Jones in 1793', naming a bundle of manors and capital messuages including Llandough, Cogan, and 'Cogan Pill, p. Llandough' — confirming the 1793 transaction was a large, multi-manor package purchased from Calvert Richard Jones (consistent with Cardiff Records' 1767 note that Dinas Powys, 'Landough East' and Cogan manors were then held by William Hurst of Gabalfa and Calvert Richard Jones of Swansea). The publicly available catalogue description does not itemise Cydfin/Ty Mawr by name — whether that specific freehold was included, excluded, or reserved cannot be answered without reading the deed itself at NLW/Glamorgan Archives. Do not assume it was swept in.",
1815:"Bute/Llandough material referenced in the brief for this date; not independently located here.",
1824:"The brief lists Bute manorial leases identifying Cydfin Farm/Ty Mawr Farm at 107 acres alongside six other named Llandough-area holdings (Llandough Farm 166a, Cogan Pill Farm 153a, Corners Well 107a, Lower Cogan Pill 24a, Green Sayes 71a, Cogan Farm 320a). These figures are carried on this map as documentary claims from the brief, not independently verified against the original Bute rentals/leases (National Library of Wales Bute Estate Records holds Glamorgan estate rentals 1728–1893 and manorial records for over 70 manors — this is where the underlying document would sit). No GIS-calculated acreage is offered for these parcels because no verified boundary geometry was located.",
1843:"Tithe mapping / survey era. The National Library of Wales Bute Estate Records description explicitly lists 'tithe commutation papers, 1720–1849 (mainly 1842–1849)' — so tithe-era material for the Bute Glamorgan estates, which would include Llandough, is known to survive in that archive. This project has not extracted or georeferenced the Llandough tithe apportionment/map itself.",
1882:"First Edition Ordnance Survey 1:2,500, Glamorganshire sheet XLVII.6, 'Llandough Juxta Cardiff' — a real, named historical map sheet (consistent with the standard county-series OS naming and scale for this area and date). It has not been georeferenced or rasterised into this application; consult the National Library of Scotland historical map viewer (maps.nls.uk) or Coflein for the sheet itself.",
2026:"Modern layer: present-day landmarks and the Llandough community boundary (Vale of Glamorgan). The shaded 'modern Llandough' zone on this map is an informal illustrative extent built from known landmark coordinates, not a traced authoritative boundary — for the legal community boundary consult Vale of Glamorgan Council or ONS boundary data."
};

/* ---- Fixed geographic anchors (approximate, WGS84) ---- */
const CENTER = [51.4462, -3.1935];

/* ---- Named sites / point evidence ---- */
// geometryType one of: PRIMARY_SURVEY, HISTORICAL_MAP, DOCUMENTARY_LOCATION, RECONSTRUCTED, APPROXIMATE, HYPOTHESIS
// confidence: high | med | low
const SITES = [
  {
    id:'church', name:"St Dochdwy's Church (parish church of Llandough)", lat:51.4459, lng:-3.1953,
    category:'landmark', from:1106, to:2026,
    variants:['Ecclesia Sancti Dochunni','St Doguin (1275)','St Dochwy / St Dochdwy'],
    desc:"Believed site of an early medieval monastic community (Bangor Dochau). A 10th/11th-century inscribed stone cross (IRBICI) stands in the churchyard. The present building (1866, S. C. Fripp) is at least the third church on the site; an earlier building was dismantled and re-erected at Leckwith. Excavations in 1994 revealed over 800 burials, 4th–12th century AD, supporting the early ecclesiastical-centre identification.",
    tenure:'Ecclesiastical — not manorial land', owner:'Church (successively monastic, then parochial)', occupier:'—',
    source:"Wikipedia 'Llandough, Penarth' (citing Glamorgan Village Book, 1993; Cadw/Archaeology Data Service excavation report 2004); Cardiff Records vol.2 (Landoch/St Doguin 1275 reference)", sourceDate:'various',
    confidence:'high', geometryType:'DOCUMENTARY_LOCATION'
  },
  {
    id:'greathouse', name:'Great House Farm (site)', lat:51.4463, lng:-3.1958,
    category:'lineage', from:1547, to:1988,
    variants:['Cydwin / Cydfin (1547 lease, per brief)','Ty Mawr (per brief)','Great House'],
    desc:"Local tradition and the Llandough community record hold that Great House Farm 'stood alongside St Dochdwy's Church, and was the site of a Celtic monastery and a missionary centre.' The farmhouse was demolished in 1988 after a 33-year ownership dispute; a soldier's remains (thought to be from a battle on the site) were found under the dining-room floor and reburied in the churchyard. The farm's fields became the current primary school (opened 1970) and 1960s housing. THIS PROJECT HAS NOT CONFIRMED that this Great House Farm is the same holding as the 1547 'Cydwin/Cydfin' lease described in the brief — the identification Cydfin → Ty Mawr → Great House is the central hypothesis under investigation, not an established fact. Treat the placement of this marker at the church-adjacent farm site as the most likely candidate location, not a proven one.",
    tenure:'Unclear — hypothesis: originally leasehold (per brief, 1,000-year lease of 1547), status at demolition (1988) not established here', owner:'Unclear across time; local dispute noted 1955–1988', occupier:'Unknown at individual dates',
    source:"Wikipedia 'Llandough, Penarth' (village history section); brief-supplied claim re: 1547 Cydwin lease (unverified — see Chronicle 1547)", sourceDate:'compiled 2022–2026',
    confidence:'low', geometryType:'HYPOTHESIS'
  },
  {
    id:'romanvilla', name:'Roman villa site (under Corinthian Close / Tuscan Close)', lat:51.4466, lng:-3.1963,
    category:'archaeology', from:1106, to:2026,
    variants:[],
    desc:"Uncovered 1979 during housing-association works; excavated by the Glamorgan-Gwent Archaeological Trust. Occupied roughly 2nd half of 2nd century to mid-4th century AD; mortared walls, red pottery-tile and Pennant sandstone roofing, plastered walls, brick/crushed-tile floors, a sunken bath, and a Romano-British burial. A last-minute preservation bid failed and flats were built over the site.",
    tenure:'—', owner:'—', occupier:'—',
    source:"Wikipedia 'Llandough, Penarth'; Glamorgan-Gwent Archaeological Trust excavation records", sourceDate:'1979 excavation',
    confidence:'high', geometryType:'DOCUMENTARY_LOCATION'
  },
  {
    id:'baronscourt', name:"Baron's Court, formerly Cogan Pill", lat:51.4386, lng:-3.1838,
    category:'landmark', from:1500, to:2026,
    variants:['Cogan Pill'],
    desc:"Late 15th/early 16th-century hall house, built for Sir Mathew Cradock (d.1531), passing to his grandson Sir George Herbert, first Sheriff of Glamorgan. Enlarged reputedly by his younger son William (Sheriff 1552, 1567). Became a farmhouse in 1642 (hall converted to a barn). Bute significance: purchased by Lord Bute in 1790 — a full THREE YEARS BEFORE the 1793 manor-of-Llandough purchase. This is direct, independently-sourced evidence that Bute's acquisitions in the Llandough area were not one single 1793 event but at least two separate transactions at different dates — exactly the kind of distinction the brief asks this map not to collapse.",
    tenure:'Freehold, passing by inheritance and sale', owner:'Cradock → Herbert family → Lord Bute (1790) → later H.S. Corbett (restored c.1850)', occupier:'Farm tenants after 1642; Corbett as residence after c.1850',
    source:"Wikipedia 'Llandough, Penarth', citing Llandough Community Council building notes and britishlistedbuildings.co.uk", sourceDate:'compiled record',
    confidence:'high', geometryType:'DOCUMENTARY_LOCATION'
  },
  {
    id:'fortifiedhouse', name:'Fortified house remains (west of church), c.1420s–30s', lat:51.4458, lng:-3.1958,
    category:'archaeology', from:1420, to:2026,
    variants:[],
    desc:"Three fragmentary components of a well-fortified house, believed built by John de Van, standing to the west of the church. Not to be confused with the separate 'Llandough Castle', a 14th-century tower house at Llandough-juxta-Cowbridge — a different village roughly 15 miles west, in a different historic parish. The brief's place-name list is specific to Llandough-juxta-Cardiff/Penarth; this map deliberately excludes the Cowbridge Llandough Castle material to avoid exactly the kind of place conflation the brief warns against.",
    tenure:'—', owner:'John de Van (attributed)', occupier:'—',
    source:"John Newman, 'Glamorgan' (Pevsner/Penguin, 1995), p.377, via Wikipedia 'Llandough, Penarth'", sourceDate:'1995 architectural survey',
    confidence:'med', geometryType:'DOCUMENTARY_LOCATION'
  },
  {
    id:'poundcottage', name:'Pound Cottage', lat:51.4468, lng:-3.1928,
    category:'landmark', from:1830, to:2026,
    variants:[],
    desc:"Grade II listed thatched cottage, built c.1830 'on land belonging to the Bute estate' — the phrase used in the listing description. This is a small but concrete data point: it shows Bute-estate land in Llandough village by 1830, consistent with (but not itself proof of the extent of) the 1793 acquisition.",
    tenure:'Bute estate land (per listing description)', owner:'Bute estate', occupier:'Pound keeper, later a sweetshop',
    source:"Cadw listed building record, via britishlistedbuildings.co.uk / Wikipedia 'Llandough, Penarth'", sourceDate:'listing record',
    confidence:'high', geometryType:'DOCUMENTARY_LOCATION'
  },
  {
    id:'nationalschool', name:'National School (1825)', lat:51.4470, lng:-3.1922,
    category:'landmark', from:1825, to:1872,
    variants:[],
    desc:"First National School in the Penarth area, opened 1825 on the initiative of the rector Rev. James Evans, 'supported by the 2nd Marquess of Bute.' Population of Llandough at this date recorded as around 200. Replaced by a larger school in 1872 (planned for c.125 children) as population passed 700 by 1870 — useful corroboration that the settlement was small and growing fast across the early-to-mid 19th century, the same period as the 1824 Bute holdings list and the 1843 tithe survey.",
    tenure:'—', owner:'Church/Bute-supported charity school', occupier:'—',
    source:"Llandough Community Council building notes, via Wikipedia 'Llandough, Penarth'", sourceDate:'compiled record',
    confidence:'high', geometryType:'DOCUMENTARY_LOCATION'
  },
  {
    id:'llandoughschoolmodern', name:'Llandough Primary School (1970– )', lat:51.4471, lng:-3.1946,
    category:'landmark', from:1970, to:2026,
    variants:[],
    desc:"Opened 1970 by James Callaghan MP, on what is described as former Great House Farm fields — physical evidence that at least part of the farm's land passed into 20th-century public/residential use distinct from any surviving agricultural holding.",
    tenure:'Public (education)', owner:'Local authority', occupier:'—',
    source:"Wikipedia 'Llandough, Penarth'", sourceDate:'1970',
    confidence:'high', geometryType:'DOCUMENTARY_LOCATION'
  },
  {
    id:'hospital', name:'University Hospital Llandough', lat:51.4445, lng:-3.1934,
    category:'landmark', from:1930, to:2026,
    variants:['Llandough Hospital (1930–2008)'],
    desc:"Opened 1930, joined the NHS in 1948, renamed 2008. Modern institutional landmark, useful as a fixed reference point for orienting historical evidence.",
    tenure:'Public (health)', owner:'Cardiff & Vale University Health Board', occupier:'—',
    source:"Wikipedia 'Llandough, Penarth'", sourceDate:'institutional record',
    confidence:'high', geometryType:'PRIMARY_SURVEY'
  },
  {
    id:'coganstation', name:'Cogan railway station', lat:51.4407, lng:-3.1857,
    category:'landmark', from:1878, to:2026,
    variants:[],
    desc:"Nearest railway station to Llandough village (c.0.4 miles), useful fixed modern reference point on the boundary between historic Llandough and Cogan manors/parishes.",
    tenure:'—', owner:'Transport for Wales', occupier:'—',
    source:'Wikipedia / Network Rail station data', sourceDate:'modern',
    confidence:'high', geometryType:'PRIMARY_SURVEY'
  },
  {
    id:'cwmcydfin', name:'Cwm Cydfin, Leckwith (SSSI)', lat:51.4610, lng:-3.1990,
    category:'placename', from:1106, to:2026,
    variants:['Cydfin (element in modern place-name)'],
    desc:"A Site of Special Scientific Interest — mixed deciduous woodland near Leckwith, on the River Ely, immediately north of Llandough parish. The name element 'Cydfin' recurs here in a wooded valley context. THIS IS FLAGGED, NOT CLAIMED: this project found no documentary link between this 'Cydfin' place-name and the 'Cydwin/Cydfin' farm-name described in the 1547 lease in the brief. They may be entirely unrelated names that happen to share an element, or the farm name may derive from this same landscape term used elsewhere in the locality. Do not treat this marker as evidence for the Cydfin farm's location.",
    tenure:'—', owner:'—', occupier:'—',
    source:'Natural Resources Wales SSSI citation "Cwm Cydfin", via Wikipedia', sourceDate:'modern designation',
    confidence:'low', geometryType:'HYPOTHESIS'
  }
];

/* ---- Historical place-name forms ---- */
const PLACENAME_FORMS = [
  {form:'Landochan', date:'1106', note:"'The little vill which is called Landochan', confirmed to Tewkesbury Abbey by Henry I", source:'Cartae et Munimenta de Glamorgan III, p.39, via Cardiff Records vol.2'},
  {form:'Landoch', date:'1275 (c.)', note:'Walter Thorgot grants a messuage in Landoch, south side of the church of St Doguin', source:'Cartae I, p.182, via Cardiff Records vol.2'},
  {form:'Landoch (Maurice de/of)', date:'1290 (c.)', note:'"Maurice of Landoch" grants Cogan Moor to Margam Abbey — a personal surname taken from the place', source:'Cartae III, p.541, via Cardiff Records vol.2'},
  {form:'Llandough Est (East)', date:'1535', note:'Valor Ecclesiasticus: "the manor of Llandough Est" belonged to the Abbot of Tewkesbury, with free and villein tenants — note the East qualifier, implying a companion West or a division not further explained in this source', source:'Valor Ecclesiasticus (1535), via Cardiff Records vol.2'},
  {form:'Llandough manor (unqualified)', date:'1543–45', note:'Henry VIII grants Llandough manor to Lord Clynton and Say and Robert Turwitt (1543); acquired by Sir George Herbert by 1545 (rent-roll)', source:'Cardiff Records vol.2'},
  {form:'Landoche-juxta-Cardif', date:'1596', note:'"The manor of Landoche-juxta-Cardif had free tenants, demesnes and copyholds" — the qualifier juxta Cardif (near Cardiff) distinguishes it from other Llandoughs in Glamorgan (e.g. Llandough-juxta-Cowbridge)', source:'Herbert Abbreviate, via Cardiff Records vol.2'},
  {form:'Llandough Juxta Cardiff', date:'1900 / 1882 OS convention', note:'Standard later-Victorian form, used on the 1882 First Edition OS 1:2500 sheet title (Glamorganshire XLVII.6) and by Cardiff Records (1900)', source:'OS sheet title; Cardiff Records vol.2'},
  {form:'Llandough Juxta Penarth', date:'20th century', note:'Alternative qualifier reflecting growth of Penarth relative to Cardiff as the nearer town — used in some 20th-century parish/genealogical indices (GENUKI)', source:'GENUKI parish index'},
  {form:'Llandough / Llandough, Penarth', date:'modern', note:'Current standard English form; the community became administratively separate from Penarth in 1982', source:'Vale of Glamorgan Council / Wikipedia'},
  {form:'Llandochau Fach (Welsh)', date:'modern, standardised', note:"Standardised Welsh form: llan ('church') + Dochau (for St Dochau/Dochdwy) + fach (mutated form of bach, 'small')", source:'Welsh Government Standardised Place-names list, via Wikidata'}
];

/* ---- Zones: illustrative extents built as H3 k-rings around a centre point.
       NONE of these are traced from a survey; each is graded for confidence
       and tagged with its geometryType. category drives colour. ---- */
const ZONE_CATS = {
  'modern-boundary':  {label:'Modern Llandough (illustrative)', color:'#5fa3a7'},
  'parish-hist':      {label:'Historical parish (hypothesis extent)', color:'#6f8c52'},
  'manor-hist':       {label:'Manor of Llandough (jurisdiction, hypothesis extent)', color:'#7b6ba8'},
  'demesne':          {label:'Demesne (lord\\u2019s own land, 1596-type)', color:'#c98a3a'},
  'freehold':         {label:'Free tenant land (1596-type)', color:'#5fa3a7'},
  'copyhold':         {label:'Copyhold land (1596-type)', color:'#a85263'},
  'bute-1824':        {label:'1824 Bute holdings (documentary, unmapped boundary)', color:'#8a5a35'},
  'cydfin-lineage':   {label:'Cydfin / Ty Mawr / Great House lineage zone', color:'#d9a95c'}
};

const ZONES = [
  {
    id:'z-modern', cat:'modern-boundary', name:'Llandough community (modern) — illustrative extent',
    lat:51.4462, lng:-3.1935, k:4, from:1900, to:2026, confidence:'med', geometryType:'APPROXIMATE',
    desc:"An informal illustrative extent built by ringing known modern landmarks (church, hospital, school, Cogan station, Pound Cottage). This is NOT traced from an authoritative boundary file — no ONS/Vale of Glamorgan boundary GeoJSON was loaded into this application. For the legal community boundary, consult Vale of Glamorgan Council or the ONS Open Geography Portal.",
    source:'Constructed from site coordinates in this dataset; not an official boundary source', sourceDate:'n/a', tenure:'—', owner:'Llandough Community Council', occupier:'—'
  },
  {
    id:'z-parish-hist', cat:'parish-hist', name:'Historical parish of Llandough — hypothesis extent',
    lat:51.4462, lng:-3.1940, k:3, from:1106, to:1843, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"The brief's own research question #12 asks whether the historical meaning of 'Llandough' was larger or smaller than the later c.700-acre parish. This zone is deliberately drawn at roughly the same footprint as the modern-boundary zone as a NEUTRAL STARTING HYPOTHESIS — it does not answer the question, and should not be read as evidence either way. A real answer requires the tithe apportionment map (1843-ish) and the 1596 Abbreviate's full text, neither of which has been transcribed into this application.",
    source:'No boundary source located; hypothesis placeholder only', sourceDate:'n/a', tenure:'—', owner:'—', occupier:'—'
  },
  {
    id:'z-manor-hist', cat:'manor-hist', name:'Manor of Llandough — jurisdiction, hypothesis extent',
    lat:51.4470, lng:-3.1900, k:4, from:1106, to:1793, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"A manor is a lordship/jurisdiction, not necessarily a single contiguous block of land, and per the 1596 Abbreviate it contained free tenants, demesnes AND copyholds belonging to different people. This zone is shown deliberately offset and larger than the parish-hypothesis zone to visually assert that manor \\u2260 parish \\u2260 'land the lord owned' — but its actual shape is unknown. The NLW catalogue shows the manor was at various times administered jointly with St Mary Church parish (1619-1780) and separately with Colwinston (1661-1725), which is itself evidence that 'the manor of Llandough' was not a fixed, self-evident territorial unit across time.",
    source:"NLW Archives: 'Manors of Llandough and St Mary Church' (1619-1780) and 'Manors of Llandough and Colwinston, and the tithe barns' (1661-1725) catalogue descriptions", sourceDate:'NLW catalogue, accessed 2026', tenure:'Manorial jurisdiction', owner:'Tewkesbury Abbey → Crown (1543) → Herbert → Bute (1793)', occupier:'Multiple free/copyhold tenants'
  },
  {
    id:'z-demesne-1596', cat:'demesne', name:'Demesne land (1596 Abbreviate reference)',
    lat:51.4450, lng:-3.1915, k:2, from:1596, to:1793, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"The 1596 Herbert Abbreviate records that the manor 'had free tenants, demesnes and copyholds' but the surviving summary quoted in Cardiff Records does not itemise which fields were demesne. This zone marks a plausible location near the historic core (adjacent to the church/Great House area, where lords' home farms typically sat) but is NOT derived from any surveyed demesne boundary.",
    source:'Herbert Abbreviate (summarised), via Cardiff Records vol.2 — category only, no itemised parcels located', sourceDate:'1596', tenure:'Demesne', owner:'Lord of the manor (Herbert family, 1596)', occupier:'In hand, or leased at will'
  },
  {
    id:'z-freehold-1596', cat:'freehold', name:'Free tenant land (1596 Abbreviate reference)',
    lat:51.4480, lng:-3.1960, k:2, from:1596, to:1793, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"Free tenants held land within the manor's jurisdiction but by definition NOT as the lord's own property — this is exactly the category the brief warns must not be swept into 'Bute owned everything inside the manor' after 1793. No itemised list of 1596 freeholders or their holdings has been located.",
    source:'Herbert Abbreviate (summarised), via Cardiff Records vol.2', sourceDate:'1596', tenure:'Freehold', owner:'Multiple free tenants (unnamed in the located source)', occupier:'Free tenants themselves'
  },
  {
    id:'z-copyhold-1596', cat:'copyhold', name:'Copyhold land (1596 Abbreviate reference)',
    lat:51.4440, lng:-3.1880, k:2, from:1596, to:1793, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"Copyhold tenants held 'by copy of court roll' — a customary tenure recorded in the manor court, distinct from freehold and from demesne. No itemised 1596 copyhold list located for Llandough specifically (compare the fuller 1653/1673 copyhold surveys that survive for neighbouring Llystalybont manor, which show this level of detail does exist in the archive for comparable manors).",
    source:'Herbert Abbreviate (summarised), via Cardiff Records vol.2', sourceDate:'1596', tenure:'Copyhold', owner:'Lord of the manor (nominal); customary tenants (beneficial)', occupier:'Copyhold tenants'
  },
  {
    id:'z-cydfin-lineage', cat:'cydfin-lineage', name:'Cydfin / Ty Mawr / Great House — investigation zone',
    lat:51.4463, lng:-3.1958, k:1, from:1547, to:1988, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"This is the central object of investigation, not a conclusion. It marks the area around the Great House Farm site (church-adjacent) as the leading candidate location for the 1547 Cydwin/Cydfin lease and the 1824 107-acre Ty Mawr/Cydfin holding, on the strength of (a) the shared Ty Mawr name and (b) the church-adjacent Great House being the only substantial farm site with continuous documentary presence located near the historic ecclesiastical core. But: no document located in this project explicitly equates Cydwin (1547) with Ty Mawr with the church-adjacent Great House. See the Lineage tab for the full step-by-step evidence and gaps.",
    source:'Composite — see Lineage tab for the evidence chain and its gaps', sourceDate:'n/a', tenure:'Unclear across time', owner:'Unclear across time', occupier:'Unclear across time'
  },
  {
    id:'z-bute-cydfin-1824', cat:'bute-1824', name:'Cydfin / Ty Mawr Farm — 107 acres (1824, per brief)',
    lat:51.4463, lng:-3.1958, k:1, from:1824, to:1843, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"1824 Bute manorial lease documentary acreage: 107 acres. No boundary polygon located, so no GIS-calculated acreage is offered — see the info panel's acreage-comparison block, which reports the GIS figure as unavailable rather than inventing one. Located at the Great House / Cydfin investigation zone as the leading candidate, per the caveats on that zone.",
    source:'Research brief (unverified against original Bute lease); zone location follows the Cydfin investigation-zone hypothesis above', sourceDate:'1824 (claimed)', tenure:'Leasehold under Bute manor', owner:'Marquess of Bute (lord of the manor)', occupier:'Named in the original lease (not located)',
    docAcres:107
  },
  {
    id:'z-bute-llandoughfarm-1824', cat:'bute-1824', name:'Llandough Farm — 166 acres (1824, per brief)',
    lat:51.4500, lng:-3.1900, k:1, from:1824, to:1843, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"1824 Bute manorial lease documentary acreage: 166 acres. Location shown here is an approximate placement within the village area — not derived from any plan.",
    source:'Research brief (unverified against original Bute lease)', sourceDate:'1824 (claimed)', tenure:'Leasehold under Bute manor', owner:'Marquess of Bute', occupier:'Not located',
    docAcres:166
  },
  {
    id:'z-bute-coganpill-1824', cat:'bute-1824', name:'Cogan Pill Farm — 153 acres (1824, per brief)',
    lat:51.4390, lng:-3.1840, k:1, from:1824, to:1843, confidence:'med', geometryType:'HYPOTHESIS',
    desc:"1824 Bute manorial lease documentary acreage: 153 acres. Placed at Cogan Pill / Baron's Court, the one site in this cluster with an independently-verified real address (Baron's Court, formerly Cogan Pill — see that site marker). Confidence is 'med' for the LOCATION only; the 153-acre figure itself is still an unverified documentary claim from the brief.",
    source:'Research brief (unverified against original Bute lease); location corroborated by Wikipedia \\'Llandough, Penarth\\' description of Baron\\'s Court/Cogan Pill', sourceDate:'1824 (claimed)', tenure:'Leasehold under Bute manor', owner:'Marquess of Bute', occupier:'Not located',
    docAcres:153
  },
  {
    id:'z-bute-corners-1824', cat:'bute-1824', name:'Corners Well — 107 acres (1824, per brief)',
    lat:51.4520, lng:-3.1870, k:1, from:1824, to:1843, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"1824 Bute manorial lease documentary acreage: 107 acres. No location evidence found beyond the name itself; placed provisionally north-east of the village core.",
    source:'Research brief (unverified against original Bute lease)', sourceDate:'1824 (claimed)', tenure:'Leasehold under Bute manor', owner:'Marquess of Bute', occupier:'Not located',
    docAcres:107
  },
  {
    id:'z-bute-lowercogan-1824', cat:'bute-1824', name:'Lower Cogan Pill — 24 acres (1824, per brief)',
    lat:51.4360, lng:-3.1810, k:1, from:1824, to:1843, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"1824 Bute manorial lease documentary acreage: 24 acres. Placed provisionally south of Cogan Pill/Baron's Court, consistent with the 'Lower' qualifier, but not derived from a plan.",
    source:'Research brief (unverified against original Bute lease)', sourceDate:'1824 (claimed)', tenure:'Leasehold under Bute manor', owner:'Marquess of Bute', occupier:'Not located',
    docAcres:24
  },
  {
    id:'z-bute-greensayes-1824', cat:'bute-1824', name:'Green Sayes — 71 acres (1824, per brief)',
    lat:51.4430, lng:-3.1990, k:1, from:1824, to:1843, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"1824 Bute manorial lease documentary acreage: 71 acres. No location evidence found; placed provisionally west of the village core.",
    source:'Research brief (unverified against original Bute lease)', sourceDate:'1824 (claimed)', tenure:'Leasehold under Bute manor', owner:'Marquess of Bute', occupier:'Not located',
    docAcres:71
  },
  {
    id:'z-bute-coganfarm-1824', cat:'bute-1824', name:'Cogan Farm — 320 acres (1824, per brief)',
    lat:51.4340, lng:-3.1790, k:2, from:1824, to:1843, confidence:'low', geometryType:'HYPOTHESIS',
    desc:"1824 Bute manorial lease documentary acreage: 320 acres — by far the largest of the seven listed holdings, and located in the separate (though adjoining and, per Cardiff Records, historically parallel) manor of Cogan, also purchased by Bute in 1793. Its inclusion in a 'Llandough' holdings list in the brief is a useful reminder that Bute's estate rentals bundled multiple manors together administratively, which is exactly why the brief is right to insist these figures are not automatically 'the parish of Llandough'.",
    source:'Research brief (unverified against original Bute lease); manor-of-Cogan context from Cardiff Records vol.2', sourceDate:'1824 (claimed)', tenure:'Leasehold under Bute manor of Cogan', owner:'Marquess of Bute', occupier:'Not located',
    docAcres:320
  }
];

/* ---- Evidence table (flat, matches requested columns) ---- */
function buildEvidenceRows(){
  const rows = [];
  PLACENAME_FORMS.forEach(p=>rows.push({
    date:p.date, entity:'Place-name', name:p.form, acreage:'—', tenure:'—', owner:'—', occupier:'—',
    geomSource:'DOCUMENTARY_LOCATION', citation:p.source, confidence:'high', notes:p.note
  }));
  SITES.forEach(s=>rows.push({
    date:(s.from===s.to? s.from : s.from+'–'+(s.to===2026?'present':s.to)), entity:'Site', name:s.name,
    acreage:'—', tenure:s.tenure, owner:s.owner, occupier:s.occupier,
    geomSource:s.geometryType, citation:s.source, confidence:s.confidence, notes:s.desc
  }));
  ZONES.forEach(z=>rows.push({
    date:(z.from===z.to? z.from : z.from+'–'+(z.to===2026?'present':z.to)), entity:ZONE_CATS[z.cat].label, name:z.name,
    acreage:(z.docAcres? z.docAcres+' ac (documentary)':'—'), tenure:z.tenure, owner:z.owner, occupier:z.occupier,
    geomSource:z.geometryType, citation:z.source, confidence:z.confidence, notes:z.desc
  }));
  return rows;
}
const EVIDENCE_ROWS = buildEvidenceRows();

/* ---- Lineage steps ---- */
const LINEAGE = [
  {y:'1547', label:'Cydwin / Cydfin', hyp:false, note:'1,000-year lease, Herbert–Vaughan instrument (per brief). NOT independently located in this project — flagged for archival check.'},
  {y:'1552 / 1618 / 1631 / 1719', label:'Cydfin / Ty Mawr material', hyp:false, note:'Referenced in the brief at each date; none independently located here.'},
  {y:'1740', label:'Assignment of the 1547 lease', hyp:false, note:'Cydwin described as a farm in the manor of Llandough (per brief). Not independently located.'},
  {y:'1793', label:'Bute acquires the manor of Llandough', hyp:true, note:'CONFIRMED at the manor level (Cardiff Records; NLW catalogue). NOT confirmed that Cydfin/Ty Mawr specifically was included — the NLW catalogue description of the 1793 deed bundle does not name it. This is the single biggest open gap in the lineage.'},
  {y:'1815', label:'Further Bute/Llandough material', hyp:false, note:'Referenced in the brief; not independently located here.'},
  {y:'1824', label:'Ty Mawr / Cydfin Farm, 107 acres', hyp:true, note:'Documentary acreage claim from the brief, attributed to Bute manorial leases. Not independently verified against the original lease. If genuine, this is the first point at which a Bute-era document (per the brief) explicitly ties the Cydfin name to a 107-acre bounded farm.'},
  {y:'1840s', label:'Tithe survey', hyp:false, note:'Bute Estate Records at NLW confirm tithe commutation papers exist for the estate (1720–1849, mainly 1842–9) — the Llandough apportionment itself has not been extracted here.'},
  {y:'1882', label:'First Edition OS, Glamorganshire XLVII.6', hyp:false, note:'Named, dateable map sheet — not georeferenced in this application.'},
  {y:'modern', label:'Great House Farm site', hyp:true, note:'Demolished 1988. Local/community history (Wikipedia, citing the Llandough community record) places "Great House Farm" beside the church and states it was the site of the early monastery — but does not itself use the names Cydwin, Cydfin or Ty Mawr. The Great House ↔ Ty Mawr ↔ Cydfin identification rests on (a) shared "great house" / Ty Mawr naming logic, and (b) it being the only substantial farm continuously attested beside the historic ecclesiastical core — not on a document that names all three together across time. Treat as a live hypothesis.'}
];

const KNOW = [
  "Landochan/Landoch is a genuinely old territorial name — confirmed from 1106 (Henry I to Tewkesbury Abbey) and again at 1275, independent of any later manor, parish or estate structure.",
  "The manor of Llandough (Landoche-juxta-Cardif) explicitly contained free tenants, demesnes AND copyholds in 1596 — the lord did not own every acre inside manorial jurisdiction.",
  "Llandough manor's post-medieval descent is documented: Crown (1543, to Clynton & Say / Turwitt) → Sir George Herbert (by 1545) → Sir William Herbert → purchased by the Earl of Bute in 1793.",
  "The 1793 Bute purchase was a large, multi-manor package bought from Calvert Richard Jones (NLW catalogue), covering Dinas Powys, Kibbor, South Cornelly, Llandough, Cogan and Newton Nottage manors plus named capital messuages including Cogan Pill in the parish of Llandough — not a single-property transaction.",
  "Bute's acquisition activity in the Llandough/Cogan area was not confined to a single 1793 event: Cogan Pill/Baron's Court was bought separately in 1790, three years earlier — direct proof that 'Bute bought the manor in 1793' cannot be used as shorthand for 'Bute acquired every freehold interest at the same moment.'",
  "The manor of Llandough was, at different times, administered jointly with different neighbouring units (with St Mary Church parish, 1619–1780; with Colwinston, 1661–1725, per NLW's manorial series) — showing 'the manor' was not a fixed, self-evidently bounded thing even administratively.",
  "'Great House Farm' — demolished 1988 — stood immediately beside St Dochdwy's church and is independently described (Wikipedia, citing local community history) as occupying the site of the early monastery.",
  "The 1882 First Edition OS 1:2,500 sheet for this area (Glamorganshire XLVII.6, titled 'Llandough Juxta Cardiff') exists and is locatable by name, even though it has not been georeferenced into this application."
];
const UNPROVEN = [
  "That the 1547 Cydwin/Cydfin lease, the 1824 107-acre Ty Mawr/Cydfin holding, and the demolished Great House Farm are the SAME piece of land across four centuries, rather than a changing collection of parcels or a later aggregation. No single document located in this project names all of Cydwin, Cydfin, Ty Mawr and Great House together.",
  "Whether Cydfin/Ty Mawr/Great House was included in, excluded from, or reserved out of the 1793 Bute conveyance. The 1793 deed bundle is catalogued at NLW but its full itemised schedule has not been read for this project.",
  "The exact boundary of the historical parish of Llandough at any date, and therefore whether it was larger or smaller than the later c.700-acre parish figure quoted in the brief.",
  "The exact boundary of the manor of Llandough at any date, as distinct from the parish.",
  "Which specific parcels constituted demesne, freehold and copyhold land under the 1596 description — the source located here confirms the three categories existed but does not itemise them.",
  "The 1547, 1552, 1618, 1631, 1719 and 1740 Cydfin/Ty Mawr documentary claims from the brief — none were independently located via public search; they require the original instruments (likely Glamorgan Archives or Cardiff University's Bute Papers / NLW).",
  "GIS-calculated acreage for any of the seven 1824 Bute holdings, because no verified boundary polygon for any of them was located.",
  "The apparent Cwm Cydfin (Leckwith) place-name link to the Cydwin/Cydfin farm-name — flagged as a possible coincidence of naming, not evidence of location."
];

/* ============================================================================
   MAP SETUP
   ============================================================================ */
const map = L.map('map', {zoomControl:true, minZoom:11, maxZoom:19}).setView(CENTER, 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom:19, attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);

let currentRes = 9;
let currentOpacityH3 = 0.35;
let currentOpacityZone = 0.55;
let currentYearIdx = 10; // 1793
let confidenceMode = 'all'; // all | evidence | reconstruction | hypothesis
let selectedFeature = null;

const layerToggles = {
  h3grid: true,
  modernBoundary: true,
  parishHist: false,
  manorHist: true,
  buteHoldings: true,
  cydfinLineage: true,
  greatHouseFarm: true,
  tenureCats: true,
  os1882note: true,
  placeNames: true,
  documentaryPoints: true,
  archaeology: true,
  landmarks: true
};

const LAYER_DEFS = [
  {key:'h3grid', label:'H3 hex grid (spatial index only)', color:'#5a6478'},
  {key:'modernBoundary', label:'Modern Llandough boundary (illustrative)', color:ZONE_CATS['modern-boundary'].color},
  {key:'parishHist', label:'Historical parish (hypothesis)', color:ZONE_CATS['parish-hist'].color},
  {key:'manorHist', label:'Historical manor (hypothesis)', color:ZONE_CATS['manor-hist'].color},
  {key:'tenureCats', label:'1596 demesne / freehold / copyhold', color:ZONE_CATS['demesne'].color},
  {key:'buteHoldings', label:'Bute estate holdings incl. 1824 parcels', color:ZONE_CATS['bute-1824'].color},
  {key:'cydfinLineage', label:'Cydfin / Ty Mawr investigation zone', color:ZONE_CATS['cydfin-lineage'].color},
  {key:'greatHouseFarm', label:'Great House Farm site marker', color:'#d9a95c'},
  {key:'placeNames', label:'Historical place-name labels', color:'#7b6ba8'},
  {key:'documentaryPoints', label:'Documentary evidence points', color:'#5fa3a7'},
  {key:'archaeology', label:'Archaeological sites', color:'#a85263'},
  {key:'landmarks', label:'Roads, churches, farms, fixed landmarks', color:'#c9c2a8'},
  {key:'os1882note', label:'1882 OS sheet reference (not georeferenced)', color:'#6f8c52'}
];

const sidebarList = document.getElementById('layerList');
LAYER_DEFS.forEach(ld=>{
  const row = document.createElement('div');
  row.className = 'layer-row';
  row.innerHTML = \`<span class="swatch" style="background:\${ld.color}"></span>
    <label for="chk_\${ld.key}">\${ld.label}</label>
    <input type="checkbox" id="chk_\${ld.key}" \${layerToggles[ld.key]!==false?'checked':''}>\`;
  sidebarList.appendChild(row);
  row.querySelector('input').addEventListener('change', e=>{
    layerToggles[ld.key] = e.target.checked;
    renderAll();
  });
});

/* ---- Timeline labels ---- */
const tlWrap = document.getElementById('timelineLabels');
YEARS.forEach((yy,i)=>{
  const s = document.createElement('span');
  s.textContent = yy.label;
  s.dataset.idx = i;
  s.addEventListener('click', ()=>{ document.getElementById('timeSlider').value = i; onSliderChange(); });
  tlWrap.appendChild(s);
});
function refreshTimelineLabels(){
  [...tlWrap.children].forEach((el,i)=> el.classList.toggle('current', i===currentYearIdx));
}

/* ---- H3 grid ---- */
let h3Layer = L.layerGroup().addTo(map);
function drawH3Grid(){
  h3Layer.clearLayers();
  if(!layerToggles.h3grid) return;
  const bbox = [
    [CENTER[0]+0.017, CENTER[1]-0.030],
    [CENTER[0]+0.017, CENTER[1]+0.022],
    [CENTER[0]-0.017, CENTER[1]+0.022],
    [CENTER[0]-0.017, CENTER[1]-0.030]
  ];
  let cells;
  try{
    cells = h3.polygonToCells(bbox, currentRes, false);
  }catch(e){ cells = []; }
  cells.forEach(c=>{
    const boundary = h3.cellToBoundary(c);
    const poly = L.polygon(boundary, {
      color:'#5a6478', weight:1, opacity:0.55, fillColor:'#2c3549', fillOpacity:currentOpacityH3*0.5
    });
    h3Layer.addLayer(poly);
  });
}

/* ---- Zones (drawn as k-ring hex clusters) ---- */
let zoneLayer = L.layerGroup().addTo(map);
function confidencePasses(z){
  if(confidenceMode==='all') return true;
  const rank = {PRIMARY_SURVEY:0, HISTORICAL_MAP:1, DOCUMENTARY_LOCATION:1, APPROXIMATE:2, RECONSTRUCTED:2, HYPOTHESIS:3};
  const r = rank[z.geometryType] ?? 3;
  if(confidenceMode==='evidence') return r<=1;
  if(confidenceMode==='reconstruction') return r<=2;
  if(confidenceMode==='hypothesis') return true;
  return true;
}
function zoneVisibleAtYear(z){
  const yr = YEARS[currentYearIdx].y;
  return yr>=z.from && yr<=z.to;
}
const ZONE_LAYER_MAP = {
  'modern-boundary':'modernBoundary','parish-hist':'parishHist','manor-hist':'manorHist',
  'demesne':'tenureCats','freehold':'tenureCats','copyhold':'tenureCats',
  'bute-1824':'buteHoldings','cydfin-lineage':'cydfinLineage'
};
function drawZones(){
  zoneLayer.clearLayers();
  ZONES.forEach(z=>{
    const layerKey = ZONE_LAYER_MAP[z.cat];
    if(layerToggles[layerKey]===false) return;
    if(!zoneVisibleAtYear(z)) return;
    if(!confidencePasses(z)) return;
    const centerCell = h3.latLngToCell(z.lat, z.lng, currentRes);
    const cells = h3.gridDisk(centerCell, z.k);
    const color = ZONE_CATS[z.cat].color;
    cells.forEach(c=>{
      const boundary = h3.cellToBoundary(c);
      const poly = L.polygon(boundary, {
        color:color, weight:1.2, opacity:0.8, fillColor:color, fillOpacity:currentOpacityZone*0.55
      });
      poly.on('click', ()=> selectZone(z));
      zoneLayer.addLayer(poly);
    });
  });
}

/* ---- Site markers ---- */
let siteLayer = L.layerGroup().addTo(map);
const CAT_LAYER_MAP = {landmark:'landmarks', lineage:'greatHouseFarm', archaeology:'archaeology', placename:'placeNames'};
function siteVisible(s){
  const yr = YEARS[currentYearIdx].y;
  return yr>=s.from && yr<=s.to;
}
function drawSites(){
  siteLayer.clearLayers();
  SITES.forEach(s=>{
    const layerKey = CAT_LAYER_MAP[s.category] || 'documentaryPoints';
    if(layerToggles[layerKey]===false && layerToggles.documentaryPoints===false) return;
    if(layerToggles[layerKey]===false) return;
    if(!siteVisible(s)) return;
    const rank = {high:0, med:1, low:2}[s.confidence];
    const confRank = {evidence:0, reconstruction:1, hypothesis:2, all:2}[confidenceMode];
    if(confidenceMode!=='all' && rank>confRank) return;
    const fillColor = s.category==='archaeology' ? '#a85263' : (s.category==='lineage' ? '#d9a95c' : '#5fa3a7');
    const marker = L.circleMarker([s.lat, s.lng], {
      radius: s.category==='lineage'?9:6, color:'#151b26', weight:1.5, fillColor:fillColor, fillOpacity:0.92
    });
    marker.bindTooltip(s.name, {direction:'top', offset:[0,-4]});
    marker.on('click', ()=> selectSite(s));
    siteLayer.addLayer(marker);
  });
}

/* ---- Place-name labels (fixed cluster near village core, offset for legibility) ---- */
let labelLayer = L.layerGroup().addTo(map);
function drawLabels(){
  labelLayer.clearLayers();
  if(!layerToggles.placeNames) return;
  const yr = YEARS[currentYearIdx].y;
  const relevant = PLACENAME_FORMS.filter(p=>{
    const y = parseInt(p.date) || 1900;
    return y<=yr || p.date.includes('modern');
  });
  relevant.forEach((p,i)=>{
    const lat = CENTER[0] + 0.0095 - i*0.0016;
    const lng = CENTER[1] + 0.014;
    const icon = L.divIcon({
      className:'', html:\`<div style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(21,27,38,0.85);color:#d9a95c;padding:2px 6px;border-radius:3px;border:1px solid #3a4459;white-space:nowrap;">\${p.form} <span style="color:#a9b0c2">(\${p.date})</span></div>\`,
      iconSize:[0,0]
    });
    const m = L.marker([lat,lng], {icon});
    m.on('click', ()=> selectPlacename(p));
    labelLayer.addLayer(m);
  });
}

/* ---- OS 1882 reference marker ---- */
let osLayer = L.layerGroup().addTo(map);
function drawOS(){
  osLayer.clearLayers();
  if(!layerToggles.os1882note) return;
  const yr = YEARS[currentYearIdx].y;
  if(yr<1882) return;
  const icon = L.divIcon({
    className:'', html:\`<div style="font-family:'IBM Plex Mono',monospace;font-size:9.5px;background:rgba(111,140,82,0.92);color:#151b26;padding:3px 7px;border-radius:3px;font-weight:700;">OS 1882 · XLVII.6 (not georeferenced — see maps.nls.uk)</div>\`,
    iconSize:[0,0]
  });
  osLayer.addLayer(L.marker([CENTER[0]-0.012, CENTER[1]-0.006], {icon}));
}

/* ============================================================================
   SELECTION / INFO PANEL
   ============================================================================ */
function acreageBlock(doc){
  return \`<div class="acre-compare">
    <div><span>Documentary</span><strong>\${doc} ac</strong></div>
    <div><span>GIS-calculated</span><strong>not available</strong></div>
    <div class="diff"><span>Difference</span><strong>cannot compute — no verified boundary polygon located</strong></div>
  </div>\`;
}
function confClass(c){ return c==='high'?'conf-high':(c==='med'?'conf-med':'conf-low'); }

function selectSite(s){
  selectedFeature = s;
  showTab('info');
  const html = \`
    <div class="kicker">Site · \${s.category}</div>
    <h3>\${s.name}</h3>
    <div class="field"><div class="k">Historical name variants</div><div class="v">\${s.variants.length?s.variants.join(' · '):'—'}</div></div>
    <div class="field"><div class="k">Attested window</div><div class="v">\${s.from} – \${s.to===2026?'present':s.to}</div></div>
    <div class="field"><div class="k">Tenure</div><div class="v">\${s.tenure}</div></div>
    <div class="field"><div class="k">Owner / lord</div><div class="v">\${s.owner}</div></div>
    <div class="field"><div class="k">Occupier / tenant</div><div class="v">\${s.occupier}</div></div>
    <div class="field"><div class="k">Documentary description</div><div class="v">\${s.desc}</div></div>
    <div class="field"><div class="k">Geometry classification</div><div class="v"><span class="chip \${s.geometryType}">\${s.geometryType.replace('_',' ')}</span></div></div>
    <div class="field"><div class="k">Confidence</div><div class="confbar \${confClass(s.confidence)}"><i></i></div></div>
    <div class="src-box"><strong>Source:</strong> \${s.source}<br><strong>Source date:</strong> \${s.sourceDate}</div>
  \`;
  document.getElementById('tabInfo').innerHTML = html;
}
function selectZone(z){
  selectedFeature = z;
  showTab('info');
  const html = \`
    <div class="kicker">\${ZONE_CATS[z.cat].label}</div>
    <h3>\${z.name}</h3>
    <div class="field"><div class="k">Date window</div><div class="v">\${z.from} – \${z.to===2026?'present':z.to}</div></div>
    <div class="field"><div class="k">Tenure</div><div class="v">\${z.tenure}</div></div>
    <div class="field"><div class="k">Owner / lord</div><div class="v">\${z.owner}</div></div>
    <div class="field"><div class="k">Occupier / tenant</div><div class="v">\${z.occupier}</div></div>
    <div class="field"><div class="k">Documentary description</div><div class="v">\${z.desc}</div></div>
    \${z.docAcres? acreageBlock(z.docAcres) : ''}
    <div class="field" style="margin-top:8px;"><div class="k">Geometry classification</div><div class="v"><span class="chip \${z.geometryType}">\${z.geometryType.replace('_',' ')}</span></div></div>
    <div class="field"><div class="k">Confidence</div><div class="confbar \${confClass(z.confidence)}"><i></i></div></div>
    <div class="src-box"><strong>Source:</strong> \${z.source}<br><strong>Source date:</strong> \${z.sourceDate}</div>
  \`;
  document.getElementById('tabInfo').innerHTML = html;
}
function selectPlacename(p){
  showTab('info');
  const html = \`
    <div class="kicker">Historical place-name form</div>
    <h3>\${p.form}</h3>
    <div class="field"><div class="k">Date</div><div class="v">\${p.date}</div></div>
    <div class="field"><div class="k">Note</div><div class="v">\${p.note}</div></div>
    <div class="field"><div class="k">Geometry classification</div><div class="v"><span class="chip DOCUMENTARY_LOCATION">DOCUMENTARY LOCATION</span></div></div>
    <div class="src-box"><strong>Source:</strong> \${p.source}</div>
  \`;
  document.getElementById('tabInfo').innerHTML = html;
}

/* ============================================================================
   TABS
   ============================================================================ */
function showTab(name){
  ['info','evidence','know','lineage'].forEach(t=>{
    document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1)).style.display = (t===name?'block':'none');
  });
  document.querySelectorAll('.tabbtn').forEach(b=> b.classList.toggle('on', b.dataset.tab===name));
}
document.querySelectorAll('.tabbtn').forEach(b=> b.addEventListener('click', ()=> showTab(b.dataset.tab)));
document.getElementById('btnEvidence').addEventListener('click', ()=> showTab('evidence'));
document.getElementById('btnKnow').addEventListener('click', ()=> showTab('know'));
document.getElementById('btnLineage').addEventListener('click', ()=> showTab('lineage'));

function renderEvidenceTable(filter){
  const f = (filter||'').toLowerCase();
  const rows = EVIDENCE_ROWS.filter(r => !f || JSON.stringify(r).toLowerCase().includes(f));
  let html = \`<thead><tr><th>Date</th><th>Entity</th><th>Name</th><th>Acreage</th><th>Tenure</th><th>Owner</th><th>Occupier</th><th>Geom.</th><th>Confidence</th><th>Notes</th></tr></thead><tbody>\`;
  rows.forEach(r=>{
    html += \`<tr><td>\${r.date}</td><td>\${r.entity}</td><td>\${r.name}</td><td>\${r.acreage}</td><td>\${r.tenure}</td><td>\${r.owner}</td><td>\${r.occupier}</td><td><span class="chip \${r.geomSource}">\${r.geomSource.replace('_',' ')}</span></td><td>\${r.confidence}</td><td style="max-width:220px;">\${r.notes}</td></tr>\`;
  });
  html += '</tbody>';
  document.getElementById('evTable').innerHTML = html;
}
document.getElementById('evSearch').addEventListener('input', e=> renderEvidenceTable(e.target.value));

function renderKnowTab(){
  document.getElementById('tabKnow').innerHTML = \`
    <h3 style="margin-bottom:4px;">What we actually know</h3>
    <div class="kicker">independently corroborated from named sources</div>
    <ul class="know-list">\${KNOW.map(k=>\`<li>\${k}</li>\`).join('')}</ul>
    <h3 style="margin:16px 0 4px;">What remains unproven</h3>
    <div class="kicker">claims from the brief not yet verified, or open research questions</div>
    <ul class="know-list unproven-list">\${UNPROVEN.map(k=>\`<li>\${k}</li>\`).join('')}</ul>
  \`;
}
function renderLineageTab(){
  let html = \`<h3 style="margin-bottom:2px;">Cydfin → Ty Mawr → Great House</h3>
  <div class="kicker">continuity, changing parcels, or later aggregation? — under investigation, not resolved</div>
  <div class="lineage">\`;
  LINEAGE.forEach((step,i)=>{
    html += \`<div class="lineage-step \${step.hyp?'hyp':''}"><div class="yr">\${step.y}\${step.hyp?' ⚠':''}</div><div class="desc"><strong>\${step.label}</strong><br>\${step.note}</div></div>\`;
    if(i<LINEAGE.length-1) html += \`<div class="lineage-arrow">↓</div>\`;
  });
  html += \`</div><div class="src-box" style="margin-top:10px;">⚠ marks the two weakest links in the chain: whether the 1793 manor purchase included this holding, and whether the demolished Great House Farm is the same holding as the 1824 Ty Mawr/Cydfin parcel. Everything else in the chain is either independently confirmed (1793 manor sale; 1882 OS sheet) or an unverified claim carried directly from the brief.</div>\`;
  document.getElementById('tabLineage').innerHTML = html;
}

/* ============================================================================
   CONTROLS
   ============================================================================ */
document.getElementById('confSwitch').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  confidenceMode = e.target.dataset.c;
  [...e.currentTarget.children].forEach(b=> b.classList.toggle('on', b===e.target));
  renderAll();
});
document.getElementById('resRow').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  currentRes = parseInt(e.target.dataset.r);
  document.getElementById('resLabel').textContent = currentRes;
  [...e.currentTarget.children].forEach(b=> b.classList.toggle('on', b===e.target));
  renderAll();
});
document.getElementById('opH3').addEventListener('input', e=>{ currentOpacityH3 = e.target.value/100; drawH3Grid(); });
document.getElementById('opZone').addEventListener('input', e=>{ currentOpacityZone = e.target.value/100; drawZones(); });

let captionState = {
  hidden: false,
  collapsed: false
};

function updateMapCaption(){
  const yy = YEARS[currentYearIdx];
  const text = CHRONICLE[yy.y] || '';
  
  const yrEl = document.getElementById('mapCaptionYr');
  const titleEl = document.getElementById('mapCaptionTitle');
  const bodyEl = document.getElementById('mapCaptionBody');
  const reopenLabelEl = document.getElementById('reopenLabel');
  const captionEl = document.getElementById('mapCaption');
  const reopenBtn = document.getElementById('mapCaptionReopen');
  const toggleBtn = document.getElementById('btnToggleCaption');

  if(yrEl) yrEl.textContent = yy.label;
  if(titleEl) titleEl.textContent = 'Milestone Archival Note';
  if(bodyEl) bodyEl.textContent = text;
  if(reopenLabelEl) reopenLabelEl.textContent = yy.label + ' Note';

  if(captionEl && reopenBtn && toggleBtn){
    if(captionState.hidden){
      captionEl.classList.add('hidden');
      reopenBtn.classList.add('show');
    } else {
      captionEl.classList.remove('hidden');
      reopenBtn.classList.remove('show');
    }

    if(captionState.collapsed){
      captionEl.classList.add('collapsed');
      toggleBtn.textContent = '▴ Expand';
      toggleBtn.title = 'Expand note text';
    } else {
      captionEl.classList.remove('collapsed');
      toggleBtn.textContent = '▾ Min';
      toggleBtn.title = 'Collapse note text';
    }
  }
}

document.getElementById('btnToggleCaption').addEventListener('click', function(e){
  e.stopPropagation();
  captionState.collapsed = !captionState.collapsed;
  updateMapCaption();
});

document.getElementById('mapCaptionToggle').addEventListener('click', function(){
  captionState.collapsed = !captionState.collapsed;
  updateMapCaption();
});

document.getElementById('btnHideCaption').addEventListener('click', function(e){
  e.stopPropagation();
  captionState.hidden = true;
  updateMapCaption();
});

document.getElementById('mapCaptionReopen').addEventListener('click', function(){
  captionState.hidden = false;
  updateMapCaption();
});

const slider = document.getElementById('timeSlider');
slider.addEventListener('input', onSliderChange);
function onSliderChange(){
  currentYearIdx = parseInt(slider.value);
  refreshTimelineLabels();
  const yy = YEARS[currentYearIdx];
  const shortTxt = CHRONICLE[yy.y].length>130 ? CHRONICLE[yy.y].slice(0,130)+'…' : CHRONICLE[yy.y];
  document.getElementById('nowBadge').innerHTML = \`\${yy.label} <small>\${shortTxt}</small>\`;
  updateMapCaption();
  renderAll();
}

function renderAll(){
  drawH3Grid();
  drawZones();
  drawSites();
  drawLabels();
  drawOS();
}

/* ---- Mobile drawers ---- */
const sidebarEl = document.querySelector('.sidebar');
const infoPanelEl = document.querySelector('.info-panel');
const backdropEl = document.getElementById('drawerBackdrop');
function openDrawer(el){
  closeDrawers();
  el.classList.add('open');
  backdropEl.classList.add('show');
}
function closeDrawers(){
  sidebarEl.classList.remove('open');
  infoPanelEl.classList.remove('open');
  backdropEl.classList.remove('show');
}
document.getElementById('btnOpenLayers').addEventListener('click', ()=> openDrawer(sidebarEl));
document.getElementById('btnOpenInfo').addEventListener('click', ()=> openDrawer(infoPanelEl));
document.getElementById('closeSidebar').addEventListener('click', closeDrawers);
document.getElementById('closeInfo').addEventListener('click', closeDrawers);
backdropEl.addEventListener('click', closeDrawers);
// Selecting any map feature on a narrow screen should surface the info panel automatically
const _origSelectSite = selectSite, _origSelectZone = selectZone, _origSelectPlacename = selectPlacename;
selectSite = function(s){ _origSelectSite(s); if(window.innerWidth<=860) openDrawer(infoPanelEl); };
selectZone = function(z){ _origSelectZone(z); if(window.innerWidth<=860) openDrawer(infoPanelEl); };
selectPlacename = function(p){ _origSelectPlacename(p); if(window.innerWidth<=860) openDrawer(infoPanelEl); };

/* Init */
renderEvidenceTable('');
renderKnowTab();
renderLineageTab();
onSliderChange();
</script>
</body>
</html>
`;
