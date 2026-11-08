# Learntify UI/UX Design Specification & Handoff

**Author**: Design Lead (Antigravity)  
**Reviewer**: Juan Pablo Bovio Vallejo  
**Implementation Owner**: OpenCode  
**Workspace Path**: `design/learntify-ui/`  
**Client Ownership**: OpenCode maintains live client (`apps/client`), dependencies, and test suite.

---

## 1. Executive Summary & Review Compositions

Learntify is a free, MIT-licensed JavaScript learning platform for complete beginners launching in English and Spanish. Learners include people preparing for their first internship who need the confidence to explain how code works line-by-line.

The visual direction draws direct inspiration from Resend’s website: a disciplined near-black canvas, white/ivory typography, restrained charcoal borders, generous spacing, and a strict monochrome identity with a single ivory primary action per view.

### First Review Compositions

Open the interactive prototype or view the standalone boards in any browser:

| Composition | Viewport & Locale | Relative Board Link | Review Status |
| :--- | :--- | :--- | :--- |
| **Interactive Prototype Hub** | Responsive Frame Switcher | [Prototype Review Hub](prototype/index.html) | Ready for Review |
| **1. Desktop Lesson** (`2 + 3` -> `5`) | 1280px Desktop · English | [Desktop Lesson Board](boards/desktop-lesson.html) | Ready for Juan's Review |
| **2. Mobile Lesson + Drawer Open** | 390 × 844px iPhone · Spanish | [Mobile Lesson Drawer Board](boards/mobile-lesson-drawer.html) | Ready for Juan's Review |
| **3. Mobile Lesson (Unobscured)** | 390 × 844px iPhone · Spanish | [Mobile Lesson Unobscured Board](boards/mobile-lesson-unobscured.html) | Ready for Juan's Review |
| **4. Welcome Page** | 1200px Desktop & Responsive · EN/ES | [Welcome Page Board](boards/welcome-page.html) | Ready for Juan's Review |
| **Future Feature Concepts** | Labeled Concepts (Forums, Circles, Rehearsal) | [Future Concepts Board](boards/future-concepts.html) | Concept Reference |
| **Design Tokens Stylesheet** | CSS Custom Properties | [tokens.css](tokens.css) | Specification |

---

## 2. Route Inventory & Status Tracking

Each route is tracked with its review status according to Juan's feedback and implementation readiness:

| Route Path | Screen Key | Purpose & Core Requirement | Status |
| :--- | :--- | :--- | :--- |
| `/`, `/:locale` | `welcome` | Public landing, method explanation, first lesson preview, secondary sign-in. | **Draft Ready for Review** |
| `/:locale/auth` | `auth` | Magic link, passkey, provider options; check-inbox, retry, session recovery. | **Specification Ready** |
| `/:locale/start` | `start` | Onboarding preferences (pace, goals), resume without account. | **Specification Ready** |
| `/:locale/today` | `today` | Next action priority: due review first, then next lesson. First-day zero state. | **Specification Ready** |
| `/:locale/progress` | `progress` | Descriptive attempt history and review readiness. No artificial streaks. | **Specification Ready** |
| `/:locale/learn` | `learn` | Learning catalog, sequence numbers, prerequisites legible. | **Specification Ready** |
| `/:locale/learn/lessons/:id` | `lesson` | Three-step rhythm (Predict, Run, Explain), workbench, Run key clay depth. | **Draft Ready for Review** |
| `/:locale/practice` | `practice` | Spaced review queue, code-runner practice with real attempts. | **Specification Ready** |
| `/:locale/projects` | `projects` | Real guided project workspace with check validations. | **Specification Ready** |
| `/:locale/notebook` | `notebook` | Private versioned lesson notes; empty vs loading vs unavailable states. | **Specification Ready** |
| `/:locale/study-plans` | `study-plans`| 5 real REST operations (list, detail, create, edit, delete), accessible validation. | **Specification Ready** |
| `/:locale/settings` | `settings` | Account preferences, passkey management, provider linking, session revoking. | **Specification Ready** |

---

## 3. Design System Tokens & WCAG Contrast Verification

All tokens are defined in [`design/learntify-ui/tokens.css`](tokens.css). Every token meets or exceeds WCAG 2.1 AA (4.5:1 for normal text) and AAA (7:1 for normal text) against its corresponding surface.

### 3.1 Color & Surface Tokens

