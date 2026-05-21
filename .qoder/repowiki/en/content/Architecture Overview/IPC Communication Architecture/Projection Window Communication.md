# Projection Window Communication

<cite>
**Referenced Files in This Document**
- [electron/main.ts](file://electron/main.ts)
- [electron/preload.ts](file://electron/preload.ts)
- [src/store/appStore.ts](file://src/store/appStore.ts)
- [src/components/ProjectionView.tsx](file://src/components/ProjectionView.tsx)
- [src/components/PresentPanel.tsx](file://src/components/PresentPanel.tsx)
- [src/App.tsx](file://src/App.tsx)
- [src/types/index.ts](file://src/types/index.ts)
- [src/types/electron.d.ts](file://src/types/electron.d.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains LyricDeck's projection window inter-process communication (IPC) patterns. It covers bidirectional communication between the main process and the projection window, including state synchronization, display management, lifecycle events, and error recovery. It focuses on two key channels:
- update-projection: Real-time state broadcasts from the main application to the projection window
- projection-state: Real-time updates received by the projection window from the main process

The documentation also details event subscription patterns, callback management, cleanup procedures, multi-window coordination, display detection integration, and graceful shutdown handling.

## Project Structure
The projection window communication spans three layers:
- Main process (Electron): Creates and manages the projection BrowserWindow, exposes IPC handlers, and routes state updates
- Preload bridge: Exposes a typed API to the renderer, wrapping IPC calls and event subscriptions
- Renderer (React): Consumes the API to initialize the projection window, subscribe to state updates, and render projection content

```mermaid
graph TB
subgraph "Main Process"
M_main["electron/main.ts<br/>Creates projection window<br/>Handles IPC handlers"]
end
subgraph "Preload Bridge"
P_preload["electron/preload.ts<br/>Exposes electronAPI<br/>Wraps IPC and events"]
end
subgraph "Renderer (Main App)"
R_store["src/store/appStore.ts<br/>Projection state management<br/>Broadcasts updates"]
R_present["src/components/PresentPanel.tsx<br/>Controls projection window<br/>Display selection"]
R_app["src/App.tsx<br/>Detects projection route<br/>Wires lifecycle events"]
end
subgraph "Renderer (Projection Window)"
P_view["src/components/ProjectionView.tsx<br/>Receives state updates<br/>Renders projection"]
end
R_store --> |"updateProjection"| P_preload
P_preload --> |"update-projection"| M_main
M_main --> |"projection-state"| P_preload
P_preload --> |"onProjectionState"| P_view
R_present --> |"openProjection/closeProjection"| P_preload
P_preload --> |"projection-window-closed"| R_app
```

**Diagram sources**
- [electron/main.ts:111-152](file://electron/main.ts#L111-L152)
- [electron/preload.ts:3-42](file://electron/preload.ts#L3-L42)
- [src/store/appStore.ts:241-249](file://src/store/appStore.ts#L241-L249)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [src/components/PresentPanel.tsx:109-129](file://src/components/PresentPanel.tsx#L109-L129)
- [src/App.tsx:34-42](file://src/App.tsx#L34-L42)

**Section sources**
- [electron/main.ts:111-152](file://electron/main.ts#L111-L152)
- [electron/preload.ts:3-42](file://electron/preload.ts#L3-L42)
- [src/store/appStore.ts:241-249](file://src/store/appStore.ts#L241-L249)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [src/components/PresentPanel.tsx:109-129](file://src/components/PresentPanel.tsx#L109-L129)
- [src/App.tsx:34-42](file://src/App.tsx#L34-L42)

## Core Components
- Main process projection window lifecycle:
  - Creation with display targeting and fullscreen configuration
  - Closed event emits a notification to the main app
- Preload electronAPI:
  - Provides typed methods for display management, projection control, and event subscriptions
  - Wraps IPC send/invoke and event listeners with cleanup functions
- Store-driven state broadcasting:
  - Projection state updates are merged and sent to the projection window
- Projection window renderer:
  - Subscribes to state updates and renders according to mode and styles

Key IPC channels:
- update-projection: Main app -> Projection window (send)
- projection-state: Projection window -> Main app (send) -> Projection window renderer (receive)
- projection-window-closed: Main app -> Main app renderer (notification)

**Section sources**
- [electron/main.ts:111-152](file://electron/main.ts#L111-L152)
- [electron/preload.ts:3-42](file://electron/preload.ts#L3-L42)
- [src/store/appStore.ts:241-249](file://src/store/appStore.ts#L241-L249)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)

## Architecture Overview
The projection window architecture follows a publish-subscribe model:
- The main application maintains a single source of truth for projection state
- Changes are broadcast via update-projection to the projection window
- The projection window receives projection-state messages and re-renders immediately
- Lifecycle events (open/close) are coordinated through dedicated IPC channels

```mermaid
sequenceDiagram
participant MainApp as "Main App Renderer<br/>PresentPanel"
participant Store as "Zustand Store<br/>appStore.ts"
participant Preload as "Preload Bridge<br/>electron/preload.ts"
participant MainProc as "Main Process<br/>electron/main.ts"
participant ProjWin as "Projection Window<br/>ProjectionView.tsx"
MainApp->>Store : "setProjectionState(newState)"
Store->>Preload : "updateProjection(newState)"
Preload->>MainProc : "send 'update-projection' newState"
MainProc->>MainProc : "Validate projectionWindow exists"
MainProc->>ProjWin : "send 'projection-state' newState"
ProjWin->>ProjWin : "setState(newState)"
ProjWin-->>MainApp : "Immediate visual update"
```

**Diagram sources**
- [src/store/appStore.ts:241-249](file://src/store/appStore.ts#L241-L249)
- [electron/preload.ts:11](file://electron/preload.ts#L11)
- [electron/main.ts:186-190](file://electron/main.ts#L186-L190)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)

## Detailed Component Analysis

### Main Process: Projection Window Management
The main process creates the projection window on a chosen display and handles lifecycle events:
- Display selection: Uses provided display ID or falls back to secondary display or primary
- Fullscreen configuration: Frameless, always-on-top, skip-taskbar, black background
- Closed event: Notifies the main app renderer that the projection window closed

```mermaid
flowchart TD
Start(["Open Projection Request"]) --> GetDisplays["Get all displays"]
GetDisplays --> HasTarget{"Target display provided?"}
HasTarget --> |Yes| UseTarget["Use provided display ID"]
HasTarget --> |No| UseSecondary["Use secondary display if available"]
UseSecondary --> NoSecondary{"Secondary exists?"}
NoSecondary --> |No| UsePrimary["Fallback to primary display"]
UseTarget --> CreateWin["Create BrowserWindow on target display"]
UsePrimary --> CreateWin
CreateWin --> LoadURL["Load projection route"]
LoadURL --> OnClosed["Listen for 'closed' event"]
OnClosed --> NotifyMain["Send 'projection-window-closed' to main app"]
```

**Diagram sources**
- [electron/main.ts:111-152](file://electron/main.ts#L111-L152)

**Section sources**
- [electron/main.ts:111-152](file://electron/main.ts#L111-L152)

### Preload Bridge: Typed API and Event Subscription
The preload bridge exposes a typed electronAPI with:
- Display management: getDisplays, openProjection, closeProjection, isProjectionOpen
- Projection updates: updateProjection (send), onProjectionState (subscribe), onProjectionWindowClosed (subscribe)
- Cleanup: Each subscription returns a function to remove the listener

```mermaid
classDiagram
class ElectronAPI {
+getDisplays() Promise
+openProjection(displayId?) Promise
+closeProjection() Promise
+isProjectionOpen() Promise
+updateProjection(state) void
+onProjectionState(callback) () => void
+onProjectionWindowClosed(callback) () => void
}
```

**Diagram sources**
- [electron/preload.ts:3-42](file://electron/preload.ts#L3-L42)
- [src/types/electron.d.ts:5-17](file://src/types/electron.d.ts#L5-L17)

**Section sources**
- [electron/preload.ts:3-42](file://electron/preload.ts#L3-L42)
- [src/types/electron.d.ts:5-17](file://src/types/electron.d.ts#L5-L17)

### Store: State Broadcasting and Multi-Window Coordination
The store coordinates projection state and broadcasts updates:
- setProjectionState merges partial state and sends to the projection window
- Navigation actions (goToSlide, nextSlide, prevSlide) compute and broadcast live projection state
- Mode toggles (blank, black, logo, clear) update state and broadcast
- Line shifting adjusts vertical positioning for smooth transitions

```mermaid
flowchart TD
UserAction["User Action<br/>PresentPanel buttons"] --> ComputeState["Compute Projection State<br/>from current song/arrangement"]
ComputeState --> MergeState["Merge with existing state"]
MergeState --> Broadcast["Broadcast via updateProjection"]
Broadcast --> IPC["IPC 'update-projection'"]
IPC --> Receive["IPC 'projection-state' in projection window"]
Receive --> Render["Render updated projection"]
```

**Diagram sources**
- [src/store/appStore.ts:241-274](file://src/store/appStore.ts#L241-L274)
- [electron/main.ts:186-190](file://electron/main.ts#L186-L190)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)

**Section sources**
- [src/store/appStore.ts:241-274](file://src/store/appStore.ts#L241-L274)
- [src/store/appStore.ts:276-302](file://src/store/appStore.ts#L276-L302)
- [src/store/appStore.ts:293-295](file://src/store/appStore.ts#L293-L295)

### Projection Window Renderer: Subscription and Rendering
The projection window renderer subscribes to state updates and renders content:
- Subscribes to projection-state updates on mount and cleans up on unmount
- Renders different modes (black, logo, live, blank, clear) based on state
- Applies background styles, text styles, and overlays
- Handles copyright display and line offset animations

```mermaid
sequenceDiagram
participant View as "ProjectionView.tsx"
participant Preload as "Preload Bridge"
participant MainProc as "Main Process"
participant Win as "Projection Window"
View->>Preload : "onProjectionState(callback)"
Preload->>Win : "Add 'projection-state' listener"
MainProc->>Win : "send 'projection-state' newState"
Win->>View : "Invoke callback with newState"
View->>View : "setState(newState)"
View-->>View : "Re-render with new state"
View->>Preload : "Cleanup removes listener on unmount"
```

**Diagram sources**
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [electron/preload.ts:12-16](file://electron/preload.ts#L12-L16)
- [electron/main.ts:186-189](file://electron/main.ts#L186-L189)

**Section sources**
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [src/components/ProjectionView.tsx:77-132](file://src/components/ProjectionView.tsx#L77-L132)

### Display Detection and Multi-Window Coordination
Display detection integrates with the projection workflow:
- PresentPanel loads available displays and selects a default target
- openProjection passes the selected display ID to the main process
- The main process targets the specified display or falls back to secondary/primary
- The main app renderer listens for projection-window-closed to update UI state

```mermaid
sequenceDiagram
participant Present as "PresentPanel.tsx"
participant Preload as "Preload Bridge"
participant Main as "Main Process"
participant App as "Main App Renderer"
Present->>Preload : "getDisplays()"
Preload->>Main : "invoke 'get-displays'"
Main-->>Preload : "Return display list"
Preload-->>Present : "Display list"
Present->>Preload : "openProjection(selectedDisplay)"
Preload->>Main : "invoke 'open-projection' with displayId"
Main->>Main : "Create projection window on target display"
Main-->>Present : "Return success"
Main->>App : "send 'projection-window-closed'"
App->>App : "Set isProjectionOpen=false"
```

**Diagram sources**
- [src/components/PresentPanel.tsx:26-36](file://src/components/PresentPanel.tsx#L26-L36)
- [src/components/PresentPanel.tsx:109-114](file://src/components/PresentPanel.tsx#L109-L114)
- [electron/preload.ts:5-8](file://electron/preload.ts#L5-L8)
- [electron/main.ts:155-164](file://electron/main.ts#L155-L164)
- [electron/main.ts:166-172](file://electron/main.ts#L166-L172)
- [electron/main.ts:148-151](file://electron/main.ts#L148-L151)
- [src/App.tsx:34-42](file://src/App.tsx#L34-L42)

**Section sources**
- [src/components/PresentPanel.tsx:26-36](file://src/components/PresentPanel.tsx#L26-L36)
- [src/components/PresentPanel.tsx:109-114](file://src/components/PresentPanel.tsx#L109-L114)
- [electron/preload.ts:5-8](file://electron/preload.ts#L5-L8)
- [electron/main.ts:155-164](file://electron/main.ts#L155-L164)
- [electron/main.ts:166-172](file://electron/main.ts#L166-L172)
- [electron/main.ts:148-151](file://electron/main.ts#L148-L151)
- [src/App.tsx:34-42](file://src/App.tsx#L34-L42)

### Event Subscription Patterns and Cleanup
Subscription patterns ensure robust event handling:
- onProjectionState returns a cleanup function to remove the listener
- onProjectionWindowClosed similarly returns a cleanup function
- Unmounting the projection view removes listeners automatically
- The main process removes listeners when the projection window closes

Best practices:
- Always capture the cleanup function from onProjectionState and call it on unmount
- Use useEffect cleanup in components that subscribe to projection state
- Avoid memory leaks by removing listeners when components unmount

**Section sources**
- [electron/preload.ts:12-21](file://electron/preload.ts#L12-L21)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)

### Graceful Shutdown Handling
Graceful shutdown ensures clean state and resource management:
- Closing the projection window triggers a closed event in the main process
- The main process notifies the main app renderer via projection-window-closed
- The main app renderer sets isProjectionOpen to false
- The main process clears the projectionWindow reference

```mermaid
flowchart TD
CloseReq["User closes projection window"] --> ClosedEvent["Projection window 'closed' event"]
ClosedEvent --> ClearRef["Clear projectionWindow reference"]
ClearRef --> NotifyRenderer["Send 'projection-window-closed' to main app"]
NotifyRenderer --> UpdateUI["Set isProjectionOpen=false"]
```

**Diagram sources**
- [electron/main.ts:148-151](file://electron/main.ts#L148-L151)
- [src/App.tsx:34-42](file://src/App.tsx#L34-L42)

**Section sources**
- [electron/main.ts:148-151](file://electron/main.ts#L148-L151)
- [src/App.tsx:34-42](file://src/App.tsx#L34-L42)

## Dependency Analysis
The projection window communication depends on:
- Types define the ProjectionState contract used across layers
- Preload bridge depends on Electron APIs for IPC and event handling
- Store depends on preload bridge for IPC calls
- Projection view depends on preload bridge for event subscriptions

```mermaid
graph LR
Types["src/types/index.ts<br/>ProjectionState, AppSettings"] --> Store["src/store/appStore.ts"]
Types --> View["src/components/ProjectionView.tsx"]
Preload["electron/preload.ts"] --> Store
Preload --> View
Main["electron/main.ts"] --> Preload
Store --> Main
View --> Preload
```

**Diagram sources**
- [src/types/index.ts:71-81](file://src/types/index.ts#L71-L81)
- [src/store/appStore.ts:241-249](file://src/store/appStore.ts#L241-L249)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [electron/preload.ts:3-42](file://electron/preload.ts#L3-L42)
- [electron/main.ts:186-190](file://electron/main.ts#L186-L190)

**Section sources**
- [src/types/index.ts:71-81](file://src/types/index.ts#L71-L81)
- [src/store/appStore.ts:241-249](file://src/store/appStore.ts#L241-L249)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [electron/preload.ts:3-42](file://electron/preload.ts#L3-L42)
- [electron/main.ts:186-190](file://electron/main.ts#L186-L190)

## Performance Considerations
- Minimize state churn: Batch small updates to reduce IPC traffic
- Debounce rapid UI interactions: Avoid flooding the projection window with frequent updates
- Efficient rendering: The projection view computes styles inline; keep state minimal and normalized
- Display targeting: Choose the correct display early to avoid re-layout costs
- Memory management: Always clean up event listeners to prevent leaks

## Troubleshooting Guide
Common issues and resolutions:
- Projection window does not open:
  - Verify display ID passed to openProjection is valid
  - Check that the main process creates the window without errors
- State not updating in projection window:
  - Confirm updateProjection is called from the store
  - Ensure onProjectionState is subscribed and not removed prematurely
- Projection window closes unexpectedly:
  - Check for closed event handling in the main process
  - Verify the main app renderer receives projection-window-closed
- Memory leaks:
  - Ensure cleanup functions from onProjectionState/onProjectionWindowClosed are called on unmount

**Section sources**
- [electron/main.ts:166-172](file://electron/main.ts#L166-L172)
- [electron/preload.ts:12-21](file://electron/preload.ts#L12-L21)
- [src/components/ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [electron/main.ts:148-151](file://electron/main.ts#L148-L151)
- [src/App.tsx:34-42](file://src/App.tsx#L34-L42)

## Conclusion
LyricDeck's projection window communication is built around a clean, typed IPC layer with robust event subscription and cleanup patterns. The main process manages projection lifecycle and state routing, while the preload bridge provides a safe, typed API to the renderer. The projection window renderer efficiently consumes state updates to deliver responsive, real-time projection displays. Proper cleanup and lifecycle handling ensure reliable operation across multi-window scenarios and various display configurations.