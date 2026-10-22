# Learntify owner decisions

Recorded October 21, 2026. Architecture planning only; no implementation, purchases, or deployments.

This decision record supersedes earlier assumptions where they differ. Architecture recommendations below remain distinguished from owner-confirmed constraints.

## Confirmed constraints

Latest approval: APPROVED_BASELINE.md records the accepted stack (subject to validation/replacement), learning-only first build, seven-day backup target, fourteen-day diagnostics, thirty-day security metadata, ninety-day closed-case moderation evidence, and seven-day active-system deletion target. The owner explicitly chose to remain in planning. No validation experiments or scaffolding are authorized yet. Cleanup records remain through actual backup expiry plus thirty days, with timing defined in that baseline.

Latest owner choices: restrict new accounts and costly features near capacity while preserving public lessons; topic/study-circle chat first, private messages later; retain ordinary chat indefinitely unless deleted/moderated; automatically synchronize drafts across devices; offer preservation with author identity removed or removal of public contributions during account deletion; external free-tier auth/email providers are acceptable when replaceable and protected against paid overages. TECHNICAL_DECISIONS.md records the recommended protocols/provider choices. No fixed-age chat expiry or local-only draft policy applies.

- 100,000 users is a future growth scenario, not an expected first-week audience or launch acceptance requirement.
- Initial recurring infrastructure budget is strictly US$0 without donations. Capacity limits and occasional downtime are acceptable. No automatic paid upgrade or metered-overage exposure is authorized.
- Cloudflare is preferred. External providers are acceptable when justified and compatible with the budget.
- Juan Pablo Bovio Vallejo is the initial sole builder/operator; community contributors may join later. The owner is willing to adapt to the technologies best suited to the app. Weekly availability remains unspecified, so no delivery dates are committed.
- Account creation and community participation are initially for adults aged 18+. This does not establish a jurisdiction-specific compliance policy or require collecting full birth dates or identity documents.
- Authentication must include Google, GitHub, and passwordless email via a one-time code or sign-in link. No password storage/recovery subsystem is needed for the selected email experience. Auth library/provider and email delivery service remain open implementation selections.
- Initial social release includes the forum, connections, asynchronous study circles, and live text chat. Collaborative editing remains later scope.
- No English/Spanish moderators are committed yet. The owner explicitly selected keeping public posting and live chat unreleased until moderators join. Core learning can launch independently. Do not assign moderation to the owner or silently substitute an unmoderated pilot.
- Availability is best effort initially; occasional downtime is accepted. Earlier 99.9%, 15-minute RPO, and four-hour RTO proposals are future evaluation targets, not launch commitments.
- MIT covers the software and all original project materials created by the owner, including curriculum, documentation, and illustrations. Copyright holder: Juan Pablo Bovio Vallejo. Third-party materials and user content retain their own applicable terms.
- Intended domain: learntify.lat. The owner plans to buy it; ownership, availability, purchase, DNS, and outgoing-email verification have not been established. Domain registration/renewal is distinct from the US$0 recurring hosting target. No purchase is authorized by this planning work.
- All learner-facing capabilities remain free; donations confer no entitlements.

## Recommended architecture under these constraints

Keep the independent client and modular Worker API in one public repository. Use D1 as the recommended initial relational store, subject to later compatibility/restore validation, rather than requiring a paid high-growth database at launch. Keep domain-owned persistence ports and versioned migrations so a later database change is contained but not misrepresented as automatic. Reconsider PostgreSQL or partitioning when measured load, data size, required semantics, or funding warrants it.

Plan a live-room runtime using SQLite-backed Durable Objects with bounded rooms, messages, history, and reconnect behavior. Separate the runtime boundary from the application API, but reuse authentication contracts and domain policies. Presence is ephemeral; the room owns its persisted message history. D1 owns room metadata, membership, and moderation policy. Define authorization revocation and moderation access across those stores explicitly. Initial chat has no attachments, voice/video, or collaborative editing.

Durable Objects offer a free-plan SQLite option, with finite allowances. Reverify current limits and account eligibility before implementation/deployment. [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

Avoid services with uncapped paid overages in the zero-budget deployment. Cost alerts alone are not a spending cap. Do not rely on R2 or a transactional email provider until account terms and a no-overage setup are verified. Static curriculum and small text/code records can start without user file uploads. Existing domain ownership may determine whether a branded email sender is feasible without new spending.

Keep learning code execution in the isolated browser environment. Use an outbox and bounded scheduled jobs for asynchronous work initially; a separate broker is not a requirement until justified. Public search can begin with bounded indexed database queries. No Redis, Kubernetes, paid AI, dedicated search cluster, or server execution fleet is required by the launch architecture.

## Launch and growth separation

Launch validates real learning flows, correctness, privacy, recovery procedures, and understandable quota behavior on the selected free tiers. Establish an admitted load envelope through future tests rather than promising a fixed number of users now. Admission controls, bounded rooms, and queued local progress are acceptable responses to capacity limits; no paid priority is introduced.

The 100,000-user workload calculations in ARCHITECTURE.md remain useful future scenarios. They are not benchmarks that a US$0 launch must pass. Crossing measured headroom thresholds triggers a funding/capacity decision, not an automatic bill.

Operationally, choose best-effort service messaging and truthful local/pending/saved states. Document restore procedures and test backups when implemented. State the actual achieved recovery window after validation rather than promising the previous aspirational figures.

## Passwordless authentication design

Recommended primary email flow: an expiring, single-use code entered into the requesting browser session. A magic link can be an alternate experience if the chosen maintained auth implementation supports it safely. This is a design recommendation within the owner's accepted code/link preference, not a custom-auth implementation mandate.

Requirements: generic account-existence responses, hashed challenge storage, challenge/session binding, bounded attempts and resend frequency, expiry, replay prevention, server-issued secure sessions, and safe provider linking. Do not log codes or tokens. Existing valid sessions should remain usable during email-delivery outages. Explain sending failures without pretending mail was delivered. An email-only user is not automatically given a Google/GitHub identity; linking requires proof of control. Email quota exhaustion must not incur an automatic paid upgrade.

The delivery-provider decision requires checking free allowances, sending-domain verification, recipient restrictions, abuse controls, and overage behavior. Do not assume domain purchase alone supplies outbound email. Select a maintained Worker-compatible authentication solution before implementation; keep its integration behind the identity boundary.

## Community activation gate

Keep the forum, connections, study circles, and live text rooms in the product architecture. Release public contribution/chat capabilities only after named moderators agree to cover English and Spanish and the report/block/action/appeal workflows are ready. As a recommended consistent launch policy, also hold person-to-person invitations and group discussions until those controls have owners; they create the same moderation obligations.

Gate posting, replies, room joins, and messages on the server, not just by hiding navigation. Private administrative testing uses synthetic or explicitly consented test content. A learning-only public release has no empty public forum or promise that live community help is already available. The social release remains free and includes live text chat when the gate is satisfied.

## Remaining architecture work

The owner constraints are sufficiently clear to continue architecture planning without another broad questionnaire. Next technical records should finalize the authentication/provider evaluation, API contracts, persistence/migration conventions, room message consistency and revocation, and quota/failure policies. Provider selections require current documentation and later compatibility validation; no exact package versions are locked now.

Weekly availability is needed only before delivery estimates. Domain purchase, credentials, moderator recruitment, and deployment remain future actions, not completed facts. No application implementation is authorized.
