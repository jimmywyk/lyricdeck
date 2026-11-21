Now I have a comprehensive understanding of the camera visualization feature. Let me update the ProjectionView documentation to reflect these significant changes:

# Projection View Component

<cite>
**Referenced Files in This Document**
- [ProjectionView.tsx](file://src/components/ProjectionView.tsx)
- [PresentPanel.tsx](file://src/components/PresentPanel.tsx)
- [index.ts](file://src/types/index.ts)
- [main.ts](file://electron/main.ts)
- [en.ts](file://src/i18n/en.ts)
- [sanitize.ts](file://src/utils/sanitize.ts)
- [appStore.ts](file://src/store/appStore.ts)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive camera visualization feature with CameraView and PipOverlay components
- Implemented useCameraStream hook for webcam feed management with proper resource cleanup
- Enhanced ProjectionView component with new 'camera' mode for fullscreen webcam display
- Added Picture-in-Picture functionality allowing camera overlay during live presentations
- Integrated camera device selection and management in PresentPanel controls
- Updated type definitions to include camera-related state properties (cameraDeviceId, pipEnabled, pipPosition)
- Added internationalization support for camera features across multiple languages
- Enhanced Electron permission handling for camera access in projection windows

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Camera Visualization System](#camera-visualization-system)
7. [Security Enhancements](#security-enhancements)
8. [Dependency Analysis](#dependency-analysis)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Conclusion](#conclusion)
12. [Appendices](#appendices)

## Introduction
This document provides comprehensive documentation for the ProjectionView component, which renders fullscreen projection output for live presentations. It covers the component's fullscreen rendering capabilities, real-time state synchronization from the main application, multi-display support, projection mode system, background rendering pipeline, text styling application, responsive scaling, Electron window management integration, display detection APIs, and projection state updates. The component now includes enhanced smooth line transition animations with configurable timing through the scrollDuration parameter, enabling animated line movements with precise control over transition duration. Additionally, the component has been strengthened with robust security measures to prevent CSS injection attacks through comprehensive input validation and sanitization. **Updated** The component now features comprehensive camera visualization capabilities including fullscreen camera feeds, picture-in-picture overlays, and integrated camera device management for professional presentation workflows.

## Project Structure
The ProjectionView component is part of a React-based desktop application built with Electron. The application architecture separates concerns across:
- Frontend React components for UI and presentation controls
- Zustand store for global state management
- Electron main process for window management and display detection
- Preload bridge exposing safe IPC APIs to the renderer
- Type definitions for projection state and styling
- Security utilities for CSS injection prevention
- **New** Camera stream management and WebRTC integration

```mermaid
graph TB
subgraph "Electron Main Process"
EM["electron/main.ts"]
EP["electron/preload.ts"]
end
subgraph "React Renderer"
APP["src/App.tsx"]
PV["src/components/ProjectionView.tsx"]
PP["src/components/PresentPanel.tsx"]
PL["src/components/PreparationList.tsx"]
AS["src/store/appStore.ts"]
TY["src/types/index.ts"]
SEC["src/utils/sanitize.ts"]
end
subgraph "Camera System"
CS["useCameraStream Hook"]
CV["CameraView Component"]
PO["PipOverlay Component"]
MP["MediaDevices API"]
end
subgraph "Styling"
CSS["src/index.css"]
end
EM --> EP
EP --> APP
APP --> PV
APP --> PP
APP --> PL
AS --> PV
AS --> PP
AS --> PL
TY --> PV
TY --> PP
TY --> PL
SEC --> PV
SEC --> PP
SEC --> PL
PV --> CS
CS --> CV
CS --> PO
CV --> MP
PO --> MP
CSS --> PV
CSS --> PP
CSS --> PL
```

**Diagram sources**
- [main.ts:1-390](file://electron/main.ts#L1-L390)
- [preload.ts:1-43](file://electron/preload.ts#L1-L43)
- [App.tsx:1-102](file://src/App.tsx#L1-L102)
- [ProjectionView.tsx:1-229](file://src/components/ProjectionView.tsx#L1-L229)
- [sanitize.ts:1-132](file://src/utils/sanitize.ts#L1-L132)
- [PresentPanel.tsx:1-459](file://src/components/PresentPanel.tsx#L1-L459)
- [PreparationList.tsx:1-188](file://src/components/PreparationList.tsx#L1-L188)
- [appStore.ts:1-396](file://src/store/appStore.ts#L1-L396)
- [index.ts:1-95](file://src/types/index.ts#L1-L95)
- [index.css:1-100](file://src/index.css#L1-L100)

**Section sources**
- [main.ts:1-390](file://electron/main.ts#L1-L390)
- [preload.ts:1-43](file://electron/preload.ts#L1-L43)
- [App.tsx:1-102](file://src/App.tsx#L1-L102)
- [ProjectionView.tsx:1-229](file://src/components/ProjectionView.tsx#L1-L229)
- [sanitize.ts:1-132](file://src/utils/sanitize.ts#L1-L132)
- [PresentPanel.tsx:1-459](file://src/components/PresentPanel.tsx#L1-L459)
- [PreparationList.tsx:1-188](file://src/components/PreparationList.tsx#L1-L188)
- [appStore.ts:1-396](file://src/store/appStore.ts#L1-L396)
- [index.ts:1-95](file://src/types/index.ts#L1-L95)
- [index.css:1-100](file://src/index.css#L1-L100)

## Core Components
The ProjectionView component orchestrates fullscreen projection rendering with the following responsibilities:
- Real-time state synchronization via Electron IPC
- Fullscreen rendering using Tailwind CSS utilities
- Multi-mode projection rendering (live, blank, black, logo, clear, **camera**)
- Dynamic background rendering (color, gradient, image) with security validation
- Text styling application with responsive margins
- Smooth vertical alignment and line offset transitions with configurable timing
- Copyright display for live mode
- **Enhanced** Secure background style generation using safeBackgroundStyle() utility
- **Enhanced** Input validation for overlay opacity using sanitizeNumber() function
- **New** Camera feed management with useCameraStream hook
- **New** Picture-in-Picture overlay functionality for webcam feeds

Key integration points:
- Electron preload bridge exposes updateProjection and onProjectionState callbacks
- Zustand store manages projection state and dispatches updates to the projection window
- Electron main process creates and manages the projection window on target displays
- Enhanced preparation list functionality allows cleaner transition experiences through blank mode
- Scroll duration parameter enables smooth line movement animations with configurable timing
- **New** Camera device enumeration and selection through MediaDevices API
- **New** Comprehensive security utilities prevent CSS injection attacks through input validation

**Updated** Enhanced with smooth line transition animations, scrollDuration parameter support, comprehensive camera visualization features, and robust security measures for CSS injection prevention

**Section sources**
- [ProjectionView.tsx:1-229](file://src/components/ProjectionView.tsx#L1-L229)
- [sanitize.ts:1-132](file://src/utils/sanitize.ts#L1-L132)
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)
- [main.ts:111-152](file://electron/main.ts#L111-L152)
- [preload.ts:3-21](file://electron/preload.ts#L3-L21)

## Architecture Overview
The projection system follows a unidirectional data flow with enhanced preparation list integration, smooth line transition animations, comprehensive security validation, and integrated camera visualization:
1. Presentation controls in PresentPanel trigger state changes with duration parameters
2. Preparation list interactions utilize blank mode for cleaner transitions
3. Camera device enumeration and selection through MediaDevices API
4. Zustand store updates projectionState with scrollDuration and sends IPC updates
5. Electron main process forwards state to projection window
6. ProjectionView subscribes to state updates and renders with smooth animations
7. **Enhanced** All user-provided CSS values are validated and sanitized before rendering
8. **New** Camera streams are managed with proper resource cleanup and error handling

```mermaid
sequenceDiagram
participant Presenter as "Presenter"
participant PresentPanel as "PresentPanel"
participant PreparationList as "PreparationList"
participant Store as "Zustand Store"
participant Main as "Electron Main"
participant Preload as "Preload Bridge"
participant Projection as "ProjectionView"
participant Camera as "Camera System"
participant Security as "Security Utilities"
Presenter->>PresentPanel : "Select camera or shift lines"
PresentPanel->>Store : "update camera/device or shiftLines(offset, duration)"
Store->>Main : "updateProjection(state with scrollDuration, cameraDeviceId)"
Main->>Preload : "send('update-projection', state)"
Preload->>Projection : "onProjectionState(callback)"
alt Camera Mode
Projection->>Camera : "Initialize camera stream"
Camera-->>Projection : "Video feed with error handling"
else Live Mode with PiP
Projection->>Camera : "Start PiP overlay"
Camera-->>Projection : "Small camera feed"
end
Projection->>Security : "Validate background styles"
Security-->>Projection : "Safe background styles"
Projection->>Security : "Sanitize overlay opacity"
Security-->>Projection : "Validated opacity value"
Projection->>Projection : "setState(newState)"
Projection->>Projection : "Render with CSS transition"
Note over PreparationList,Store : "Blank mode for cleaner transitions"
Note over Projection : "Smooth line movement animation<br/>with configurable timing"
Note over Camera,Projection : "Camera feed with proper resource management"
Note over Security,Projection : "CSS injection prevention"
```

**Diagram sources**
- [PresentPanel.tsx:103-131](file://src/components/PresentPanel.tsx#L103-L131)
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)
- [PreparationList.tsx:57-63](file://src/components/PreparationList.tsx#L57-L63)
- [main.ts:186-190](file://electron/main.ts#L186-L190)
- [preload.ts:10-16](file://electron/preload.ts#L10-L16)
- [ProjectionView.tsx:76-79](file://src/components/ProjectionView.tsx#L76-L79)
- [ProjectionView.tsx:139-180](file://src/components/ProjectionView.tsx#L139-L180)
- [sanitize.ts:106-131](file://src/utils/sanitize.ts#L106-L131)

## Detailed Component Analysis

### ProjectionView Component
The ProjectionView component renders fullscreen projection output with enhanced smooth line transition animations, comprehensive camera visualization, and security validation:
- Fullscreen rendering using w-screen h-screen utilities
- Mode-based rendering (black, logo, **camera**, live, blank, clear)
- Dynamic background rendering with overlay support and security validation
- Text styling application with responsive margins
- Smooth transitions for line offset animations with configurable timing
- Copyright display for live mode
- **Enhanced** Secure background style generation using safeBackgroundStyle() utility
- **Enhanced** Input validation for overlay opacity using sanitizeNumber() function
- **New** Camera mode rendering with fullscreen webcam display
- **New** Picture-in-Picture overlay functionality for camera feeds

```mermaid
classDiagram
class ProjectionView {
+useState(state)
+useEffect(subscribe)
+getBackgroundStyle() React.CSSProperties
+getTextStyle() React.CSSProperties
+getVerticalAlignment() string
+render() JSX.Element
}
class ProjectionState {
+mode : ProjectionMode
+background : BackgroundSettings
+textStyle : TextStyle
+lyrics? : string
+lineOffset? : number
+scrollDuration? : number
+copyright? : string
+cameraDeviceId? : string
+pipEnabled? : boolean
+pipPosition? : PipPosition
}
class BackgroundSettings {
+type : "color"|"gradient"|"image"|"video"
+value : string
+overlayOpacity? : number
+blur? : number
}
class TextStyle {
+fontFamily : string
+fontSize : number
+fontWeight : string
+italic : boolean
+color : string
+alignment : "left"|"center"|"right"
+verticalPosition : "top"|"middle"|"bottom"
+shadow : boolean
+outline : boolean
+lineHeight : number
+topMargin? : number
+bottomMargin? : number
}
class CameraSystem {
+useCameraStream(deviceId)
+CameraView(deviceId)
+PipOverlay(deviceId, position)
}
class SecurityUtilities {
+safeBackgroundStyle() React.CSSProperties
+sanitizeNumber() number
+sanitizeColor() string
+sanitizeGradient() string
+sanitizeImageUrl() string|null
}
ProjectionView --> ProjectionState : "renders"
ProjectionView --> CameraSystem : "uses for camera feeds"
ProjectionView --> SecurityUtilities : "uses for validation"
ProjectionState --> BackgroundSettings : "contains"
ProjectionState --> TextStyle : "contains"
```

**Diagram sources**
- [ProjectionView.tsx:6-35](file://src/components/ProjectionView.tsx#L6-L35)
- [index.ts:69-87](file://src/types/index.ts#L69-L87)
- [index.ts:21-27](file://src/types/index.ts#L21-L27)
- [index.ts:29-42](file://src/types/index.ts#L29-L42)
- [sanitize.ts:106-131](file://src/utils/sanitize.ts#L106-L131)

#### Rendering Modes
The component supports six projection modes:
- Black: Solid black background
- Logo: Dark background with centered "LyricDeck 3.0" watermark
- **Camera**: Fullscreen camera feed with error handling
- Live: Full projection with lyrics and background, including smooth line transition animations
- Blank: Transparent overlay with text styling (enhanced with cleaner transitions)
- Clear: Empty projection (used for transitions)

**Updated** Live mode now includes smooth line transition animations with configurable timing through scrollDuration parameter, enhanced security validation, and optional camera overlay through Picture-in-Picture functionality

```mermaid
flowchart TD
Start(["ProjectionView Render"]) --> CheckMode{"Mode"}
CheckMode --> |black| Black["Solid black background"]
CheckMode --> |logo| Logo["Black background with watermark"]
CheckMode --> |camera| Camera["Fullscreen camera feed<br/>New: Camera visualization"]
CheckMode --> |live| Live["Live projection with lyrics<br/>Enhanced: Smooth line transition + Security + Optional PiP"]
CheckMode --> |blank| Blank["Blank overlay with text styling<br/>Enhanced: Cleaner transition experience"]
CheckMode --> |clear| Clear["Empty projection"]
Camera --> CameraView["CameraView component<br/>Error handling & i18n"]
Live --> Background["Apply background settings<br/>Enhanced: Using safeBackgroundStyle()"]
Live --> Text["Apply text styling and line offset<br/>Enhanced: CSS transition animation"]
Live --> Copyright["Show copyright if present"]
Live --> PiP["Optional PiP overlay<br/>New: Camera feed in corner"]
Background --> Overlay["Optional overlay color<br/>Enhanced: Sanitized with sanitizeNumber()"]
Text --> Transition["Smooth line offset transition<br/>Configurable duration via scrollDuration"]
Blank --> Preparation["Preparation phase transitions<br/>Shows background only"]
PiP --> PipOverlay["PipOverlay component<br/>Positioned camera feed"]
```

**Diagram sources**
- [ProjectionView.tsx:64-137](file://src/components/ProjectionView.tsx#L64-L137)
- [ProjectionView.tsx:182-203](file://src/components/ProjectionView.tsx#L182-L203)
- [ProjectionView.tsx:206-228](file://src/components/ProjectionView.tsx#L206-L228)

#### Background Rendering Pipeline
The background rendering system supports three types with comprehensive security validation:
- Color backgrounds with solid fills and color validation
- Gradient backgrounds with customizable gradients and gradient sanitization
- Image backgrounds with blur effects, positioning, and URL validation

```mermaid
flowchart TD
BGStart["Background Settings"] --> Security["Security Validation"]
Security --> Type{"Background Type"}
Type --> |color| ColorBG["backgroundColor: sanitized color"]
Type --> |gradient| GradientBG["background: sanitized gradient"]
Type --> |image| ImageBG["backgroundImage with validated URL"]
ImageBG --> Position["backgroundPosition: center"]
ImageBG --> Size["backgroundSize: cover"]
ImageBG --> Blur["Optional blur filter<br/>Enhanced: Sanitized blur value"]
ColorBG --> SafeColor["sanitizeColor() validation"]
GradientBG --> SafeGradient["sanitizeGradient() validation"]
ImageBG --> SafeURL["sanitizeImageUrl() validation"]
```

**Diagram sources**
- [ProjectionView.tsx:33-35](file://src/components/ProjectionView.tsx#L33-L35)
- [sanitize.ts:106-131](file://src/utils/sanitize.ts#L106-L131)
- [index.ts:21-27](file://src/types/index.ts#L21-L27)

#### Text Styling Application
Text styling is applied through computed CSS properties:
- Font family, size, weight, and italic styling
- Color and text alignment
- Line height and vertical positioning
- Text shadows and stroke outlines
- Dynamic top/bottom margins for responsive layout

**Updated** Enhanced with smooth line transition animations controlled by scrollDuration parameter

```mermaid
flowchart TD
TSStart["TextStyle Settings"] --> Font["Font properties"]
TSStart --> Layout["Layout properties"]
TSStart --> Effects["Visual effects"]
TSStart --> Animation["Animation properties"]
Font --> Family["fontFamily"]
Font --> Size["fontSize"]
Font --> Weight["fontWeight"]
Font --> Style["italic"]
Layout --> Color["color"]
Layout --> Align["textAlign"]
Layout --> Line["lineHeight"]
Layout --> Margins["top/bottom margins"]
Effects --> Shadow["textShadow"]
Effects --> Outline["WebkitTextStroke"]
Animation --> Transform["transform: translateY()"]
Animation --> Transition["transition: transform duration"]
```

**Diagram sources**
- [ProjectionView.tsx:37-50](file://src/components/ProjectionView.tsx#L37-L50)
- [index.ts:29-42](file://src/types/index.ts#L29-L42)

#### Smooth Line Transition Animations
The enhanced line transition system provides smooth animations with configurable timing:
- CSS transition property automatically applied when scrollDuration > 0
- Linear timing function ensures consistent animation speed
- Transform calculations support smooth vertical positioning
- Duration parameter controls animation speed precisely
- Hardware-accelerated CSS transforms for optimal performance

**New** Smooth line transition animations with configurable timing through scrollDuration parameter

```mermaid
flowchart TD
LineStart["Line Offset Change"] --> CheckDuration{"scrollDuration > 0?"}
CheckDuration --> |Yes| ApplyTransition["Apply CSS transition:<br/>transform Xs linear"]
CheckDuration --> |No| NoTransition["No animation<br/>Immediate position change"]
ApplyTransition --> CalculateTransform["Calculate transform:<br/>translateY(-lineOffset × fontSize × lineHeight)"]
CalculateTransform --> Animate["Animate with smooth easing"]
NoTransition --> Direct["Direct position update"]
Animate --> Render["Render with smooth transition"]
Direct --> Render
```

**Diagram sources**
- [ProjectionView.tsx:109-115](file://src/components/ProjectionView.tsx#L109-L115)

**Section sources**
- [ProjectionView.tsx:1-229](file://src/components/ProjectionView.tsx#L1-L229)
- [index.ts:69-87](file://src/types/index.ts#L69-L87)

### Enhanced Preparation List Integration
The preparation list system now includes enhanced projection control actions that provide cleaner transition experiences:

#### Blank Mode Functionality
The `selectFromPreparationList` action has been enhanced to automatically switch to blank mode when selecting songs from the preparation list. This provides a cleaner transition experience by displaying only the song's background without immediately showing lyrics during the preparation phase.

**Updated** Enhanced projection control actions with blank mode functionality for smoother transitions

```mermaid
flowchart TD
PrepList["PreparationList.tsx"] --> SelectSong["selectFromPreparationList()"]
SelectSong --> SetBlank["Set mode: 'blank'"]
SelectSong --> ClearLyrics["Set lyrics: undefined"]
SelectSong --> ShowBackground["Display song background only"]
SelectSong --> UpdateState["Update projection state"]
UpdateState --> ProjectionView["ProjectionView renders blank mode"]
```

**Diagram sources**
- [PreparationList.tsx:57-63](file://src/components/PreparationList.tsx#L57-L63)
- [appStore.ts:353-370](file://src/store/appStore.ts#L353-L370)

#### Presentation Controls Integration
The presentation panel provides direct access to blank mode through dedicated buttons and keyboard shortcuts, complementing the preparation list functionality.

**Section sources**
- [PreparationList.tsx:1-188](file://src/components/PreparationList.tsx#L1-L188)
- [PresentPanel.tsx:288-311](file://src/components/PresentPanel.tsx#L288-L311)
- [appStore.ts:353-370](file://src/store/appStore.ts#L353-L370)

### Enhanced Line Movement System
The shiftLines functionality has been enhanced to support smooth animations with configurable timing:

#### Scroll Duration Parameter
The shiftLines function now accepts a duration parameter that controls animation timing:
- Duration parameter passed from presentation controls
- Stored in projectionState.scrollDuration
- Applied as CSS transition duration for line movements
- Enables precise control over animation speed
- Supports smooth, professional transitions

**New** Enhanced shiftLines function with scrollDuration parameter for smooth animations

```mermaid
flowchart TD
ShiftStart["shiftLines(offset, duration)"] --> GetCurrent["Get current lineOffset"]
GetCurrent --> CalculateNew["Calculate new lineOffset:<br/>current + offset"]
CalculateNew --> SetDuration["Set scrollDuration:<br/>duration parameter"]
SetDuration --> UpdateState["Update projectionState"]
UpdateState --> SendIPC["Send to projection window"]
SendIPC --> ApplyAnimation["Apply CSS transition:<br/>transform duration linear"]
```

**Diagram sources**
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)

#### Presentation Controls Integration
The presentation panel provides intuitive controls for line shifting with duration configuration:
- Scroll speed input field for duration setting
- Line shift buttons with configurable timing
- Real-time preview of animation effects
- Keyboard shortcuts for quick adjustments

**Section sources**
- [PresentPanel.tsx:320-362](file://src/components/PresentPanel.tsx#L320-362)
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)

### Electron Integration
The projection system integrates tightly with Electron for window management and display detection:

```mermaid
sequenceDiagram
participant Main as "Electron Main"
participant Screen as "Electron Screen API"
participant Window as "Projection Window"
participant Renderer as "ProjectionView"
Main->>Screen : "getAllDisplays()"
Screen-->>Main : "Display list"
Main->>Window : "createBrowserWindow(fullscreen)"
Window->>Renderer : "Load ProjectionView"
Renderer->>Main : "subscribe to state updates"
Note over Main,Window : "Multi-display support"
Main->>Screen : "getPrimaryDisplay()"
Main->>Window : "Position on target display"
```

**Diagram sources**
- [main.ts:111-152](file://electron/main.ts#L111-L152)
- [main.ts:155-164](file://electron/main.ts#L155-L164)
- [App.tsx:16-17](file://src/App.tsx#L16-L17)

#### Display Management
The Electron main process handles:
- Display enumeration and selection
- Multi-display window placement
- Primary display fallback logic
- Projection window lifecycle management
- **New** Camera permission handling for media access

**Section sources**
- [main.ts:111-152](file://electron/main.ts#L111-L152)
- [main.ts:155-164](file://electron/main.ts#L155-L164)
- [main.ts:455-458](file://electron/main.ts#L455-L458)
- [preload.ts:3-21](file://electron/preload.ts#L3-L21)

### State Synchronization
Real-time state synchronization occurs through:
- IPC handlers for state updates with scrollDuration support
- Subscription mechanism for renderer updates
- Automatic cleanup of event listeners

```mermaid
flowchart TD
Store["Zustand Store"] --> IPC["IPC Handler"]
IPC --> Window["Projection Window"]
Window --> Renderer["ProjectionView"]
Renderer --> State["Local State"]
State --> Cleanup["Cleanup on unmount"]
```

**Diagram sources**
- [appStore.ts:242-250](file://src/store/appStore.ts#L242-L250)
- [main.ts:186-190](file://electron/main.ts#L186-L190)
- [ProjectionView.tsx:24-31](file://src/components/ProjectionView.tsx#L24-L31)

**Section sources**
- [appStore.ts:241-306](file://src/store/appStore.ts#L241-L306)
- [main.ts:186-190](file://electron/main.ts#L186-L190)
- [preload.ts:10-16](file://electron/preload.ts#L10-L16)

## Camera Visualization System

### Camera Stream Management
The camera visualization system provides comprehensive webcam feed management with proper resource handling:

#### useCameraStream Hook
The `useCameraStream` hook manages camera initialization, stream lifecycle, and error handling:
- Automatic camera stream initialization with device selection
- Proper resource cleanup when device changes or component unmounts
- Error state management for camera access failures
- Support for specific camera device IDs
- Audio disabled by default for clean presentation feeds

```mermaid
flowchart TD
HookInit["useCameraStream(deviceId)"] --> CreateRef["Create video ref & error state"]
CreateRef --> StartStream["startCamera() async function"]
StartStream --> GetConstraints["Build MediaStreamConstraints"]
GetConstraints --> RequestAccess["navigator.mediaDevices.getUserMedia()"]
RequestAccess --> Success{"Success?"}
Success --> |Yes| AttachStream["Attach stream to video element"]
Success --> |No| SetError["Set error state"]
AttachStream --> PlayStream["Play video stream"]
PlayStream --> Cleanup["Cleanup on unmount/device change"]
SetError --> Cleanup
```

**Diagram sources**
- [ProjectionView.tsx:139-180](file://src/components/ProjectionView.tsx#L139-L180)

#### CameraView Component
The `CameraView` component provides fullscreen camera feed display:
- Fullscreen video rendering with object-contain scaling
- Error handling with user-friendly messages
- Internationalization support for error messages
- Proper video element configuration (autoplay, playsInline, muted)
- Responsive design adapting to different screen sizes

#### PipOverlay Component
The `PipOverlay` component creates picture-in-picture camera feeds:
- Positioned camera overlay in bottom-left or bottom-right corners
- Responsive sizing with viewport-relative dimensions
- Styled container with border, shadow, and rounded corners
- Graceful error handling (renders nothing on camera failure)
- Z-index layering to ensure overlay appears above content

```mermaid
flowchart TD
PipStart["PipOverlay Component"] --> CheckError{"Camera error?"}
CheckError --> |Yes| HideOverlay["Return null (no overlay)"]
CheckError --> |No| DeterminePosition["Determine corner position"]
DeterminePosition --> BottomLeft{"position === 'bottom-left'?"}
BottomLeft --> |Yes| LeftPos["bottom-[2vw] left-[2vw]"]
BottomLeft --> |No| RightPos["bottom-[2vw] right-[2vw]"]
LeftPos --> CreateContainer["Create styled container"]
RightPos --> CreateContainer
CreateContainer --> AddVideo["Add video element with object-cover"]
AddVideo --> RenderOverlay["Render positioned camera feed"]
```

**Diagram sources**
- [ProjectionView.tsx:206-228](file://src/components/ProjectionView.tsx#L206-L228)

### Camera Device Management
The PresentPanel component provides comprehensive camera device management:

#### Device Enumeration
- Automatic camera device discovery using MediaDevices API
- Filter for videoinput devices only
- User-friendly device labels with fallback numbering
- Permission handling for camera access

#### Device Selection
- Dropdown interface for camera selection
- Real-time device switching without re-entering camera mode
- Integration with both fullscreen camera mode and PiP functionality
- Visual feedback for selected camera device

#### Camera Mode Control
- Toggle button for fullscreen camera visualization mode
- Integration with existing projection workflow
- Seamless switching between camera and other projection modes
- State persistence for camera device selection

**Section sources**
- [ProjectionView.tsx:139-228](file://src/components/ProjectionView.tsx#L139-L228)
- [PresentPanel.tsx:79-131](file://src/components/PresentPanel.tsx#L79-L131)
- [PresentPanel.tsx:305-344](file://src/components/PresentPanel.tsx#L305-L344)

### Camera Permissions and Security
The system implements proper camera permission handling:

#### Electron Permission Management
- Global permission handler for media access requests
- Automatic approval for camera permissions in app windows
- Security-first approach with minimal permission scope

#### Browser API Integration
- Standard WebRTC getUserMedia API usage
- Proper constraint configuration for video-only access
- Error handling for permission denials and hardware failures

**Section sources**
- [main.ts:455-458](file://electron/main.ts#L455-L458)
- [ProjectionView.tsx:148-166](file://src/components/ProjectionView.tsx#L148-L166)

## Security Enhancements

### CSS Injection Prevention System
The ProjectionView component now implements comprehensive security measures to prevent CSS injection attacks through multiple layers of validation and sanitization:

#### Safe Background Style Generation
The `getBackgroundStyle()` method has been completely replaced with the `safeBackgroundStyle()` utility function, providing secure background style generation:

```mermaid
flowchart TD
UserInput["User Background Settings"] --> SafeBg["safeBackgroundStyle()"]
SafeBg --> ValidateType{"Validate type"}
ValidateType --> |color| ColorValidation["sanitizeColor()"]
ValidateType --> |gradient| GradientValidation["sanitizeGradient()"]
ValidateType --> |image| ImageValidation["sanitizeImageUrl()"]
ColorValidation --> SafeColor["Safe color value"]
GradientValidation --> SafeGradient["Safe gradient value"]
ImageValidation --> SafeURL["Safe image URL"]
SafeColor --> BuildStyle["Build safe CSS object"]
SafeGradient --> BuildStyle
SafeURL --> BuildStyle
BuildStyle --> Output["Secure background styles"]
```

**Diagram sources**
- [ProjectionView.tsx:33-35](file://src/components/ProjectionView.tsx#L33-L35)
- [sanitize.ts:106-131](file://src/utils/sanitize.ts#L106-L131)

#### Overlay Opacity Validation
The overlay opacity handling has been enhanced with `sanitizeNumber()` validation to ensure values remain within the valid 0-1 range:

```mermaid
flowchart TD
OpacityInput["overlayOpacity value"] --> Sanitize["sanitizeNumber(value, 0, 1, 0)"]
Sanitize --> ValidateRange{"Value in range 0-1?"}
ValidateRange --> |Yes| UseValue["Use validated value"]
ValidateRange --> |No| Fallback["Use fallback value (0)"]
UseValue --> CreateOverlay["Create rgba overlay"]
Fallback --> NoOverlay["No overlay or transparent"]
```

**Diagram sources**
- [ProjectionView.tsx:81-86](file://src/components/ProjectionView.tsx#L81-L86)
- [sanitize.ts:96-100](file://src/utils/sanitize.ts#L96-L100)

### Security Utility Functions
The security system provides comprehensive validation functions:

#### Color Validation (`sanitizeColor`)
- Validates hex colors (#RGB, #RRGGBB, #RRGGBBAA)
- Validates RGB/RGBA color functions
- Validates HSL/HSLA color functions
- Allows safe named colors (transparent, black, white, etc.)
- Returns fallback color for invalid inputs

#### Gradient Validation (`sanitizeGradient`)
- Validates gradient function syntax (linear-gradient, radial-gradient, conic-gradient)
- Rejects dangerous patterns (expression(), javascript:, vbscript:)
- Prevents CSS injection through malicious gradient values
- Returns safe default gradient for invalid inputs

#### Image URL Validation (`sanitizeImageUrl`)
- Allows custom lyricdeck-img:// protocol
- Validates safe data URLs (png, jpeg, gif, webp, bmp, svg+xml)
- Blocks potentially dangerous protocols and data URIs
- Returns null for unsafe URLs

#### Number Validation (`sanitizeNumber`)
- Ensures numeric values are finite numbers
- Clamps values within specified min/max ranges
- Provides fallback values for invalid inputs
- Used for opacity, blur, and other numeric CSS properties

**Section sources**
- [ProjectionView.tsx:33-35](file://src/components/ProjectionView.tsx#L33-L35)
- [ProjectionView.tsx:81-86](file://src/components/ProjectionView.tsx#L81-L86)
- [sanitize.ts:1-132](file://src/utils/sanitize.ts#L1-132)

## Dependency Analysis
The ProjectionView component has the following dependencies and relationships with enhanced security utilities and camera system:

```mermaid
graph TB
PV["ProjectionView.tsx"] --> Types["types/index.ts"]
PV --> Store["store/appStore.ts"]
PV --> Electron["electron/main.ts"]
PV --> Preload["electron/preload.ts"]
PV --> CSS["index.css"]
PV --> Security["utils/sanitize.ts"]
PV --> I18n["i18n/useI18n"]
Types --> PV
Store --> PV
Electron --> PV
Preload --> PV
Security --> PV
I18n --> PV
PL["PreparationList.tsx"] --> Store
PP["PresentPanel.tsx"] --> Store
PP --> Types
PP --> I18n
EP["EditorPanel.tsx"] --> Security
SP["SettingsPanel.tsx"] --> Security
subgraph "External Dependencies"
React["React"]
Tailwind["Tailwind CSS"]
Zustand["Zustand"]
ElectronDep["Electron"]
WebRTC["WebRTC API"]
end
PV --> React
PV --> Tailwind
Store --> Zustand
PV --> ElectronDep
PV --> WebRTC
PL --> React
PP --> React
EP --> React
SP --> React
```

**Diagram sources**
- [ProjectionView.tsx:1-4](file://src/components/ProjectionView.tsx#L1-L4)
- [index.ts:1-95](file://src/types/index.ts#L1-L95)
- [appStore.ts:1-3](file://src/store/appStore.ts#L1-L3)
- [main.ts:1-5](file://electron/main.ts#L1-L5)
- [preload.ts:1-3](file://electron/preload.ts#L1-L3)
- [sanitize.ts:1-5](file://src/utils/sanitize.ts#L1-L5)
- [index.css:1-3](file://src/index.css#L1-L3)
- [PreparationList.tsx:1-3](file://src/components/PreparationList.tsx#L1-L3)
- [PresentPanel.tsx:1-4](file://src/components/PresentPanel.tsx#L1-L4)
- [EditorPanel.tsx:1-4](file://src/components/EditorPanel.tsx#L1-L4)
- [SettingsPanel.tsx:1-5](file://src/components/SettingsPanel.tsx#L1-L5)

Key dependency characteristics:
- Low coupling with external libraries (React, Tailwind, Zustand)
- Strong separation between presentation logic and Electron integration
- Type-safe state management through TypeScript interfaces
- Minimal runtime dependencies for optimal performance
- Enhanced preparation list integration for improved workflow
- ScrollDuration parameter support for smooth animations
- **New** WebRTC API integration for camera functionality
- **New** Comprehensive security utilities for CSS injection prevention
- **New** Centralized security validation across multiple components
- **New** Internationalization support for camera features

**Section sources**
- [ProjectionView.tsx:1-4](file://src/components/ProjectionView.tsx#L1-L4)
- [index.ts:1-95](file://src/types/index.ts#L1-L95)
- [appStore.ts:1-3](file://src/store/appStore.ts#L1-L3)
- [main.ts:1-5](file://electron/main.ts#L1-L5)
- [preload.ts:1-3](file://electron/preload.ts#L1-L3)
- [sanitize.ts:1-5](file://src/utils/sanitize.ts#L1-L5)

## Performance Considerations
Optimizing the ProjectionView component for smooth live presentation rendering with enhanced animations, security validation, and camera functionality:

### Rendering Optimizations
- Use CSS transforms for line offset animations (hardware-accelerated)
- Leverage Tailwind utility classes for efficient styling
- Avoid unnecessary re-renders through proper state management
- Optimize blank mode rendering for cleaner transitions
- Hardware-accelerated CSS transitions for smooth animations
- Configurable animation timing reduces CPU overhead during rapid changes
- **Enhanced** Efficient security validation with minimal performance impact
- **New** Efficient camera stream management with proper resource cleanup

### Memory Management
- Clean up IPC event listeners on component unmount
- Dispose of projection window resources properly
- Monitor memory usage during long presentations
- Efficient handling of preparation list state changes
- Animation state cleanup prevents memory leaks
- **Enhanced** Security utility functions are lightweight and reusable
- **New** Proper camera stream cleanup on device changes and component unmount
- **New** Video element resource management to prevent memory leaks

### Display Performance
- Use hardware-accelerated CSS properties (transform, filter)
- Optimize image backgrounds with appropriate sizing
- Consider GPU acceleration for complex effects
- Smooth transitions between blank and live modes
- Optimized CSS transition calculations for minimal performance impact
- **Enhanced** Security validation occurs once per render cycle
- **New** Efficient camera feed rendering with object-fit optimization

### State Synchronization
- Debounce rapid state updates to prevent excessive re-renders
- Use selective state updates for projection-specific properties
- Cache computed style values when possible
- Optimize preparation list interaction performance
- Efficient scrollDuration parameter handling for smooth animations
- **Enhanced** Security validation integrated into existing render cycle
- **New** Efficient camera device state management

### Animation Performance
- Linear timing function ensures consistent frame rates
- Hardware-accelerated transforms minimize CPU usage
- Configurable duration prevents overly slow animations
- CSS transitions optimized for smooth 60fps performance
- **Enhanced** Security validation does not impact animation performance
- **New** Smooth camera feed transitions without jank

### Security Performance
- **New** Lightweight validation functions with minimal overhead
- **New** Reusable security utilities across components
- **New** Efficient regex patterns for fast validation
- **New** Early return patterns for invalid inputs
- **New** Caching of validation results where appropriate

### Camera Performance
- **New** Lazy camera stream initialization only when needed
- **New** Efficient video element reuse to prevent recreation overhead
- **New** Proper stream disposal to free camera resources
- **New** Error handling prevents performance degradation on camera failures
- **New** Optimized PiP overlay rendering with minimal DOM manipulation

## Troubleshooting Guide

### Common Display Issues
**Problem**: Projection window fails to open on secondary display
- Verify display detection returns multiple displays
- Check display ID selection logic
- Ensure projection window creation succeeds

**Problem**: Incorrect fullscreen positioning
- Validate display bounds calculation
- Confirm window position matches display coordinates
- Test with different DPI settings

**Problem**: Black screen or missing content
- Verify IPC state updates are received
- Check projection mode rendering logic
- Ensure background rendering applies correctly
- **Enhanced** Check security validation is not blocking legitimate content

### State Synchronization Problems
**Issue**: State updates not reflected in projection
- Confirm IPC handler registration
- Verify state update propagation chain
- Check for event listener cleanup issues

**Issue**: Stale state in projection window
- Implement proper cleanup of subscriptions
- Validate state update frequency
- Monitor for memory leaks

### Animation and Transition Issues
**Issue**: Line transitions not animating smoothly
- Verify scrollDuration parameter > 0
- Check CSS transition property application
- Ensure transform calculations are correct
- Monitor browser compatibility for CSS transitions

**Issue**: Animation timing feels too fast or slow
- Adjust scrollDuration parameter in presentation controls
- Test with different duration values
- Verify linear timing function is applied correctly

**Issue**: Jittery or choppy animations
- Reduce animation complexity
- Optimize background rendering
- Monitor CPU/GPU usage during presentations
- Ensure hardware acceleration is enabled

### Camera-Related Issues
**Issue**: Camera feed not displaying
- Check camera permission grants in Electron main process
- Verify MediaDevices API availability
- Ensure camera device is properly enumerated
- Check for browser security restrictions

**Issue**: Camera permission denied
- Verify Electron permission handler is configured
- Check browser security policies
- Ensure proper HTTPS context for camera access
- Review user permission dialogs

**Issue**: Poor camera performance
- Check camera resolution settings
- Monitor CPU usage during camera streaming
- Verify video element optimization (object-fit, autoplay)
- Ensure proper stream cleanup on device changes

**Issue**: PiP overlay not appearing
- Verify pipEnabled state is true
- Check cameraDeviceId is properly set
- Ensure PiP position is valid
- Monitor for camera errors that would hide the overlay

### Security-Related Issues
**Issue**: Background styles not displaying correctly
- Check if security validation is rejecting legitimate values
- Verify color format matches expected patterns
- Ensure gradient syntax is valid
- Confirm image URLs use allowed protocols

**Issue**: Overlay opacity not working
- Verify opacity values are within 0-1 range
- Check sanitizeNumber() validation is functioning
- Ensure overlay opacity is being calculated correctly

**Issue**: Content blocked by security validation
- Review security utility function behavior
- Check for overly restrictive validation rules
- Verify input data format matches expected patterns

### Preparation List Integration Issues
**Issue**: Blank mode not activating from preparation list
- Verify selectFromPreparationList action implementation
- Check projection state updates for blank mode
- Ensure proper cleanup of lyrics and line offset

**Issue**: Inconsistent transition behavior
- Monitor preparation list click events
- Verify blank mode state persistence
- Check for conflicts with manual mode switching

### Performance Issues
**Symptoms**: Choppy animations or delayed updates
- Reduce animation complexity
- Optimize background rendering
- Monitor CPU/GPU usage during presentations
- Optimize preparation list interaction performance
- Check scrollDuration values for optimal performance
- Monitor animation frame rates during testing
- **Enhanced** Monitor security validation performance impact
- **New** Monitor camera stream performance and resource usage

**Section sources**
- [main.ts:111-152](file://electron/main.ts#L111-L152)
- [main.ts:455-458](file://electron/main.ts#L455-L458)
- [preload.ts:10-16](file://electron/preload.ts#L10-L16)
- [ProjectionView.tsx:24-31](file://src/components/ProjectionView.tsx#L24-L31)
- [ProjectionView.tsx:139-180](file://src/components/ProjectionView.tsx#L139-L180)
- [appStore.ts:353-370](file://src/store/appStore.ts#L353-L370)
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)
- [sanitize.ts:1-132](file://src/utils/sanitize.ts#L1-L132)

## Conclusion
The ProjectionView component provides a robust, performant solution for fullscreen lyric projection in live presentation environments. Its architecture emphasizes real-time state synchronization, multi-display support, and responsive rendering while maintaining clean separation between presentation logic and Electron integration. The component's design enables smooth operation during live events through careful optimization of rendering pipelines, efficient state management, and reliable IPC communication.

**Updated** The enhanced smooth line transition animations with scrollDuration parameter support significantly improve the presentation experience by enabling professional-grade animated line movements with precise timing control. Presenters can now create smooth, polished transitions between lyrics sections with configurable animation speeds, enhancing the overall quality of live presentations. Additionally, the comprehensive security enhancements provide robust protection against CSS injection attacks through multiple layers of validation and sanitization. **New** The integrated camera visualization system adds powerful presentation capabilities including fullscreen camera feeds, picture-in-picture overlays, and seamless camera device management, enabling presenters to incorporate live visual elements into their presentations.

Key strengths include:
- Seamless integration with the presentation controls system
- Comprehensive multi-mode rendering support including enhanced blank mode and new camera mode
- Efficient background and text styling systems
- Reliable multi-display window management
- Performance-optimized rendering pipeline with smooth animations
- Enhanced preparation list integration for improved workflow
- Configurable animation timing for professional presentation quality
- **New** Comprehensive camera visualization with fullscreen and PiP modes
- **New** Robust camera device management and permission handling
- **New** Comprehensive security measures preventing CSS injection attacks
- **New** Robust input validation ensuring data integrity and safety

The component serves as a critical foundation for live presentation workflows, enabling presenters to deliver professional-quality lyric projections with minimal technical overhead while enjoying improved preparation experiences through the blank mode functionality, smooth animation capabilities, enhanced security protections, and powerful camera visualization features.

## Appendices

### Projection Setup Workflows

#### Basic Projection Setup
1. Select target display in presentation panel
2. Click "Start Projection" button
3. Verify projection window opens on selected display
4. Adjust projection mode as needed

#### Enhanced Preparation Workflow with Blank Mode
1. Build preparation list with desired songs
2. Select song from preparation list
3. System automatically switches to blank mode with background only
4. Prepare for presentation without immediate lyric reveal
5. Switch to live mode when ready to present

#### Smooth Line Transition Setup
1. Configure scroll speed in presentation controls
2. Use line shift buttons to move between lyrics sections
3. Adjust duration for desired animation speed
4. Test animations with different timing values
5. Fine-tune for optimal presentation quality

#### Multi-Display Configuration
1. Enumerate available displays via Electron screen API
2. Select secondary display for projection
3. Configure display-specific settings
4. Test projection output quality

#### Security Configuration
1. Verify background settings use supported formats
2. Ensure image URLs use allowed protocols (lyricdeck-img:// or safe data URLs)
3. Validate color values match expected patterns
4. Test gradient syntax for compatibility
5. Monitor security validation logs for rejected inputs

#### Camera Setup and Configuration
1. Grant camera permissions in Electron main process
2. Select camera device from dropdown in presentation panel
3. Choose between fullscreen camera mode and PiP overlay
4. Configure PiP position (bottom-left or bottom-right)
5. Test camera feed quality and positioning
6. Verify proper camera resource cleanup

#### Troubleshooting Display Issues
1. Check display detection results
2. Verify projection window positioning
3. Test with different display configurations
4. Monitor for resolution mismatch issues

### Enhanced Preparation List Features
- **Blank Mode Integration**: Automatic blank mode activation when selecting songs from preparation list
- **Cleaner Transitions**: Background-only display during preparation phase
- **Smooth Workflow**: Professional transition experience between songs
- **State Management**: Proper handling of lyrics and line offset during preparation

### Enhanced Animation Features
- **Configurable Timing**: scrollDuration parameter controls animation speed
- **Linear Easing**: Consistent animation speed for professional feel
- **Hardware Acceleration**: CSS transforms optimized for smooth performance
- **Real-time Control**: Dynamic adjustment of animation timing during presentations

### Camera Visualization Features
- **Fullscreen Camera Mode**: Dedicated camera visualization mode for presenter feeds
- **Picture-in-Picture Overlay**: Camera feed overlaid in corner during live presentations
- **Camera Device Management**: Automatic device enumeration and selection
- **Permission Handling**: Proper camera permission management through Electron
- **Resource Cleanup**: Automatic stream disposal and memory management
- **Error Handling**: Graceful handling of camera failures and permission denials
- **Internationalization**: Multi-language support for camera-related UI elements

### Security Enhancement Features
- **CSS Injection Prevention**: Comprehensive validation of all user-provided CSS values
- **Safe Background Styles**: Secure background rendering through safeBackgroundStyle() utility
- **Input Validation**: Robust sanitization of colors, gradients, image URLs, and numeric values
- **Multiple Validation Layers**: Defense-in-depth approach to security
- **Reusable Security Utilities**: Centralized security functions used across components

### Performance Optimization Checklist
- Use hardware-accelerated CSS properties
- Minimize DOM complexity in projection view
- Optimize background image loading
- Implement proper state update throttling
- Monitor resource usage during presentations
- Optimize preparation list interaction performance
- Ensure smooth blank mode transitions
- Optimize animation performance with appropriate scrollDuration values
- Monitor frame rates during animation testing
- Test animation compatibility across different browsers and devices
- **New** Monitor camera stream performance and resource usage
- **New** Optimize video element rendering for smooth playback
- **New** Ensure proper camera stream cleanup to prevent memory leaks
- **New** Monitor security validation performance impact
- **New** Validate security utility efficiency under load
- **New** Test security measures with various input formats

### Security Best Practices
- Always use safeBackgroundStyle() for background rendering
- Validate all user inputs through security utilities
- Use sanitizeNumber() for numeric CSS properties
- Implement proper error handling for security validation failures
- Regularly review security utility functions for vulnerabilities
- Test with malicious inputs to ensure protection effectiveness
- Monitor security logs for potential attack attempts

### Camera Best Practices
- Always handle camera permission errors gracefully
- Implement proper camera stream cleanup on component unmount
- Use object-fit CSS properties for optimal video scaling
- Monitor camera performance and resource usage
- Provide user feedback for camera status and errors
- Test camera functionality across different browsers and devices
- Ensure proper HTTPS context for camera access in production environments