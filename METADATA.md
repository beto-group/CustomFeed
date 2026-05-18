---
author: beto.group
version: 2.0.2
id: custom-feed-visualizer-888
name: CUSTOM FEED
description: A highly specialized media viewer that parses markdown files into a social-media-style interactive scrolling feed with platform-specific iframe auto-tuning.
status: stable
complexity: intermediate
category:
  - Media Players
  - Custom Views
compatibility:
  - Obsidian >=1.4.11
repository:
  - https://github.com/beto-group/CustomFeed
missing: []
resources:
  - data/PHYSICAL.enigmas..md
  - data/EXPERIENCES.enigmas..md
  - assets/custom_feed.webp
  - assets/customfeed.clip.gif
type: DatacoreComponent
target: Datacore
security:
  - Sandboxed
storage:
  - Frontmatter
network: Offline
runtime: PureJS
entry_point: CUSTOM FEED.md
logic: src/index.jsx
---

This file contains the machine-readable packaging manifest and indexing properties for this component.
