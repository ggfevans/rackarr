---
created: 2025-11-27T19:48
updated: 2025-11-28T23:27
---

# Rackarr — Future Version Specs

This directory holds specifications for versions beyond v0.1.

## Structure

```
versions/
├── README.md           # This file
├── v0.2-spec.md        # Multi-View & Polish
├── v0.3-spec.md        # Mobile & PWA
├── v0.3.1-spec.md      # (planned) Undo/Redo
├── v0.4-spec.md        # (planned) Accessibility
└── v1.0-spec.md        # (planned) Stable Release
```

## Process

1. **Don't create specs prematurely** — Only create when version work is imminent
2. **Use brainstorming prompt** from LLM Codegen Methodology to develop spec
3. **Generate prompt_plan.md** using planning prompt
4. **Generate todo.md** for the version

## Current Status

| Version | Spec Status      | Focus                                   |
| ------- | ---------------- | --------------------------------------- |
| v0.1    | ✅ Released      | MVP — In `/01-PROJECTS/rackarr/spec.md` |
| v0.2    | ✅ Spec Complete | Multi-View & Polish                     |
| v0.3    | ✅ Spec Complete | Mobile & PWA                            |
| v0.3.1  | ⬜ Not started   | Undo/Redo                               |
| v0.4    | ⬜ Not started   | Accessibility                           |
| v1.0    | ⬜ Not started   | Stable release                          |

---

_See `roadmap.md` for version scope and planning._
