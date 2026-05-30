# Product Requirement Document

**Project:** 3D Web Card Game — "Zinky Zoogle"-Inspired Mobile Card Game  
**Status:** Ready  
**Version:** 1.0  
**Date:** 2025-05-30  
**Author:** Product Owner  

---

## 1. Executive Summary / Idea Summary

This product is a **mobile-first, browser-based 3D card game** inspired by the "Zinky Zoogle" mode from *Bogos Binted*. It is a turn-based survival card game for up to 4 players, where the last player alive wins. The MVP features one human player versus three AI-controlled bots.

Players are dealt 3 cards in hand and start with 5 lives. On each turn, a player must play a card equal to or greater than the current middle-pile value (or any card if the pile is empty). Failing to play a valid card costs 1 life. When a player's lives reach 0, they are eliminated and become a spectator. The game is rendered in lightweight 3D using React Three Fiber, with all visual assets generated procedurally via code — no external paid assets are required.

The game opens to a minimal landing screen with only a title and a fullscreen button. Upon entering fullscreen, the full 3D card game scene is revealed.

---

## 2. Background

Browser-based casual card games have seen growing popularity on mobile devices. Players increasingly prefer instant-play experiences that require no downloads or installations. The "Zinky Zoogle" game mode from *Bogos Binted* demonstrated that simple card mechanics with survival stakes create engaging, replayable experiences.

This project combines those proven mechanics with modern web 3D rendering to deliver an immersive, visually appealing card game that runs entirely in a mobile browser.

---

## 3. Problem Statement

- **For casual mobile gamers:** Many browser-based card games feel flat and uninspired due to 2D-only interfaces. There is a gap for lightweight 3D card games that feel immersive without requiring app downloads.
- **For solo players:** Finding a quick, turn-based card game to play against AI opponents in a mobile browser — without signups, downloads, or complex onboarding — is difficult.
- **For developers:** Building a 3D web card game with procedural assets (no asset pipeline dependencies) remains technically underserved in the open-source space.

---

## 4. Goals

| ID | Goal | Measure of Success |
|----|------|--------------------|
| G-001 | Deliver a fully playable single-player vs. 3 AI bots card game in a mobile browser | Complete game loop from start to win/loss |
| G-002 | Provide an immersive 3D visual experience using procedural assets | All 3D assets rendered in-browser without external asset files |
| G-003 | Achieve smooth performance on mid-range mobile devices | ≥30 FPS on devices with 2GB RAM and modern mobile browser |
| G-004 | Deliver a zero-friction entry experience (title screen → fullscreen → game) | No signups, downloads, or loading screens beyond the title card |
| G-005 | Implement clear, intuitive touch-based card interaction | Players can identify valid/invalid cards and play cards with a single tap |

---

## 5. Non-Goals

| ID | Non-Goal |
|----|----------|
| NG-001 | Multiplayer networking / real-time online play |
| NG-002 | User accounts, authentication, or persistent profiles |
| NG-003 | Server-side game logic (all logic runs client-side for MVP) |
| NG-004 | In-app purchases, ads, or monetization |
| NG-005 | Native mobile app (iOS/Android) distribution |
| NG-006 | Advanced AI strategies beyond the specified bot logic |
| NG-007 | Sound/music (deferred to future iteration) |
| NG-008 | Deck customization or collectible card systems |

---

## 6. Target Users

### Primary User: Casual Mobile Gamer
- **Age:** 13–35
- **Behavior:** Plays games in short sessions (5–15 minutes) on their phone browser
- **Motivation:** Wants quick, engaging gameplay with no downloads or signups
- **Tech literacy:** Moderate — comfortable with mobile browsers and fullscreen modes

### Secondary User: Web Game Enthusiast
- **Age:** 16–40
- **Behavior:** Explores browser-based indie games, appreciates 3D web experiences
- **Motivation:** Interested in novel web technology showcases (3D in browser)

### User Personas

| Persona | Description |
|---------|-------------|
| **Rina (17)** | Plays games during commute. Opens link, hits fullscreen, plays a round. No patience for tutorials. |
| **Dani (25)** | Web developer who appreciates clean 3D rendering. Plays a few rounds during breaks. |
| **Ayu (14)** | Casual gamer who loves card games with friends but plays solo on her phone when bored. |

---

## 7. User Journey

### Journey 1: First-Time Player