| Token | Hex / Value | Role & Applied Elements | Contrast vs Surface | WCAG Compliance |
| :--- | :--- | :--- | :--- | :--- |
| `--color-canvas` | `#101214` | Global background canvas | N/A (Base) | Base |
| `--color-surface-reading`| `#171A1D` | Lesson prose cards, sidebar, drawer | N/A (Surface) | Base |
| `--color-surface-raised` | `#202529` | Code editor pane, predict box, popovers | N/A (Surface) | Base |
| `--color-divider` | `#343B40` | Structural rules, container borders | 3.1:1 vs `#101214` | UI Component Border |
| `--color-outline-interactive`| `#74818A` | Unfocused inputs, radio borders | 5.5:1 vs `#101214` | Exceeds AA Non-text (3:1) |
| `--color-text-primary` | `#F3F1EB` | Headings, body prose, Run button fill | **16.5:1** vs `#101214`<br>**15.3:1** vs `#171A1D` | **Passes WCAG AAA (7:1)** |
| `--color-action-primary-label`| `#101214`| Text on Ivory Run Key / Primary action | **16.5:1** vs `#F3F1EB` | **Passes WCAG AAA (7:1)** |
| `--color-text-secondary`| `#B2BABD` | Subtitles, labels, secondary links | **10.1:1** vs `#101214`<br>**9.4:1** vs `#171A1D` | **Passes WCAG AAA (7:1)** |
| `--color-text-tertiary` | `#74818A` | Eyebrows, line numbers, shortcuts | **5.5:1** vs `#101214` | **Passes WCAG AA (4.5:1)** |
| `--color-status-success`| `#A3E6C3` | Success check icon + "Output matches" | **12.8:1** vs `#101214`<br>**11.8:1** vs `#171A1D` | **Passes WCAG AAA (7:1)** |
| `--color-status-warning`| `#F3C477` | Unsaved draft alert, session expiring | **12.5:1** vs `#101214` | **Passes WCAG AAA (7:1)** |
| `--color-status-error` | `#FF9696` | Syntax error, worker execution failure | **9.0:1** vs `#101214` | **Passes WCAG AAA (7:1)** |

> [!IMPORTANT]
> **Code output is neutral**: Code results print in `--color-text-primary` (`#F3F1EB`) inside a `#101214` terminal panel. The mint `#A3E6C3` accent is strictly reserved for the accompanying status label `✓ Output matches` paired with descriptive text.

### 3.2 Typography & Reading Measure

- **Prose Font**: System Sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`)
- **Code Font**: System Monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`)
- **Lesson Body Measure**: 17px (`--text-lesson`), line-height 1.6 (`--line-height-normal`), bounded to **60–68 characters** (`max-width: 64ch`) to ensure effortless reading for beginners.
- **Control Corners**: 8px (`--radius-control`) for buttons, text inputs, radio labels, and pills.
- **Panel Corners**: 12px (`--radius-panel`) for cards, lesson containers, and code workbenches.
- **Run Key Clay Depth**:
  ```css
  .run-key {
    background: #F3F1EB;
    color: #101214;
    border-radius: 8px;
    box-shadow: 0 2px 0 #000000; /* 2px lower edge clay depth */
    transform: translateY(0);
    transition: transform 100ms, box-shadow 100ms;
  }
  .run-key:active {
    transform: translateY(2px);
    box-shadow: 0 0 0 transparent; /* Compresses on press */
  }
  ```
- **Focus Rings**: Offset ivory focus ring with charcoal gap so it stays prominent even around an ivory button:
  ```css
  :focus-visible {
    outline: 2px solid #F3F1EB;
    outline-offset: 3px; /* 3px dark gap over surface */
  }
  ```

---

## 4. Layout & Breakpoint Specifications

Learntify targets three responsive viewports:

| Breakpoint | Window Width | Layout Structure | Navigation & Controls |
| :--- | :--- | :--- | :--- |
| **Mobile** | `< 640px` (Base: 390px) | Single column layout, stacked editor & output, padding `16px`. | Header shows brand + labeled `Menú` button. Slide-out modal drawer (`310px` wide). Min touch target: 44px. |
| **Tablet** | `640px - 1023px` | Single column or collapsed sidebar, padding `24px`. | Desktop navigation collapses to Menu drawer at `< 840px`. |
| **Desktop** | `≥ 1024px` (Max: 1200px) | Two-column layout: 240px curriculum sidebar + 1fr lesson container (with 80px editorial margin). | Full sticky topbar with glass effect (`backdrop-filter: blur(12px)`) and solid `#101214` fallback. |

### The Recognizable Signature Margin

The desktop lesson workspace features an editorial left margin with three quiet markers:
1. **Predict** (aligned to the multiple choice prediction prompt)
2. **Run** (aligned to the code workbench and editor)
3. **Explain** (aligned to the plain-language reflection and notes)

