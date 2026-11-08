# OpenCode | Learntify UI/UX implementation prompt

You own implementation and verification in the existing TypeScript React/Vite client. Antigravity owns design assets in `design/learntify-ui/`. Start now by mapping routes to components, data sources, translations and existing tests. Capture a baseline of the local working flows while Antigravity prepares the designs.

## Receive the handoff

Read `design/learntify-ui/HANDOFF.md` when available. Use its revision, approval status and linked boards to implement the approved screens. If it is missing or still draft, finish the inventory and identify gaps for Antigravity. Keep design decisions in the handoff and production code in the client. Return screenshots labeled with route, locale, viewport and handoff revision so Antigravity can review the result.

## Product and audience

Learntify is a free, MIT-licensed JavaScript learning platform for complete beginners, launching in English and Spanish. It connects explanations, practice, projects, and review. Our learners include people preparing for a first internship who need confidence explaining how code works. Use plain, encouraging language. Avoid competition, paywalls, premium tiers, punishment for missing a day, and invented activity or success statistics.

## Visual direction

Use Resend’s website as a reference for its near-black canvas, white typography, restrained borders, and generous spacing. Give Learntify a monochrome identity. Use charcoal surfaces, ivory text and a single ivory primary action per task. Show hierarchy through spacing, type weight and contrast. Keep navigation, links and progress indicators neutral.

Use these starting tokens. Canvas #101214, reading surface #171A1D, raised surface #202529, decorative divider #343B40, interactive outline #74818A. Primary text and primary button fill #F3F1EB. Use #101214 for the button label and #B2BABD for secondary text. Use an offset ivory focus ring with a charcoal gap so it stays visible around the ivory Run key. Keep code output neutral. Reserve mint #A3E6C3 for a small success check with a text label, amber #F3C477 for warnings and coral #FF9696 for errors. Verify contrast against each actual surface, including translucent navigation.

Use the system sans for prose and system monospace for code. Start lesson copy at 17px with 1.6 line height and a 60–68 character measure. Use a 4px spacing scale, 8px control corners and 12px panels. Use clay depth on the Run key: a 2px lower edge that compresses on press. Allow glass on the sticky navigation only, with an opaque fallback. Keep lesson prose and code on opaque surfaces. Avoid gradients, floating ornaments, animated counters, pill-shaped labels everywhere, or stock dashboard card grids.

Give Learntify a recognizable signature: a lesson margin with three small labels, “Predict”, “Run”, “Explain”. For the first design review, show a real introductory expression such as `2 + 3`, its output `5`, and an explanation in plain language. Use this as an editorial treatment where the existing content supports it, without inventing a new graded interaction.

## Menus and motion

Public header: wordmark, Learn, language selector, Sign in. Desktop workspace: Today, Learn, Practice in the main group; Projects, Notebook, Study plans and Progress in a second group. Place Settings and Sign out in the account disclosure. On narrow screens use a labeled Menu button and one drawer containing the same destinations. Indicate the current route with text weight and a marker. Preserve the current page when switching language. Use real links, a visible focus ring, Escape to dismiss, focus restoration, and focus containment only in modal drawers. Keep global navigation secondary to reading and running code.

Use free Motion for React (Framer Motion) for the mobile drawer (180–220ms), account disclosure (120–150ms fade) and the first appearance of a completed run result (120ms fade). OpenCode installs `motion` only in the client workspace and imports from `motion/react`. Use CSS for hover and the Run key press. Honor reduced motion globally and remove movement and delays in those flows. Results and errors must be available immediately to assistive technology. Never remount the editor, delay navigation or animate on every keystroke. No Three.js for this redesign.

## Screen inventory and tasks

Read apps/client/src/shared/routes.ts, the app entry points, feature modules, docs/DESIGN_INTEGRATION.md and existing browser tests before editing. Inspect ai-studio-desing as earlier design exploration. The working app is the source of truth. Cover each of these routes in both locales:

1. Welcome (/, /en, /es). Show what a beginner will learn, offer a clear first lesson, and keep sign-in secondary to exploring public lessons.
2. Auth (/auth under each locale). Visually separate email link, passkey, and available provider options. Cover submitting, check-your-inbox, retry and error states. Preserve account admission and session recovery.
3. Onboarding (/start). Make preferences easy to choose and resume. Explain what changes when learners save their choices.
4. Today and Progress (/today, /progress). Give the next action a clear place. Distinguish completed work from upcoming work. Design the first-day state with no history.
5. Learning hub and lesson (/learn, /learn/lessons/:id). Make prerequisites and sequence legible. Design the lesson workspace around reading, editing, running and reviewing output. Keep notes, attempt history, draft sync status and project guidance available without crowding the editor. On mobile preserve code indentation and provide an obvious path from Run to its result.
6. Practice and Projects (/practice, /projects). Show what each activity teaches and where to start. Use real review and project data only. Preserve existing navigation and downloads.
7. Notebook (/notebook). Support finding and reopening saved work. Distinguish an empty notebook from a loading or unavailable one.
8. Study plans (/study-plans). Preserve list, detail, create, edit, delete, duplicate conflict feedback and the API activity demo. Keep the five real REST operations demonstrable in class. Make validation visible near the form and communicate success to screen readers.
9. Settings (/settings). Group preferences, account details, sign-in methods, provider linking and passkeys by task. Preserve pending, connected, canceled and failed states. Include signed-out, expired-session, missing-route and missing-lesson views.

For future moderated forums, study-circle chat and interview rehearsal, deliver labeled design concepts separately. Show how a learner could ask a question from a lesson or practice explaining a solution in an interview. Keep those concepts out of live navigation until backed by implemented features and moderation coverage.

## Implementation and acceptance

Work in the existing TypeScript React/Vite client. Preserve route URLs, API contracts, authentication, storage semantics, runner isolation, translations, and meaningful tests. Leave cloud settings and credentials alone. Reuse shared components for navigation, actions, forms, status and feedback. Define reusable color, spacing, type, radius and elevation tokens. Prefer a small number of purposeful layouts over a parallel component library. Keep the lesson editor’s code and output legible independently of global typography.

Implement one complete vertical slice (welcome → lesson → run → result) before rolling out to all routes. Check phone, tablet and desktop sizes, keyboard-only use, visible focus, reduced motion, contrast, Spanish text expansion and long code. For async screens verify loading, empty, success and recoverable error states where supported. Use the repo’s local test profiles and simulated providers for verification. Run the relevant type, build, unit and Playwright checks. Fix regressions without weakening assertions. Do not deploy.

Deliver the implemented client, a route-by-route coverage checklist, representative English and Spanish screenshots at phone and desktop sizes, commands and test outcomes, and a short list of any states that could not be verified. Clearly distinguish screenshots of working screens from roadmap mockups.