```
1. User opens the game URL on their mobile browser
2. Sees a clean title screen with the game name and a fullscreen button
3. Taps the fullscreen button → browser enters fullscreen mode
4. The 3D card game scene loads:
   - A 3D table/arena is visible
   - 4 player positions around the table (1 human, 3 bots)
   - The human player sees 3 face-up cards in their hand
   - Bot cards are face-down
   - Each player slot shows 5 life tokens
   - The middle pile area is empty
5. Human player is prompted: "Your turn! Play a card."
6. Since the middle pile is empty, all cards in hand are valid (highlighted as interactive)
7. Player taps a card → card animates to the middle pile
8. Player draws a replacement card from the deck
9. Turn passes to the next bot
10. Bots play automatically — cards animate from their hand to the pile
11. Game continues with the human making choices and observing bot plays
12. Player eventually runs out of lives → sees elimination animation → becomes spectator
13. OR player is the last alive → sees victory screen with option to play again
```

### Journey 2: Returning Player (Subsequent Games)

```
1. User opens URL → taps fullscreen → game starts immediately (or shows "New Game" button)
2. Plays multiple rounds, becoming familiar with special card effects
3. Exits by leaving fullscreen or closing the tab
```

---

## 8. User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-001 | As a **player**, I want to see a title screen with a fullscreen button so that I can enter an immersive game experience with one tap | Must |
| US-002 | As a **player**, I want to see my 3 cards face-up in 3D so that I can read their values and make strategic decisions | Must |
| US-003 | As a **player**, I want invalid cards to be visually disabled so that I know which cards I can legally play | Must |
| US-004 | As a **player**, I want to tap a card to play it so that interaction feels natural on mobile | Must |
| US-005 | As a **player**, I want to see the middle pile update in 3D after each play so that I understand the current game state | Must |
| US-006 | As a **player**, I want to see my life tokens decrease when I cannot play so that I understand the survival stakes | Must |
| US-007 | As a **player**, I want to see an elimination animation when I lose all lives so that the game over feels dramatic | Must |
| US-008 | As a **player**, I want to continue watching the game as a spectator after elimination so that I can see how the round ends | Must |
| US-009 | As a **player**, I want to see a victory screen when I am the last one alive so that I feel rewarded | Must |
| US-010 | As a **player**, I want to start a new game after winning or losing so that I can replay immediately | Must |
| US-011 | As a **player**, I want bots to play cards automatically with visible animations so that I can follow the game flow | Must |
| US-012 | As a **player**, I want to see special card effects (explosion for Bomb, nuke for Nuclear, etc.) so that special plays feel impactful | Should |
| US-013 | As a **player**, I want a "Play Again" button after each game ends so that I can quickly restart | Must |
| US-014 | As a **player**, I want turn direction changes (Reverse) to be visually indicated so that I understand the game state | Should |
| US-015 | As a **player**, I want to see whose turn it is at all times so that I know when to act | Must |

---

## 9. Functional Requirements

### Title Screen

| ID | Requirement |
|----|-------------|
| FR-001 | The game shall display a title screen as the initial view with the game title and a fullscreen button |
| FR-002 | The fullscreen button shall request fullscreen mode from the browser when tapped |
| FR-003 | Upon entering fullscreen, the 3D game scene shall load and replace the title screen |
| FR-004 | If the browser does not support fullscreen, the game shall still proceed to the game scene when the button is tapped |

### Game Setup

| ID | Requirement |
|----|-------------|
| FR-010 | The game shall initialize 4 players: Player 1 as human, Players 2–4 as bots |
| FR-011 | Each player shall start with 5 lives and 3 cards dealt from the deck |
| FR-012 | The deck shall contain 39 number cards (values 1–13, 3 copies each) plus special cards (Reverse, Skip, Bomb, Nuclear, Random) |
| FR-013 | The deck shall be shuffled randomly at the start of each game |
| FR-014 | Player 1 (human) shall always take the first turn |
| FR-015 | Turn direction shall default to clockwise |

### Card Deck

| ID | Requirement |
|----|-------------|
| FR-020 | Number cards shall have values 1 through 13, with 3 copies of each value (39 cards total) |
| FR-021 | The deck shall include the following special cards: Reverse, Skip, Bomb, Nuclear (Nuklir), and Random |
| FR-022 | Special card quantities shall be: Reverse ×3, Skip ×3, Bomb ×3, Nuclear ×2, Random ×3 (14 special cards, 53 total in deck) |
| FR-023 | When the deck is depleted and a player must draw, the draw is skipped (player continues with fewer than 3 cards) |

