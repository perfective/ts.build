# @perfective/build (`ts.build`)

Shared Perfective build kit for TypeScript packages under `~/Code/Perfective/typescript`.
Workspace-wide conventions live in the parent [AGENTS.md](../AGENTS.md); this file covers this package.

## Purpose

Primary job: build a TypeScript library into **one `dist/` tree** with both ESM (`.js`) and CJS (`.cjs`),
plus `.d.ts`, instead of two separate compiler output directories.
Babel plugins rewrite relative import/`require` paths for Node’s extension rules.
Prettier, Jest, and `tsconfig.strict.json` are shared presets consumers may skip.

- Dual package (e.g. `@perfective/common`): `esmBuild` + `cjsBuild` + `tsDeclarations`
- ESM-only (e.g. `@perfective/eslint-config*`): `esmBuild` + `tsDeclarations` (ESLint is ESM-only)

Import subpaths (`@perfective/build/gulp`, `/babel`, `/jest`, `/prettier`, `/tsconfig.strict.json`).
The root barrel in `src/index.js` is unused by current consumers.

## Layout

- `src/**/*.js` — hand-written ESM source (this package is not TypeScript yet)
- `src/gulp/` — Gulp task factories for consumers
- `src/babel/` — `babelPluginImportExtension`, `babelPluginRequireExtension`
- `src/jest/`, `src/prettier/` — shareable configs
- `tsconfig/tsconfig.strict.json` — base strict TS config shipped as `@perfective/build/tsconfig.strict.json`
- `gulpfile.js` — builds **this** package: copy JS + generate `package.json`/`exports` into `dist/`
- `dist/` — publish artifact (`npm publish ./dist`); gitignored

Self-build does **not** run `typescript.esmBuild` / `cjsBuild`; those APIs are for downstream packages.
`gulpfile.js` copies sources, runs `subPackageJson` then `packageJson`, copies tsconfig/docs assets, runs Asciidoctor.

## Gulp API (`@perfective/build/gulp`)

- `clean`, `copy`, `file` (`createFile`, `createJsonFile`), `asciidoctor`
- `typescript.esmBuild()` — `module: esnext` → Babel → `.js`
- `typescript.cjsBuild()` — `module: commonjs` → Babel → rename to `.cjs`
- `typescript.tsDeclarations()` — `.d.ts` only (comments kept)
- `typescript.tsBuild()` — plain emit
- `packageJson.subPackageJson(scopeName, opts)` then `packageJson.packageJson(opts, overrides, extraExports)`

Default TS project file: `./tsconfig.build.json`. Default output: `./dist`.
Gulp overrides `module` per task; do not assume `tsconfig.strict.json`’s `module` matches the emit target.

## Documentation

- All documentation uses [semantic line breaks](https://sembr.org/): break on sense boundaries;
  keep each line ≤ 120 characters (URLs that cannot wrap may exceed that alone).
- Consumer docs: `README.adoc` (canonical), short `README.md` pointer.
  Do **not** edit them on feature/dependency commits.
  `main` on GitHub must stay consistent with the latest published package,
  so README changes belong only in the **Publish** commit
  (together with version bump and `CHANGELOG.adoc`).
- `AGENTS.md` / `ROADMAP.adoc` / `specs/**`: development process and design specs;
  update with the work that changes them. Do not copy them into `dist/`.
- Remaining doc gaps are listed in `ROADMAP.adoc` (apply to README at release time).

## Git and releases (this repo)

- Work on the `cursor` branch (maintainer rebases/cherry-picks as needed).
  Always commit completed work there.
  Never commit to `main`, force-push, tag, release, or `npm publish`.
- Backports only when needed: remote/local `vX.Y.x` (e.g. `v0.4.x`).
  CI also runs on those branches.
- One dependency change per commit.
  Verbs by **dependency** SemVer: `Patch` / `Update` / `Upgrade`.
- Changelog: consumer-relevant only
  (e.g. TypeScript, Prettier, Jest bumps for this package; not pure infra).
- Package SemVer while on `v0`: bump **minor** for breaking changes;
  **patch** for non-breaking.
  Moving to the next TypeScript line usually opens the next `@perfective/build` version.
- Maintainer release: `Publish vX.Y.Z` commit (includes `npm update` for peers)
  → wait CI → signed annotated tag (`git tag -s vX.Y.Z` + push the tag)
  → create the GitHub Release manually (so `publish.yaml` receives a human
  `release` event; Actions-created releases with `GITHUB_TOKEN` do not wake it).
  Prereleases are unused until ~v1.0
  (`next` npm tag remains wired for `prereleased` events).

## Renovate (dependency discovery)

Config: `renovate.json`.
Renovate opens **one PR per dependency** (no automerge).
It does not migrate configs.
`rangeStrategy` is `bump` so in-range updates also raise the pin in `package.json`
(not lockfile-only).
End-state design (controller, agents, squash atomicity): `specs/renovate.adoc`.

### Handling a Renovate PR

1. **Agent review** (required before merge) — catch policy misses Renovate will not:
    - Both `package.json` **and** the lockfile move when this repo pins that dependency
      (direct or peer).
      Lockfile-only while a pin stays on an older minor/patch is a defect
      (often wrong `rangeStrategy` or an outdated PR from before `bump`).
    - Choose the Perfective commit verb from the **dependency** SemVer:
      `Patch` / `Update` / `Upgrade`.
    - Read release notes (and security advisories) for every intervening version;
      map breaking changes to this repo.
    - Semantic updates (e.g. TypeScript majors): adapt `tsconfig*` / source as needed;
      do **not** edit README/CHANGELOG here.
    - **NEEDS HUMAN** must state exactly what a person should verify
      (versions/notes, config options, decisions) — not a vague “please review”.
    - **Configuration** section is required for tools with repo config surfaces
      (Jest, Prettier, TypeScript, ESLint / plugins, Babel, etc.):
      list note-called-out option changes, which in-repo files apply,
      and whether this PR already applied them or what is still open.
    - Allowed follow-up paths on the PR or `cursor`:
      `package.json`, lockfile, `tsconfig*`, `src/**`,
      `ROADMAP.adoc`, `AGENTS.md`, `renovate.json`.
2. **Land the change** — prefer squash-merge on GitHub,
   or recreate on `cursor` then merge.
   Do not amend Renovate’s commit on a branch Renovate still owns;
   add a follow-up commit if needed, then squash.
3. **Squash commit message** — replace Renovate’s title with Perfective style,
   e.g. `Update @babel/core to v7.29.6`
   (no `dependency` prefix, no `[SECURITY]` suffix).
   Put advisory links in the squash body if useful.
4. Dependency Dashboard is the backlog;
   use label `renovate-regenerate` to force Renovate to rebuild a branch.

## Catch-up order after this package

1. Publish `@perfective/build`
2. `@perfective/common` (re-patch build if needed)
3. `@perfective/eslint-config` → `eslint-config-angular` → `eslint-config-react`
4. Apply updated configs back into `ts.common`

## Verifying changes

After every change set, run:

```bash
npm run lint
```

Before considering work done, also run:

```bash
npm run lint:build
npm run dist
```

There are no tests here yet (tech debt).
After `dist`, link `./dist` into a consumer (`ts.common` or `eslint-config`) with `npm link`
and run that package’s `lint:build`, `test:build` (100% coverage), and `dist`.
