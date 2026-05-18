# 🛠️ Contributing to Custom Feed

Welcome! This document outlines the core developer standards, iframe tuning mechanisms, and compilation guidelines required to maintain the advanced implementation of the Custom Feed visualizer.

---

## 🏛️ Core Architecture Pillars

1.  **Platform Guidelines Mapping (`IframesGuidelines`)**:
    *   Iframe cropping, scaling, and alignment offsets are configured inside `getIframesGuidelines` to normalize third-party embeds (e.g. YouTube, Instagram, X) into consistent frames.
    *   Always extend these guidelines with clean, tested scale factors (`iframeScale`) and offset coordinate markers (`iframeLeft`, `iframeTop`).
2.  **Precise Text Segment Editing (`editFileSegment`)**:
    *   Inline text block adjustments are executed by target segment matching rather than overwriting full document contents.
    *   This guarantees vault file safety and maintains perfect multi-pane edit synchronization.
3.  **Safe View-Content Portal Mounting**:
    *   Edge-to-edge layout immersion is executed by reparenting the container directly into Obsidian's native `.view-content` leaf, preserving native tab headers.
    *   A target global CSS stylesheet is dynamically injected on mount and cleaned up on unmount to suppress Obsidian status bars (`.status-bar`) and footers.
4.  **Touch/Swipe Capture Engine**:
    *   Fluid vertical transitions are captured using direct touch capture listeners (`touchstart`, `touchmove`, `touchend`) to guarantee a natural scrolling feel on mobile and tablet form factors.

---

## 🚀 Local Compilation & Developer Loop

*   **Logic Entry Point**: All component visualizer logic resides in `src/index.jsx`.
*   **Tuning Offsets**: You can adjust container and iframe parameters in real-time by toggling the layout tuning sliders (press the slider button). Manual alignments can be hard-coded into `getIframesGuidelines` inside `src/index.jsx` to make them permanent.
*   **Hot Reload Trigger**: Press the reload button inside the Obsidian UI or invoke `dc.app.workspace.activeLeaf.rebuildView()` to flush the view cache. The visualizer compiles your changes instantly without a full application restart.
