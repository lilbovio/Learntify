# Release pipeline

## Current decision

The owner has purchased the domain and asked to keep implementing without deploying to Cloudflare while alpha work continues. No DNS, deployment, production database or secret changes are part of this increment.

GitHub Actions already validates pushes and pull requests with formatting, types, module boundaries, unit/local-D1 tests, browser account journeys, and client/Worker builds. This is CI; it does not publish the app.

## Next deployment milestone

A restricted staging deployment can be useful during alpha; it does not imply a public production launch. When deployment is authorized, use a separate Worker environment, database, secrets and callback URLs. Keep the existing external-test database separate. First verify the actual purchased domain and DNS ownership; do not infer DNS readiness from the purchase.

Keep GitHub Actions as the CI system. Start with a manually triggered staging deployment gated by the same checks and a protected GitHub environment. Use a narrowly scoped Cloudflare token stored in GitHub environment secrets. Never make deployment credentials available to fork PR jobs. Production should remain a separate, manually approved promotion of a tested revision.

Before enabling CD, validate remote migrations and restore/deletion replay, static asset routing and security headers, cookie/origin behavior, email sender verification, OAuth/passkey domain settings, quota limits, and health checks. Establish how to roll back the Worker without reversing incompatible schema migrations. Uploading assets or applying migrations alone is not a successful release.

No deployment workflow is enabled yet: placeholder credentials and unverified resource IDs would make it misleading. Local CI continues to work without deployment credentials.

References: [Cloudflare environments](https://developers.cloudflare.com/workers/wrangler/environments/) and [GitHub Actions deployments](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
