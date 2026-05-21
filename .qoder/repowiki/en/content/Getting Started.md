# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [vite.config.ts](file://vite.config.ts)
- [forge.config.js](file://forge.config.js)
- [tsconfig.json](file://tsconfig.json)
- [tsconfig.node.json](file://tsconfig.node.json)
- [electron/main.ts](file://electron/main.ts)
- [electron/preload.ts](file://electron/preload.ts)
- [electron/db.ts](file://electron/db.ts)
- [electron/migrate.ts](file://electron/migrate.ts)
- [src/App.tsx](file://src/App.tsx)
- [src/main.tsx](file://src/main.tsx)
- [index.html](file://index.html)
- [tailwind.config.js](file://tailwind.config.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Development Workflow](#development-workflow)
6. [Production Build](#production-build)
7. [Type Checking](#type-checking)
8. [Project Structure Overview](#project-structure-overview)
9. [Platform-Specific Considerations](#platform-specific-considerations)
10. [Initial Setup Procedures](#initial-setup-procedures)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Conclusion](#conclusion)

## Introduction
LyricDeck is a cross-platform desktop application for managing song lyrics and live lyric projection. Built with Electron, React 18, TypeScript, Vite, Tailwind CSS, Zustand, and @dnd-kit, it provides a modern desktop experience for churches, worship teams, and presenters who need reliable, local-first lyric management and presentation capabilities.

## System Requirements
- Operating systems: Windows, macOS, Linux
- Architecture: x64
- Memory: Minimum 4 GB RAM recommended
- Disk space: Approximately 50 MB free space after installation
- Network: Required for initial dependency installation; offline usage after setup

## Prerequisites
Before installing LyricDeck, ensure your development environment meets the following requirements:
- Node.js 18 or later
- npm 9 or later

These requirements are enforced by the project configuration and scripts. Using older versions may lead to build failures or runtime errors.

**Section sources**
- [README.md:29-32](file://README.md#L29-L32)
- [package.json:58-84](file://package.json#L58-L84)

## Installation
Follow these steps to install LyricDeck on your local machine:

1. Clone or download the repository to your local machine.
2. Open a terminal or command prompt in the project root directory.
3. Install all project dependencies using npm:
   ```bash
   npm install
   ```
   This command installs both runtime and development dependencies defined in the project configuration.

4. Verify the installation by checking that the `node_modules` directory is created and contains the required packages.

**Section sources**
- [README.md:34-38](file://README.md#L34-L38)
- [package.json:58-96](file://package.json#L58-L96)

## Development Workflow
LyricDeck uses Vite for the development server and Electron for the desktop shell. The development workflow enables hot reloading for rapid iteration.

To start the development environment:
```bash
npm run dev
```
This script launches:
- Vite's development server
- Electron with automatic page reload when frontend code changes

The development server runs on port 5173 by default. Electron loads the app from the development server during development and from the built files in production.

For an alternative development experience that synchronizes React and Electron builds:
```bash
npm run electron:dev
```
This command concurrently runs Vite and Electron, automatically opening the app after the development server becomes available.

**Section sources**
- [README.md:40-46](file://README.md#L40-L46)
- [package.json:6-16](file://package.json#L6-L16)
- [vite.config.ts:1-51](file://vite.config.ts#L1-L51)
- [electron/main.ts:96-100](file://electron/main.ts#L96-L100)

## Production Build
To build LyricDeck for distribution:
```bash
npm run build
```
This script performs the following steps:
1. TypeScript compilation
2. Vite build for the renderer process
3. Electron Builder packaging for Windows (NSIS installer and portable executable)

The build output is placed in the `release` directory as configured in the project settings.

For previewing the production build locally:
```bash
npm run preview
```
This serves the built assets locally for testing.

**Section sources**
- [README.md:48-52](file://README.md#L48-L52)
- [package.json:6-16](file://package.json#L6-L16)
- [forge.config.js:26-57](file://forge.config.js#L26-L57)

## Type Checking
Ensure your TypeScript code adheres to strict type safety:
```bash
npm run typecheck
```
This command runs the TypeScript compiler in no-emit mode, reporting any type errors without generating JavaScript output.

**Section sources**
- [README.md:54-58](file://README.md#L54-L58)
- [package.json:6-16](file://package.json#L6-L16)
- [tsconfig.json:1-26](file://tsconfig.json#L1-L26)

## Project Structure Overview
LyricDeck follows a clear separation between Electron main process, preload context bridge, and React renderer process, with shared TypeScript configuration for both environments.

```mermaid
graph TB
subgraph "Electron Main Process"
EM["electron/main.ts"]
EP["electron/preload.ts"]
EDB["electron/db.ts"]
EMIG["electron/migrate.ts"]
end
subgraph "Renderer Process"
HTML["index.html"]
APP["src/App.tsx"]
MAIN["src/main.tsx"]
STORE["src/store/appStore.ts"]
end
subgraph "Build Tools"
VITE["vite.config.ts"]
TS["tsconfig.json"]
TSN["tsconfig.node.json"]
FW["forge.config.js"]
end
HTML --> MAIN
MAIN --> APP
APP --> STORE
APP --> EP
EP --> EM
EM --> EDB
EDB --> EMIG
VITE --> HTML
TS --> MAIN
TSN --> VITE
FW --> EM
```

**Diagram sources**
- [electron/main.ts:1-390](file://electron/main.ts#L1-L390)
- [electron/preload.ts:1-43](file://electron/preload.ts#L1-L43)
- [electron/db.ts:1-214](file://electron/db.ts#L1-L214)
- [electron/migrate.ts:1-127](file://electron/migrate.ts#L1-L127)
- [src/App.tsx:1-102](file://src/App.tsx#L1-L102)
- [src/main.tsx:1-11](file://src/main.tsx#L1-L11)
- [src/store/appStore.ts:1-385](file://src/store/appStore.ts#L1-L385)
- [index.html:1-14](file://index.html#L1-L14)
- [vite.config.ts:1-51](file://vite.config.ts#L1-L51)
- [tsconfig.json:1-26](file://tsconfig.json#L1-L26)
- [tsconfig.node.json:1-11](file://tsconfig.node.json#L1-L11)
- [forge.config.js:1-45](file://forge.config.js#L1-L45)

**Section sources**
- [README.md:70-100](file://README.md#L70-L100)
- [vite.config.ts:1-51](file://vite.config.ts#L1-L51)
- [tsconfig.json:1-26](file://tsconfig.json#L1-L26)
- [tsconfig.node.json:1-11](file://tsconfig.node.json#L1-L11)
- [forge.config.js:1-45](file://forge.config.js#L1-L45)

## Platform-Specific Considerations
- Windows
  - Installer targets: NSIS installer and portable executable (x64)
  - Desktop and Start Menu shortcuts are enabled by default
  - Application data stored under `%APPDATA%/lyricdeck/data/`
- macOS
  - Supported via ZIP maker configuration
  - Application data stored under `~/Library/Application Support/lyricdeck/data/`
- Linux
  - Supported via DEB and RPM makers
  - Application data stored under `~/.local/share/lyricdeck/data/`

**Section sources**
- [package.json:26-56](file://package.json#L26-L56)
- [forge.config.js:9-26](file://forge.config.js#L9-L26)
- [README.md:102-107](file://README.md#L102-L107)

## Initial Setup Procedures
After successful installation, LyricDeck initializes with the following behavior:
- On first launch, if no songs exist, a set of seed songs is loaded automatically
- All data persists locally as JSON files in the application data directory
- The projection window opens on a separate display when requested

Key initialization points:
- Renderer process bootstrapping occurs in the HTML root element
- Zustand store manages application state and persistence hooks
- Electron preload exposes a typed API to the renderer process

**Section sources**
- [src/App.tsx:19-32](file://src/App.tsx#L19-L32)
- [src/App.tsx:44-46](file://src/App.tsx#L44-L46)
- [src/main.tsx:1-11](file://src/main.tsx#L1-L11)
- [src/store/appStore.ts:361-384](file://src/store/appStore.ts#L361-L384)
- [electron/preload.ts:1-43](file://electron/preload.ts#L1-L43)

## Troubleshooting Guide
Common setup issues and their solutions:

- Node.js or npm version mismatch
  - Symptom: Build fails with engine compatibility errors
  - Solution: Upgrade to Node.js 18+ and npm 9+
  - Verification: Check versions with `node --version` and `npm --version`

- Port conflicts during development
  - Symptom: Vite fails to start on port 5173
  - Solution: Stop other processes using the port or configure a different port in Vite configuration
  - Alternative: Use the Electron-focused development script that waits for the dev server

- Missing native dependencies
  - Symptom: Runtime errors related to native modules
  - Solution: Reinstall dependencies with `npm ci` or clear `node_modules` and reinstall

- Database initialization errors
  - Symptom: Application fails to load or save data
  - Solution: Verify the application data directory exists and has write permissions
  - Location: See platform-specific paths in the data storage section

- Projection window issues
  - Symptom: Projection window does not open or displays incorrectly
  - Solution: Ensure multiple displays are connected; verify display detection and selection logic

**Section sources**
- [README.md:29-32](file://README.md#L29-L32)
- [package.json:6-16](file://package.json#L6-L16)
- [electron/main.ts:111-152](file://electron/main.ts#L111-L152)
- [electron/db.ts:19-41](file://electron/db.ts#L19-L41)
- [README.md:102-107](file://README.md#L102-L107)

## Conclusion
You are now ready to develop and build LyricDeck. Use the development workflow for rapid iteration, the production build for distribution, and the type checking process to maintain code quality. For platform-specific packaging and deployment, refer to the build configuration and makers defined in the project settings.