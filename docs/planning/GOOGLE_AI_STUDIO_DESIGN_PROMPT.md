# Copy everything below into Google AI Studio

You are the product designer and frontend prototyper for Learntify. Create a complete, coherent UI/UX system and an interactive React prototype covering every screen below. This is a learning web application, not a marketing-page exercise. Produce usable screens and source code, not only a mood board or prose recommendations. Another engineer will integrate your work into our existing application.

## Product and audience

Learntify is an MIT-licensed, open-source JavaScript learning platform by Juan Pablo Bovio Vallejo. It teaches complete beginners from syntax and reasoning through data structures, algorithms, projects and interview preparation. English and Spanish launch together. Account/community access is initially for adults 18+. Lessons remain accessible to guests.

Everything is free: all lessons, exercises, projects, community access and interview preparation. Donations may support operations but never unlock features. No pricing tiers, subscription UI, credit balances, premium locks, upsells or payment-required actions. Do not invent a paid AI tutor. The project starts with one maintainer and a strictly zero-dollar infrastructure budget; prefer ordinary web UI over expensive or complicated technology.

The product helps learners understand, apply, explain and revisit ideas. A correct output alone does not prove mastery. We want confidence and collaboration, not competitive rankings, speed pressure or an addictive streak system. The solo learning path must work without a partner or community response.

## Current implementation versus future design

The existing app is a functional alpha: TypeScript, React and Vite client, separate modular Cloudflare Worker API, D1 database, Better Auth, Resend email, Google/GitHub integration and passkeys. We have real accounts, onboarding, Today, bilingual lessons, a bounded isolated code runner, prediction feedback, automatic account code/notes drafts with conflict recovery, explicitly saved attempts, basic practice counts/review reminders, and the latest 20 attempts with restoration. Public deployment is not complete. The intended learntify.lat domain is not purchased yet.

Core current routes are /en and /es, /{locale}/auth, /{locale}/start, /{locale}/today, /{locale}/learn/lessons/:lessonId and /{locale}/settings. Additional routes below are design targets, not claims that their backend exists. The repository is https://github.com/lilbovio/Learntify, but this prompt must be sufficient without repository access. Do not replace the architecture with Next.js, Firebase, Supabase or a new backend.

Design the complete product, including future screens. In the prototype, provide a separate developer-facing screen/state gallery that exposes all designs and labels fixtures and future features. In the ordinary learner experience, hide unreleased areas through one simple feature configuration. Community posting/chat stays disabled until moderators are available. No dead or misleading navigation in the core release. Do not show implementation labels throughout the actual learner interface.

## Visual direction: quiet clay, selective glass

The app should feel like a carefully designed learning studio: warm, tactile, mature and calm. Use claymorphism selectively for buttons, small concept markers, navigation accents and meaningful learning objects. Use restrained glassmorphism for a floating toolbar, lightweight navigation or an overlay when transparency helps establish hierarchy. Long lessons, code, forms and discussions must use opaque, readable surfaces.

Start with warm ivory backgrounds, charcoal text, terracotta primary actions and muted sage secondary accents. Define semantic CSS tokens rather than scattering hex values. Maintain contrast; refine this palette where necessary. Use moderate corner radii, soft inset highlights and shallow shadows. Avoid huge puffy cards everywhere, excessive blur, plastic toy interfaces or muddy low-contrast neumorphism. Glass always needs a solid fallback.

Explicitly avoid generic AI-generated website styling: purple/blue gradients, glowing blobs, endless bento grids, giant pill buttons, oversized slogan heroes on every screen, repeated decorative cards, irrelevant floating 3D objects, emoji icon systems, fake metrics, stock testimonial blocks and unnecessary dashboard charts. Also avoid cloning LeetCode: no dense competitive problem table as the home screen, ranking-first design, or harsh terminal aesthetic. Preserve useful density without cramming the page.

Use an intentional typography hierarchy: a readable UI/body family and a dedicated monospace family for code. At most two font families. Prefer system fonts or openly licensed assets. Use one consistent icon set with accessible labels. Distinguish primary, secondary and destructive actions. Empty space should clarify relationships, not make learners scroll past decoration. Produce a polished light theme first; do not double scope with a dark theme before all core screens work.

## Motion and optional 3D

