# LyricDeck

A cross-platform desktop application for managing song lyrics and live lyric projection. Built for live events, churches, worship teams, concerts, rehearsals, and presentations.

## Features

- **Song Library** - Create, edit, delete, duplicate, and search songs with metadata (key, tempo, copyright, tags)
- **Section Editor** - Organize lyrics into sections (Verse, Chorus, Bridge, Intro, Outro, etc.) with drag-and-drop reordering
- **Arrangement Editor** - Build custom presentation arrangements by combining sections in any order
- **Live Presentation** - Quick-access buttons for each section, with keyboard shortcuts for fast switching
- **Projection Output** - Fullscreen output window for extended monitors/projectors
- **Background Customization** - Solid colors, gradients, or images per song
- **Text Styling** - Font, size, color, alignment, shadow, outline, and vertical positioning
- **Multi-Monitor Support** - Detect and select projection display
- **Local Storage** - All data saved locally as JSON in the app data directory

## Tech Stack

- Electron
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- @dnd-kit (drag and drop)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite dev server and launches Electron with hot reload.

### Build for Production

The project supports building distributable executables for both Windows and macOS via [electron-builder](https://www.electron.build/).

#### Windows Build

Run on a **Windows host**:

```bash
npm run build
```

This runs `tsc`, `vite build`, then `electron-builder --win`. Output is written to the `release/` directory:

| File | Description |
|------|-------------|
| `LyricDeck Setup 1.0.0.exe` | NSIS installer (x64). Lets the user choose install directory and creates desktop / start-menu shortcuts. |
| `LyricDeck 1.0.0.exe` | Portable executable (x64). Runs without installation. |

#### macOS Build

Run on a **macOS host** (required — see notes below):

```bash
npm run build:mac
```

This runs `tsc`, `vite build`, then `electron-builder --mac` and produces a zipped `.app` bundle for both Intel (x64) and Apple Silicon (arm64) in the `release/` directory:

| File | Description |
|------|-------------|
| `LyricDeck-1.0.0-mac.zip` | macOS app bundle for Intel (x64). |
| `LyricDeck-1.0.0-arm64-mac.zip` | macOS app bundle for Apple Silicon (arm64). |

Unzip and drag `LyricDeck.app` into `/Applications`. Because the build is unsigned, the first launch may require right-click → **Open**, or running:

```bash
xattr -cr /Applications/LyricDeck.app
```

#### Build Both Platforms (macOS host only)

```bash
npm run build:all
```

#### Cross-Platform Build Notes

- **macOS targets cannot be built from Windows or Linux.** electron-builder 26+ requires a native macOS host for any `--mac` build (this includes `.zip`, `.dmg`, and `.app`). Trying `npm run build:mac` on Windows will fail with: *"Build for macOS is supported only on macOS"*.
- **Windows targets** can be built from Windows directly. Building Windows targets from macOS/Linux is possible but is not part of this repo's default scripts.
- For automated cross-platform builds, use a CI service such as **GitHub Actions** with a `macos-latest` runner for the macOS artifact and `windows-latest` for the Windows artifact.

### Type Check

```bash
npm run typecheck
```

## Keyboard Shortcuts (Present Mode)

| Key | Action |
|-----|--------|
| Space / Arrow Right | Next slide |
| Arrow Left | Previous slide |
| B | Toggle black screen |
| C | Toggle clear (hide lyrics, keep background) |
| Escape | Return to live mode |

## Project Structure

```
lyricdeck/
├── electron/
│   ├── main.ts          # Electron main process (windows, IPC, file I/O)
│   └── preload.ts       # Context bridge API
├── src/
│   ├── components/
│   │   ├── SongLibrary.tsx    # Left panel song list
│   │   ├── EditorPanel.tsx    # Lyrics section editor
│   │   ├── ArrangePanel.tsx   # Arrangement builder
│   │   ├── PresentPanel.tsx   # Live presentation controls
│   │   ├── SettingsPanel.tsx  # Background & text settings
│   │   └── ProjectionView.tsx # Fullscreen projection output
│   ├── store/
│   │   └── appStore.ts        # Zustand state management
│   ├── types/
│   │   ├── index.ts           # Data models
│   │   └── electron.d.ts      # Window API types
│   ├── utils/
│   │   └── seedData.ts        # Sample songs
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Data Storage

Songs and settings are stored as JSON files in the OS-specific app data directory:
- **Windows**: `%APPDATA%/lyricdeck/data/`
- **macOS**: `~/Library/Application Support/lyricdeck/data/`

## License

MIT
