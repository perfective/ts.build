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

- Consumer docs: `README.adoc` (canonical), short `README.md` pointer.
  Update them in the **Publish** commit so `main` matches what npm ships.
- `AGENTS.md` / `ROADMAP.adoc`: development process only; update with the work that changes them.
  Do not copy them into `dist/`.
- Docs currently lag the Gulp API; aligning them is the first planned task (see `ROADMAP.adoc`).

## Git and releases (this repo)

- Work on the `cursor` branch (maintainer rebases/cherry-picks as needed). Always commit completed work there.
  Never commit to `main`, force-push, tag, release, or `npm publish`.
- Backports only when needed: remote/local `vX.Y.x` (e.g. `v0.4.x`). CI also runs on those branches.
- One dependency change per commit. Verbs by **dependency** SemVer: `Patch` / `Update` / `Upgrade`.
- Changelog: consumer-relevant only (e.g. TypeScript, Prettier, Jest bumps for this package; not pure infra).
- Package SemVer while on `v0`: bump **minor** for breaking changes; **patch** for non-breaking.
  Moving to the next TypeScript line usually opens the next `@perfective/build` version.
- Maintainer release: `Publish vX.Y.Z` commit (includes `npm update` for peers) → wait CI → signed annotated tag → GitHub Release → publish workflow.
  Prereleases are unused until ~v1.0 (`next` npm tag remains wired for `prereleased` events).

## Catch-up order after this package

1. Publish `@perfective/build`
2. `@perfective/common` (re-patch build if needed)
3. `@perfective/eslint-config` → `eslint-config-angular` → `eslint-config-react`
4. Apply updated configs back into `ts.common`
5. `ts.ai` later, after main packages are current

## Verifying changes

```bash
npm run lint:build
npm run dist
```

There are no tests here yet (tech debt). After `dist`, link `./dist` into a consumer (`ts.common` or `eslint-config`) with `npm link` and run that package’s `lint:build`, `test:build` (100% coverage), and `dist`.
