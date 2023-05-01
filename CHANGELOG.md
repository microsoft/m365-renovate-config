# @microsoft/m365-renovate-config

## 2.0.0

[Compare source](https://github.com/microsoft/m365-renovate-config/compare/v1.8.13...v2.0.0) - May 1, 2023, 3:44 PM PDT

### Major Changes

- [`9a9f133`](https://github.com/microsoft/m365-renovate-config/commit/9a9f133120e810860e8c1c26f361e9a157395adb) - `m365-renovate-config` version 2 makes the default preset a bit more opinionated based on testing, streamlines preset naming, and updates settings to better reflect recent improvements in Renovate. (Thanks [@ecraig12345](https://github.com/ecraig12345)!)

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

## 1.8.13

[Compare source](https://github.com/microsoft/m365-renovate-config/compare/v1.8.12...v1.8.13) - April 28, 2023, 4:07 PM PDT

### Patch Changes

- [`077edb3`](https://github.com/microsoft/m365-renovate-config/commit/077edb3d8a35f9fa0405b29328dfbec9adc01873) - Testing new release setup (Thanks [@ecraig12345](https://github.com/ecraig12345)!)

## 1.8.12

[Compare source](https://github.com/microsoft/m365-renovate-config/compare/v1.8.11...v1.8.12) - April 27, 2023 at 9:17 PM GMT-7

### Patch Changes

- [`0a8f68e`](https://github.com/microsoft/m365-renovate-config/commit/0a8f68ef2fa4266598622aacfaecc854b37bc550) - More release updates (Thanks [@ecraig12345](https://github.com/ecraig12345)!)

## 1.8.11

[Compare source](https://github.com/microsoft/m365-renovate-config/compare/v1.8.10...v1.8.11) - April 27, 2023 at 8:53 PM GMT-7

### Patch Changes

- [`433d88d`](https://github.com/microsoft/m365-renovate-config/commit/433d88d8e56b7980351fa6172d37946ee04efd3c) - More changelog fixes (Thanks [@ecraig12345](https://github.com/ecraig12345)!)

## 1.8.10

[Compare source](https://github.com/microsoft/m365-renovate-config/compare/v1.8.9...v1.8.10) - April 27, 2023 at 8:42 PM GMT-7

### Patch Changes

- [`674a4ca`](https://github.com/microsoft/m365-renovate-config/commit/674a4ca31f32339ffde8596a86d3c497f14bfd8a) - Changeset fixes (Thanks [@ecraig12345](https://github.com/ecraig12345)!)

## 1.8.9

[Compare source](https://github.com/microsoft/m365-renovate-config/compare/v1.8.8...v1.8.9) - April 27, 2023 at 8:38 PM GMT-7

### Patch Changes

- [`c33c229`](https://github.com/microsoft/m365-renovate-config/commit/c33c2292d8321ab27602d9a2301255870ad4af97) - Release using changesets (Thanks [@ecraig12345](https://github.com/ecraig12345)!)

## 1.8.8

[Compare source](https://github.com/microsoft/m365-renovate-config/compare/v1.8.7...v1.8.8) (2023-04-19)

### Bug Fixes

- include more dep types in groupFixtures ([ec07661](https://github.com/microsoft/m365-renovate-config/commit/ec07661b7759006165acef982b9cef2182c52fbc))

## [1.8.7](https://github.com/microsoft/m365-renovate-config/compare/v1.8.6...v1.8.7) (2023-04-13)

### Bug Fixes

- remove renovate from scheduleNoisy ([198e004](https://github.com/microsoft/m365-renovate-config/commit/198e00442ecf1ae4a7ca812b04ebd93d896ddf40))

## [1.8.6](https://github.com/microsoft/m365-renovate-config/compare/v1.8.5...v1.8.6) (2023-03-10)

### Bug Fixes

- Reduce scheduled update frequency ([a99d3d9](https://github.com/microsoft/m365-renovate-config/commit/a99d3d92c939cca155ee553ef55523a24549bea0))
- use valid schedules ([2bd4e18](https://github.com/microsoft/m365-renovate-config/commit/2bd4e18dab011d4116956ff199213c946b841ceb))

## [1.8.5](https://github.com/microsoft/m365-renovate-config/compare/v1.8.4...v1.8.5) (2023-02-21)

### Bug Fixes

- schedule eslint-related updates ([#51](https://github.com/microsoft/m365-renovate-config/issues/51)) ([410f3d5](https://github.com/microsoft/m365-renovate-config/commit/410f3d548c8b1224e9aa5bfe408f4b56f5a52406))

## [1.8.4](https://github.com/microsoft/m365-renovate-config/compare/v1.8.3...v1.8.4) (2022-09-21)

### Bug Fixes

- add `@microsoft/api-extractor` to noisy packages rule ([99ac22c](https://github.com/microsoft/m365-renovate-config/commit/99ac22c68d0843c4275f3eff98f9a284d1699354))

## [1.8.3](https://github.com/microsoft/m365-renovate-config/compare/v1.8.2...v1.8.3) (2022-09-16)

### Bug Fixes

- **disableEsmVersions:** add ansi-regex ([9e8c1f4](https://github.com/microsoft/m365-renovate-config/commit/9e8c1f4a89ff0704b62d52c37587ce6d71e108dd))

## [1.8.2](https://github.com/microsoft/m365-renovate-config/compare/v1.8.1...v1.8.2) (2022-09-13)

### Bug Fixes

- **default:** run schedules relative to pacific time ([89616d0](https://github.com/microsoft/m365-renovate-config/commit/89616d0d9e7071dd2e8d83a4f36361c4831483ee))

## [1.8.1](https://github.com/microsoft/m365-renovate-config/compare/v1.8.0...v1.8.1) (2022-09-13)

### Bug Fixes

- **groupTypes:** only run in early morning ([3e59a57](https://github.com/microsoft/m365-renovate-config/commit/3e59a57766ca3b6b222e2b04d2bbe3926062a3ca))

# [1.8.0](https://github.com/microsoft/m365-renovate-config/compare/v1.7.3...v1.8.0) (2022-09-12)

### Features

- add groupD3 ([bf79e31](https://github.com/microsoft/m365-renovate-config/commit/bf79e31cf37d635cbce129fb2eda834cbfe4a0fc))

## [1.7.3](https://github.com/microsoft/m365-renovate-config/compare/v1.7.2...v1.7.3) (2022-09-12)

### Bug Fixes

- **disableEsmVersions:** add pretty-bytes ([ccbc878](https://github.com/microsoft/m365-renovate-config/commit/ccbc8785f305c26353433749cf4d184eba07f5f3))

## [1.7.2](https://github.com/microsoft/m365-renovate-config/compare/v1.7.1...v1.7.2) (2022-09-10)

### Bug Fixes

- **groupNodeMajor:** remove broken engines rule ([5875670](https://github.com/microsoft/m365-renovate-config/commit/58756708c475084ae342ebf8fa61a03dca3a5712))

## [1.7.1](https://github.com/microsoft/m365-renovate-config/compare/v1.7.0...v1.7.1) (2022-09-10)

### Bug Fixes

- **disableEsmVersions:** add supports-color ([39cfa94](https://github.com/microsoft/m365-renovate-config/commit/39cfa94cb92e59aa96385009dba8f6f0e58c993f))
- **groupNodeMajor:** bump node version in engines ([f22bee7](https://github.com/microsoft/m365-renovate-config/commit/f22bee72c017dc9853ed6924a58ee17f0efbaef7))

# [1.7.0](https://github.com/microsoft/m365-renovate-config/compare/v1.6.0...v1.7.0) (2022-09-09)

### Bug Fixes

- **restrictNode:** add more ways of specifying node version ([5f138e8](https://github.com/microsoft/m365-renovate-config/commit/5f138e88b93a432c126b1706c5e86bdb8beb90e8))

### Features

- add groupNodeMajor ([92a8bdc](https://github.com/microsoft/m365-renovate-config/commit/92a8bdce1826d75cbe1e99865651d4558e33b4db))

# [1.6.0](https://github.com/microsoft/m365-renovate-config/compare/v1.5.0...v1.6.0) (2022-09-09)

### Features

- add disableEsmVersions ([bfbe09f](https://github.com/microsoft/m365-renovate-config/commit/bfbe09f06da192f7c89a56ada6c6faeb1fa728f3))

# [1.5.0](https://github.com/microsoft/m365-renovate-config/compare/v1.4.2...v1.5.0) (2022-09-09)

### Bug Fixes

- add groupYargs file ([8ff7423](https://github.com/microsoft/m365-renovate-config/commit/8ff7423055aecbfdc91e574e3c38a3437a99ad33))

### Features

- add groupYargs ([9eb24ec](https://github.com/microsoft/m365-renovate-config/commit/9eb24ec24cc13fa223ec58a0f0695441b67628a0))

## [1.4.2](https://github.com/microsoft/m365-renovate-config/compare/v1.4.1...v1.4.2) (2022-09-09)

### Bug Fixes

- clarify groupTypes group name ([5384f40](https://github.com/microsoft/m365-renovate-config/commit/5384f40bf6d0b6f6053ecb258a3e02707b149dc2))
- exclude other grouped packages from groupTypes ([41efe17](https://github.com/microsoft/m365-renovate-config/commit/41efe175c1ef8923ff00a8e8e317120a872624f7))

## [1.4.1](https://github.com/microsoft/m365-renovate-config/compare/v1.4.0...v1.4.1) (2022-09-09)

### Bug Fixes

- exclude 0.x from groupTypes ([f0f3a1b](https://github.com/microsoft/m365-renovate-config/commit/f0f3a1b5fc2a8d7b37650834a965edd970d10a06))

# [1.4.0](https://github.com/microsoft/m365-renovate-config/compare/v1.3.0...v1.4.0) (2022-09-09)

### Features

- add restrictNode ([538ba0c](https://github.com/microsoft/m365-renovate-config/commit/538ba0c423590cf9b8ac4679381e0aad75df8937))

# [1.3.0](https://github.com/microsoft/m365-renovate-config/compare/v1.2.0...v1.3.0) (2022-09-09)

### Features

- add groupTypes ([f1eba61](https://github.com/microsoft/m365-renovate-config/commit/f1eba6144a28d0620d455b10164fef26c746e652))

# [1.2.0](https://github.com/microsoft/m365-renovate-config/compare/v1.1.0...v1.2.0) (2022-09-06)

### Features

- add beachballLibraryVerbose ([12fa211](https://github.com/microsoft/m365-renovate-config/commit/12fa2111e7ced8fb7bb6431d737b76c147c2906e))

# [1.1.0](https://github.com/microsoft/m365-renovate-config/compare/v1.0.4...v1.1.0) (2022-09-01)

### Bug Fixes

- **keepFresh:** remove unnecessary updateNotScheduled setting ([480d161](https://github.com/microsoft/m365-renovate-config/commit/480d161a68a1d07cca8997c2ab0089f55a35c175))

### Features

- add scheduleNoisy preset ([f880ddb](https://github.com/microsoft/m365-renovate-config/commit/f880ddbd965f9b304cbf91939408c12b4f71fbae))

## [1.0.4](https://github.com/microsoft/m365-renovate-config/compare/v1.0.3...v1.0.4) (2022-09-01)

### Bug Fixes

- **keepFresh:** allow wider schedule for lock file updates ([22c4317](https://github.com/microsoft/m365-renovate-config/commit/22c4317c0a9dcb0e07d32b098c798c2dee8e68cf))

## [1.0.3](https://github.com/microsoft/m365-renovate-config/compare/v1.0.2...v1.0.3) (2022-09-01)

### Bug Fixes

- use correct option name yarnDedupeFewer in keepFresh ([03fdab8](https://github.com/microsoft/m365-renovate-config/commit/03fdab8cb9e89b4692930f543863f83c81a9b767))

## [1.0.2](https://github.com/microsoft/m365-renovate-config/compare/v1.0.1...v1.0.2) (2022-09-01)

### Bug Fixes

- update keepFresh to use yarnDedupeFewest ([a166eef](https://github.com/microsoft/m365-renovate-config/commit/a166eeffd6f935c7daddb29ee4e7ec87268ef5e5))

## [1.0.1](https://github.com/microsoft/m365-renovate-config/compare/v1.0.0...v1.0.1) (2022-08-25)

### Bug Fixes

- update react monorepo config to extend default group ([139741f](https://github.com/microsoft/m365-renovate-config/commit/139741ff745005d68bc851569498a58e9fbc1a6b))

# 1.0.0 (2022-08-18)

### Features

- Add config and build files ([3c698d3](https://github.com/microsoft/m365-renovate-config/commit/3c698d3d19de488809c631e9057d024ebec87e88))