### Turn Logic

| ID | Requirement |
|----|-------------|
| FR-030 | At the start of each turn, the system shall check if the current player is alive (lives > 0) |
| FR-031 | At the start of each turn, the system shall check if the current player has a valid playable card |
| FR-032 | If the middle pile is empty (no cards or reset), the player may play any number card or any special card |
| FR-033 | If the middle pile has a value, the player may play a number card with value ≥ the current middle value, or any special card |
| FR-034 | If the player has a valid card, they shall play it, and then draw 1 card from the deck to return to 3 cards (if deck has cards) |
| FR-035 | If the player has no valid card, they lose 1 life, do not draw a card, and the turn passes to the next active player |
| FR-036 | Cards that cannot be legally played shall be visually disabled (grayed out / locked) for the human player |
| FR-037 | The turn shall advance to the next active (non-eliminated) player in the current direction |

### Special Card Effects

| ID | Requirement |
|----|-------------|
| FR-040 | **Reverse:** Shall reverse the turn direction (clockwise ↔ counter-clockwise). Eliminated players remain skipped |
| FR-041 | **Skip:** Shall skip the next active player in the current turn direction |
| FR-042 | **Bomb:** Shall reset the middle pile value to empty/null (pile appears empty, any card can be played next) |
| FR-043 | **Nuclear (Nuklir):** Shall clear all cards from the middle pile entirely, resetting the value to empty/null |
| FR-044 | **Random:** Shall generate a random number between 1 and 13. This value becomes the new middle pile value |
| FR-045 | Special cards may be played regardless of the current middle pile value (they are always valid) |

### Elimination & Win Condition

| ID | Requirement |
|----|-------------|
| FR-050 | When a player's lives reach 0, they shall be marked as eliminated |
| FR-051 | Eliminated players shall transition to spectator status and be skipped in turn order |
| FR-052 | The game shall continue until exactly 1 active player remains |
| FR-053 | The last remaining alive player shall be declared the winner |
| FR-054 | A victory/defeat screen shall be displayed at the end of the game with a "Play Again" option |

### Bot AI

| ID | Requirement |
|----|-------------|
| FR-060 | Bots shall play automatically without human input |
| FR-061 | If the bot has valid number cards, it shall play the smallest valid number card |
| FR-062 | If the bot has no valid number cards but has special cards, it shall play a special card |
| FR-063 | If the middle pile is empty, the bot shall play its smallest card (number or special) |
| FR-064 | If the bot has no valid card to play, it shall lose 1 life and the turn passes |
| FR-065 | Bot plays shall have a brief visible delay (≈1–2 seconds) so the human can follow the game flow |
| FR-066 | Bot cards shall be displayed face-down to the human player |

### 3D Scene & Visuals

| ID | Requirement |
|----|-------------|
| FR-070 | The game shall render a 3D table/arena as the main play surface |
| FR-071 | Four player positions shall be arranged around the table (bottom = human, others = bots) |
| FR-072 | The human player's cards shall be rendered as 3D face-up card objects, interactive via touch |
| FR-073 | Bot cards shall be rendered as 3D face-down card objects |
| FR-074 | The middle pile area shall display played cards stacked in 3D |
| FR-075 | Life tokens shall be rendered visually for each player (e.g., 3D hearts or icons) |
| FR-076 | Card play animations shall move the card from hand to middle pile with smooth 3D transitions |
| FR-077 | Special cards shall trigger VFX particles (explosion for Bomb, radiation for Nuclear, shuffle for Random, arrow for Reverse, dash for Skip) |
| FR-078 | All 3D assets shall be procedurally generated via code (no external image/3D model files) |
| FR-079 | The camera shall be positioned to give the human player a clear view of their hand and the middle pile |

### UI Overlay

| ID | Requirement |
|----|-------------|
| FR-080 | A turn indicator overlay shall display whose turn it is and any instructions (e.g., "Your turn! Play a card") |
| FR-081 | A "Play Again" button shall appear on the game-over screen |
| FR-082 | Player names and life counts shall be visible as 2D overlays above each player position |
| FR-083 | A deck counter shall show remaining cards in the draw pile |
| FR-084 | When the human player is eliminated, a "You are now spectating" message shall appear |

### Game Flow Control