Use Framer Motion for a small set of reusable interactions if it improves the experience: panel entrances, tab transitions, expanding feedback, gentle progress changes and dialog transitions. Prefer CSS for simple hover/focus states. Typical transitions should feel brief and responsive, roughly 120–220 ms. Never delay an action until an animation finishes.

Three.js is optional, not a requirement. Use it only if a specific educational visualization is clearer in 3D. Arrays, stacks, queues, loop execution and concept maps are usually clearer in accessible 2D HTML/SVG. Do not add a 3D hero, animated background or always-running canvas merely for visual novelty. If you use Three.js, isolate and lazy-load it, stop rendering while hidden, provide a non-WebGL equivalent, and explain its teaching purpose. No animation may be the only way information is communicated.

Respect prefers-reduced-motion, avoid scroll hijacking, parallax, autoplay effects, continuous bobbing and layout-shifting animations. Motion should explain a change of state, not compete with reading code.

## Shared UX requirements

- Desktop: consistent app navigation and personal menu. Future full navigation includes Today, Learn, Practice, Projects, Community and Interview Studio. Released-only navigation is the default core mode.
- Mobile: a compact shell and focused editor, reachable actions, visible navigation back, and useful reading width. Never shrink a desktop IDE into an unusable miniature. Keep code horizontally scrollable without overflowing the page. Provide a linear list alternative to visual concept maps.
- English/Spanish switch preserves route identity, draft and session. Use real translations, including form validation, hints, empty states and errors. Allow longer Spanish labels. User-authored posts retain their original language.
- Keyboard access, meaningful headings, landmarks, skip links, visible focus, labeled inputs, focus management after navigation/dialogs, accessible status updates, and no color-only meaning. Target WCAG 2.2 AA; do not claim certification without an audit. Check layouts at 360, 390, 768, 1280 and 1440 pixels and at 200% zoom.
- Every data-dependent screen needs loading, empty, populated and recoverable failure states. Relevant actions also need disabled, pending, success, permission-denied, offline/session-expired and retry states. Preserve typed work after failures. Never use a toast as the sole place important errors or unsaved-state information appear.
- Distinguish guest browser storage, account-saved drafts, pending writes and saved attempt snapshots. Do not claim offline sync is available: the current client requires the tab to remain open to recover failed writes. Guest import is not automatic.
- Authentication: email link sign-in, passkey sign-in, and configured Google/GitHub buttons. An explicit logout ends the session. Passkeys let returning users sign in without another email. Do not propose silently signing someone in just because their email was verified once.
- Provider linking uses the same verified email. If fresh confirmation is needed, offer in-place passkey confirmation, then resume the action; provide email recovery. No visible “connect within 15 minutes” countdown. Include canceled authentication, changed-account, expired-link and unavailable-provider states.
- No notifications, public sharing, device permissions or social discovery enabled without an appropriate user choice. Do not imply tests, certificates or security controls exist when they are only mock UI.

## Complete screen inventory

Design every item and its named subflows. Related states can share a component; “all screens” does not mean separate bespoke code for each state.

