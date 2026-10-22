# Learntify open-source and stewardship plan

Planning only · October 21, 2026

## License and project promise

MIT is confirmed for Learntify software and all original project materials created by the owner, including lessons, documentation, and illustrations. Copyright holder: Juan Pablo Bovio Vallejo. Before publishing, add the unmodified MIT text with that holder and the appropriate year. This planning pass records the decision without creating a license file yet.

MIT permits reuse, modification, distribution, and commercial use subject to its notice requirement. Learntify's official service can commit to free access, but MIT does not prohibit another operator from charging for a fork. Keep that distinction explicit rather than modifying MIT with a noncommercial restriction. [Official MIT license](https://opensource.org/license/mit)

Original owner-created repository materials use MIT. External contributions need explicit compatible contribution terms; third-party fonts, assets, libraries, and other material retain their own applicable terms. Never relabel third-party content automatically. Track provenance/attribution and dependency licenses. Community posts and learners' private projects are not silently relicensed by the repository's LICENSE file; contribution and platform terms must distinguish them.

The official service's free-access policy covers lessons, hints, assessments, community, projects, and interviews. Donations grant no learning or moderation privilege. Publish operating costs and funding goals at a level that does not reveal sensitive account information. Donations are voluntary support, not a purchase flow embedded in learning.

## Governance proposal

Initial project owner acts as lead maintainer. As contributors grow, appoint domain maintainers for curriculum, learning runtime, community, infrastructure, accessibility, and translations according to demonstrated work and explicit agreement. Do not manufacture a foundation or maintenance team in project claims.

Public RFCs cover significant product/architecture decisions; ADRs record accepted technical decisions, alternatives, consequences, and superseded decisions. The lead maintainer resolves disagreements initially with a recorded rationale. Later governance can distribute authority without making routine changes require a committee.

Define reviewer expectations, release authority, contributor attribution, conflict-of-interest disclosures, conduct enforcement, and an appeal path. Moderation authority is separate from code commit access. Donations do not buy roadmap control, reviewer authority, or exceptions to conduct rules.

## Contribution workflow

Provide issue forms for bugs, accessibility, translations, curriculum corrections, and feature proposals. PRs explain the problem, behavior, validation, and affected domains. Large changes begin with an RFC to prevent contributors spending weeks on an incompatible direction. Small fixes should remain easy to contribute.

Accept code only with a clear contribution-rights statement; a lightweight sign-off policy is a candidate, to be finalized before contribution intake. Avoid an unnecessary copyright transfer requirement. Review dependency licenses and copied examples, and preserve existing notices.

Required repository documentation at implementation/publication time: README, MIT LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, GOVERNANCE, architecture index, supported environment/setup instructions, and release/migration notes. All belong in the planned structure; none require an application scaffold now.

## Security and releases

Choose a monitored private security-reporting channel before publishing a SECURITY contact. Never invent an email address. Document supported versions, acknowledgement expectations appropriate to actual maintainer capacity, coordinated fixes, and public advisories after mitigation.

Protect release credentials, separate maintainer access from public CI, review dependency updates, and produce reproducible release artifacts where practical. Untrusted fork contributions cannot access deployment secrets. Public preview data is synthetic.

Plan maintainer continuity: at least two trusted release-capable maintainers when available, recovery procedures for critical accounts, documented ownership of domains/billing, and backups that do not depend on one laptop. Until staffing exists, describe the operational limitation honestly.

## Architecture planning gate

Before application implementation, review the architecture and repository documents with the owner and resolve or explicitly defer each decision below with a reason:

1. Capacity interpretation: weekly users versus active users and surge assumptions.
2. Production budget envelope and database decision criteria.
3. Domain ownership, consistency boundaries, and independent deployment strategy.
4. Authentication/recovery approach and intended age audience.
5. Reliability, retention, export/deletion, and backup objectives.
6. License scope and copyright holder; contribution governance.
7. API compatibility rules, package boundaries, and local contributor workflow.

Any deferred choice must have a stable interface, an owner, and a validation gate before dependent implementation. This is a planning review, not permission to deploy, spend, or publish.
