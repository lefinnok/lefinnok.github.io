# 3D Model System

**Document Type**: Specification
**Status**: Complete
**Date**: 2026-02-26
**Related Spec**: [[architecture/site-architecture|Site Architecture]]
**Audience**: Developers
**Tags**: #three-js #3d #rendering

---

## Overview

The 3D Model System renders interactive wireframe FBX models for each project. Models auto-spin, respond to hover by returning to their initial orientation, and on project detail pages, follow the mouse cursor. The system is built on Three.js and manages its own lifecycle — including scene setup, animation loops, and full cleanup on navigation.

---

## Model Behavior States

```mermaid
stateDiagram-v2
    [*] --> Spinning: Model loaded

    Spinning --> HoverHold: Mouse enters (card or viewer)
    HoverHold --> Spinning: Mouse leaves

    Spinning --> MouseFollow: Mouse enters (detail page viewer)
    MouseFollow --> Spinning: Mouse leaves

    HoverHold --> HoverHold: Lerp to initial rotation
    MouseFollow --> MouseFollow: Lerp toward cursor

    note right of Spinning
        Continuous Y rotation
        Speed: 0.003–0.005 rad/frame
        Angle wraps at ±PI
    end note

    note right of HoverHold
        Eases to -90deg (initial)
        Holds until mouse leaves
    end note

    note right of MouseFollow
        Y tracks horizontal cursor
        X tracks vertical cursor
        Range: ±45deg Y, ±22.5deg X
    end note
```

---

## Model Configuration

Each project defines a model configuration that controls camera positioning and scale.

| Field | Type | Description |
|-------|------|-------------|
| **path** | string | URL to FBX file in `/public/models/` |
| **cameraZ** | number | Camera distance from model on Z axis |
| **cameraY** | number | Camera vertical offset |
| **scale** | number (optional) | Override default scale of 0.1 |

### Per-Project Configurations

| Project | FBX File | Camera Z | Camera Y |
|---------|----------|----------|----------|
| UML Diagram Generator | uml_generator.fbx | 60 | 0 |
| [NASS] Ocelli | Ocelli.fbx | 60 | -6 |
| 8-bit Transistor Computer | Transistor.fbx | 80 | -30 |
| Gesture Recognition | Gesture.fbx | 10 | 0 |
| [LD42] Space Saver | SpaceDef.fbx | 26 | 0 |
| Retro Handheld | Handheld.fbx | 100 | -10 |

---

## Rendering Pipeline

```mermaid
sequenceDiagram
    participant C as Component Mount
    participant S as Three.js Scene
    participant L as FBXLoader
    participant A as Animation Loop
    participant D as Component Unmount

    C->>S: Create Scene, Camera, Renderer
    C->>S: Add ambient + directional light
    C->>L: Load FBX file
    L->>S: Add model (wireframe, white, scale 0.1)
    C->>A: Start requestAnimationFrame loop

    loop Every Frame
        A->>A: Check visibility (IntersectionObserver)
        A->>A: Determine state (spin / hover / follow)
        A->>A: Apply rotation + render
    end

    D->>A: Cancel animation frame
    D->>S: Dispose geometry, materials, renderer
    D->>S: Remove canvas from DOM
```

---

## Interaction Modes

### Auto-Spin (Default)

- Model rotates on Y axis at configurable speed
- Initial rotation is **-90 degrees** (`-PI/2`) so the model's "front" faces the viewer
- Spin angle wraps at `±PI` to prevent floating point accumulation over long sessions

### Hover Hold (Cards + Home)

- Triggered by `hovered` prop from parent card **or** direct mouseenter on the viewer
- Model lerps back to initial rotation (`-PI/2`) at a rate of 0.08 per frame
- Uses shortest-path normalization to avoid spinning the long way around
- On mouse leave, spin resumes smoothly from the current angle

### Mouse Follow (Detail Pages)

- Enabled via `followMouse` prop
- Mouse position normalized to `-1..1` relative to viewer container center
- Y rotation: `INITIAL_ROTATION + mouseX * 45deg`
- X rotation: `-mouseY * 22.5deg`
- Both axes lerped at 0.08 per frame for smooth tracking
- On mouse leave, model eases back to initial rotation then resumes spinning

---

## Performance Considerations

| Concern | Mitigation |
|---------|------------|
| **Bundle size** (~550KB) | Three.js split into own chunk via Vite `manualChunks` |
| **Off-screen rendering** | IntersectionObserver pauses animation when model is not visible |
| **Memory leaks** | Full cleanup on unmount: geometry, materials, renderer disposed; canvas removed |
| **Pixel density** | `devicePixelRatio` capped at 2 to avoid excessive GPU load on HiDPI |
| **Resize handling** | ResizeObserver on container (not window) for responsive layout changes |