1. **Welcome /{locale}**: concise product introduction, a real lesson preview, Start learning and Try a lesson, sign-in when enabled, free/open-source promise, contributor and optional donation links. Show what learning feels like without a giant generic landing page.
2. **Authentication /{locale}/auth**: email entry, adult confirmation, sending/check-email, resend/retry, expired/reused link, passkey prompt/cancellation, Google/GitHub entry and provider failure. Include reauthentication that preserves the pending destination and recovery when a passkey is unavailable.
3. **Onboarding /{locale}/start**: language, beginner-first goal, optional weekly time, skip and edit paths. Goals include foundations, projects and interview confidence. Explain persistence without forcing an account before the first lesson.
4. **Today /{locale}/today**: one clear next action, learning direction, available lessons, actual practice summary and review queue. First-time state has useful guidance rather than a wall of zeros. Future replies, projects or peer sessions appear only when those features and data exist. No invented mastery percentage.
5. **Learning map /{locale}/learn**: stages, prerequisites, current location, list/map toggle and search. Show what is available versus planned without making an entire locked roadmap look purchasable. Distinguish unvisited, practiced, needs review and supported evidence of understanding.
6. **Concept overview /{locale}/learn/concepts/:conceptId**: objective, prerequisite links, why it matters, examples, misconceptions, related lessons, a project application and an interview bridge. Include a clear start/resume action.
7. **Lesson workspace /{locale}/learn/lessons/:lessonId**: explanation → prediction → editable example → Run/Stop/Reset → actual/expected output → useful feedback → reflection → save attempt. Include separate notes, code autosave status, retries, device conflict comparison with explicit keep/use choices, recent attempts and confirmed restoration, previous/next navigation, and unsaved-change warnings. Desktop may use a restrained split view; mobile needs a deliberate linear or tabbed flow. Never gate the explanation behind passing a test.
8. **Practice and review /{locale}/practice**: manageable queue, reason for each review, untimed practice, focused exercise, hints in stages, result and return-to-learning action. Current policy is simple: mismatch due now, match revisited after one day. Future adaptive designs must not misrepresent that as an existing algorithm.
9. **Personal progress /{locale}/me/progress**: actual practice history, concept evidence, goals and next actions. Explain what each metric means. No public rankings, guilt messages, fabricated certificates or confetti for every click.
10. **Mistake notebook /{locale}/me/notebook**: privately saved misunderstanding, code excerpt, explanation of the correction, linked lesson and retry action. Search/filter and useful empty state. Reflection should be short and optional, not an essay requirement.
11. **Community home /{locale}/community**: searchable questions with topics, language, unanswered/answered filters and helpful previews. Design meaningful first-post guidance and moderation-unavailable state. Do not imitate a noisy social feed.
12. **Question composer /{locale}/community/new**: title, what I expected, what happened, what I tried, bounded code example, tags and language. “Ask from this lesson” previews the exact context before sharing; drafts, account data and private notes are not attached automatically.
13. **Question thread /{locale}/community/questions/:questionId**: question, code, answers, clarification, helpful/accepted markers, edit history, report/block and a path back to independent practice. Helpful participation is not a competitive reputation economy. Reading a post never executes its code.
14. **Bug clinic /{locale}/community/clinics/:clinicId**: guided group debugging, hypothesis list, observations, proposed fixes, conclusion and individual follow-up exercise. Include closed/full session and no-host states.
15. **Profiles and connections /{locale}/people/:handle and /{locale}/me/connections**: learner-selected public details, interests, languages and opt-in study availability; request/accept/decline/block flows. Private progress remains private. Private direct messages are later scope, not required at initial community launch.
16. **Study circles and live rooms /{locale}/community/circles/**: discovery, circle detail, join/leave, shared study plan and topic/text rooms. Design history, message composer, reconnect, pending/failed send, capacity-full, unavailable moderator, report/block and removal states. Ordinary chat history is retained unless deleted/moderated. No video, voice or collaborative code editing requirement.
17. **Explain it back /{locale}/practice/teach-backs/:sessionId**: learner explains a concept to a peer, peer uses a small supportive rubric, learner records a takeaway. Include asynchronous/solo alternative and partner-no-show handling. No AI grading requirement.
18. **Notifications /{locale}/me/notifications**: replies, circle updates, invitations and optional review reminders; read/unread and preferences. Avoid urgency badges on routine practice.
19. **Project library and workspace /{locale}/projects/**: beginner-friendly briefs tied to learned concepts, examples of expected behavior, staged milestones, files/editor/output, snapshots, reflection and optional showcase. Include an individual path without collaboration.
20. **Project handoff /{locale}/projects/:projectId/handoffs/:handoffId**: author explains current state, decisions, known issues and next task; recipient previews and accepts. Show permissions and conflict states. No implied automatic deployment or repository write.
21. **Interview Studio /{locale}/interviews**: practice formats for explaining code, clarifying requirements, choosing an approach, debugging, discussing complexity, project walkthroughs and behavioral stories. Coding interview preparation must be more than solving algorithm puzzles. Allow untimed and optional timed practice.
22. **Interview session /{locale}/interviews/sessions/:sessionId**: prompt, clarifying questions, plan, code or discussion notes, tests, tradeoffs and summary. Timer is optional; pause/leave is humane. Include interviewer/partner roles and a solo version. No mandatory microphone, camera or automated surveillance.
23. **Interview review /{locale}/interviews/sessions/:sessionId/review**: evidence-based feedback on communication, reasoning, correctness, testing and tradeoffs; self/peer feedback; concrete next practice links. No fake hiring probability, employer endorsement or invented AI assessment.
24. **Peer matching/scheduling /{locale}/interviews/partners**: opt-in language/topic/experience preferences, availability with timezone, invite/accept, reschedule, cancellation, no-show and block/report. Provide a solo fallback when no partner is available.
25. **Settings and support /{locale}/settings/** and /{locale}/support: learning preferences, language, passkey add/name/remove, connected providers, recent-confirmation flow, other-session revocation, sign-out, privacy and notification controls, accessibility preferences, help/contact, community guidelines, privacy/terms, open-source contribution and optional donation page. Design account deletion carefully: explicit confirmation, current restrictions, and eventual choice to remove public answers or preserve them anonymously. Export/deletion operational targets are future work; do not claim instant erasure from backups. Never invent legal policy text as approved legal advice.
26. **Content studio, restricted author area**: lesson list, lesson/version editor, objectives and prerequisites, bilingual authoring/review, exercise and expected-output editor, preview, validation errors, draft/review/published states and publication history. Publishing is a deliberate action; learner UI cannot access author controls.
27. **Moderation console, restricted moderator area**: reports queue, case/context/evidence view, reasoned actions, notices, appeals, closed cases, language filters and action history. Include restricted access and no-moderator availability. Do not expose private moderation evidence in ordinary profiles. The planning retention target is 90 days after a case/appeal closes; it is not implemented yet.
28. **Shared recovery/system screens**: 404, unavailable lesson/version, session expiry, permission denied, maintenance, offline, capacity reached, and account signup temporarily limited. If free-tier capacity is constrained, keep public lessons usable where possible and explain account/costly-feature restrictions without payment pressure.

## Features that make the experience distinctive

Connect learning to action: predict before running; explain a result in your own words; compare a failed approach with a corrected one; return to a small review queue; apply the idea in a project; explain the same idea in an interview context. Make those connections visible, not a disconnected row of feature cards.

Design “ask with context” with an explicit sharing preview, bug clinics, teach-backs, study circles, project handoffs and peer interview practice. Give each one a concrete user task, a helpful empty state and a solo fallback. Do not add more speculative features until these workflows are coherent.

## Prototype implementation and handoff

Use React, TypeScript and Vite-compatible components. Keep UI modular by feature with a small shared component layer: app shell, button, field, dialog, status, card, tabs, code frame and empty state. Define design tokens in CSS variables. Use a straightforward responsive CSS approach. No micro-frontends, custom state framework, generated design-system engine or dependencies for trivial interactions.

Keep fixtures and mock async adapters separate from presentational components. Simulate account/provider, saving/conflict, output, room and interview states without real credentials or network mutations. Do not implement a new code sandbox or execute learner source using eval/Function. Preserve a runner integration boundary for our existing isolated implementation. Do not ask for secrets, make provider connections, create a payment integration, or deploy anything.

Use representative fixture content: JavaScript values, variables, strings, comparisons, if/else, loops, functions, arrays and objects. A beginner should be able to follow the copy. Use credible community examples and short interview prompts. Never imply fixture people or statistics are real users. Keep all screen controls meaningfully interactive; if an action needs a backend, demonstrate its relevant success/error states through the mock adapter.

Deliver:

1. A concise visual-direction explanation, followed by the working prototype rather than pages of design theory.
2. A screen/state gallery listing every screen above, its implemented routes and core/future classification. Core navigation remains clean; the gallery is only for review.
3. Responsive English/Spanish screens with representative loading, empty, failure, saving/conflict and permission states. Avoid designing only the happy path.
4. Reusable components, semantic tokens, locale dictionaries, fixture data and clearly separated API/runner integration boundaries.
5. A short interaction map: guest lesson; sign-in/resume; lesson/save/review; cloud conflict recovery; question/help/independent retry; project application; solo and peer interview practice; moderation case.
6. Keyboard, reduced-motion, mobile and overflow checks, with a truthful list of any unverified accessibility items.
7. A handoff README with how to run, component/file map, dependency list and why each dependency exists, and a list of mock-only actions. Include openly licensed assets or attribution where required.

Prioritize coherence, readability and a working learning flow over decorative effects. Do not stop after the landing page or first dashboard. If your execution budget requires multiple passes, keep a screen checklist and complete the core journey first, then the remaining inventory without pretending unfinished screens are done. Make reasonable design choices and proceed; do not block on questions this prompt already answers.