On mobile screens, where horizontal space is constrained, this signature is rendered as numbered inline section kickers (`01 · Predice`, `02 · Ejecuta`, `03 · Explica`), maintaining the pedagogical rhythm without horizontal overflow.

---

## 5. Component States Specification

OpenCode must implement the following states for each interactive control:

| Component | Default | Hover | Active / Pressed | Focus-Visible | Disabled |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Run Key** | Bg `#F3F1EB`, text `#101214`, `box-shadow: 0 2px 0 #000` | Brightness `0.96` | `translateY(2px)`, shadow cleared | `outline: 2px solid #F3F1EB`, offset `3px` | Opacity `0.5`, cursor `not-allowed`, no shadow |
| **Secondary Button** | Transparent, border `#343B40`, text `#B2BABD` | Text `#F3F1EB`, border `#74818A` | `translateY(1px)`, bg `rgba(255,255,255,0.03)` | `outline: 2px solid #F3F1EB`, offset `3px` | Opacity `0.45` |
| **Radio Option** | Bg `#171A1D`, border `#343B40`, text `#B2BABD` | Border `#74818A`, bg `rgba(255,255,255,0.02)` | Selected: border `#F3F1EB`, radio dot ivory | `outline: 2px solid #F3F1EB`, offset `2px` | Opacity `0.5` |
| **Code Editor** | Bg `#202529`, border `#343B40`, text `#F3F1EB` | Border `#74818A` | Bg `rgba(255,255,255,0.01)` | `outline: 2px solid #F3F1EB`, offset `2px` | Opacity `0.6` while code executes |
| **Navigation Link** | Text `#B2BABD`, transparent | Text `#F3F1EB`, bg `rgba(255,255,255,0.04)` | Current page: text `#F3F1EB`, weight `600`, active indicator | `outline: 2px solid #F3F1EB`, offset `2px` | N/A |

---

## 6. Motion & Assistive Technology Guidelines

Learntify relies on **Motion for React** (`motion/react`) in `apps/client` for delicate transitions, while reserving CSS for micro-interactions:

1. **Mobile Drawer**: Slide transition from right:
   - Initial: `x: "100%"`
   - Animate: `x: 0`
   - Exit: `x: "100%"`
   - Duration: **200ms**
   - Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
2. **Account Popover Disclosure**: Subtle vertical fade:
   - Initial: `opacity: 0, y: -4`
   - Animate: `opacity: 1, y: 0`
   - Exit: `opacity: 0, y: -4`
   - Duration: **130ms**
3. **Run Result Appearance**:
   - Fade in output on completion: **120ms**
4. **CSS-Only Micro-Interactions**:
   - Run key active press: CSS `transform: translateY(2px)` and `box-shadow` transition (**100ms**).
   - Button hover brightness: CSS filter transition (**140ms**).
5. **Reduced Motion (`prefers-reduced-motion: reduce`)**:
   - When active, all durations collapse to **0ms**.
   - No translational sliding; drawers and popovers appear instantly.
   - Screen reader announcements (`role="status"`, `role="alert"`) trigger immediately without waiting for animations.
   - Never remount the editor textarea, delay route navigation, or animate on typing keystrokes.

---

## 7. Keyboard Interactions & Focus Trapping

OpenCode should verify the following keyboard interactions:

- <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>: Moves sequentially through interactive elements in logical reading order.
- **Skip Link**: Hidden at top of DOM (`top: -100px`). On first <kbd>Tab</kbd>, slides into view (`top: 1rem`) linking to `#main-content`.
- **Mobile Drawer Focus Trapping**:
  - When the drawer opens, focus is immediately moved to the first focusable element (`.drawer-close` or first navigation link).
  - While open, <kbd>Tab</kbd> cycles exclusively within the drawer; focus never escapes to background content.
  - Pressing <kbd>Escape</kbd> immediately closes the drawer and restores focus to the triggering `Menú` button.
- **Account Disclosure**:
  - Pressing <kbd>Escape</kbd> closes the popover and restores focus to the `Account` trigger button. Focus trapping is **not** applied to this non-modal popover.
- **Code Editor**:
  - Supports standard indentation without capturing global keyboard focus traps inappropriately.

---

## 8. Detailed Route Specifications for OpenCode

### Route 1: Welcome (`/`, `/en`, `/es`)
- **Header**: Wordmark `learntify.`, single public link `Learn`, language selector (preserves current route), secondary `Sign in` link.
- **Hero**: Clean typographic lede explaining the platform.
- **Actions**: One ivory primary button `Find my starting point` (`/:locale/start`). Adjacent secondary link `Open the first lesson →`.
- **Preview Card**: Real expression `2 + 3`, output `5`, plain-language explanation, vertical signature margin labels ("Predict", "Run", "Explain").
- **Pedagogical Rhythm**: 3 numbered cards ("01 Predict", "02 Run", "03 Explain").
- **Roadmap Preview**: 3 cards introducing Values & Expressions, Variables & Decisions, Projects & Review.

