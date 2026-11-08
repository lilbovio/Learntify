# AI Studio design integration

The original export lives in `ai-studio-desing/`. It is a design reference, not the deployed application. The production client remains `apps/client`; the Worker, D1 adapters, contracts and authentication implementation remain in their existing packages.

## Integrated

- Shared localized navigation, warm neutral surfaces, restrained clay controls, glass header with a solid fallback, responsive layouts and reduced-motion support.
- Welcome learning-cycle introduction, narrower authentication/settings layouts, existing onboarding and lesson workspace styled with the shared system.
- Learning library with live curriculum data, search, list/path views, stable lesson numbering and working lesson links.
- Practice and progress destinations backed by account-owned attempts and review scheduling. Results describe practice, never certified mastery.
- Notebook backed by the existing private, versioned lesson notes. Explicit lesson selection avoids creating drafts for every lesson. Autosave, retry, conflict resolution and unsaved-change warnings are reused.
- Today suggests a due review first, then an unpracticed lesson. If progress is temporarily unavailable, the catalog stays usable and the practice panel provides its own retry state.

## Kept out of the live application

The export's role picker, simulated sign-in, fixture users, invented activity and mocked execution are not authorization, persistence or grading implementations. No Gemini SDK, Express server, remote fonts or additional paid service was introduced.

One guided project workspace now supports function checks and a private-notes interview walkthrough. Multi-project workspaces, teach-back, bug clinic, full interview sessions/reviews, profiles, notifications, authoring and moderation tools still require further product behavior and authorization. Their exported screens remain design references; they are not advertised as working features. Public community posting, study circles and chat stay unreleased until moderators are available. This is a first core integration, not completion of every exported screen or a production-readiness claim.

## Validation

Public browser journeys cover bilingual navigation, search/path filtering, mobile overflow, code execution and recovery. Account journeys cover real local Worker/D1 authentication, passkeys, provider failure recovery, cloud drafts/conflicts and notebook-to-lesson persistence. CI also checks formatting, TypeScript, module boundaries, unit/integration tests and build output.
