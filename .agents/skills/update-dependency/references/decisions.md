# Dependency decisions for `@perfective/build`

Use this guide to decide how a dependency update changes the package.

First, look for earlier decisions:

- `git log --format='%h %s%n%b' -- package.json`
- `git log -S'<package>'`

If this guide and the history do not decide a question, report it as **NEEDS HUMAN**.

This repository gives build tasks and shared presets.
It does not configure ESLint rules, and it has no test suite yet.
Do not make up a rule audit, a metadata snapshot, or a migration guide.

## Manifest and lockfile

- Update each `package.json` entry for the package (`dependencies`, `devDependencies`, and `peerDependencies`).
  Also update `package-lock.json`.
- Keep the range operator of each entry:
    - `typescript` has `~` as a peer dependency and as a devDependency.
    - `prettier` has `^` as a peer dependency and `~` as a devDependency.
    - Do not make these operators the same.
- If only the lockfile changes, and a pin stays on an older minor or patch version, the update has a defect.
- Do not add a dependency, remove a dependency, or change the `package.json` scripts,
  unless the maintainer asks.
  These changes are **NEEDS HUMAN**.
- Do not use `npm install --save-exact`, `--force`, or `--legacy-peer-deps`.
  Edit the ranges, and then run `npm install` to make the lockfile agree.

## TypeScript

- Read the release notes of each TypeScript version between the two versions, at all SemVer levels.
- Change `tsconfig/tsconfig.strict.json` and `src/**` when a note makes it necessary.
  For example, an option is removed, or a default changes what consumers compile.
- Do not change `module`, `moduleResolution`, `target`, `types`, or the supported TypeScript line
  as a side effect of a patch.
  The maintainer decides these settings (**NEEDS HUMAN**).
- Gulp sets its own `module` for each emit task.
  Thus, the `module` in `tsconfig.strict.json` is not necessarily the emit target.
- If an update stops support for a TypeScript version or a Node.js version that consumers use,
  it is **NEEDS HUMAN**.

## Presets, Babel, and Gulp

Consumers use these parts of the package directly:
`src/prettier/`, `src/jest/`, `src/babel/`, `src/gulp/`, and `tsconfig/tsconfig.strict.json`.

- Apply an option change from the notes if one of these conditions is true:
    - The config in this repository already sets that option.
    - The old behavior would be incorrect.
- A change to what a preset or a task does for consumers is **NEEDS HUMAN**,
  unless the notes make the old behavior impossible.
- `@babel/core` is an optional peer dependency with the range `^7.29.0 || ^8.1.0`.
  Do not remove one of these major versions without a **NEEDS HUMAN** decision.
- `gulp` is a dependency and also an optional peer dependency.
  Change the two ranges together.
- A peer range change that makes support narrower or removes a major version is **NEEDS HUMAN**.
  Give the old range, the new range, and the consumers that the change affects
  (`@perfective/common`, `@perfective/eslint-config`).

## Configuration section of the report

For TypeScript, Babel, Gulp, Prettier, and Jest, the report has a **Configuration** section with these items:

- The option changes and the behavior changes from the notes.
- The files in this repository that the changes affect:
  `tsconfig/tsconfig.strict.json`, `src/babel/**`, `src/gulp/**`, `src/prettier/index.js`,
  `src/jest/index.js`, and `gulpfile.js`.
- For each change, whether this update applied it, or what work remains.

If a tool has no configuration in this repository, the report does not need this section.

## The `help wanted` label

Add `help wanted` when the verdict is **NEEDS HUMAN**.

Remove `help wanted` only if both of these conditions are true:

- The verdict is not **NEEDS HUMAN**.
- The update is not a major update, a peer dependency update, or a TypeScript update.

`renovate.json` adds `help wanted` to these three types of update, so that a maintainer examines them.
For these updates, keep the label, and write in the report that you kept it.

## Commit message

Select the verb in the title from the SemVer level of the version change: `Patch`, `Update`, or `Upgrade`.
Do not use backticks in the title, for example `Update @babel/core to v7.29.6`.

Add a body only for a configuration change or a behavior change that consumers can see.
Write one list item for each change.
In the body, put backticks around package names and option names.

## CHANGELOG phrasing (for `prepare-release`)

`CHANGELOG.adoc` uses the past tense and the same verb as the commit.
Write one bullet for each dependency, with backticks around the package and the version:

```asciidoc
* Updated `prettier` to `3.10.1`.
* Upgraded `typescript` to `6.0.3`.
* Patched `glob` to `14.0.6`.
```

Write a behavior change that consumers can see as a nested bullet.
Put two blank lines between versions.
Do not include changes to CI, workflows, Renovate, `AGENTS.md`, or `ROADMAP.adoc`.

## What not to change in a dependency update

`README.adoc`, `README.md`, and `CHANGELOG.adoc` change only in the Publish commit.
Do not change `.github/`, `.claude/`, or `.mcp.json` in a dependency update.
`ROADMAP.adoc`, `AGENTS.md`, and `renovate.json` can change when the update changes the process that they describe.
