# MongoDB Atlas Free evaluation

Checked October 22, 2026. Evaluation only; no account, cluster, driver, credentials, or migration created.

MongoDB is a technically viable alternative. Cloudflare now documents connecting Workers through the native MongoDB Node.js driver. Runtime compatibility flags, connection lifecycle, network access, authentication integration, and latency still require validation before adoption. [Cloudflare tutorial](https://developers.cloudflare.com/workers/tutorials/connect-to-mongodb-atlas/)

Atlas Free currently lists 0.5 GB total document/index storage, 100 operations per second, 500 connections, and 10 GB in/10 GB out over a rolling seven-day window. These are database operations, not application requests. Its limits page describes optional daily backups retaining four snapshots; that does not establish our seven-day target. Some older overview pages disagree about free backups, so verify actual account capability. [Atlas Free limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/)

Recommendation: retain D1 initially. This is an engineering judgment, not a claim that MongoDB cannot scale. Accepted-answer integrity, memberships, versioned attempts/evidence, scheduling reservations, and deletion already have relational constraints and transaction boundaries in our design. Switching requires deliberate document modeling, indexes, concurrency tests, auth-adapter review, and a restore plan. D1 is still only a local experiment here, so there is no production data migration today.

Avoid adding a second primary store just to consume another free allowance. If MongoDB becomes the selected direction, validate the draft repository against it first, then revise the application schema and choose one authoritative store. The exploratory question does not trigger a migration.