| ID | Requirement |
|----|-------------|
| FR-090 | The game shall support a "New Game" / "Play Again" action that resets all state and restarts |
| FR-091 | The game shall handle edge cases: empty deck draws, multiple special card chains, simultaneous eliminations |
| FR-092 | If all remaining alive players have no valid cards simultaneously, the game shall resolve by awarding the win to the player with the most lives (tie-breaker: lowest player index) |

---

## 10. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | **Performance:** The game shall maintain ≥30 FPS on mid-range mobile devices (e.g., Snapdragon 665, 2GB RAM) | ≥30 FPS |
| NFR-002 | **Load Time:** The initial page load to interactive title screen shall complete in ≤5 seconds on 4G mobile network | ≤5s |
| NFR-003 | **Responsiveness:** Touch interactions (card tap → animation start) shall respond within ≤200ms | ≤200ms |
| NFR-004 | **Compatibility:** The game shall run on the latest 2 versions of Chrome, Safari, Firefox, and Samsung Internet on mobile | Supported |
| NFR-005 | **Resolution:** The game shall adapt to mobile screen widths from 320px to 428px (iPhone SE to iPhone 15 Pro Max) | 320–428px |
| NFR-006 | **Orientation:** The game shall be optimized for portrait orientation. Landscape is acceptable but not required | Portrait |
| NFR-007 | **Memory:** The game shall not exceed 150MB of total memory usage to run smoothly on constrained devices | ≤150MB |
| NFR-008 | **Accessibility:** Card values shall be readable in the 3D scene. Valid/invalid states shall be distinguishable by color + visual state (not color alone) | WCAG-like |
| NFR-009 | **Code Quality:** The project shall use TypeScript, ESLint, and a clear folder structure | Enforced |
| NFR-010 | **Asset Strategy:** All visual assets shall be generated procedurally via code — no external paid or licensed asset files | Code-only |
| NFR-011 | **State Management:** Game state shall be managed via Zustand with a clear, serializable state shape | Zustand |
| NFR-012 | **Modularity:** Game logic shall be separated from rendering logic to enable future testing and AI improvements | Separated |

---

## 11. Data Requirements

### Core Game State

| Field | Type | Description |
|-------|------|-------------|
| `players` | `Player[]` | Array of all 4 players |
| `currentPlayerIndex` | `number` | Index of the player whose turn it is |
| `direction` | `1 \| -1` | Turn direction: 1 = clockwise, -1 = counter-clockwise |
| `deck` | `Card[]` | Remaining cards in the draw pile |
| `middlePile` | `Card[]` | Cards that have been played to the center |
| `lastValue` | `number \| null` | Current middle pile value (null if reset via Bomb/Nuclear, empty pile) |
| `gameStatus` | `'waiting' \| 'playing' \| 'finished'` | Overall game phase |
| `isFullscreen` | `boolean` | Whether the game is in fullscreen mode |
| `winner` | `Player \| null` | The winning player (null until game ends) |

### Player State

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique player identifier (1–4) |
| `name` | `string` | Display name (e.g., "You", "Bot 2", "Bot 3", "Bot 4") |
| `type` | `'human' \| 'bot'` | Player type |
| `hand` | `Card[]` | Cards currently in hand (max 3) |
| `lives` | `number` | Remaining lives (0–5) |
| `status` | `'alive' \| 'eliminated' \| 'spectator'` | Current player status |

### Card State

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique card identifier |
| `type` | `'number' \| 'special'` | Card category |
| `value` | `number \| null` | Numeric value for number cards (1–13), null for special |
| `effect` | `'reverse' \| 'skip' \| 'bomb' \| 'nuclear' \| 'random' \| null` | Special card effect type |

### Special Card Reference Data

| Card | Effect | Description |
|------|--------|-------------|
| Reverse | `reverse` | Reverses turn direction |
| Skip | `skip` | Skips next active player |
| Bomb | `bomb` | Resets middle value to null |
| Nuclear (Nuklir) | `nuclear` | Clears all middle pile cards, resets to null |
| Random | `random` | Generates random 1–13, sets as new middle value |

---

## 12. Integration Requirements