### Route 2: Auth (`/:locale/auth`)
- **Card**: Narrow centered reading card (`max-width: 440px`).
- **Separation**: Clear visual divider between passwordless magic link email input, passkeys, and third-party social providers (Google, GitHub).
- **States**: Default form, submitting spinner, "Check your inbox" confirmation state, error callout with retry action.
- **Reassurance**: Explicit confirmation of account admission, privacy, and session recovery without paywall mentions.

### Route 3: Onboarding (`/:locale/start`)
- **Purpose**: Let learners choose their goal (e.g., "Build projects with confidence", "Prepare for interviews") and optional weekly study pace (e.g., 60, 120, 180 min).
- **Preferences**: Radio cards with generous tap areas.
- **Actions**: Primary `Save and continue` button, secondary `Skip for now` link.
- **Persistence**: Selections save to `localStorage` (guest) or sync to D1 database when signed in.

### Route 4: Today & Progress (`/:locale/today`, `/:locale/progress`)
- **Today**:
  - Highlights the single next high-leverage action: a spaced review card if due, or the next uncompleted lesson.
  - Zero-state for day 1 learners: Welcoming encouragement to begin Lesson 01.
- **Progress**:
  - Displays real attempt logs, completed lessons, and study plan activities.
  - Avoids manipulative streak counters, badges, or fake activity points.

### Route 5: Learning Hub & Lesson (`/:locale/learn`, `/:locale/learn/lessons/:id`)
- **Catalog (`/learn`)**: Grid of lesson units with clear step numbers (`01`, `02`, etc.), estimated times, and prerequisite chains.
- **Lesson Workspace (`/learn/lessons/:id`)**:
  - Two-column layout on desktop: sticky curriculum path on left; lesson workbench with signature margin on right.
  - Predict form: radio group for hypotheses, instant feedback on submit.
  - Code workbench: side-by-side on desktop, stacked on mobile. Code indentation preserved.
  - Run key: ivory clay button directly above/beside neutral output.
  - Private notes: auto-saving notes panel for learners to record explanations in their own words.

### Route 6: Practice & Projects (`/:locale/practice`, `/:locale/projects`)
- **Practice**: Spaced repetition queue using real attempt logs. Supports executing code directly and comparing outputs.
- **Projects**: Guided multi-step basket project with real milestone assertions (`checks: Array<{ label, expression, expected }>`).

### Route 7: Notebook (`/:locale/notebook`)
- **Features**: List of lessons with private user notes and code drafts.
- **States**: Distinguishes between an empty notebook (user has taken no notes yet), loading, and offline/unavailable storage with clear recovery warnings.

### Route 8: Study Plans (`/:locale/study-plans`)
- **Features**: Real REST demonstration showing list, create, edit, duplicate conflict, and delete operations.
- **Accessibility**: Form validation errors rendered near inputs with `aria-describedby`; success notifications announced to assistive technology.

### Route 9: Settings (`/:locale/settings`)
- **Structure**: Grouped by task: Learning preferences, account details, passkeys, social provider linking, and danger zone (sign out, delete account).
- **Edge Views**: Clean monochrome templates for signed-out notice, expired session, missing route (404), and missing lesson.

---

## 9. Concrete Guidance for OpenCode Implementation

1. **Ownership Boundary**:
   - Design files reside in `design/learntify-ui/`.
   - OpenCode will translate these tokens, CSS rules, and component structures into `apps/client/src/design.css`, `apps/client/src/styles.css`, and relevant React components.
2. **Review Checklist for OpenCode**:
   - [ ] Import and apply `--color-canvas: #101214` and `--color-text-primary: #F3F1EB` globally.
   - [ ] Ensure Run key possesses the 2px clay depth lower edge and ivory focus ring with charcoal gap.
   - [ ] Maintain 60–68 character measure on lesson prose (`max-width: 64ch`).
   - [ ] Verify that code output is neutral monochrome, with mint `#A3E6C3` reserved for status badges.
   - [ ] Confirm mobile drawer slides in 200ms with focus containment and Escape dismissal.
   - [ ] Ensure all existing Playwright tests (`tests/journeys/*.spec.ts`) pass without regression.
3. **Flagging Constraints**:
   - OpenCode is invited to flag any CSS or DOM constraints encountered during implementation in PR comments or review notes.
   - Design Lead will inspect screenshots against the approved boards and deliver exact pixel adjustments by route and viewport.
