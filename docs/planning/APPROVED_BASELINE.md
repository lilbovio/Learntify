# Approved baseline for owner review

Recorded October 21, 2026. This records owner approvals and operational targets; it does not authorize implementation or assert validated production capability.

## Current authorization

Remain in planning. Do not begin technical experiments, install packages, scaffold applications, generate migrations, configure providers, deploy, or purchase services. Document updates and review are authorized. Implementation requires a later explicit request.

## Approved stack

TypeScript; React/Vite client; independently deployed modular Cloudflare Worker server; D1; Better Auth; Resend; Durable Objects when chat launches. The owner permits replacing a component if technical validation exposes a problem. Record the evidence and update the relevant decision before relying on a replacement. No paid service is authorized by this flexibility.

Keep the monorepo/module-boundary design, versioned API contracts, domain-owned persistence, isolated browser execution, and independent client/server deployment. Stack approval is not proof of runtime compatibility, capacity, authentication correctness, or recovery performance.

## Approved first build scope — future work

- Accounts with Google, GitHub, and passwordless email.
- English and Spanish lessons.
- Lesson editor with isolated code execution.
- Continuous cross-device draft synchronization with local recovery and explicit conflicts.
- Versioned attempts and learning evidence.
- Progress and a basic review queue.

Community, connections, live chat, projects, distinctive social features, and interview preparation remain in the full product roadmap. They are not mandatory deliverables for this first build. In particular, the earlier first-build solo interview/project requirement is superseded. Public posting/chat still require moderators before activation.

## Approved retention targets

- Backup copies of changed/deleted data: target seven days initially. Document actual provider capabilities, recovery windows, and any shortfall before making user-facing promises.
- Routine diagnostic logs: fourteen days from event time. Exclude private code, message bodies, credentials, login codes, and unnecessary identifiers.
- Security-event metadata, including login-abuse signals and administrator actions: thirty days from event time, with restricted access. This is metadata, not a general license to retain private content.
- Moderation evidence: ninety days after the case and any appeal have closed. Unresolved cases do not start the closure countdown; periodically review open cases to avoid accidental indefinite retention. This policy applies when community moderation launches.
- Ordinary chat messages: indefinite retention unless deleted or moderated, as previously selected. The ninety-day evidence rule does not impose a ninety-day expiry on ordinary chat.

Use the purpose-specific policy for each record. Do not duplicate private content into logs to extend its retention. A scoped moderation-evidence copy, when justified, has separate restricted ownership and expiry from public message history. Reopening a case must be auditable; it is not a silent mechanism to extend retention forever.

These are operational targets subject to validation, not claims that providers currently support these periods on free plans. Do not upgrade plans or introduce paid storage to meet them without authorization. If a provider retains less diagnostic history, document the shortfall; if it retains data longer, document and resolve the privacy discrepancy before launch rather than claiming earlier deletion.

## Account deletion

Revoke account access immediately when deletion is accepted. Aim to remove private data from active systems within seven days. Preserve or remove public contributions according to the user's explicit choice; removing an author label alone does not guarantee anonymization of the text.

Backup copies expire within the documented actual backup window. Keep minimal restricted cleanup records until that window has elapsed, then for thirty additional days. At a validated seven-day backup window, this is thirty-seven days after active-system removal completes and no new backup can capture the removed active data. If cleanup completes at the seven-day target, this could be up to forty-four days from the original deletion request. The start point is explicit so the deletion ledger does not expire while an affected backup remains restorable.

On restore, reapply deletion records before returning restored data to service. All restore points containing removed active data must expire before the ledger's additional thirty-day countdown. The operator must never restore an older untracked backup after purging the corresponding ledger.

Document any justified exception, its purpose, scope, access controls and expiry. Moderation evidence may follow its separate approved policy; do not silently preserve all private learner data under that exception. Show pending/failed cleanup honestly and do not report completion until required stores reconcile.

## Remaining validation work — not authorized to execute yet

Verify Workers/D1/Better Auth compatibility and migrations, OTP delivery and no-overage limits, browser isolation, atomicity/CAS/idempotency, draft conflict behavior, and deletion across stores. Check whether the seven-day backup target and fourteen-/thirty-day log targets fit the zero-dollar budget. Confirm restore and expiry behavior with tests once implementation is authorized.

Dates and effort estimates remain unset because weekly availability is unspecified. Learntify.lat remains an intended domain purchase, not a verified owned domain. No further broad product questionnaire is needed to record this baseline.

## Document precedence

This approved baseline controls current authorization, first-build scope, stack acceptance status, and retention. DECISIONS.md retains the other owner constraints. API_CONTRACTS.md, DATABASE_SCHEMA.md and MODULE_RULES.md describe the full product design; their breadth does not expand the approved first build. BACKLOG.md remains future work, not an instruction to start implementation.
