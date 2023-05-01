---
'@microsoft/m365-renovate-config': major
---

`m365-renovate-config` version 2 makes the default preset a bit more opinionated based on testing, streamlines preset naming, and updates settings to better reflect recent improvements in Renovate.

**These changes have been picked up automatically** unless you specified a ref (e.g. `#v1`) as part of the preset names in your `extends` config.

Note: `<m365>` in preset names referenced below is a shorthand for `github>microsoft/m365-renovate-config`. This is just for readability of the readme and will _**not**_ work in actual configs (you must use the full repo prefix).

#### Default preset changes

The default preset (`github>microsoft/m365-renovate-config`) is now a bit more "opinionated" and includes the settings that were previously defined in `<m365>:libraryRecommended`. These settings can be disabled either individually or using the `excludePresets` option.

The dependency version update strategy (`rangeStrategy`) has also changed as described below.

#### Major preset changes and deprecations

Deprecated presets still exist for now to avoid immediate breaks in consuming repos, but will be removed in version 3.

- `<m365>:libraryRecommended` is deprecated in favor of this repo's default preset.
- `<m365>:beachballLibraryRecommended` is renamed to `<m365>:beachball`.

#### Dependency version update strategy

Previously, Renovate's `config:base` would pin `devDependencies` and possibly also `dependencies` to exact versions. Pinning `dependencies` is not desirable for libraries, so `v1` of `m365-renovate-config` omitted any pinning behavior in its default preset, and enabled pinning _only_ `devDependencies` in its `<m365>:libraryRecommended` preset.

A [recent Renovate update](https://docs.renovatebot.com/release-notes-for-major-versions/#version-35) included greatly expanded support for doing in-range updates (e.g. updating the installed version for `"foo": "^1.0.0"` from `1.1.0` to `1.2.0`) by changing only the lockfile. Therefore, Renovate's default [`rangeStrategy: "auto"`](https://docs.renovatebot.com/configuration-options/#rangestrategy) was changed to do lockfile-only updates when possible (instead of pinning or replacing versions), and `config:base` no longer includes any pinning of versions.

Since the lockfile-only updates are likely a good strategy for `devDependencies` in most repos, `m365-renovate-config`'s default preset (which supersedes `<m365>:libraryRecommended`) has been updated as follows:

- Use `rangeStrategy: "replace"` for `dependencies` (production) to reduce the chance of breaks for library consumers.
- Remove overrides (use `rangeStrategy: "auto"`) for other dependency types.

To restore the previous behavior of `<m365>:libraryRecommended`, extend the Renovate preset [`:pinOnlyDevDependencies`](https://docs.renovatebot.com/presets-default/#pinonlydevdependencies).
