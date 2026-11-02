# Chrome Web Store Listing — HaniShot

> Last Updated: 2026-11-02

## Store Listing

**Extension Name** [REQUIRED]
HaniShot - Screen Recorder & Screenshot

**Short Description** [REQUIRED]
Unlimited screen & tab video recording with customizable auto-split length, full-page screenshots, and 100% local storage.

**Detailed Description** [REQUIRED]
HaniShot is a lightweight, privacy-first screen recorder and screenshot extension designed for effortless content creation, tutorials, meeting captures, and bug reports.

Record your desktop, application windows, or browser tabs with crystal-clear audio from both your computer and your microphone. Long recordings are automatically and seamlessly split into manageable video files so you never have to worry about browser memory limits or corrupted files.

KEY FEATURES

• Unlimited Screen Recording: Record entire screens, specific application windows, or active browser tabs without arbitrary time limits.
• Audio Commentary & System Sound: Seamlessly capture microphone voiceover combined with computer and tab audio.
• Smart Auto-Split (Chunking): Automatically segments long sessions into numbered, ready-to-watch video files (e.g., 10, 15, 30, or 60-minute parts) while you keep recording continuously.
• Multiple Screenshot Modes: Capture your visible viewport, drag to crop any selected area with a clear focus mask, or scroll through entire web pages for full-length captures.
• Built-In Annotation Editor: Crop, highlight, draw arrows, add rectangles, and write text over captured screenshots before saving or copying.
• Local Media Gallery: Browse, replay, preview, and download your previous captures anytime directly inside your browser.
• 100% Local & Private: Everything stays on your machine. Your recordings and screenshots are never uploaded to third-party cloud servers.

HOW TO USE

1. Click the HaniShot honey-recorder icon in your Chrome toolbar.
2. Choose between Screenshot or Record Video.
3. For screenshots, select Visible Part, Selected Area, or Full Page.
4. For video, select Desktop, Tab, or Camera, toggle microphone or system audio as desired, and click Start Recording.
5. Finish recording anytime via the popup or the browser bar to instantly preview, auto-save, or download your video parts.

PRIVACY & PERMISSIONS

HaniShot operates 100% locally on your computer. It contains zero third-party trackers, zero advertising scripts, and collects no personal data or browsing activity. All recordings and screenshots are processed in your local browser sandbox and stored securely in local IndexedDB storage.

SUPPORT & COMMUNITY

Have suggestions, issues, or feature requests?
Visit our GitHub repository: https://github.com/novosadskigari/HaniShot

Developed with ❤️ by NWD

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Screen and tab video recording with automated segment splitting and local screenshot capture with annotations.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename / Notes |
|-------|------------|--------|------------------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ To Prepare | Popup screen: Capture and Record options |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To Prepare | Selected Area crop tool with transparent overlay |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To Prepare | Video recording in progress with audio controls |
| Screenshot 4 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To Prepare | Local media gallery and video playback |
| Small Promo Tile [RECOMMENDED] | 440×280 PNG | ⬜ Optional | Honeycomb & REC badge on dark theme |
| Marquee Promo Tile | 1400×560 PNG | ⬜ Optional | Hero graphic for Chrome Web Store showcase |

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `activeTab` | permissions | Allows capturing the visible area and scrolling contents of the currently active tab when the user triggers a screenshot. |
| `scripting` | permissions | Injects the interactive area-crop selector and full-page scrolling engine into the active web page upon user request. |
| `tabCapture` | permissions | Captures video and audio streams of the selected browser tab when recording in Tab mode. |
| `offscreen` | permissions | Encodes captured media streams in the background using the MediaRecorder API and mixes system and microphone audio without disrupting the user interface. |
| `downloads` | permissions | Automatically saves recorded video files and screenshot images directly to the user's Downloads folder. |
| `storage` | permissions | Saves user preferences such as default auto-split duration, video resolution, and default audio settings. |
| `unlimitedStorage` | permissions | Allows local IndexedDB to safely store long high-definition video chunks and screenshot history on the user's device without exceeding browser storage quotas. |
| `notifications` | permissions | Displays desktop notifications when long video recording parts are split and ready, and notifies the user of extension updates. |
| `contextMenus` | permissions | Adds right-click context menu shortcuts allowing quick capture of web pages directly from the browser viewport. |
| `alarms` | permissions | Powers recording timers and periodic checks in the background service worker. |

---

## Privacy & Data Use

### Data Collection Declarations

**Does the extension collect user data?** No

| Data Type | Collected? | Transmitted Off-Device? |
|-----------|------------|-------------------------|
| Personally identifiable info | No | No |
| Health info | No | No |
| Financial info | No | No |
| Authentication info | No | No |
| Personal communications | No | No |
| Location | No | No |
| Web history | No | No |
| User activity | No | No |
| Website content | No | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://github.com/novosadskigari/HaniShot/blob/main/PRIVACY.md

---

## Distribution

- **Visibility**: Public
- **Regions**: All regions

---

## Developer Info

- **Publisher Name**: NWD (or your developer name)
- **Support URL**: https://github.com/novosadskigari/HaniShot/issues
- **Homepage URL**: https://github.com/novosadskigari/HaniShot

---

## Packaging for Submission

Run this command in the project directory to create a clean zip file without unnecessary git or OS files:

```bash
zip -r hanishot-v1.0.3.zip . -x "*.git*" "*.DS_Store*" "*.zip"
```
Upload `hanishot-v1.0.3.zip` to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
