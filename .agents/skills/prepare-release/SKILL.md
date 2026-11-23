---
name: prepare-release
description: >-
    Prepare the `Publish vX.Y.Z` commit for @perfective/build
    from the commits since the last release:
    the version, CHANGELOG.adoc, the READMEs, and ROADMAP.adoc.
    Use this skill only when the maintainer asks for a local release commit.
    On GitHub, a release issue starts publish-pr.yaml instead,
    also for a later fix on the Publish branch.
    This skill does not tag, release, or publish.
---

# Prepare a release

Use this skill only when the maintainer asks for a local release commit.
Do not use it on a GitHub release issue or on a Publish PR.

On GitHub, the release process is different:

- A release issue is an open issue with the title `Release @perfective/build vX.Y.Z`.
- When the maintainer adds the `claude` label to that issue, `.github/workflows/publish-pr.yaml` runs.
- To continue on an existing `publish-vX.Y.Z` branch, the maintainer does one of these steps:
    - Remove the `claude` label from the release issue, and then add it again.
      The workflow starts only when the label is added.
      If the label is already on the issue, the workflow does not start.
    - Post `@claude` on the Publish PR.

    Then the workflow adds a fix commit to that PR.

- The general Claude workflow skips the Publish PR,
  and it skips an issue that has the `release` label or a `Release @perfective/build v` title.

The maintainer does these steps, not the agent:

- Sign and push the tag.
  After the tag push, `publish.yaml` publishes the package to npm.
- Make the GitHub Release.

A local run makes one `Publish vX.Y.Z` commit on a `publish-vX.Y.Z` branch from `main`.
Do not use a `feature/` name for this branch.
The workflows find a Publish PR from the `publish-vX.Y.Z` name.
For more information, refer to "Branch rules" in `AGENTS.md`.

## 1. Collect the changes

Find the last tag and the commits after it:

```bash
git describe --tags --abbrev=0 --match 'v*'
git log --reverse --format='%h %s%n%b' <last-tag>..HEAD
```

Put the commits into these groups:

- Dependency updates (`Patch`, `Update`, or `Upgrade`).
- Changes to tasks, presets, and exports.
- Documentation changes that consumers need.

Do not include changes to CI, workflows, Renovate, `AGENTS.md`, or `ROADMAP.adoc`.

## 2. Select the version

While the package is at `v0`, use these rules:

- Use a minor version (`v0.X+1.0`) if a change can break the build of a consumer.
  Examples:
    - An export is removed or changed.
    - A preset or the `tsconfig` is stricter.
    - A peer dependency gets a new major version, or a new peer dependency is added.
    - A Node.js version or a TypeScript version is no longer supported.
- Use a patch version (`v0.X.Y+1`) for all other changes.

If the maintainer gave the version, use that version.
If you are not sure, use a minor version and give the reason in the report.
A change to a new TypeScript line usually starts the next `@perfective/build` version.

## 3. Update the version and the lockfile

Skip this step if both of these conditions are true:

- `package.json` already has the new version.
- `npm update` already ran.

`publish-pr.yaml` does these two steps before Claude starts.
In that case, do not change `package.json` or `package-lock.json` again.

Otherwise, run these commands:

```bash
npm version <version> --no-git-tag-version
npm update
```

Make sure that the `peerDependencies` ranges agree with the installed versions.

## 4. Write the changelog

Add a `== vX.Y.Z` section at the top of `CHANGELOG.adoc`.
Use the same format as the existing sections.
Also obey "CHANGELOG phrasing" in `.agents/skills/update-dependency/references/decisions.md`:

- Write the bullets in the past tense.
- Use the same verb as the commit.
- Put two blank lines between versions.
- Include only changes that affect consumers.

## 5. Update the READMEs

`ROADMAP.adoc` lists the README changes that are pending.
For each of these changes that the new commits deliver, update both `README.adoc` and `README.md`.

- Keep `README.adoc` and `README.md` in sync with each other.
- Keep the peer dependency ranges in both READMEs in sync with `package.json`.
- Use semantic line breaks.
- If no change applies to a README, do not change it.

## 6. Update the roadmap

Remove the `ROADMAP.adoc` items that this release delivers, or mark them as done.

## 7. Verify and commit

Run these commands:

```bash
npm run lint
npm run lint:build
npm run dist
```

All commands must pass.

Commit the changes with the title `Publish vX.Y.Z`.
The commit can change only these files:

- `package.json`
- `package-lock.json`
- `CHANGELOG.adoc`
- `README.adoc`
- `README.md`
- `ROADMAP.adoc`

## 8. Report the next steps

Stop after the commit.
Do not make a tag, do not make a release, and do not publish to npm.

Report these next steps to the maintainer:

1.  Push the branch and open a pull request.
    Alternatively, let `publish-pr.yaml` do this from the release issue.
2.  After CI passes, squash-merge the Publish PR.
3.  Sign the tag with `git tag -s vX.Y.Z`, and push the tag.
4.  `publish.yaml` publishes `@perfective/build` to npm.
5.  Make the GitHub Release for the tag manually.
