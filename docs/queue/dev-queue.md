# Development Queue — Zinky Zoogle 3D Card Game

**Created:** 2025-05-30  
**Scrum Master:** SM Agent  
**Total Stories:** 21  
**Total Story Points:** 97  
**Current Sprint:** Wave 1 (Foundation)  
**Status:** Active — Ready for Development

---

## Queue Summary

| Wave | Focus | Stories | Points | Status |
|------|-------|---------|--------|--------|
| Wave 1 | Foundation | STORY-001, 002, 003, 004 | 13 | **Current Sprint** |
| Wave 2 | Engine Completion & State | STORY-005, 006, 007, 008, 009 | 19 | Queued |
| Wave 3 | 3D Scene & Entry | STORY-010, 011, 012 | 18 | Queued |
| Wave 4 | Animation & Loop | STORY-013, 014, 015, 016 | 23 | Queued |
| Wave 5 | Assembly & VFX | STORY-017, 018, 019 | 11 | Queued |
| Wave 6 | Performance & Testing | STORY-020, 021 | 13 | Queued |
| **Total** | | **21 stories** | **97 pts** | |

---

## Wave 1 — Foundation (Current Sprint)

> **Goal:** Project scaffolding, type system, and core engine primitives.  
> **Exit Criteria:** All engine primitives pass unit tests; project builds cleanly.

| # | Story ID | Title | Complexity | Points | Dependencies | Status |
|---|----------|-------|------------|--------|--------------|--------|
| 1 | STORY-001 | Project Scaffolding & Configuration | Low | 3 | None | **Done** |
| 2 | STORY-002 | Data Model & Type Definitions | Low | 2 | STORY-001 | **Done** ✅ |
| 3 | STORY-003 | Game Engine: Deck Manager & Utility Functions | Medium | 5 | STORY-001, STORY-002 | **Done** ✅ |
| 4 | STORY-004 | Game Engine: Turn Manager & Player Operations | Medium | 3 | STORY-001, STORY-002 | **Done** ✅ |

**Wave 1 Implementation Order:** 001 → 002 → 003 → 004  
**Wave 1 Total:** 13 story points  
**Key Deliverable:** Fully scaffolded TypeScript project with all deps installed, types defined, deck/card/turn engine modules passing unit tests.

---

## Wave 2 — Engine Completion & State Entry

> **Goal:** Complete all pure game logic modules and build the Zustand state management layer.  
> **Exit Criteria:** Full game engine is testable; Zustand store can initialize, play, and reset games programmatically.

| # | Story ID | Title | Complexity | Points | Dependencies | Status |
|---|----------|-------|------------|--------|--------------|--------|
| 5 | STORY-005 | Game Engine: Special Card Effects | Medium | 3 | STORY-001, 002, 003 | **Queued** |
| 6 | STORY-006 | Game Engine: Bot AI Decision Tree | Low-Med | 3 | STORY-001, 002, 003 | **Queued** |
| 7 | STORY-007 | Game Engine: Win Condition & Deadlock Resolution | Low | 2 | STORY-001, 002, 003 | **Queued** |
| 8 | STORY-008 | Game Engine: Full Orchestration (initGame, resetGame) | Medium | 3 | STORY-001, 002, 003, 004 | **Queued** |
| 9 | STORY-009 | Zustand Store Implementation (3 slices + selectors) | High | 8 | STORY-001 through 008 | **Queued** |

**Wave 2 Implementation Order:** 005 → 006 → 007 → 008 → 009  
(Stories 005, 006, 007 can be parallelized since they all depend only on 003. Story 008 needs 004. Story 009 must come last as it depends on ALL engine modules.)  
**Wave 2 Total:** 19 story points  
**Key Deliverable:** Complete, testable game engine with Zustand store; full game can be simulated programmatically.

---

## Wave 3 — 3D Scene & Entry

> **Goal:** Title screen entry point, 3D Canvas foundation, and interactive card rendering.  
> **Exit Criteria:** User can open the game, see the title screen, enter fullscreen, and see a 3D table with interactive cards.

