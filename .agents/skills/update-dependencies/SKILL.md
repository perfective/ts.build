---
name: update-dependencies
description: >-
    Check pending dependency updates for @perfective/build
    (Renovate Dependency Dashboard or npm outdated)
    and process them one by one in the required order with the update-dependency skill.
    Use for a regular maintenance pass or when asked to "update dependencies".
---

# Update all pending dependencies

## 1. Collect pending updates

- Renovate: find the Dependency Dashboard issue and the open Renovate PRs:

    ```bash
    gh issue list --label dependencies --search "Dependency Dashboard in:title" --state open
    gh pr list --author "app/renovate" --state open
    ```

- Always also run `npm outdated` to catch updates Renovate has not opened yet
  (for example, during the release-age cooldown or while waiting for approval in the Dependency Dashboard).

Ignore prereleases. Note security updates (Renovate's `vulnerability` label): they go first within their group.

## 2. Order them

1. `typescript`
2. Babel (`@babel/core`, `gulp-babel`)
3. Gulp and its plugins, alphabetically
4. Preset peers (`prettier`, `jest`, `ts-jest`, `@types/jest`)
5. Other dependencies, alphabetically

`typescript` comes first because a major or a config change can decide what the later tools must accept.

## 3. Process them one by one

For each update, follow `.agents/skills/update-dependency/SKILL.md` completely:
one dependency, one commit, verified before the next one starts.

Stop and report at the first:

- **NEEDS HUMAN** item that blocks the update
  (an item that does not block it, such as a preset decision left at its current setting, can go in the report);
- failing verification that you cannot fix within the update.

## 4. Report

End with a table of the processed updates (package, from → to, commit, configuration changes, NEEDS HUMAN items)
and the list of updates not processed and why.
Do not push, merge, tag, or publish.
On GitHub, a release is a `Release @perfective/build vX.Y.Z` issue, not this skill.
