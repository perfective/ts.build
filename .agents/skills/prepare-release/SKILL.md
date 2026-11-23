---
name: prepare-release
description: >-
    Prepare the `Publish vX.Y.Z` commit for @perfective/build
    (version bump, CHANGELOG.adoc, README updates, ROADMAP.adoc)
    from the commits since the last release.
    Use only when the maintainer asks locally.
    On GitHub, a release issue runs publish-pr.yaml instead,
    including a later fix on the existing publish branch.
    It never tags, releases, or publishes.
---

# Prepare a release

Run this only on the maintainer's request, and only outside a GitHub release issue or its Publish PR.
A GitHub release is an open issue titled `Release @perfective/build vX.Y.Z` with the `release` label.
Adding the `claude` label runs `.github/workflows/publish-pr.yaml`,
which also continues on an existing `publish-vX.Y.Z` branch
(re-adding the label, or `@claude` on the Publish PR) with a fix-up commit on that PR.
The general Claude workflow skips the release issue and the Publish PR, so do not run this skill on either.
Tagging and `npm publish` stay with the maintainer: `publish.yaml` publishes to npm only
after the signed tag is pushed.
The maintainer creates the GitHub Release manually.

The result of a local run is one `Publish vX.Y.Z` commit on a `publish-vX.Y.Z` branch from `main`.
Do not use a `feature/` name: the workflows find a Publish PR from the `publish-vX.Y.Z` name
(see "Branch rules" in `AGENTS.md`).

## 1. Collect the changes

```bash
git describe --tags --abbrev=0 --match 'v*'
git log --reverse --format='%h %s%n%b' <last-tag>..HEAD
```

Group the commits:

- dependency updates (`Patch` / `Update` / `Upgrade`);
- task, preset, and export changes;
- documentation that consumers need (the changelog only when it is relevant to them).

Leave out CI, workflow, Renovate, `AGENTS.md`, and `ROADMAP.adoc` changes.

## 2. Choose the version

While on `v0`:

- **minor** (`v0.X+1.0`) when anything can break a consumer's build:
  a removed or changed export, a stricter preset or `tsconfig`, a peer dependency major or a new peer,
  or a dropped Node.js or TypeScript version;
- **patch** (`v0.X.Y+1`) otherwise.

When the maintainer already named the version, use that version.
When unsure, choose minor and say why in the report.
Moving to the next TypeScript line usually opens the next `@perfective/build` version.

## 3. Update the version and the lockfile

Skip this step when `package.json` is already at that version and `npm update` has already been run
(that is what `publish-pr.yaml` does before Claude starts). Do not change those two files further then.

Otherwise:

```bash
npm version <version> --no-git-tag-version
npm update
```

Check that `peerDependencies` ranges still match the installed versions.

## 4. Write the CHANGELOG

Add a `== vX.Y.Z` section at the top of `CHANGELOG.adoc`, following the existing sections
and "CHANGELOG phrasing" in `.agents/skills/update-dependency/references/decisions.md`:

- past tense, bullets that mirror the commit verbs;
- two blank lines between versions;
- only consumer-relevant changes.

## 5. Update the READMEs

Apply the README gaps listed in `ROADMAP.adoc` that the commits since the last tag address
to both `README.adoc` and `README.md`, and keep the two in sync
(including peer dependency ranges with `package.json`).
Use semantic line breaks. Leave a README as it is when nothing applies.

## 6. Update the roadmap

Remove or check off the `ROADMAP.adoc` items this release delivered.

## 7. Verify and commit

```bash
npm run lint
npm run lint:build
npm run dist
```

Commit as `Publish vX.Y.Z` with only the changed files among `package.json`, `package-lock.json`,
`CHANGELOG.adoc`, `README.adoc`, `README.md`, and `ROADMAP.adoc`.

## 8. Report the next steps

Stop after the commit. Do not tag, create a release, or publish to npm. Report:

1. Push the branch and open a pull request (or let `publish-pr.yaml` do that from the release issue).
2. After CI passes, squash-merge the Publish PR.
3. `git tag -s vX.Y.Z` and push the tag.
4. `publish.yaml` publishes `@perfective/build` to npm only.
5. The maintainer creates the GitHub Release for the tag manually.