| ID | Requirement |
|----|-------------|
| IR-001 | **React + Vite:** The project shall use React with Vite as the build tool |
| IR-002 | **React Three Fiber (@react-three/fiber):** Used for declarative 3D scene rendering within React |
| IR-003 | **Drei (@react-three/drei):** Used for 3D helper components (e.g., `OrbitControls`, `Text`, `Html`, `RoundedBox`) |
| IR-004 | **Zustand:** Used for global game state management |
| IR-005 | **Tailwind CSS:** Used for UI overlay styling (menus, HUD, buttons) |
| IR-006 | **TypeScript:** The project shall be written in TypeScript for type safety |
| IR-007 | **No backend required:** The entire game runs client-side; no server integration needed for MVP |
| IR-008 | **Browser Fullscreen API:** The game shall use the standard Fullscreen API for immersive mode |
| IR-009 | **Touch Events:** Card interactions shall use touch events (with pointer event fallback) for mobile input |

---

## 13. Acceptance Criteria

| ID | Criterion | Related FR |
|----|-----------|------------|
| AC-001 | Given I open the game URL, I see a title screen with a game title and a fullscreen button | FR-001, FR-002 |
| AC-002 | Given I tap the fullscreen button, the browser enters fullscreen and the 3D game scene loads | FR-002, FR-003 |
| AC-003 | Given the game starts, I see 4 players at a 3D table, I (human) have 3 face-up cards, bots have 3 face-down cards, and each player shows 5 life tokens | FR-010, FR-011, FR-070, FR-072, FR-073, FR-075 |
| AC-004 | Given it is my turn and the middle pile is empty, all my cards are valid and interactive (not disabled) | FR-032, FR-036 |
| AC-005 | Given it is my turn and the middle pile has value 8, cards with value < 8 are visually disabled and cards with value ≥ 8 are interactive | FR-033, FR-036 |
| AC-006 | Given I tap a valid card, the card animates from my hand to the middle pile, and I draw a new card (if deck has cards) | FR-034, FR-076 |
| AC-007 | Given I have no valid cards, the turn indicator shows I lose 1 life, my life tokens decrease by 1, and the turn passes | FR-035 |
| AC-008 | Given I play a Reverse card, the turn direction indicator changes and subsequent turns flow in the opposite direction | FR-040, FR-077 |
| AC-009 | Given I play a Skip card, the next active player is skipped and the turn goes to the player after them | FR-041 |
| AC-010 | Given I play a Bomb card, the middle pile value resets to null and a bomb VFX plays | FR-042, FR-077 |
| AC-011 | Given I play a Nuclear card, all cards are cleared from the middle pile and the value resets to null with a nuclear VFX | FR-043, FR-077 |
| AC-012 | Given I play a Random card, a random number 1–13 is generated and displayed as the new middle value with a random VFX | FR-044, FR-077 |
| AC-013 | Given my lives reach 0, I am eliminated, see an elimination animation, and become a spectator | FR-050, FR-051, FR-077 |
| AC-014 | Given I am a spectator, I can watch the remaining bots play until the game ends | FR-051, FR-008 |
| AC-015 | Given only 1 player remains alive, a victory/defeat screen appears with a "Play Again" button | FR-053, FR-054 |
| AC-016 | Given I tap "Play Again," the game resets all state and starts a new round | FR-090 |
| AC-017 | Given it is a bot's turn, the bot plays a card automatically after a 1–2 second delay with visible animation | FR-060, FR-065 |
| AC-018 | Given a bot has valid number cards, it plays the smallest valid number card | FR-061 |
| AC-019 | Given a bot has no valid number cards but has special cards, it plays a special card | FR-062 |
| AC-020 | Given the deck is empty and a player must draw, the draw is skipped and the player continues with fewer cards | FR-023 |
| AC-021 | Given the game runs on a mid-range mobile device, FPS stays at or above 30 during gameplay | NFR-001 |
| AC-022 | Given the game is in portrait mode, all UI elements are visible and touch targets are adequately sized (≥44×44px) | NFR-005, NFR-008 |
| AC-023 | Given the deck is depleted and all alive players cannot play, the player with the most lives wins (tie-breaker: lowest index) | FR-092 |

---

