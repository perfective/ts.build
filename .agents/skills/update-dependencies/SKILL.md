---
name: update-dependencies
description: >-
    Find the pending dependency updates for @perfective/build
    (from the Renovate Dependency Dashboard and npm outdated),
    and do them one at a time, in the necessary sequence, with the update-dependency skill.
    Use this skill for a maintenance pass or when the maintainer asks to "update dependencies".
---

# Update all pending dependencies

## 1. Find the pending updates

Find the Renovate Dependency Dashboard issue and the open Renovate PRs:

```bash
gh issue list --label dependencies --search "Dependency Dashboard in:title" --state open
gh pr list --author "app/renovate" --state open
```

Also run `npm outdated` each time.
It finds updates that Renovate did not open yet.
For example, Renovate waits during the minimum release age,
and it waits for an approval in the Dependency Dashboard.

Ignore prereleases.

Security updates have the `vulnerability` label from Renovate.
Do a security update first in its group.

## 2. Put the updates in sequence

Do the updates in this sequence:

1.  `typescript`
2.  Babel (`@babel/core`, `gulp-babel`)
3.  Gulp and its plugins, in alphabetical order
4.  Preset peers (`prettier`, `jest`, `ts-jest`, `@types/jest`)
5.  All other dependencies, in alphabetical order

`typescript` is first, because a major version or a config change can set what the other tools must accept.

## 3. Do the updates one at a time

For each update, do all the steps in `.agents/skills/update-dependency/SKILL.md`.
Use one commit for each dependency.
Verify each update before you start the next update.

Stop and report when one of these conditions occurs:

- A **NEEDS HUMAN** item blocks the update.
  A **NEEDS HUMAN** item that does not block the update can stay in the report.
  For example, a preset decision that keeps its current setting does not block the update.
- Verification fails, and you cannot fix it in the same update.

## 4. Report

At the end, write a table of the updates that you did, with these columns:

- Package
- Versions (from → to)
- Commit
- Configuration changes
- **NEEDS HUMAN** items

Then list the updates that you did not do, and give the reason for each.

Do not push, merge, tag, or publish.

A release on GitHub starts from a `Release @perfective/build vX.Y.Z` issue.
This skill does not make a release.
