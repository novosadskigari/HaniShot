# HaniShot 🎥 📸

> **A modern, privacy-first, 100% local screen recorder and full-page screenshot Chrome extension built with Manifest V3.**
> No paywalls. No time limits. No cloud uploads. Everything stays on your machine.

---

## ✨ Features

### 🎥 Screen & Audio Recording (Unlimited Duration)
* **Record Entire Screen, Single Tab, or Webcam**: Flexible recording options for tutorials, meetings, presentations, and gameplay.
* **Dual Audio Capture**: Simultaneously records your microphone and system/tab audio using the Web Audio API without feedback loops.
* **Automatic Video Splitting (Chunking)**:
  * Automatically cuts long recordings into numbered playable files (`Part 1`, `Part 2`, etc.) without interrupting your live recording session.
  * **Default segment length: 30 minutes** (customizable to 10m, 15m, 30m, 45m, 60m, or disabled in Options).
  * Safeguards long recordings against browser memory exhaustion.
* **In-Page Floating Controller**: Draggable overlay widget featuring a live timer, part indicator, Pause, Resume, Stop, and Discard buttons.
* **High Resolution**: Crystal-clear 720p, 1080p Full HD, or Native / 4K up to 60 FPS in WebM (VP9/Opus) and MP4.

### 📸 Full-Featured Screenshot Suite
* **Visible Page**: Snap the active viewport instantly.
* **Selected Area**: Click-and-drag interactive crop tool with real-time pixel dimensions and cancel/confirm buttons.
* **Full Page Scrolling**: Automatically scrolls through the entire webpage, captures vertical slices, and stitches them seamlessly into a single high-resolution image.

### 🎨 In-Browser Image Editor & Media Player
* **Annotation Tools**: Add rectangles, arrows, freehand drawings, text labels, and apply **pixelate/blur redaction** to hide sensitive data like passwords and emails.
* **One-Click Clipboard Copy**: Directly copy annotated screenshots to your system clipboard (`Ctrl+C` / `Cmd+C` or click `📋 Copy`).
* **HTML5 Video Player**: Immediate playback with speed adjustment controls (1x, 1.25x, 1.5x, 2x) and instant download.

### 💾 100% Local Storage & Media Gallery
* Built-in **Gallery** (`gallery.html`) to manage, filter, preview, and download your library of recordings and screenshots.
* Saved locally via IndexedDB with `unlimitedStorage` permissions.
* **Zero telemetry, zero tracking, zero external server dependency**.

---

## 🚀 Installation Guide

### Method 1: Git Clone (Recommended — Enables Easy Updates)

1. Open your terminal and clone the repository:
   ```bash
   git clone https://github.com/novosadskigari/HaniShot.git
   ```
2. Open your Chromium-based browser (Google Chrome, Brave, Microsoft Edge, Opera, or Vivaldi) and navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** toggle in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the cloned `HaniShot` directory.
6. Pin **HaniShot** to your browser toolbar and you're ready to go!

---

### Method 2: Download ZIP

1. Click **Code** -> **Download ZIP** on GitHub (or download from [Releases](https://github.com/novosadskigari/HaniShot/releases)).
2. Extract the downloaded ZIP archive on your computer.
3. Open `chrome://extensions` in your browser.
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select the unzipped `HaniShot` folder.

---

## 🔄 Automatic Update Checker

HaniShot includes a built-in background update detection engine:
- Every 6 hours (and on browser launch), HaniShot checks the GitHub repository for new version releases.
- When an update is published on GitHub, a **`NEW`** badge will appear on the extension icon and a notification banner will display in the Popup and Settings.

### How to Apply Updates:
If you installed using **Git**:
```bash
cd /path/to/HaniShot
git pull
```
Then go to `chrome://extensions` and click the **Reload (🔄)** icon on the HaniShot card.

If you installed using **ZIP**:
Download the latest ZIP release, replace the folder contents, and click the **Reload (🔄)** icon in `chrome://extensions`.

---

## ⌨️ Default Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| `Alt + Shift + V` | Capture visible area of active tab |
| `Alt + Shift + S` | Capture selected rectangular area |
| `Alt + Shift + F` | Capture full scrolling page |
| `Alt + Shift + R` | Start / Stop desktop screen recording |

*(Shortcuts can be customized at `chrome://extensions/shortcuts`)*

---

## ⚙️ Configuration & Options

Access settings by clicking the ⚙️ icon in the popup or right-clicking the HaniShot icon and selecting **Options**:
- **Auto-Split Length**: Choose segment duration (default: 30 minutes).
- **Default Resolution & FPS**: 1080p, 4K, 720p at 30 or 60 FPS.
- **Audio Inputs**: Default state for microphone and tab/system sound.
- **Screenshot Format**: Lossless PNG or compressed JPEG.
- **Auto-Download**: Automatically download video chunks upon completion.

---

## 🛠️ Project Structure

```
HaniShot/
├── manifest.json          # Manifest V3 extension configuration
├── version.json           # Remote version tracker for auto-updates
├── background/
│   └── background.js      # Service Worker (commands, offscreen & downloads)
├── offscreen/
│   ├── offscreen.html     # Background capture container
│   └── offscreen.js       # MediaRecorder, Web Audio mixer & 30-min auto-splitter
├── popup/
│   ├── popup.html         # Main extension popup interface
│   ├── popup.css
│   └── popup.js
├── content/
│   ├── area-crop.js       # Interactive area selection overlay
│   ├── fullpage-scroll.js # Automated scrolling page stitcher
│   └── floating-bar.js    # Draggable in-page recording controller
├── viewer/
│   ├── viewer.html        # Annotation canvas & HTML5 video player
│   ├── viewer.css
│   └── viewer.js
├── gallery/
│   ├── gallery.html       # Local media gallery manager
│   ├── gallery.css
│   └── gallery.js
├── options/
│   ├── options.html       # Extension preferences & update checker
│   ├── options.css
│   └── options.js
├── utils/
│   ├── db.js              # IndexedDB local storage engine
│   └── updater.js         # GitHub update detection & version comparator
├── icons/                 # Crisp SVG-rendered PNG icons (16, 32, 48, 128 px)
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Free for personal and commercial use.

---

## 👨‍💻 Credits & Author

Developed with ❤️ by **[NWD](https://github.com/novosadskigari/HaniShot)**

### ☕ Support & Donations
- 🥃 [Buy me a Jägermeister](https://coff.ee/damirbodor)
- 💰 [Donate with PayPal](http://paypal.me/damirnwd)