## 14. Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| R-001 | **Mobile browser 3D performance:** Low-end devices may struggle with React Three Fiber rendering | High | Medium | Optimize scene complexity: limit polygon count, use LOD, cap draw calls, test on low-end devices early |
| R-002 | **Fullscreen API inconsistency:** Different mobile browsers handle fullscreen differently (especially iOS Safari) | Medium | High | Implement fallback behavior: allow the game to proceed without true fullscreen; use CSS-based fullscreen mode |
| R-003 | **Touch event handling conflicts:** 3D canvas touch events may conflict with browser gestures (scroll, zoom) | Medium | Medium | Prevent default browser gestures on the canvas; use `touch-action: none`; test across browsers |
| R-004 | **Procedural 3D asset quality:** Code-generated cards and table may not look polished enough | Medium | Medium | Iterate on visual design; use Drei helpers (RoundedBox, Text) for clean geometry; add subtle lighting and shadows |
| R-005 | **State complexity with special cards:** Chaining special card effects (e.g., Skip + Reverse in sequence) may introduce bugs | Medium | Medium | Build a robust turn resolution engine with unit tests; handle edge cases explicitly in state transitions |
| R-006 | **Deck depletion edge cases:** When the deck runs out and players have no valid cards, the game could stall | Low | Medium | Implement FR-092 tie-breaker rule; ensure the game always reaches a terminal state |
| R-007 | **iOS Safari WebGL limitations:** Some iOS versions have stricter WebGL memory/feature limits | Medium | Medium | Test on real iOS devices; keep texture sizes small; use procedural materials over textures |
| R-008 | **Scope creep during development:** Feature requests for multiplayer, sound, leaderboards could delay MVP | High | High | Enforce strict MVP scope via this PRD; defer all enhancements to post-MVP (Section 16) |

---

## 15. Assumptions

| ID | Assumption |
|----|------------|
| A-001 | **Assumption:** The special card quantities are: Reverse ×3, Skip ×3, Bomb ×3, Nuclear ×2, Random ×3 (14 special cards + 39 number cards = 53 total). *Rationale: Based on balanced gameplay estimation; not specified in original brief.* |
| A-002 | **Assumption:** The game has no sound or music in the MVP. *Rationale: Procedural audio was not mentioned; sound can be added in a future iteration.* |
| A-003 | **Assumption:** Portrait orientation is the primary target. *Rationale: Mobile users predominantly hold phones in portrait; "mobile-first" implies portrait-first.* |
| A-004 | **Assumption:** Bot cards are face-down (hidden from the human player). *Rationale: Standard card game convention; no indication bots should reveal their hands.* |
| A-005 | **Assumption:** The game is entirely client-side with no backend. *Rationale: MVP scope has no multiplayer or persistent data; no need for a server.* |
| A-006 | **Assumption:** The human player does not see bot card values. Bot "thinking" time is simulated with a delay for UX. *Rationale: Mimics real card game feel; prevents instant bot plays that are hard to follow.* |
| A-007 | **Assumption:** Special cards are always playable regardless of the middle pile value. *Rationale: This matches the stated rule "Use special cards to your advantage" and standard card game design.* |
| A-008 | **Assumption:** When a Random card is played, the visual display shows the rolled number. *Rationale: Players need to see the new middle value to make informed decisions.* |
| A-009 | **Assumption:** The turn direction indicator is displayed in the UI overlay (not just inferred). *Rationale: Players need to understand game flow visually, especially after Reverse plays.* |
| A-010 | **Assumption:** "Spectator" status after elimination is functionally identical to "eliminated" but allows the player to watch the game continue. *Rationale: Keeps the eliminated player engaged.* |
| A-011 | **Assumption:** No tutorial or onboarding flow is required for MVP. The game rules are self-evident through UI cues (disabled cards, turn prompts). *Rationale: Keeping scope minimal; tutorial can be added later.* |
| A-012 | **Assumption:** The card deck is drawn from the top (random already since shuffled), not from a specific end. |

---

## 16. Out of Scope (MVP)

| Item | Reason for Deferral |
|------|---------------------|
| Online multiplayer (real-time or async) | Requires server infrastructure; not needed for MVP |
| Local multiplayer (pass-and-play or split-screen) | Adds UI complexity; AI bots cover multiplayer feel |
| User accounts and authentication | No server; no persistent data needed |
| Leaderboards or stats tracking | Requires backend; post-MVP feature |
| Sound effects and background music | Procedural audio is an additional workstream |
| Card animations beyond basic play/draw (e.g., card flips for bots) | Polish feature; defer to post-MVP |
| Difficulty settings for bot AI | MVP bots use a single simple strategy |
| Deck customization or card selection | Beyond MVP scope; collectible/card-building is a future feature |
| Tutorial or onboarding flow | Keep MVP lean; rely on UI cues for learnability |
| Landscape orientation optimization | Portrait-first for MVP |
| Offline/PWA support (service workers) | Post-MVP enhancement |
| Accessibility features (screen reader support, high-contrast mode) | Post-MVP; basic color+state indicators are implemented |
| Analytics or telemetry | Not required for MVP |