| # | Story ID | Title | Complexity | Points | Dependencies | Status |
|---|----------|-------|------------|--------|--------------|--------|
| 10 | STORY-010 | Title Screen & Fullscreen Entry | Medium | 5 | STORY-001, 008, 009 | **Queued** |
| 11 | STORY-011 | 3D Scene Foundation (Canvas, Camera, Lighting, Table) | Medium-High | 5 | STORY-001, 009, 010 | **Queued** |
| 12 | STORY-012 | 3D Card Model, Player Hand Rendering & Card Interaction | High | 8 | STORY-002, 003, 009, 011 | **Queued** |

**Wave 3 Implementation Order:** 010 → 011 → 012  
(Sequential: title screen first so App.tsx has structure, then 3D scene, then cards within the scene.)  
**Wave 3 Total:** 18 story points  
**Key Deliverable:** Visual game entry — title screen → fullscreen → 3D table with face-up cards for human, face-down for bots, tap-to-play interaction.

---

## Wave 4 — Animation & Loop

> **Goal:** Card animations, life tokens, middle pile visuals, game loop orchestration, and HUD overlays.  
> **Exit Criteria:** Full turn loop works end-to-end: human plays → animation → bot plays → animation → life loss → elimination → win detection.

| # | Story ID | Title | Complexity | Points | Dependencies | Status |
|---|----------|-------|------------|--------|--------------|--------|
| 13 | STORY-013 | Life Tokens & Middle Pile 3D Rendering | Medium | 5 | STORY-009, 011, 012 | **Queued** |
| 14 | STORY-014 | Card Play Animation & Draw Animation | Medium-High | 5 | STORY-009, 012, 013 | **Queued** |
| 15 | STORY-015 | Bot Turn Hook & Game Loop Orchestration | High | 8 | STORY-004, 005, 006, 007, 008, 009, 012, 014 | **Queued** |
| 16 | STORY-016 | HUD Overlay (Turn, Player Info, Deck, Direction, Pile Value) | Medium | 5 | STORY-009, 010, 011, 015 | **Queued** |

