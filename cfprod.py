from playwright.sync_api import sync_playwright
from pathlib import Path
import time

OUT = Path(r"C:\Users\Hemant\AppData\Local\Temp\opencode\pt_audit\cfprod.txt")
LOG = []

def attempt(page):
    msgs, fontreqs, moderrs, resp = [], [], [], {}
    page.on("console", lambda m: msgs.append(f"{m.type}: {m.text[:220]}"))
    def on_resp(r):
        u = r.url
        if "fonts" in u or ".pbf" in u:
            fontreqs.append(f"{r.status} {u[:130]}")
        if "maplibre-gl-worker" in u:
            resp["worker_url"] = u
            resp["worker_status"] = r.status
            resp["worker_ct"] = r.headers.get("content-type", "?")
    page.on("response", on_resp)
    try:
        page.goto("https://criaruntime.pages.dev", wait_until="domcontentloaded", timeout=60000)
    except Exception as e:
        return {"err": f"goto:{str(e)[:120]}", "msgs": msgs}
    page.wait_for_timeout(3500)
    try:
        rail = page.locator(".pt-rail-btn")
        if rail.count() > 1:
            rail.nth(1).click()
    except Exception:
        pass
    page.wait_for_timeout(11000)
    st = page.evaluate("""() => { const m = window.__criaMap; if(!m) return {exposed:false};
      return { exposed:true, loaded:(()=>{try{return m.loaded()}catch(e){return 'THROW'}})(),
               has3d:(()=>{try{return !!m.getLayer('secret-3d-buildings')}catch(e){return false}})(),
               hasCases:(()=>{try{return !!m.getLayer('secret-cases')}catch(e){return false}})(),
               hasOverlay:(()=>{try{return !!m.getLayer('secret-three-intel-overlay')}catch(e){return false}})(),
               canvasW:(()=>{try{return m.getCanvas().clientWidth}catch(e){return -1}})(),
               canvasH:(()=>{try{return m.getCanvas().clientHeight}catch(e){return -1}})() }; }""")
    cria = [x for x in msgs if "[CRIA MAP]" in x]
    moderr = [x for x in msgs if ("Failed to load module script" in x or "text/html" in x)]
    opensans = [f for f in fontreqs if "Open" in f]
    f404 = [f for f in fontreqs if f.startswith("404")]
    hud = page.locator(".pt-hud").inner_text() if page.locator(".pt-hud").count() else ""
    return {
        "err": None,
        "st": st,
        "resp": resp,
        "moderr": moderr[:3],
        "opensans": opensans[:3],
        "f404": f404[:4],
        "fontsNoto": len([f for f in fontreqs if "Noto" in f and f.startswith("200")]),
        "cria": cria[-14:],
        "hudReady": "READY" in hud,
    }

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1920,"height":1080})
    result = None
    for i in range(10):
        LOG.append(f"--- attempt {i+1} ---")
        r = attempt(page)
        stable = (not r.get("err")) and r.get("st", {}).get("exposed") and r["st"].get("has3d")
        LOG.append("  quick: err=%s exposed=%s has3d=%s" % (r.get("err") is not None, r.get("st", {}).get("exposed"), r.get("st", {}).get("has3d")))
        if stable:
            result = r
            break
        time.sleep(15)
    if result is None:
        result = r
    LOG.append("=== FINAL ===")
    LOG.append("MAP-STATE: " + str(result.get("st")))
    LOG.append("WORKER-RESP: " + str(result.get("resp")))
    LOG.append("MODULE-ERRORS: " + str(result.get("moderr")))
    LOG.append("OPEN-SANS-REQS: " + str(result.get("opensans")))
    LOG.append("FONT-404: " + str(result.get("f404")))
    LOG.append("NOTO-200-COUNT: " + str(result.get("fontsNoto")))
    LOG.append("HUD-READY: " + str(result.get("hudReady")))
    for m in result.get("cria", []):
        LOG.append("  " + m[:220])
    page.screenshot(path=str(OUT.with_suffix(".png")))
    browser.close()

OUT.write_text("\n".join(LOG), encoding="utf-8")
print("done")