---

## 17. Future Enhancements (Post-MVP)

| Enhancement | Description |
|-------------|-------------|
| Online multiplayer | WebSocket-based real-time multiplayer for 2–4 human players |
| Ranked matchmaking | ELO-based matchmaking for competitive play |
| Sound & music | Procedurally generated ambient music and card play sound effects |
| Additional special cards | New card types (Steal, Swap, Shield, Double) for deeper strategy |
| Deck builder | Allow players to customize their deck before a match |
| AI difficulty levels | Easy, Medium, Hard bot AI with different strategies |
| Achievements & stats | Track games played, win rate, special cards played, etc. |
| PWA offline support | Service worker for offline play capability |
| Animations polish | Bot card flips, elimination cutscenes, victory celebrations |
| Tutorial mode | Interactive tutorial that teaches game rules step by step |
| Spectator mode for online games | Watch other players' games in real-time |
| Cosmetic card skins | Unlockable visual themes for cards and table |

---

## 18. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Game Completion Rate** | ≥80% of started games reach a win/loss state | Track games where `gameStatus === 'finished'` |
| **Replay Rate** | ≥40% of players start a second game | Track "Play Again" button taps |
| **Average Session Duration** | 5–15 minutes per session | Time from game start to game end (or tab close) |
| **FPS Performance** | ≥30 FPS on mid-range devices | Measured via performance profiling during development |
| **Load Time** | ≤5 seconds to interactive title screen | Measured via Lighthouse and real-device testing |
| **Touch Responsiveness** | ≤200ms from tap to animation start | Measured via custom performance markers |
| **Bug-free Game Loops** | 0 game-breaking bugs in 100 consecutive automated play-throughs | Automated testing of game logic (state machine) |

---

## 19. UX Flow Diagram

```
┌─────────────────┐
│   Open Game URL  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│   Title Screen       │
│  [Game Title]        │
│  [Fullscreen Button] │
└────────┬────────────┘
         │ Tap Fullscreen
         ▼
┌─────────────────────┐
│  Enter Fullscreen    │
│  Load 3D Scene       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Game Setup         │
│  - Shuffle deck      │
│  - Deal 3 cards each │
│  - Set 5 lives each  │
│  - Player 1 starts   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────┐
│         TURN LOOP               │
│                                 │
│  ┌──────────────────────┐       │
│  │ Current Player Alive? │       │
│  │ No → Skip, next player│       │
│  │ Yes ↓                │       │
│  └──────────┬───────────┘       │
│             │                   │
│  ┌──────────▼───────────┐       │
│  │ Has valid card?       │       │
│  │ No → Lose 1 life     │       │
│  │      Check alive?     │       │
│  │      No → Eliminate   │       │
│  │      Next player      │       │
│  │ Yes ↓                │       │
│  └──────────┬───────────┘       │
│             │                   │
│  ┌──────────▼───────────┐       │
│  │ Play Card             │       │
│  │ Apply Effect          │       │
│  │ Draw 1 Card (if deck) │       │
│  │ Check win condition   │       │
│  └──────────┬───────────┘       │
│             │                   │
│  ┌──────────▼───────────┐       │
│  │ Only 1 player alive? │       │
│  │ No → Next player ──→ loop    │
│  │ Yes ↓                │       │
│  └──────────┬───────────┘       │
│             │                   │
└─────────────┼───────────────────┘
              │
              ▼
┌─────────────────────────┐
│   Game Over Screen       │
│  [Winner Announced]      │
│  [Play Again Button]     │
└──────────┬──────────────┘
           │ Tap Play Again
           ▼
    (Restart from Game Setup)
```

---

## Ready Checklist

- [x] **Problem is clear** — Casual mobile gamers lack immersive, no-download 3D card games in the browser
- [x] **Goals are clear** — 5 measurable goals covering playability, visuals, performance, zero-friction, and UX
- [x] **Requirements have IDs** — All functional (FR-xxx) and non-functional (NFR-xxx) requirements are identified
- [x] **Acceptance criteria are testable** — 23 acceptance criteria with Given-When-Then style, linked to requirements
- [x] **Scope is controlled** — Out-of-scope items explicitly listed; MVP is single-player vs. bots only
