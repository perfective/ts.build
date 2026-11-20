# Dependency decisions for `@perfective/build`

Use this guide to decide how a dependency update changes the package.
Look for precedent first: `git log --format='%h %s%n%b' -- package.json` and `git log -S'<package>'`.
When neither this guide nor the history settles a decision, report it as **NEEDS HUMAN**.

This repository ships build tasks and shared presets.
It does not configure ESLint rules, and it has no test suite yet.
Do not invent a rule audit, a metadata snapshot, or a migration guide.

## Manifest and lockfile

- Update every `package.json` entry for that package
  (`dependencies`, `devDependencies`, and `peerDependencies`) and `package-lock.json`.
- Keep each entry's existing range operator.
  `typescript` is `~` in both the peer dependency and the devDependency.
  `prettier` is `^` as a peer and `~` as a devDependency.
  Do not force those operators to match.
- A lockfile-only change while a pin stays on an older minor or patch is a defect.
- Do not add a dependency, remove one, or change `package.json` scripts unless the maintainer asked.
  That is **NEEDS HUMAN**.
- Do not use `npm install --save-exact` or `--force` or `--legacy-peer-deps`.
  Edit the ranges, then run `npm install` so the lockfile matches.

## TypeScript

- Read every intervening TypeScript release note, at any SemVer level.
- Adapt `tsconfig/tsconfig.strict.json` and `src/**` when a note requires it
  (a removed option, or a default that changes what consumers compile).
- Do not change `module`, `moduleResolution`, `target`, `types`, or the supported TypeScript line
  as a side effect of a patch.
  Those are maintainer decisions (**NEEDS HUMAN**).
- Gulp overrides `module` per emit task.
  Do not assume `tsconfig.strict.json`'s `module` is the emit target.
- Dropping a TypeScript or Node.js version consumers rely on is **NEEDS HUMAN**.

## Presets, Babel, and Gulp

`src/prettier/`, `src/jest/`, `src/babel/`, `src/gulp/`, and `tsconfig/tsconfig.strict.json` are product surface.

- Apply an option change the notes call out when this repo's config already sets that option
  or when the old behavior would be wrong.
- A change to what a preset or task does for consumers is **NEEDS HUMAN**
  unless the notes make the previous behavior impossible.
- `@babel/core` is an optional peer on `^7.29.0 || ^8.1.0`.
  Do not drop either major without **NEEDS HUMAN**.
- `gulp` is both a dependency and an optional peer. Move both ranges together.
- Peer range changes that narrow support or drop a major are **NEEDS HUMAN**.
  Name the old range, the new range, and which consumers are affected
  (`@perfective/common`, `@perfective/eslint-config`).

## Configuration section of the report

For TypeScript, Babel, Gulp, Prettier, and Jest, the report lists:

- option or behavior changes the notes call out;
- which in-repo files apply
  (`tsconfig/tsconfig.strict.json`, `src/babel/**`, `src/gulp/**`, `src/prettier/index.js`,
  `src/jest/index.js`, `gulpfile.js`);
- whether this change already applied them, or what is still open.

A tool with no config surface in this repo does not need that section.

## The `help wanted` label

Add `help wanted` when the verdict is **NEEDS HUMAN**.
Remove it only when the verdict is not **NEEDS HUMAN**
and the update is not a major, a peer dependency change, or a TypeScript update.
`renovate.json` adds `help wanted` for those three so a maintainer still looks at them.
Leave the label in place then, and say so in the report.

## Commit message

The subject verb follows the dependency's SemVer level: `Patch` / `Update` / `Upgrade`.
The subject has no backticks: `Update @babel/core to v7.29.6`.
Add a body only for a consumer-visible configuration or behavior change, one list item per change.
Wrap package and option names in backticks in the body.

## CHANGELOG phrasing (used by `prepare-release`)

`CHANGELOG.adoc` uses past tense and mirrors the commit verb.
One bullet per dependency, with backticks around the package and the version:

```asciidoc
* Updated `prettier` to `3.10.1`.
* Upgraded `typescript` to `6.0.3`.
* Patched `glob` to `14.0.6`.
```

A consumer-visible behavior change is a nested bullet.
Separate versions with two blank lines.
Leave out CI, workflow, Renovate, `AGENTS.md`, and `ROADMAP.adoc` changes.

## What not to edit on a dependency update

`README.adoc`, `README.md`, and `CHANGELOG.adoc` change only in the Publish commit.
Do not edit `.github/`, `.claude/`, or `.mcp.json` in that update.
`ROADMAP.adoc`, `AGENTS.md`, and `renovate.json` may change when the update changes the process they describe.