**Wave 4 Implementation Order:** 013 → 014 → 015 → 016  
(Life tokens/pile first for positions, then animations use those positions, then game loop drives everything, then HUD overlays display the loop's messages.)  
**Wave 4 Total:** 23 story points  
**Key Deliverable:** Playable game loop — users can tap cards, see animations, bots play automatically, turn flow works, and HUD shows game information.

---

## Wave 5 — Assembly & VFX

> **Goal:** Full scene assembly, special card visual effects, and game over screen.  
> **Exit Criteria:** Complete game visually cohesive; all special cards trigger VFX; game ends with victory/defeat screen and Play Again works.

| # | Story ID | Title | Complexity | Points | Dependencies | Status |
|---|----------|-------|------------|--------|--------------|--------|
| 17 | STORY-017 | Full Game Scene Assembly | Medium | 3 | STORY-011, 012, 013, 014 | **Queued** |
| 18 | STORY-018 | Special Card Visual Effects (VFX) | Medium-High | 5 | STORY-009, 014, 017 | **Queued** |
| 19 | STORY-019 | Game Over Screen & Play Again | Medium | 3 | STORY-009, 015, 016 | **Queued** |

**Wave 5 Implementation Order:** 017 → 018 → 019  
(Assemble scene first, then add VFX into it, then game over screen which is independent of VFX but needs game loop.)  
**Wave 5 Total:** 11 story points  
**Key Deliverable:** Visually complete game with VFX for all special cards, elimination animation, and replayable game flow.

---

## Wave 6 — Performance & Testing

> **Goal:** Mobile optimization, cross-browser polish, and comprehensive integration testing.  
> **Exit Criteria:** Game meets all NFRs (30 FPS, ≤5s load, ≤200ms touch, ≤150MB memory); 100 automated game simulations pass without errors; ≥80% code coverage on engine + store.

| # | Story ID | Title | Complexity | Points | Dependencies | Status |
|---|----------|-------|------------|--------|--------------|--------|
| 20 | STORY-020 | Mobile Optimization, Performance Tuning & iOS Fallback | Medium-High | 5 | STORY-010, 017, 018, 019 + all prior | **Queued** |
| 21 | STORY-021 | Integration Testing & End-to-End Game Validation | High | 8 | ALL previous stories (001-020) | **Queued** |

**Wave 6 Implementation Order:** 020 → 021  
(Optimize first so performance tests run against the final codebase, then validate everything.)  
**Wave 6 Total:** 13 story points  
**Key Deliverable:** Production-ready MVP passing all acceptance criteria and NFRs.

---

## Dependency Graph (Visual)

```
WAVE 1                    WAVE 2                    WAVE 3
┌──────────┐             ┌──────────┐             ┌──────────┐
│ STORY-001│─────────────┤          │             │          │
│ Scaffold │             │          │             │          │
└────┬─────┘             │          │             │          │
     │                   │          │             │          │
┌────▼─────┐             │          │             │          │
│ STORY-002│─────────────┤          │             │          │
│ Types    │             │          │             │          │
└────┬──┬──┘             │          │             │          │
     │  │                │          │             │          │
┌────▼──▼──┐  ┌─────────┐│          │             │          │
│ STORY-003│  │STORY-004 ││          │             │          │
│ Deck     │  │Turn Mgr  ││          │             │          │
└────┬─────┘  └────┬────┘│          │             │          │
     │             │     │          │             │          │
WAVE 2             │     │          │             │          │
┌────▼────┐ ┌─────▼────┐│          │             │          │
│STORY-005│ │STORY-008 ││          │             │          │
│Specials │ │Orchestr. ││          │             │          │
└─────────┘ └────┬─────┘│          │             │          │
┌─────────┐      │     │          │             │          │
│STORY-006│      │     │          │             │          │
│Bot AI   │      │     │          │             │          │
└─────────┘      │     │          │             │          │
┌─────────┐      │     │          │             │          │
│STORY-007│      │     │          │             │          │
│Win Cond │      │     │          │             │          │
└────┬────┘      │     │          │             │          │
     │           │     │          │             │          │
┌────▼───────────▼─────▼──────────▼┐            │          │
│         STORY-009                │            │          │
│         Zustand Store            │            │          │
└──────────────┬───────────────────┘            │          │
               │                                │          │
WAVE 3         │                                │          │
┌──────────────▼──┐                             │          │
│    STORY-010    │                             │          │
│    Title Screen │                             │          │
└──────────────┬──┘                             │          │
               │                                │          │
┌──────────────▼──┐                             │          │
│    STORY-011    │                             │          │
│    3D Scene     │                             │          │
└──────────────┬──┘                             │          │
               │                                │          │
┌──────────────▼──┐                             │          │
│    STORY-012    │                             │          │
│    Card Model   │─────────────────────────────┘          │
└─────────────────┘                                        │
                                                           │
WAVE 4                                                     │
┌──────────────────────────────────────────────────────────┘
│    STORY-013 → STORY-014 → STORY-015 → STORY-016
│    LifeTokens    Animations   GameLoop     HUD
│
WAVE 5
│    STORY-017 → STORY-018 → STORY-019
│    Assembly      VFX         GameOver
│
WAVE 6
│    STORY-020 → STORY-021
│    Performance   Testing
└──────────────────────────────────────────────────────────┘
```

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **Queued** | Ready for development, not yet started |
| **In Progress** | Developer is actively working on this story |
| **In Review** | Developer complete, Scrum Master reviewing |
| **In QA** | Passed Scrum Master review, QA testing |
| **Done** | QA passed, story merged and closed |
| **Blocked** | Cannot proceed (dependency or blocker) |

---

*Last updated: 2026-05-30 — STORY-004 closed, Wave 1 COMPLETE*
