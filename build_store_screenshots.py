import os
import subprocess
import base64

OUTPUT_DIR = "/Applications/MAMP/htdocs/HaniShot/store-assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open("/Applications/MAMP/htdocs/HaniShot/icons/icon-128.png", "rb") as f:
    ICON_B64 = base64.b64encode(f.read()).decode("utf-8")

# --- SLIDE 1: SCREENSHOT TAB ---
slide1_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
  width: 1280px;
  height: 800px;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  background: radial-gradient(circle at 50% 5%, #1a2438 0%, #0c111d 55%, #070a12 100%);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 34px 40px;
  position: relative;
}}
.glow-1 {{
  position: absolute;
  top: -80px; left: 25%;
  width: 500px; height: 350px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0) 70%);
  filter: blur(60px);
}}
.glow-2 {{
  position: absolute;
  bottom: -40px; right: 20%;
  width: 450px; height: 300px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(56, 189, 248, 0) 70%);
  filter: blur(60px);
}}
.header-banner {{
  text-align: center;
  margin-bottom: 22px;
  z-index: 2;
}}
.badge {{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 999px;
  color: #fbbf24;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}}
.header-banner h1 {{
  font-size: 30px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 5px;
}}
.header-banner p {{
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}}
.browser-window {{
  width: 1040px;
  height: 575px;
  background: #111827;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 2;
}}
.browser-header {{
  height: 42px;
  background: #1a2234;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 14px;
}}
.traffic-lights {{ display: flex; gap: 7px; }}
.dot {{ width: 11px; height: 11px; border-radius: 50%; }}
.dot.red {{ background: #ef4444; }}
.dot.yellow {{ background: #f59e0b; }}
.dot.green {{ background: #10b981; }}
.url-bar {{
  flex: 1;
  height: 26px;
  background: #0f172a;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}}
.url-bar .lock {{ color: #10b981; font-size: 11px; }}
.browser-actions {{ display: flex; align-items: center; gap: 8px; }}
.ext-btn {{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}}
.ext-btn img {{ width: 20px; height: 20px; }}
.browser-content {{
  flex: 1;
  background: #0b0f19;
  padding: 24px;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  position: relative;
}}
.mock-sidebar {{
  background: #151d30;
  border: 1px solid #23314e;
  border-radius: 8px;
  padding: 16px;
}}
.mock-bar {{ height: 10px; background: #23314e; border-radius: 4px; margin-bottom: 12px; }}
.mock-main {{
  display: flex;
  flex-direction: column;
  gap: 16px;
}}
.mock-cards {{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}}
.mock-card {{
  background: #151d30;
  border: 1px solid #23314e;
  border-radius: 8px;
  padding: 16px;
  height: 100px;
}}
.mock-chart {{
  background: #151d30;
  border: 1px solid #23314e;
  border-radius: 8px;
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
}}
.chart-bar {{
  flex: 1;
  background: linear-gradient(180deg, #38bdf8, #0284c7);
  border-radius: 4px 4px 0 0;
}}
.hanishot-popup {{
  position: absolute;
  top: 14px;
  right: 18px;
  width: 320px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
  padding: 14px;
  z-index: 10;
}}
.popup-head {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1e293b;
}}
.brand {{ display: flex; align-items: center; gap: 8px; }}
.brand img {{ width: 24px; height: 24px; }}
.brand span {{ font-weight: 800; font-size: 15px; color: #f8fafc; }}
.head-icons {{ display: flex; gap: 6px; }}
.icon-btn {{
  background: #1e293b;
  border: 1px solid #334155;
  color: #94a3b8;
  border-radius: 6px;
  padding: 4px 7px;
  font-size: 11px;
}}
.tab-nav {{
  display: flex;
  background: #1e293b;
  border-radius: 8px;
  padding: 3px;
  margin-bottom: 12px;
  gap: 4px;
}}
.tab-item {{
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  border-radius: 6px;
}}
.tab-item.active {{
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
}}
.action-card {{
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
}}
.action-card.highlight {{
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}}
.action-icon {{
  font-size: 18px;
  background: #0f172a;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}}
.action-info h4 {{ font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 2px; }}
.action-info p {{ font-size: 11px; color: #94a3b8; }}
.popup-footer {{
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #1e293b;
}}
.badge-row {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}}
.pill-green {{
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}}
.footer-stats {{ font-size: 10px; color: #64748b; }}
.credits {{ font-size: 10px; color: #64748b; text-align: center; }}
</style>
</head>
<body>
<div class="glow-1"></div>
<div class="glow-2"></div>
<div class="header-banner">
  <div class="badge">📸 Ultra-Sharp Capture Modes</div>
  <h1>Capture Visible Area, Selected Crop & Full Page</h1>
  <p>1-Click instant screenshot capture with built-in annotation editor and local export</p>
</div>

<div class="browser-window">
  <div class="browser-header">
    <div class="traffic-lights">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
    </div>
    <div class="url-bar">
      <span class="lock">🔒</span>
      <span>https://analytics.workspace.io/dashboard</span>
    </div>
    <div class="browser-actions">
      <div class="ext-btn">
        <img src="data:image/png;base64,{ICON_B64}" alt="HaniShot">
      </div>
    </div>
  </div>

  <div class="browser-content">
    <div class="mock-sidebar">
      <div class="mock-bar" style="width: 70%; background: #38bdf8;"></div>
      <div class="mock-bar" style="width: 90%;"></div>
      <div class="mock-bar" style="width: 80%;"></div>
      <div class="mock-bar" style="width: 85%;"></div>
      <div class="mock-bar" style="width: 60%; margin-top: 24px;"></div>
      <div class="mock-bar" style="width: 75%;"></div>
    </div>
    <div class="mock-main">
      <div class="mock-cards">
        <div class="mock-card">
          <div class="mock-bar" style="width: 45%;"></div>
          <div style="font-size: 20px; font-weight: 800; color: #34d399; margin: 8px 0;">+148.5%</div>
          <div class="mock-bar" style="width: 70%;"></div>
        </div>
        <div class="mock-card">
          <div class="mock-bar" style="width: 50%;"></div>
          <div style="font-size: 20px; font-weight: 800; color: #38bdf8; margin: 8px 0;">24,890</div>
          <div class="mock-bar" style="width: 65%;"></div>
        </div>
        <div class="mock-card">
          <div class="mock-bar" style="width: 40%;"></div>
          <div style="font-size: 20px; font-weight: 800; color: #fbbf24; margin: 8px 0;">99.98%</div>
          <div class="mock-bar" style="width: 80%;"></div>
        </div>
      </div>
      <div class="mock-chart">
        <div class="chart-bar" style="height: 45%;"></div>
        <div class="chart-bar" style="height: 60%;"></div>
        <div class="chart-bar" style="height: 35%;"></div>
        <div class="chart-bar" style="height: 80%;"></div>
        <div class="chart-bar" style="height: 55%;"></div>
        <div class="chart-bar" style="height: 90%;"></div>
        <div class="chart-bar" style="height: 70%;"></div>
        <div class="chart-bar" style="height: 85%;"></div>
      </div>
    </div>

    <!-- HaniShot Popup -->
    <div class="hanishot-popup">
      <div class="popup-head">
        <div class="brand">
          <img src="data:image/png;base64,{ICON_B64}">
          <span>HaniShot</span>
        </div>
        <div class="head-icons">
          <span class="icon-btn">📁</span>
          <span class="icon-btn">⚙️</span>
        </div>
      </div>

      <div class="tab-nav">
        <div class="tab-item active">📸 Screenshot</div>
        <div class="tab-item">🎥 Record Video</div>
      </div>

      <div class="action-card">
        <div class="action-icon">👁️</div>
        <div class="action-info">
          <h4>Visible Part</h4>
          <p>Capture what you see right now</p>
        </div>
      </div>

      <div class="action-card highlight">
        <div class="action-icon">✂️</div>
        <div class="action-info">
          <h4 style="color: #fbbf24;">Selected Area</h4>
          <p>Click and drag to select any region</p>
        </div>
      </div>

      <div class="action-card">
        <div class="action-icon">📜</div>
        <div class="action-info">
          <h4>Full Page</h4>
          <p>Scroll and capture entire web page</p>
        </div>
      </div>

      <div class="popup-footer">
        <div class="badge-row">
          <span class="pill-green">Unlimited</span>
          <span class="footer-stats">100% Local • Zero Limits</span>
        </div>
        <div class="credits">Developed with ❤️ by <strong style="color: #38bdf8;">NWD</strong></div>
      </div>
    </div>
  </div>
</div>
</body>
</html>"""

with open(f"{OUTPUT_DIR}/slide1.html", "w") as f:
    f.write(slide1_html)


# --- SLIDE 2: VIDEO RECORDING & AUTO-SPLIT ---
slide2_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
  width: 1280px;
  height: 800px;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  background: radial-gradient(circle at 50% 5%, #1a2438 0%, #0c111d 55%, #070a12 100%);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 34px 40px;
  position: relative;
}}
.glow-1 {{
  position: absolute;
  top: -80px; left: 25%;
  width: 500px; height: 350px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.16) 0%, rgba(239, 68, 68, 0) 70%);
  filter: blur(60px);
}}
.glow-2 {{
  position: absolute;
  bottom: -40px; right: 20%;
  width: 450px; height: 300px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0) 70%);
  filter: blur(60px);
}}
.header-banner {{
  text-align: center;
  margin-bottom: 22px;
  z-index: 2;
}}
.badge {{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 999px;
  color: #f87171;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}}
.header-banner h1 {{
  font-size: 30px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 5px;
}}
.header-banner p {{
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}}
.browser-window {{
  width: 1040px;
  height: 575px;
  background: #111827;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 2;
}}
.browser-header {{
  height: 42px;
  background: #1a2234;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 14px;
}}
.traffic-lights {{ display: flex; gap: 7px; }}
.dot {{ width: 11px; height: 11px; border-radius: 50%; }}
.dot.red {{ background: #ef4444; }}
.dot.yellow {{ background: #f59e0b; }}
.dot.green {{ background: #10b981; }}
.url-bar {{
  flex: 1;
  height: 26px;
  background: #0f172a;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}}
.url-bar .lock {{ color: #10b981; font-size: 11px; }}
.browser-actions {{ display: flex; align-items: center; gap: 8px; }}
.ext-btn {{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}}
.ext-btn img {{ width: 20px; height: 20px; }}
.browser-content {{
  flex: 1;
  background: #0d1117;
  padding: 24px;
  display: flex;
  flex-direction: column;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  position: relative;
}}
.code-line {{ height: 22px; display: flex; align-items: center; gap: 12px; }}
.ln {{ color: #484f58; width: 24px; text-align: right; }}
.k {{ color: #ff7b72; }}
.f {{ color: #d2a8ff; }}
.s {{ color: #a5d6ff; }}
.c {{ color: #8b949e; }}
.hanishot-popup {{
  position: absolute;
  top: 14px;
  right: 18px;
  width: 325px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
  padding: 14px;
  z-index: 10;
  font-family: 'Plus Jakarta Sans', sans-serif;
}}
.popup-head {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1e293b;
}}
.brand {{ display: flex; align-items: center; gap: 8px; }}
.brand img {{ width: 24px; height: 24px; }}
.brand span {{ font-weight: 800; font-size: 15px; color: #f8fafc; }}
.head-icons {{ display: flex; gap: 6px; }}
.icon-btn {{
  background: #1e293b;
  border: 1px solid #334155;
  color: #94a3b8;
  border-radius: 6px;
  padding: 4px 7px;
  font-size: 11px;
}}
.tab-nav {{
  display: flex;
  background: #1e293b;
  border-radius: 8px;
  padding: 3px;
  margin-bottom: 12px;
  gap: 4px;
}}
.tab-item {{
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  border-radius: 6px;
}}
.tab-item.active {{
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
}}
.type-grid {{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}}
.type-card {{
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 4px;
  text-align: center;
}}
.type-card.active {{
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
}}
.type-icon {{ font-size: 18px; margin-bottom: 4px; }}
.type-label {{ font-size: 11px; font-weight: 700; }}
.toggle-row {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #1e293b;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 12px;
}}
.switch-pill {{
  width: 32px;
  height: 18px;
  background: #0284c7;
  border-radius: 999px;
  position: relative;
}}
.switch-pill::after {{
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
}}
.split-banner {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  margin: 10px 0;
  font-size: 11px;
}}
.record-btn {{
  width: 100%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-weight: 700;
  font-size: 13px;
  padding: 10px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}}
.popup-footer {{
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #1e293b;
}}
.badge-row {{
  display: flex;
  align-items: center;
  justify-content: space-between;
}}
.pill-green {{
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}}
.footer-stats {{ font-size: 10px; color: #64748b; }}
</style>
</head>
<body>
<div class="glow-1"></div>
<div class="glow-2"></div>
<div class="header-banner">
  <div class="badge">🎥 Unlimited Video & Audio Capture</div>
  <h1>Record Screen, Tab & Mic with Smart Auto-Split</h1>
  <p>Continuous recording with automatic file segmentation to safeguard against browser memory limits</p>
</div>

<div class="browser-window">
  <div class="browser-header">
    <div class="traffic-lights">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
    </div>
    <div class="url-bar">
      <span class="lock">🔒</span>
      <span>https://github.com/novosadskigari/HaniShot/src/engine.ts</span>
    </div>
    <div class="browser-actions">
      <div class="ext-btn">
        <img src="data:image/png;base64,{ICON_B64}" alt="HaniShot">
      </div>
    </div>
  </div>

  <div class="browser-content">
    <div class="code-line"><span class="ln">1</span> <span><span class="k">import</span> {{ MediaRecorderEngine }} <span class="k">from</span> <span class="s">'./recorder'</span>;</span></div>
    <div class="code-line"><span class="ln">2</span> <span><span class="k">export async function</span> <span class="f">startStreamCapture</span>(config) {{</span></div>
    <div class="code-line"><span class="ln">3</span> <span>  <span class="c">// Continuous screen recording with dual-channel audio mixing</span></span></div>
    <div class="code-line"><span class="ln">4</span> <span>  <span class="k">const</span> screen = <span class="k">await</span> navigator.mediaDevices.<span class="f">getDisplayMedia</span>({{</span></div>
    <div class="code-line"><span class="ln">5</span> <span>    video: {{ frameRate: 60, resolution: <span class="s">'native'</span> }},</span></div>
    <div class="code-line"><span class="ln">6</span> <span>    audio: config.systemAudio</span></div>
    <div class="code-line"><span class="ln">7</span> <span>  }});</span></div>
    <div class="code-line"><span class="ln">8</span> <span>  <span class="c">// Auto-split scheduled every 30 minutes seamlessly</span></span></div>
    <div class="code-line"><span class="ln">9</span> <span>  recorder.<span class="f">enableAutoChunking</span>({{ splitMinutes: 30 }});</span></div>
    <div class="code-line"><span class="ln">10</span> <span>  <span class="k">return</span> recorder.<span class="f">start</span>();</span></div>
    <div class="code-line"><span class="ln">11</span> <span>}}</span></div>

    <!-- HaniShot Popup -->
    <div class="hanishot-popup">
      <div class="popup-head">
        <div class="brand">
          <img src="data:image/png;base64,{ICON_B64}">
          <span>HaniShot</span>
        </div>
        <div class="head-icons">
          <span class="icon-btn">📁</span>
          <span class="icon-btn">⚙️</span>
        </div>
      </div>

      <div class="tab-nav">
        <div class="tab-item">📸 Screenshot</div>
        <div class="tab-item active">🎥 Record Video</div>
      </div>

      <div class="type-grid">
        <div class="type-card active">
          <div class="type-icon">🖥️</div>
          <div class="type-label">Screen</div>
        </div>
        <div class="type-card">
          <div class="type-icon">📄</div>
          <div class="type-label">Tab</div>
        </div>
        <div class="type-card">
          <div class="type-icon">📷</div>
          <div class="type-label">Camera</div>
        </div>
      </div>

      <div class="toggle-row">
        <span>🎙️ Microphone</span>
        <div class="switch-pill"></div>
      </div>

      <div class="toggle-row">
        <span>🔊 System / Tab Audio</span>
        <div class="switch-pill"></div>
      </div>

      <div class="split-banner">
        <span>✂️ Auto-Split: <strong style="color: #38bdf8;">30 min</strong></span>
        <span style="color: #38bdf8; font-weight: 600; cursor: pointer;">Edit</span>
      </div>

      <button class="record-btn">
        <span>●</span> Start Recording
      </button>

      <div class="popup-footer">
        <div class="badge-row">
          <span class="pill-green">Unlimited</span>
          <span class="footer-stats">100% Local • Zero Limits</span>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>"""

with open(f"{OUTPUT_DIR}/slide2.html", "w") as f:
    f.write(slide2_html)


# --- SLIDE 3: 100% LOCAL MEDIA GALLERY ---
slide3_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{
  width: 1280px;
  height: 800px;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  background: radial-gradient(circle at 50% 5%, #1a2438 0%, #0c111d 55%, #070a12 100%);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 34px 40px;
  position: relative;
}}
.glow-1 {{
  position: absolute;
  top: -80px; left: 25%;
  width: 500px; height: 350px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0) 70%);
  filter: blur(60px);
}}
.glow-2 {{
  position: absolute;
  bottom: -40px; right: 20%;
  width: 450px; height: 300px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(56, 189, 248, 0) 70%);
  filter: blur(60px);
}}
.header-banner {{
  text-align: center;
  margin-bottom: 22px;
  z-index: 2;
}}
.badge {{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 999px;
  color: #34d399;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}}
.header-banner h1 {{
  font-size: 30px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 5px;
}}
.header-banner p {{
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}}
.browser-window {{
  width: 1040px;
  height: 575px;
  background: #0b0f19;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 2;
}}
.browser-header {{
  height: 42px;
  background: #1a2234;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 14px;
}}
.traffic-lights {{ display: flex; gap: 7px; }}
.dot {{ width: 11px; height: 11px; border-radius: 50%; }}
.dot.red {{ background: #ef4444; }}
.dot.yellow {{ background: #f59e0b; }}
.dot.green {{ background: #10b981; }}
.url-bar {{
  flex: 1;
  height: 26px;
  background: #0f172a;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}}
.url-bar .lock {{ color: #10b981; font-size: 11px; }}

/* Gallery Inner Layout */
.gallery-container {{
  flex: 1;
  padding: 18px 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}}
.gallery-top {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1e293b;
}}
.brand-group {{ display: flex; align-items: center; gap: 12px; }}
.brand-group img {{ width: 36px; height: 36px; }}
.brand-group h2 {{ font-size: 18px; font-weight: 800; color: #ffffff; }}
.brand-group p {{ font-size: 12px; color: #94a3b8; margin-top: 1px; }}
.top-actions {{ display: flex; align-items: center; gap: 10px; }}
.storage-pill {{
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  color: #94a3b8;
}}
.storage-pill strong {{ color: #38bdf8; }}
.opt-btn {{
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #f8fafc;
}}
.filter-bar {{
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}}
.filter-btn {{
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}}
.filter-btn.active {{
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}}

/* Cards Grid */
.cards-grid {{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}}
.media-card {{
  background: #151d30;
  border: 1px solid #23314e;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}}
.card-thumb {{
  height: 92px;
  background: #0a0e17;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}}
.thumb-tag {{
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.7);
}}
.tag-video {{ color: #38bdf8; }}
.tag-shot {{ color: #fbbf24; }}
.part-pill {{
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #0284c7;
  color: white;
}}
.card-details {{
  padding: 10px;
}}
.card-title {{
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}}
.card-meta {{
  font-size: 10px;
  color: #64748b;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}}
.card-buttons {{
  display: flex;
  gap: 6px;
}}
.c-btn {{
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px 0;
  font-size: 10px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
}}
.c-btn.del {{
  flex: 0 0 26px;
  color: #ef4444;
}}
</style>
</head>
<body>
<div class="glow-1"></div>
<div class="glow-2"></div>
<div class="header-banner">
  <div class="badge">💾 100% Local Media Gallery</div>
  <h1>Browse, Preview & Download All Your Captures</h1>
  <p>Never uploaded to any cloud server — 100% stored securely inside your browser's IndexedDB</p>
</div>

<div class="browser-window">
  <div class="browser-header">
    <div class="traffic-lights">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
    </div>
    <div class="url-bar">
      <span class="lock">🔒</span>
      <span>chrome-extension://hanishot/gallery/gallery.html</span>
    </div>
  </div>

  <div class="gallery-container">
    <div class="gallery-top">
      <div class="brand-group">
        <img src="data:image/png;base64,{ICON_B64}">
        <div>
          <h2>HaniShot Gallery</h2>
          <p>All your local recordings and screenshots — 100% private and stored on your machine.</p>
        </div>
      </div>
      <div class="top-actions">
        <div class="storage-pill">Storage: <strong>38.45 MB</strong></div>
        <div class="opt-btn">⚙️ Options</div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-btn active">All Items (6)</div>
      <div class="filter-btn">🎥 Videos (2)</div>
      <div class="filter-btn">📸 Screenshots (4)</div>
    </div>

    <div class="cards-grid">
      <!-- Card 1 -->
      <div class="media-card">
        <div class="card-thumb" style="background: linear-gradient(135deg, #1e293b, #0f172a);">
          <span class="thumb-tag tag-video">🎥 Video</span>
          <span class="part-pill">Part 1</span>
          <div style="font-size: 26px;">▶️</div>
        </div>
        <div class="card-details">
          <div class="card-title">HaniShot_Product_Demo_Part1.mp4</div>
          <div class="card-meta"><span>Today, 11:30 AM</span><span>18.4 MB</span></div>
          <div class="card-buttons">
            <div class="c-btn">👁️ View</div>
            <div class="c-btn">⬇️ Download</div>
            <div class="c-btn del">🗑️</div>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="media-card">
        <div class="card-thumb" style="background: linear-gradient(135deg, #1e293b, #0f172a);">
          <span class="thumb-tag tag-video">🎥 Video</span>
          <span class="part-pill">Part 1</span>
          <div style="font-size: 26px;">▶️</div>
        </div>
        <div class="card-details">
          <div class="card-title">HaniShot_Design_Review_Part1.mp4</div>
          <div class="card-meta"><span>Today, 10:15 AM</span><span>22.8 MB</span></div>
          <div class="card-buttons">
            <div class="c-btn">👁️ View</div>
            <div class="c-btn">⬇️ Download</div>
            <div class="c-btn del">🗑️</div>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="media-card">
        <div class="card-thumb" style="background: #111e38; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
          <span class="thumb-tag tag-shot">📸 Screenshot</span>
          <div style="width: 70%; height: 6px; background: #38bdf8; border-radius: 2px;"></div>
          <div style="width: 50%; height: 6px; background: #34d399; border-radius: 2px;"></div>
          <div style="width: 60%; height: 6px; background: #fbbf24; border-radius: 2px;"></div>
        </div>
        <div class="card-details">
          <div class="card-title">HaniShot_Crop_Analytics_Dashboard.png</div>
          <div class="card-meta"><span>Yesterday, 17:40 PM</span><span>480 KB</span></div>
          <div class="card-buttons">
            <div class="c-btn">👁️ View</div>
            <div class="c-btn">⬇️ Download</div>
            <div class="c-btn del">🗑️</div>
          </div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="media-card">
        <div class="card-thumb" style="background: #151d30; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;">
          <span class="thumb-tag tag-shot">📸 Screenshot</span>
          <div style="width: 80%; height: 8px; background: #334155; border-radius: 3px;"></div>
          <div style="width: 75%; height: 28px; background: #1e293b; border-radius: 4px; border: 1px solid #334155;"></div>
        </div>
        <div class="card-details">
          <div class="card-title">HaniShot_FullPage_Landing_Review.png</div>
          <div class="card-meta"><span>Yesterday, 14:12 PM</span><span>1.2 MB</span></div>
          <div class="card-buttons">
            <div class="c-btn">👁️ View</div>
            <div class="c-btn">⬇️ Download</div>
            <div class="c-btn del">🗑️</div>
          </div>
        </div>
      </div>

      <!-- Card 5 -->
      <div class="media-card">
        <div class="card-thumb" style="background: #0f172a; display: flex; align-items: center; justify-content: center;">
          <span class="thumb-tag tag-shot">📸 Screenshot</span>
          <div style="width: 44px; height: 64px; border: 2px solid #38bdf8; border-radius: 6px;"></div>
        </div>
        <div class="card-details">
          <div class="card-title">HaniShot_Selected_Mobile_Flow.png</div>
          <div class="card-meta"><span>Oct 31, 15:08 PM</span><span>340 KB</span></div>
          <div class="card-buttons">
            <div class="c-btn">👁️ View</div>
            <div class="c-btn">⬇️ Download</div>
            <div class="c-btn del">🗑️</div>
          </div>
        </div>
      </div>

      <!-- Card 6 -->
      <div class="media-card">
        <div class="card-thumb" style="background: #0c1220; display: flex; flex-direction: column; align-items: flex-start; padding: 16px; gap: 4px;">
          <span class="thumb-tag tag-shot">📸 Screenshot</span>
          <div style="width: 50%; height: 5px; background: #34d399; border-radius: 2px;"></div>
          <div style="width: 70%; height: 5px; background: #64748b; border-radius: 2px;"></div>
          <div style="width: 60%; height: 5px; background: #64748b; border-radius: 2px;"></div>
        </div>
        <div class="card-details">
          <div class="card-title">HaniShot_Visible_Console_Log.png</div>
          <div class="card-meta"><span>Oct 30, 09:30 AM</span><span>210 KB</span></div>
          <div class="card-buttons">
            <div class="c-btn">👁️ View</div>
            <div class="c-btn">⬇️ Download</div>
            <div class="c-btn del">🗑️</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>"""

with open(f"{OUTPUT_DIR}/slide3.html", "w") as f:
    f.write(slide3_html)

print("Generated HTML slides.")
