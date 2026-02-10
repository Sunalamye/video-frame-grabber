# Video Frame Grabber

A browser-based video frame extraction tool. Navigate videos frame-by-frame and capture high-quality screenshots — all processing happens locally in your browser.

**[Live Demo](https://sunalamye.github.io/video-frame-grabber/)**

## Features

- **Drag & Drop** — Load any video file by dragging it into the browser
- **Frame-by-Frame Navigation** — Step forward/backward one frame at a time
- **One-Click Capture** — Grab the current frame as a high-resolution PNG
- **Batch Export** — Download all captured frames as a ZIP archive
- **Offline Ready** — Download a single-file offline version to use anywhere
- **Keyboard Shortcuts** — `Space` play/pause, `←` `→` step frames, `S` capture
- **100% Local** — No uploads, no servers — your video never leaves your device

## Quick Start

Visit the **[Live Demo](https://sunalamye.github.io/video-frame-grabber/)** — no installation required.

### Run Locally

```bash
git clone https://github.com/Sunalamye/video-frame-grabber.git
cd video-frame-grabber
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

The output in `dist/` is a single self-contained HTML file.

## Tech Stack

- **Vite** — Fast dev server and build tool
- **Vanilla JavaScript** — No framework dependencies
- **HTML5 Video API** — `requestVideoFrameCallback` for precise frame stepping
- **Canvas / OffscreenCanvas** — High-quality frame capture
- **IndexedDB** — Local storage for captured frames
- **client-zip** — In-browser ZIP generation
- **vite-plugin-singlefile** — Bundles everything into one HTML file

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` | Previous frame |
| `→` | Next frame |
| `S` | Capture current frame |

## Privacy

All video processing happens entirely in your browser. No data is sent to any server.

## License

MIT
