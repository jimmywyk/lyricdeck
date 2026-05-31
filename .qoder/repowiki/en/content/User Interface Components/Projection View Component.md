# Projection View Component

<cite>
**Referenced Files in This Document**
- [ProjectionView.tsx](file://src/components/ProjectionView.tsx)
- [appStore.ts](file://src/store/appStore.ts)
- [index.ts](file://src/types/index.ts)
- [main.ts](file://electron/main.ts)
- [preload.ts](file://electron/preload.ts)
- [PresentPanel.tsx](file://src/components/PresentPanel.tsx)
- [PreparationList.tsx](file://src/components/PreparationList.tsx)
- [App.tsx](file://src/App.tsx)
- [index.css](file://src/index.css)
</cite>

## Update Summary
**Changes Made**
- Enhanced ProjectionView component with smooth line transition animations using CSS transitions
- Added scrollDuration parameter support for configurable animation timing
- Updated transform calculations to support scrollDuration-based transitions
- Enhanced shiftLines functionality with duration-based animations
- Updated projection state management to include scrollDuration property

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
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive documentation for the ProjectionView component, which renders fullscreen projection output for live presentations. It covers the component's fullscreen rendering capabilities, real-time state synchronization from the main application, multi-display support, projection mode system, background rendering pipeline, text styling application, responsive scaling, Electron window management integration, display detection APIs, and projection state updates. The component now includes enhanced smooth line transition animations with configurable timing through the scrollDuration parameter, enabling animated line movements with precise control over transition duration.

## Project Structure
The ProjectionView component is part of a React-based desktop application built with Electron. The application architecture separates concerns across:
- Frontend React components for UI and presentation controls
- Zustand store for global state management
- Electron main process for window management and display detection
- Preload bridge exposing safe IPC APIs to the renderer
- Type definitions for projection state and styling

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
CSS --> PV
CSS --> PP
CSS --> PL
```

**Diagram sources**
- [main.ts:1-390](file://electron/main.ts#L1-L390)
- [preload.ts:1-43](file://electron/preload.ts#L1-L43)
- [App.tsx:1-102](file://src/App.tsx#L1-L102)
- [ProjectionView.tsx:1-138](file://src/components/ProjectionView.tsx#L1-L138)
- [PresentPanel.tsx:1-395](file://src/components/PresentPanel.tsx#L1-L395)
- [PreparationList.tsx:1-188](file://src/components/PreparationList.tsx#L1-L188)
- [appStore.ts:1-396](file://src/store/appStore.ts#L1-L396)
- [index.ts:1-90](file://src/types/index.ts#L1-L90)
- [index.css:1-100](file://src/index.css#L1-L100)

**Section sources**
- [main.ts:1-390](file://electron/main.ts#L1-L390)
- [preload.ts:1-43](file://electron/preload.ts#L1-L43)
- [App.tsx:1-102](file://src/App.tsx#L1-L102)
- [ProjectionView.tsx:1-138](file://src/components/ProjectionView.tsx#L1-L138)
- [PresentPanel.tsx:1-395](file://src/components/PresentPanel.tsx#L1-L395)
- [PreparationList.tsx:1-188](file://src/components/PreparationList.tsx#L1-L188)
- [appStore.ts:1-396](file://src/store/appStore.ts#L1-L396)
- [index.ts:1-90](file://src/types/index.ts#L1-L90)
- [index.css:1-100](file://src/index.css#L1-L100)

## Core Components
The ProjectionView component orchestrates fullscreen projection rendering with the following responsibilities:
- Real-time state synchronization via Electron IPC
- Fullscreen rendering using Tailwind CSS utilities
- Multi-mode projection rendering (live, blank, black, logo, clear)
- Dynamic background rendering (color, gradient, image)
- Text styling application with responsive margins
- Smooth vertical alignment and line offset transitions with configurable timing
- Copyright display for live mode

Key integration points:
- Electron preload bridge exposes updateProjection and onProjectionState callbacks
- Zustand store manages projection state and dispatches updates to the projection window
- Electron main process creates and manages the projection window on target displays
- Enhanced preparation list functionality allows cleaner transition experiences through blank mode
- Scroll duration parameter enables smooth line movement animations with configurable timing

**Updated** Enhanced with smooth line transition animations and scrollDuration parameter support for configurable timing

**Section sources**
- [ProjectionView.tsx:1-138](file://src/components/ProjectionView.tsx#L1-L138)
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)
- [main.ts:111-152](file://electron/main.ts#L111-L152)
- [preload.ts:3-21](file://electron/preload.ts#L3-L21)

## Architecture Overview
The projection system follows a unidirectional data flow with enhanced preparation list integration and smooth line transition animations:
1. Presentation controls in PresentPanel trigger state changes with duration parameters
2. Preparation list interactions utilize blank mode for cleaner transitions
3. Zustand store updates projectionState with scrollDuration and sends IPC updates
4. Electron main process forwards state to projection window
5. ProjectionView subscribes to state updates and renders with smooth animations

```mermaid
sequenceDiagram
participant Presenter as "Presenter"
participant PresentPanel as "PresentPanel"
participant PreparationList as "PreparationList"
participant Store as "Zustand Store"
participant Main as "Electron Main"
participant Preload as "Preload Bridge"
participant Projection as "ProjectionView"
Presenter->>PresentPanel : "Shift lines with duration"
PresentPanel->>Store : "shiftLines(offset, duration)"
Store->>Main : "updateProjection(state with scrollDuration)"
Main->>Preload : "send('update-projection', state)"
Preload->>Projection : "onProjectionState(callback)"
Projection->>Projection : "setState(newState)"
Projection->>Projection : "Render with CSS transition"
Note over PreparationList,Store : "Blank mode for cleaner transitions"
Note over Projection : "Smooth line movement animation<br/>with configurable timing"
```

**Diagram sources**
- [PresentPanel.tsx:333-361](file://src/components/PresentPanel.tsx#L333-L361)
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)
- [PreparationList.tsx:57-63](file://src/components/PreparationList.tsx#L57-L63)
- [main.ts:186-190](file://electron/main.ts#L186-L190)
- [preload.ts:10-16](file://electron/preload.ts#L10-L16)
- [ProjectionView.tsx:117-121](file://src/components/ProjectionView.tsx#L117-L121)

## Detailed Component Analysis

### ProjectionView Component
The ProjectionView component renders fullscreen projection output with enhanced smooth line transition animations:
- Fullscreen rendering using w-screen h-screen utilities
- Mode-based rendering (black, logo, live, blank, clear)
- Dynamic background rendering with overlay support
- Responsive text styling with line-height and margins
- Smooth transitions for line offset animations with configurable timing
- Copyright display for live mode

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
ProjectionView --> ProjectionState : "renders"
ProjectionState --> BackgroundSettings : "contains"
ProjectionState --> TextStyle : "contains"
```

**Diagram sources**
- [ProjectionView.tsx:4-20](file://src/components/ProjectionView.tsx#L4-L20)
- [index.ts:71-82](file://src/types/index.ts#L71-L82)
- [index.ts:21-27](file://src/types/index.ts#L21-L27)
- [index.ts:29-42](file://src/types/index.ts#L29-L42)

#### Rendering Modes
The component supports five projection modes:
- Black: Solid black background
- Logo: Dark background with centered "LyricDeck" watermark
- Live: Full projection with lyrics and background, including smooth line transition animations
- Blank: Transparent overlay with text styling (enhanced with cleaner transitions)
- Clear: Empty projection (used for transitions)

**Updated** Live mode now includes smooth line transition animations with configurable timing through scrollDuration parameter

```mermaid
flowchart TD
Start(["ProjectionView Render"]) --> CheckMode{"Mode"}
CheckMode --> |black| Black["Solid black background"]
CheckMode --> |logo| Logo["Black background with watermark"]
CheckMode --> |live| Live["Live projection with lyrics<br/>Enhanced: Smooth line transition animations"]
CheckMode --> |blank| Blank["Blank overlay with text styling<br/>Enhanced: Cleaner transition experience"]
CheckMode --> |clear| Clear["Empty projection"]
Live --> Background["Apply background settings"]
Live --> Text["Apply text styling and line offset<br/>Enhanced: CSS transition animation"]
Live --> Copyright["Show copyright if present"]
Background --> Overlay["Optional overlay color"]
Text --> Transition["Smooth line offset transition<br/>Configurable duration via scrollDuration"]
Blank --> Preparation["Preparation phase transitions<br/>Shows background only"]
```

**Diagram sources**
- [ProjectionView.tsx:77-138](file://src/components/ProjectionView.tsx#L77-L138)

#### Background Rendering Pipeline
The background rendering system supports three types:
- Color backgrounds with solid fills
- Gradient backgrounds with customizable gradients
- Image backgrounds with blur effects and positioning

```mermaid
flowchart TD
BGStart["Background Settings"] --> Type{"Background Type"}
Type --> |color| ColorBG["backgroundColor: value"]
Type --> |gradient| GradientBG["background: linear-gradient(...)"]
Type --> |image| ImageBG["backgroundImage with blur"]
ImageBG --> Position["backgroundPosition: center"]
ImageBG --> Size["backgroundSize: cover"]
ImageBG --> Blur["Optional blur filter"]
```

**Diagram sources**
- [ProjectionView.tsx:31-48](file://src/components/ProjectionView.tsx#L31-L48)
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
- [ProjectionView.tsx:50-63](file://src/components/ProjectionView.tsx#L50-L63)
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
- [ProjectionView.tsx:114-121](file://src/components/ProjectionView.tsx#L114-L121)

**Section sources**
- [ProjectionView.tsx:1-138](file://src/components/ProjectionView.tsx#L1-L138)
- [index.ts:69-82](file://src/types/index.ts#L69-L82)

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
- [PresentPanel.tsx:320-362](file://src/components/PresentPanel.tsx#L320-L362)
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

**Section sources**
- [main.ts:111-152](file://electron/main.ts#L111-L152)
- [main.ts:155-164](file://electron/main.ts#L155-L164)
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
- [ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)

**Section sources**
- [appStore.ts:241-306](file://src/store/appStore.ts#L241-L306)
- [main.ts:186-190](file://electron/main.ts#L186-L190)
- [preload.ts:10-16](file://electron/preload.ts#L10-L16)

## Dependency Analysis
The ProjectionView component has the following dependencies and relationships:

```mermaid
graph TB
PV["ProjectionView.tsx"] --> Types["types/index.ts"]
PV --> Store["store/appStore.ts"]
PV --> Electron["electron/main.ts"]
PV --> Preload["electron/preload.ts"]
PV --> CSS["index.css"]
Types --> PV
Store --> PV
Electron --> PV
Preload --> PV
PL["PreparationList.tsx"] --> Store
PP["PresentPanel.tsx"] --> Store
subgraph "External Dependencies"
React["React"]
Tailwind["Tailwind CSS"]
Zustand["Zustand"]
ElectronDep["Electron"]
end
PV --> React
PV --> Tailwind
Store --> Zustand
PV --> ElectronDep
PL --> React
PP --> React
```

**Diagram sources**
- [ProjectionView.tsx:1-3](file://src/components/ProjectionView.tsx#L1-L3)
- [index.ts:1-90](file://src/types/index.ts#L1-L90)
- [appStore.ts:1-3](file://src/store/appStore.ts#L1-L3)
- [main.ts:1-5](file://electron/main.ts#L1-L5)
- [preload.ts:1-3](file://electron/preload.ts#L1-L3)
- [index.css:1-3](file://src/index.css#L1-L3)
- [PreparationList.tsx:1-3](file://src/components/PreparationList.tsx#L1-L3)
- [PresentPanel.tsx:1-4](file://src/components/PresentPanel.tsx#L1-L4)

Key dependency characteristics:
- Low coupling with external libraries (React, Tailwind, Zustand)
- Strong separation between presentation logic and Electron integration
- Type-safe state management through TypeScript interfaces
- Minimal runtime dependencies for optimal performance
- Enhanced preparation list integration for improved workflow
- ScrollDuration parameter support for smooth animations

**Section sources**
- [ProjectionView.tsx:1-3](file://src/components/ProjectionView.tsx#L1-L3)
- [index.ts:1-90](file://src/types/index.ts#L1-L90)
- [appStore.ts:1-3](file://src/store/appStore.ts#L1-L3)
- [main.ts:1-5](file://electron/main.ts#L1-L5)
- [preload.ts:1-3](file://electron/preload.ts#L1-L3)

## Performance Considerations
Optimizing the ProjectionView component for smooth live presentation rendering with enhanced animations:

### Rendering Optimizations
- Use CSS transforms for line offset animations (hardware-accelerated)
- Leverage Tailwind utility classes for efficient styling
- Avoid unnecessary re-renders through proper state management
- Optimize blank mode rendering for cleaner transitions
- **New** Hardware-accelerated CSS transitions for smooth animations
- **New** Configurable animation timing reduces CPU overhead during rapid changes

### Memory Management
- Clean up IPC event listeners on component unmount
- Dispose of projection window resources properly
- Monitor memory usage during long presentations
- Efficient handling of preparation list state changes
- **New** Animation state cleanup prevents memory leaks

### Display Performance
- Use hardware-accelerated CSS properties (transform, filter)
- Optimize image backgrounds with appropriate sizing
- Consider GPU acceleration for complex effects
- Smooth transitions between blank and live modes
- **New** Optimized CSS transition calculations for minimal performance impact

### State Synchronization
- Debounce rapid state updates to prevent excessive re-renders
- Use selective state updates for projection-specific properties
- Cache computed style values when possible
- Optimize preparation list interaction performance
- **New** Efficient scrollDuration parameter handling for smooth animations

### Animation Performance
- **New** Linear timing function ensures consistent frame rates
- **New** Hardware-accelerated transforms minimize CPU usage
- **New** Configurable duration prevents overly slow animations
- **New** CSS transitions optimized for smooth 60fps performance

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
- **New** Check scrollDuration values for optimal performance
- **New** Monitor animation frame rates during testing

**Section sources**
- [main.ts:111-152](file://electron/main.ts#L111-L152)
- [preload.ts:10-16](file://electron/preload.ts#L10-L16)
- [ProjectionView.tsx:22-29](file://src/components/ProjectionView.tsx#L22-L29)
- [appStore.ts:353-370](file://src/store/appStore.ts#L353-L370)
- [appStore.ts:300-306](file://src/store/appStore.ts#L300-L306)

## Conclusion
The ProjectionView component provides a robust, performant solution for fullscreen lyric projection in live presentation environments. Its architecture emphasizes real-time state synchronization, multi-display support, and responsive rendering while maintaining clean separation between presentation logic and Electron integration. The component's design enables smooth operation during live events through careful optimization of rendering pipelines, efficient state management, and reliable IPC communication.

**Updated** The enhanced smooth line transition animations with scrollDuration parameter support significantly improve the presentation experience by enabling professional-grade animated line movements with precise timing control. Presenters can now create smooth, polished transitions between lyrics sections with configurable animation speeds, enhancing the overall quality of live presentations.

Key strengths include:
- Seamless integration with the presentation controls system
- Comprehensive multi-mode rendering support including enhanced blank mode
- Efficient background and text styling systems
- Reliable multi-display window management
- Performance-optimized rendering pipeline with smooth animations
- Enhanced preparation list integration for improved workflow
- **New** Configurable animation timing for professional presentation quality

The component serves as a critical foundation for live presentation workflows, enabling presenters to deliver professional-quality lyric projections with minimal technical overhead while enjoying improved preparation experiences through the blank mode functionality and smooth animation capabilities.

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

### Performance Optimization Checklist
- Use hardware-accelerated CSS properties
- Minimize DOM complexity in projection view
- Optimize background image loading
- Implement proper state update throttling
- Monitor resource usage during presentations
- Optimize preparation list interaction performance
- Ensure smooth blank mode transitions
- **New** Optimize animation performance with appropriate scrollDuration values
- **New** Monitor frame rates during animation testing
- **New** Test animation compatibility across different browsers and devices