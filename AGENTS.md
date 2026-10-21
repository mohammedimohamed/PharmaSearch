# PharmaSearch — Permanent Agent Operating Rules

## 1. Highest Priority: Protect Production

The live production website is:

- https://pharmasearch.indz.net/
- https://pharmasearch-tau.vercel.app/

GitHub repository:

- https://github.com/mohammedimohamed/PharmaSearch

Production is a protected environment. Maintaining the currently working application is more important than completing a task quickly.

These rules apply to EVERY task, including bug fixes, UI changes, refactoring, dependencies, data processing, testing, Git operations, and deployment.

## 2. Strict Scope Control

Before making changes:

1. Read these instructions and inspect the current repository state.
2. Identify the exact files and behavior relevant to the user's request.
3. Inspect the existing implementation before proposing a fix.
4. Define the minimum change needed to satisfy the request.
5. Identify possible side effects and regression risks.
6. Report any ambiguity that could materially change the implementation.

Modify only what is necessary to fulfill the explicit request.

Do not add features, redesign unrelated screens, refactor unrelated code, change dependencies, rename files, rewrite architecture, or improve unrelated functionality without explicit authorization.

Do not interpret a request to fix one issue as permission to modify the entire application.

If an adjacent problem is discovered, report it separately and wait for authorization unless it creates an immediate security or data-integrity risk that prevents safe execution.

## 3. Protect Existing Work

Before editing:

- Run `git status --short --branch`.
- Record the current branch and HEAD commit.
- Inspect relevant existing changes and the latest production deployment.
- Preserve all user modifications and uncommitted work.
- Never run destructive Git commands, discard changes, reset branches, clean the working tree, or overwrite files to make tests pass without explicit authorization.

If the working tree contains unexplained changes, stop and report them before proceeding.

Never overwrite the production dataset or regenerate it from an unverified source.

## 4. No Speculative Fixes

Never change code based only on assumptions.

For every bug:

1. Reproduce it when possible.
2. Identify the root cause using code inspection, runtime evidence, logs, or a reliable test.
3. Explain the cause briefly.
4. Implement the smallest appropriate fix.
5. Add a regression test where practical.

If the root cause cannot be established, report the uncertainty and request the minimum additional information needed.

Do not use CSS hacks, broad exception handling, disabled checks, hidden errors, or global overrides simply to make a test pass.

Do not hide layout overflow when doing so could conceal content or controls.

## 5. Preserve Existing Business and Data Semantics

Unless explicitly authorized, never change:

- Pharmaceutical source records, record IDs, provenance, or dataset counts.
- Search behavior, filtering, sorting, or discrepancy relationships.
- Regulatory classifications, status labels, official source attribution, or legal disclaimers.
- French and Arabic translations unrelated to the requested change.
- RTL behavior, routes, favourites, aliases, or local storage schemas.
- Sponsor attribution, logos, and external links.
- Existing security, accessibility, or data-integrity safeguards.

Do not fabricate missing information or reinterpret source data to simplify implementation.

## 6. Testing Must Not Weaken Quality

Run the checks relevant to the change, including where applicable:

- Existing unit and integration tests.
- Regression tests for the requested behavior.
- ESLint.
- TypeScript checks.
- Production build.
- Browser verification of affected routes and viewports.

Never delete, skip, weaken, or rewrite a test merely to obtain a passing result.

Never lower performance thresholds or disable lint, type, security, or accessibility checks to make the build succeed.

If a test fails, investigate and report the failure. Fix only failures demonstrably caused by the authorized change.

Record which checks actually ran and their real outcomes. Never claim a test or browser verification passed if it was not executed successfully.

## 7. Mandatory Git Safety

The `main` branch is production-sensitive.

- Never make task changes directly on `main`.
- Create a dedicated branch for each authorized change, for example `fix/mobile-search-overflow`.
- Never push task changes directly to `main`.
- Never merge a pull request, change branch protection, or bypass repository rules without explicit user authorization.
- Never amend, force-push, or rewrite published history without explicit authorization.
- Do not commit unrelated changes or generated artifacts.
- Review the complete diff before committing.
- Commit only the files necessary for the authorized task.

If the task is complete but production approval has not been granted, leave the change on its task branch and report the branch and commit.

## 8. Production Deployment Requires Explicit Approval

A successful local build, passing tests, an existing Vercel connection, or a user's request to fix a bug does NOT authorize a production deployment.

The normal workflow is:

1. Implement the requested change on a task branch.
2. Run the required checks.
3. Review the Git diff and affected files.
4. Push the task branch and open a pull request, if repository access permits.
5. Allow Vercel to generate a Preview deployment.
6. Report the Preview URL, test results, changed files, commit hash, and known risks.
7. Wait for explicit user approval before merging to `main` or promoting the change to production.
8. After approval, perform only the authorized release operation and verify the actual production deployment.

Do not claim that a fix is live until the live site has been checked.

If deployment tooling cannot enforce this workflow, explain the limitation and do not bypass it.

## 9. Rollback and Incident Handling

Before any production release, identify the currently deployed commit or deployment that can be restored.

If a change causes a regression:

1. Stop further deployments.
2. Determine the scope and impact.
3. Inform the user promptly.
4. Recommend the safest rollback to the last known-good deployment.
5. Execute rollback only when explicitly authorized or when a separately agreed emergency procedure permits it.
6. Verify recovery and document the incident.

Never attempt an unrelated hotfix on top of a broken release without identifying the cause.

## 10. Required Final Report

Every task report must include:

- Requested change and actual implementation.
- Root cause, if the task was a bug fix.
- Exact files changed.
- Tests and checks executed, with actual outcomes.
- Git branch and commit hash, if applicable.
- Preview URL, if available.
- Production deployment status: NOT DEPLOYED, PREVIEW ONLY, or PRODUCTION VERIFIED.
- Known limitations and any unverified assumptions.

Do not state that the application is safe, production-ready, fully verified, or deployed unless the evidence supports that claim.

## 11. Default Decision Rule

When uncertain whether an action is within scope, destructive, or production-impacting:

STOP. Preserve the current state. Explain the uncertainty and ask the user before proceeding.

The user owns the application and makes production release decisions. The agent implements only the authorized scope.