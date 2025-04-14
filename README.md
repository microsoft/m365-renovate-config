# m365-renovate-config

Shared Renovate presets for use in M365 projects.

## Useful links

- [All configuration options](https://docs.renovatebot.com/configuration-options/)
- [`packageRules` configuration](https://docs.renovatebot.com/configuration-options/#packagerules) for applying custom options to individual packages or groups
- [Built-in presets](https://docs.renovatebot.com/presets-default/) (see also other pages in the same section)
- [Preset definitions](https://github.com/renovatebot/renovate/tree/main/lib/config/presets/internal)

## Using presets

There are a few different ways to reference presets from this repo in your Renovate config:

```jsonc
{
  "extends": [
    // Use the default preset
    "github>microsoft/m365-renovate-config",

    // Use a specific preset
    "github>microsoft/m365-renovate-config:somePreset",

    // Use a specific version of a preset
    "github>microsoft/m365-renovate-config:somePreset#v2.1.0",

    // Use a major version of a preset (see note below)
    "github>microsoft/m365-renovate-config:somePreset#v2",
  ],
}
```

Note that **semver ranges are not supported for preset versions** because Renovate only supports resolving presets to specific refs (tags or branches). The supported refs are:

- Major version branches: `v1`, `v2`
- Tags listed on the [Releases page](https://github.com/microsoft/m365-renovate-config/releases)

## Version 2 breaking changes

`m365-renovate-config` version 2 makes the default preset a bit more opinionated based on testing, streamlines preset naming, and updates settings to better reflect recent improvements in Renovate.

**These changes have been picked up automatically** unless you specified a ref (e.g. `#v1`) as part of the preset names in your `extends` config.

Note: `<m365>` in preset names referenced below is a shorthand for `github>microsoft/m365-renovate-config`. This is just for readability of the readme and will _**not**_ work in actual configs (you must use the full repo prefix).

### Default preset changes

The default preset (`github>microsoft/m365-renovate-config`) is now a bit more "opinionated" and includes most settings that were previously defined in `<m365>:libraryRecommended`. These settings can be disabled either individually or using the `excludePresets` option.

The dependency version update strategy (`rangeStrategy`) has also changed as described below.

### Major preset changes and deprecations

Deprecated presets still exist for now to avoid immediate breaks in consuming repos, but will be removed in version 3.

- `<m365>:libraryRecommended` is deprecated in favor of this repo's default preset.
- `<m365>:beachballLibraryRecommended` is renamed to `<m365>:beachball`.

### Dependency version update strategy

Previously, Renovate's `config:base` ([now `config:recommended`](https://docs.renovatebot.com/presets-config/#configrecommended)) would pin `devDependencies` and possibly also `dependencies` to exact versions. Pinning `dependencies` is usually not desirable for libraries, so `v1` of `m365-renovate-config` omitted any pinning behavior in its default preset, and enabled pinning _only_ `devDependencies` in its `<m365>:libraryRecommended` preset.

A [recent Renovate update](https://docs.renovatebot.com/release-notes-for-major-versions/#version-35) included greatly expanded support for doing in-range updates (e.g. updating the installed version for `"foo": "^1.0.0"` from `1.1.0` to `1.2.0`) by changing only the lockfile. Therefore, Renovate's default [`rangeStrategy: "auto"`](https://docs.renovatebot.com/configuration-options/#rangestrategy) was changed to do lockfile-only updates when possible (instead of pinning or replacing versions), and `config:recommended` no longer includes any pinning of versions.

Since the lockfile-only updates are likely a good strategy in many cases, `m365-renovate-config`'s default preset (which supersedes `<m365>:libraryRecommended`) has been updated to remove `rangeStrategy` overrides and extend `config:recommended`.

Notes on pinning behavior:

- For any versions that are currently pinned or that you manually pin, Renovate updates will bump to a new pinned version.
  - If you'd like to unpin your dev deps, use [`better-deps`](https://www.npmjs.com/package/better-deps): `npx better-deps unpin-dev-deps`
- If you prefer to restore the previous behavior of pinning _all_ `devDependencies`, extend the Renovate preset [`:pinOnlyDevDependencies`](https://docs.renovatebot.com/presets-default/#pinonlydevdependencies).

## Presets in this repo

<!--
Most content in this section is generated by scripts/updateReadme.js.

The preset's primary description should be defined and edited in its .json file.

In this section, ONLY edit between "extra content" marker comments!
-->

<!-- start presets TOC -->

- [Full config presets](#full-config-presets)
  - [default](#default)
  - [beachball](#beachball)
- [Grouping presets](#grouping-presets)
  - [groupMore](#groupmore)
  - [groupD3](#groupd3)
  - [groupEslint](#groupeslint)
  - [groupFixtureUpdates](#groupfixtureupdates)
  - [groupFluent](#groupfluent)
  - [groupJest](#groupjest)
  - [groupLageBackfill](#grouplagebackfill)
  - [groupNodeMajor](#groupnodemajor)
  - [groupReact](#groupreact)
  - [groupRollup](#grouprollup)
  - [groupTypes](#grouptypes)
  - [groupYargs](#groupyargs)
- [Compatibility presets](#compatibility-presets)
  - [disableEsmVersions](#disableesmversions)
  - [restrictNode](#restrictnodearg0)
- [Freshness and noise reduction presets](#freshness-and-noise-reduction-presets)
  - [keepFresh](#keepfresh)
  - [minorDependencyUpdates](#minordependencyupdates)
  - [scheduleNoisy](#schedulenoisy)
- [Other presets](#other-presets)
  - [automergeDevLock](#automergedevlock)
  - [automergeTypes](#automergetypes)
  - [beachballPostUpgrade](#beachballpostupgrade)
  - [dependencyDashboardMajor](#dependencydashboardmajor)
  - [newConfigWarningIssue](#newconfigwarningissue)
  - [pinActions](#pinactions)
  <!-- end presets TOC -->

<!-- start presets -->

### Full config presets

#### `default`

Recommended config which is intended to be appropriate for most projects.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "extends": [
    "config:recommended",
    "github>microsoft/m365-renovate-config:dependencyDashboardMajor#v2",
    "github>microsoft/m365-renovate-config:groupReact#v2",
    "github>microsoft/m365-renovate-config:newConfigWarningIssue#v2",
    "github>microsoft/m365-renovate-config:pinActions#v2"
  ],
  "prConcurrentLimit": 10,
  "prHourlyLimit": 2,
  "printConfig": true,
  "timezone": "America/Los_Angeles",
  "vulnerabilityAlerts": {
    "enabled": true
  },
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "commitMessageTopic": "devDependency {{{depName}}}"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This preset extends Renovate's [`config:recommended`](https://docs.renovatebot.com/presets-config/#configrecommended), which enables the following:

- [`:ignoreModulesAndTests`](https://docs.renovatebot.com/presets-default/#ignoremodulesandtests): Ignore packages under `node_modules` or common test/fixture directory names
- [`:semanticPrefixFixDepsChoreOthers`](https://docs.renovatebot.com/presets-default/#semanticprefixfixdepschoreothers): If the repo uses semantic commits, Renovate will use `fix` for dependencies and `chore` for others
- [`group:monorepos`](https://docs.renovatebot.com/presets-group/#groupmonorepos): Group known monorepos
- [`group:recommended`](https://docs.renovatebot.com/presets-group/#grouprecommended): Other known groupings (mostly not relevant for node)
- [`replacements:all`](https://docs.renovatebot.com/presets-replacements/): Replace renamed packages
- [`workarounds:all`](https://docs.renovatebot.com/presets-workarounds/#workaroundsall): Workarounds for known problems with packages

Extended presets from this repo:

- [`groupReact`](#groupreact): Group React-related packages and types
- [`newConfigWarningIssue`](#newconfigwarningissue): Create a new issue every time there's a config warning (not supported for Azure DevOps)
- [`dependencyDashboardMajor`](#dependencydashboardmajor): Require dependency dashboard approval for major upgrades (not supported for Azure DevOps)

Other settings:

- PR limits (`prHourlyLimit` and `prConcurrentLimit`): Prevent Renovate from creating an overwhelming number of PRs all at once. It's _highly encouraged_ to adjust these in your repo to fit your team's needs!
- `printConfig`: Log the final resolved config to make debugging easier
- `timezone`: Run schedules relative to Pacific time, since many M365 repos are based in that time zone. See the [time zone list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for other options.
- `vulnerabilityAlerts`: Enable PRs to address security vulnerabilities. Note that this **only** works for GitHub and currently is **only** able to update direct dependencies (except in repos using `npm` 6 or older).
- For `devDependencies`: Use "devDependencies" in commit messages (instead of the default "dependencies") to be clearer about what is being modified
<!-- end extra content -->

---

#### `beachball`

Recommended config for library repos which use Beachball for publishing.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "extends": [
    "github>microsoft/m365-renovate-config#v2",
    "github>microsoft/m365-renovate-config:beachballPostUpgrade#v2"
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This is a full config preset which extends the [default preset](#default) and adds [`beachballPostUpgrade`](#beachballpostupgrade) to generate appropriate change files after upgrades:

- Change type `none` for updating `devDependencies`
- Change type `patch` for all other changes

These change types will be correct the majority of the time, but if a different change type is appropriate, you can always edit the change file in the PR before it merges.

<!-- end extra content -->

---

### Grouping presets

#### `groupMore`

Apply all the groupings from this repo (except groupTypes).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "extends": [
    "group:monorepos",
    "group:recommended",
    "github>microsoft/m365-renovate-config:groupD3#v2",
    "github>microsoft/m365-renovate-config:groupEslint#v2",
    "github>microsoft/m365-renovate-config:groupFixtureUpdates#v2",
    "github>microsoft/m365-renovate-config:groupFluent#v2",
    "github>microsoft/m365-renovate-config:groupJest#v2",
    "github>microsoft/m365-renovate-config:groupLageBackfill#v2",
    "github>microsoft/m365-renovate-config:groupNodeMajor#v2",
    "github>microsoft/m365-renovate-config:groupReact#v2",
    "github>microsoft/m365-renovate-config:groupRollup#v2",
    "github>microsoft/m365-renovate-config:groupYargs#v2"
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

To use this preset but disable an individual grouping, add its name to the `ignorePresets` array.

<!-- end extra content -->

---

#### `groupD3`

Group D3 updates.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "D3 packages",
      "matchPackageNames": ["d3-*", "@types/d3-*"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

<!-- end extra content -->

---

#### `groupEslint`

Group and schedule all eslint-related updates.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "eslint packages",
      "matchPackageNames": ["/eslint/", "!@typecript-eslint/*"],
      "schedule": ["before 5am on the 8th and 22nd day of the month"]
    },
    {
      "groupName": "typescript-eslint monorepo",
      "matchSourceUrls": ["https://github.com/typescript-eslint/typescript-eslint"],
      "schedule": ["before 5am on the 8th and 22nd day of the month"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

<!-- end extra content -->

---

#### `groupFixtureUpdates`

Group, schedule, and auto-merge all dependency updates in `__fixtures__` sub-folders.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "ignorePresets": [":ignoreModulesAndTests"],
  "ignorePaths": [
    "**/node_modules/**",
    "**/bower_components/**",
    "**/vendor/**",
    "**/examples/**",
    "**/__tests__/**",
    "**/test/**",
    "**/tests/**"
  ],
  "packageRules": [
    {
      "groupName": "fixture dependencies",
      "schedule": ["before 5am on the 1st and 15th day of the month"],
      "matchFileNames": ["**/__fixtures__/**"],
      "matchPackageNames": ["*"],
      "matchDepTypes": [
        "dependencies",
        "devDependencies",
        "engines",
        "optionalDependencies",
        "overrides",
        "packageManager",
        "peerDependencies",
        "resolutions"
      ],
      "major": {
        "dependencyDashboardApproval": false
      },
      "commitMessagePrefix": "[fixtures]",
      "commitMessageExtra": "",
      "automerge": true,
      "platformAutomerge": true
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

The motivation for this is to reduce false positive Dependabot vulnerability alerts coming from test fixtures, since [Dependabot has no way to ignore folders](https://github.com/dependabot/dependabot-core/issues/4364). The alerts are likely not meaningful for test fixtures, but dismissing them is extra work, and leaving them sitting creates noise and makes it harder to notice meaningful alerts.

This preset works by disabling Renovate's [`:ignoreModulesAndTests` preset](https://docs.renovatebot.com/presets-default/#ignoremodulesandtests), ignoring most of the same folders, and then creating a group encompassing all updates to all deps from `package.json` files within the `__fixtures__` folder.

Updates will occur once daily (to reduce noise) and will only be auto-merged if status checks pass. For updates only affecting fixtures, it should be safe to assume that if the tests using the fixture pass, it should be safe to auto-merge. However, in repos requiring a minimum number of reviews, the PR will still need to be manually reviewed.

Note that this will still make separate PRs for major and non-major updates unless `separateMajorMinor` is set to false. (You can use a custom `packageRules` entry with the same `groupName` to do this.) Vulnerability update PRs may also be created separately and immediately.

To customize this rule's behavior for individual packages, you can add entries to `packageRules` in your repo. For example:

- Exclude individual packages: `{ "groupName": "fixture dependencies", "matchPackageNames": ["!foo"] }` (or other [exclusion options](https://docs.renovatebot.com/configuration-options/#matchrepositories))
- Limit the allowed versions for a specific package: `{ "matchPackageNames": ["foo"], "allowedVersions": "<6.0.0 }`
<!-- end extra content -->

---

#### `groupFluent`

Group Fluent UI and related package updates.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "Fluent UI React v9 packages",
      "matchPackageNames": ["@fluentui/*"],
      "matchCurrentVersion": ">=9.0.0-alpha.0"
    },
    {
      "groupName": "Fluent UI React v9 packages",
      "matchPackageNames": ["@griffel/*"]
    },
    {
      "groupName": "Fluent UI React v8 packages",
      "matchCurrentVersion": "/^[1234568]\\./",
      "matchPackageNames": [
        "@fluentui/*",
        "!@fluentui/eslint-plugin",
        "!@fluentui/react-conformance",
        "!@fluentui/react-teams"
      ]
    },
    {
      "groupName": "Fluent UI React v8 packages",
      "matchPackageNames": ["@fluentui/react-cards"]
    },
    {
      "groupName": "Fluent UI React Northstar packages",
      "matchCurrentVersion": "0.x",
      "matchPackageNames": [
        "@fluentui/*",
        "!@fluentui/eslint-plugin",
        "!@fluentui/react-cards",
        "!@fluentui/react-conformance",
        "!@fluentui/public-docsite-setup"
      ]
    },
    {
      "groupName": "Fabric packages",
      "matchPackageNames": ["office-ui-fabric-react", "@uifabric/*"]
    },
    {
      "groupName": "Fabric packages",
      "matchPackageNames": ["@fluentui/react"],
      "matchCurrentVersion": "^7.0.0"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This config creates the following groups:

- `Fluent UI React v8 packages`: Any packages corresponding to `@fluentui/react` version 8
- `Fluent UI React v9 packages`: Any packages corresponding to `@fluentui/react-components` version 9
- `Fluent UI React Northstar packages`: Any packages corresponding to `@fluentui/react-northstar`
- `Fabric packages`: Any packages corresponding to `office-ui-fabric-react` or `@fluentui/react` 7 or earlier

If any packages are mis-categorized, please file an issue.

<!-- end extra content -->

---

#### `groupJest`

Group and schedule jest, ts-jest, jest types, and related packages.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "ignorePresets": [
    "monorepo:jest",
    "group:jestMonorepo",
    "group:jestPlusTypes",
    "group:jestPlusTsJest"
  ],
  "packageRules": [
    {
      "groupName": "Jest packages",
      "matchSourceUrls": ["https://github.com/facebook/jest"],
      "schedule": ["before 5am on the 8th and 22nd day of the month"]
    },
    {
      "groupName": "Jest packages",
      "matchPackageNames": ["@types/jest", "ts-jest", "@types/jest-*", "jest-*"],
      "schedule": ["before 5am on the 8th and 22nd day of the month"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This replaces the built-in presets [`group:jestMonorepo`](https://docs.renovatebot.com/presets-group/#groupjestmonorepo), [`group:jestPlusTSJest`](https://docs.renovatebot.com/presets-group/#groupjestplustsjest), and [`group:jestPlusTypes`](https://docs.renovatebot.com/presets-group/#groupjestplustypes) with a group which catches more related dependencies.

<!-- end extra content -->

---

#### `groupLageBackfill`

Group Lage and Backfill packages (separate group for each).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "lage monorepo",
      "matchSourceUrls": ["https://github.com/microsoft/lage"]
    },
    {
      "groupName": "backfill monorepo",
      "matchSourceUrls": ["https://github.com/microsoft/backfill"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

<!-- end extra content -->

---

#### `groupNodeMajor`

Group major updates of Node and its types.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "Node",
      "matchPackageNames": ["@types/node", "node", "nodejs/node"],
      "matchUpdateTypes": ["major"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This preset should work for the Node version as defined by `@types/node` dependency, `engines.node` in `package.json`, `.nvmrc`, or `.node-version`.

It does NOT work for `actions/setup-node` (GitHub workflows) or `NodeTool` (Azure Pipelines). For a workaround for GitHub workflows, see the notes on [`restrictNode`](#restrictnodearg0).

<!-- end extra content -->

---

#### `groupReact`

Group React packages and types.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "react monorepo",
      "matchPackageNames": [
        "@types/react",
        "@types/react-dom",
        "@types/react-test-renderer",
        "@types/react-is",
        "@types/scheduler"
      ]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This uses the same name as (and therefore extends) the built-in config [`group:reactMonorepo`](https://docs.renovatebot.com/presets-group/#groupreactmonorepo).

<!-- end extra content -->

---

#### `groupRollup`

Group all Rollup-related updates.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "rollup packages",
      "matchPackageNames": ["/^@?rollup/"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

<!-- end extra content -->

---

#### `groupTypes`

Group minor and patch updates to `@types` `devDependencies`.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "@types devDependencies",
      "schedule": ["before 5am on the 1st and 15th day of the month"],
      "matchManagers": ["npm"],
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "matchCurrentVersion": ">1.0.0",
      "matchPackageNames": [
        "@types/*",
        "!@types/d3-*",
        "!@types/jest-*",
        "!@types/jest",
        "!@types/react",
        "!@types/react-dom",
        "!@types/react-is",
        "!@types/react-test-renderer",
        "!@types/scheduler",
        "!@types/yargs",
        "!@types/yargs-parser"
      ]
    },
    {
      "groupName": "@types devDependencies",
      "matchManagers": ["npm"],
      "matchPackageNames": ["@types/*"],
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["patch"],
      "matchCurrentVersion": "0.x"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

`@types` packages can update frequently, and used as `devDependencies`, they're generally low risk/effort to update. So this preset groups them together to reduce noise. It also uses an early-morning schedule since updates to `@types` packages may be released throughout the day, and probably at most one PR per day is desired.

This group excludes updates to `@types` packages with `0.x` versions since those could technically be breaking changes (and to avoid conflicting with the `dependencyDashboardMajor` preset's `0.x` rule). It also excludes things such as `@types/react` which are often included with other groups.

If you want to exclude a package from this group, add a new `packageRules` entry as follows:

```json
{
  "groupName": "@types devDependencies",
  "matchPackageNames": ["!@types/some-package"]
}
```

<!-- end extra content -->

---

#### `groupYargs`

Group yargs, yargs-parser, and their types.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "yargs packages",
      "matchPackageNames": ["yargs", "yargs-parser", "@types/yargs", "@types/yargs-parser"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Note that if you depend on both `yargs` and `yargs-parser`, and they have different major versions, this preset can cause an immortal PR (so you may want to the `ignorePresets` array).

<!-- end extra content -->

---

### Compatibility presets

#### `disableEsmVersions`

Disable upgrades to package versions that have been converted to ES modules.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["p-limit"],
      "allowedVersions": "<4.0.0"
    },
    {
      "matchPackageNames": ["chalk"],
      "allowedVersions": "<5.0.0"
    },
    {
      "matchPackageNames": ["ansi-regex", "execa", "find-up", "pretty-bytes"],
      "allowedVersions": "<6.0.0"
    },
    {
      "matchPackageNames": ["strip-ansi"],
      "allowedVersions": "<7.0.0"
    },
    {
      "matchPackageNames": ["supports-color"],
      "allowedVersions": "<9.0.0"
    },
    {
      "matchPackageNames": ["globby"],
      "allowedVersions": "<12.0.0"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

While ES modules are the new standard, migrating immediately may not be practical, in particular for libraries whose main consumers can't immediately migrate. This preset is a stopgap to prevent having to verify that every major update does not include an ESM conversion.

<!-- end extra content -->

---

#### `restrictNode(<arg0>)`

Restrict Node version to the range `arg0` and ignore updates incompatible with your repo's `engines.node`.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@types/node", "node", "nodejs/node"],
      "allowedVersions": "{{arg0}}"
    },
    {
      "matchManagers": ["npm"],
      "constraintsFiltering": "strict"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This preset should work for the Node version as defined by `@types/node` dependency, `engines.node` in `package.json`, `.nvmrc`, or `.node-version`.

It does NOT work for `actions/setup-node` (GitHub workflows) or `NodeTool` (Azure Pipelines). To ensure the Node version stays in sync for GitHub actions, it's recommended to either:

- Specify `engines.node` in `package.json` and specify `node-version-file: package.json` in the action, or
- Create a `.nvmrc` file and specify `node-version-file: .nvmrc` in the action

The preset also enables [`constraintsFiltering: "strict"`](https://docs.renovatebot.com/configuration-options/#constraintsfiltering) to prevent installing deps that are incompatible with your repo's `engines.node` setting.

<!-- end extra content -->

---

### Freshness and noise reduction presets

#### `keepFresh`

Keep locally-used dependency versions updated and deduplicated.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "lockFileMaintenance": {
    "enabled": true,
    "rebaseWhen": "behind-base-branch",
    "schedule": ["before 5am on the 1st and 15th day of the month"]
  },
  "postUpdateOptions": ["yarnDedupeFewer", "npmDedupe"],
  "packageRules": [
    {
      "matchManagers": ["npm"],
      "rangeStrategy": "replace"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

- [`lockFileMaintenance`](https://docs.renovatebot.com/configuration-options/#lockfilemaintenance): Completely re-create lock files twice a month. This will update direct and indirect dependency versions used _only within the repo_ to the latest versions that satisfy semver.
  - [`rebaseWhen`](https://docs.renovatebot.com/configuration-options/#rebasewhen): If the lock file maintenance PR gets out of date, rebase it even if there aren't conflicts.
- [`postUpdateOptions`](https://docs.renovatebot.com/configuration-options/#postupdateoptions):
  - `yarnDedupeFewer`: If using yarn, run `yarn-deduplicate --strategy fewer` after updates.
  - `npmDedupe`: If using npm, run `npm dedupe` after updates. WARNING: This may slow down Renovate runs significantly.
- ~~Extend [`<m365>:minorDependencyUpdates`](#minordependencyupdates) and set the [`rangeStrategy`](https://docs.renovatebot.com/configuration-options/#rangestrategy) for `npm` `devDependencies` to `replace` (see below for details).~~
  - `minorDependencyUpdates` was removed from the default config due to causing problematic duplication for consumer.
  - `rangeStrategy: "replace"` is now set for all `npm` dependencies.

With `dependencies` and/or `devDependencies` specified as ranges (unpinned), by default Renovate will make individual lockfile-only update PRs for in-range updates. These PRs are redundant when `lockFileMaintenance` is also enabled, so setting `rangeStrategy` to `replace` will reduce unnecessary PRs.

(To unpin your `devDependencies` that Renovate previously pinned, run `npx better-deps unpin-dev-deps`.)

It's **highly recommended** to manually run the deduplication command (`npx yarn-deduplicate --strategy fewer` or `npm dedupe`) before enabling this preset. In a large repo that hasn't been regularly deduplicated or had its lock file refreshed, it's likely that initial deduplication will cause build breaks due to implicit reliance on subtle interactions between particular old versions.

<!-- end extra content -->

---

#### `minorDependencyUpdates`

For dependencies, explicitly pick up minor updates, and ignore patch updates if in-range.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchManagers": ["npm"],
      "matchDepTypes": ["dependencies"],
      "rangeStrategy": "bump"
    },
    {
      "matchManagers": ["npm"],
      "matchDepTypes": ["dependencies"],
      "matchCurrentValue": "/^[~^][1-9]/",
      "matchUpdateTypes": ["minor"],
      "schedule": ["before 5am on Tuesday"]
    },
    {
      "matchManagers": ["npm"],
      "matchDepTypes": ["dependencies"],
      "matchCurrentVersion": "0.x",
      "matchUpdateTypes": ["patch"],
      "schedule": ["before 5am on Tuesday"]
    },
    {
      "matchManagers": ["npm"],
      "matchDepTypes": ["dependencies"],
      "matchCurrentValue": "/^[~^][1-9]/",
      "matchUpdateTypes": ["patch"],
      "enabled": false
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This preset is mainly useful if `lockFileMaintenance` is enabled and some or all dependencies are specified as ranges. Note that it only applies to `npm` `dependencies`.

- For all `npm` `dependencies`, set the [`rangeStrategy`](https://docs.renovatebot.com/configuration-options/#rangestrategy) to `bump`: bump the range even if the new version satisfies the existing range, e.g. `^1.0.0 -> ^1.1.0`.
- For `^` or `~` `dependencies`:
  - For versions > `0.x`, explicitly pick up minor updates once a week in case of API changes, and disable explicit patch updates.
  - For `0.x` versions, explicitly pick up patch updates once a week in case of API changes.
  <!-- end extra content -->

---

#### `scheduleNoisy`

Update "noisy" (frequently-updating) packages once every other week.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@microsoft/api-extractor*"],
      "schedule": ["before 5am on the 8th and 22nd day of the month"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Certain packages tend to publish updates multiple times per week, and getting a PR for every one of those updates can be annoying. This rule includes a list of packages known to update frequently and spreads them out throughout the week (to avoid attempting to create too many PRs at once and being rate limited).

<!-- end extra content -->

---

### Other presets

#### `automergeDevLock`

Auto-merge minor and patch updates to `devDependencies` and lock file maintenance (if the build passes).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "lockFileMaintenance": {
    "automerge": true,
    "platformAutomerge": true
  },
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true,
      "platformAutomerge": true,
      "internalChecksFilter": "strict",
      "matchPackageNames": ["!typescript"],
      "minimumReleaseAge": "2 days"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Any branch policies will be respected, including required status checks and required reviewers. If you have a required reviewers policy, this will prevent the PRs from merging in an entirely automated manner.

Experimentally, this preset has `stabilityDays` set to 2 to reduce the chance of automerging malicious dependencies. You can force creation of the PR earlier using the dependency dashboard.

<!-- end extra content -->

---

#### `automergeTypes`

Auto-merge minor and patch updates to `@types` `devDependencies` (if the build passes).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@types/*", "!@types/react", "!@types/react-dom"],
      "matchManagers": ["npm"],
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true,
      "platformAutomerge": true
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Any branch policies will be respected, including required status checks and required reviewers. If you have a required reviewers policy, this will prevent the PRs from merging in an entirely automated manner.

<!-- end extra content -->

---

#### `beachballPostUpgrade`

Run `beachball change` as a post-upgrade task.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "gitAuthor": "Renovate Bot <renovate@whitesourcesoftware.com>",
  "packageRules": [
    {
      "matchManagers": ["npm"],
      "matchUpdateTypes": ["!lockFileMaintenance"],
      "postUpgradeTasks": {
        "commands": [
          "git add --all",
          "npx beachball change --no-fetch --no-commit --type patch --message '{{{commitMessage}}}'",
          "git reset"
        ],
        "fileFilters": ["change/*"],
        "executionMode": "branch"
      }
    },
    {
      "matchManagers": ["npm"],
      "matchUpdateTypes": ["lockFileMaintenance"],
      "postUpgradeTasks": {
        "commands": [
          "git add --all",
          "npx beachball change --no-fetch --no-commit --type none --message '{{{commitMessage}}}'",
          "git reset"
        ],
        "fileFilters": ["change/*"],
        "executionMode": "branch"
      }
    },
    {
      "matchManagers": ["npm"],
      "matchDepTypes": ["devDependencies"],
      "postUpgradeTasks": {
        "commands": [
          "git add --all",
          "npx beachball change --no-fetch --no-commit --type none --message '{{{commitMessage}}}'",
          "git reset"
        ],
        "fileFilters": ["change/*"],
        "executionMode": "branch"
      }
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Generate appropriate change files after upgrades:

- Change type `none` for updating `devDependencies` or `lockFileMaintenance`
- Change type `patch` for all other changes

These change types will be correct the majority of the time, but if a different change type is appropriate, you can always edit the change file in the PR before it merges.

Note that in the GitHub app, commands in [`postUpgradeTasks`](https://docs.renovatebot.com/configuration-options/#postupgradetasks) are limited to a specific set of strings for security reasons. As of writing, only the specific commands used in this config are allowed (though `--no-fetch` can optionally be removed).

<!-- end extra content -->

---

#### `dependencyDashboardMajor`

Require dependency dashboard approval for major upgrades, 0.x upgrades, and minor upgrades of deps known not to follow semver.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "dependencyDashboard": true,
  "major": {
    "dependencyDashboardApproval": true
  },
  "packageRules": [
    {
      "matchPackageNames": ["go", "typescript"],
      "matchUpdateTypes": ["minor"],
      "dependencyDashboardApproval": true
    },
    {
      "matchCurrentVersion": ">=0.1.0 <1.0.0-0",
      "matchUpdateTypes": ["minor"],
      "dependencyDashboardApproval": true
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Note: The dependency dashboard feature doesn't work in Azure DevOps as of writing due to [lack of issue creation support](https://github.com/renovatebot/renovate/issues/9592) in Renovate (and lack of markdown checkbox support in Azure DevOps).

Major upgrades of certain dependencies may be disruptive or require extra validation, so to avoid the PRs sitting for a long time, it may be desirable to manually approve upgrades.

This policy is also applied for certain _minor_ upgrades that may contain breaking changes:

- Packages with `0.x` versions (allowed per semver)
- Packages that don't respect major/minor semver: so far, `typescript` and `go`

The downside of setting this policy for all major upgrades is that it reduces the visibility of available upgrades, if nobody is checking the dashboard regularly.

Some alternative strategies which would need to be configured per repo (see [Renovate docs](https://docs.renovatebot.com/configuration-options/#dependencydashboardapproval) for examples):

- Create a `packageRules` group which requires dependency dashboard approval for only major upgrades of specific packages that are known to be high risk/effort.
- Set [schedules](https://docs.renovatebot.com/configuration-options/#schedule) for individual `packageRules` groups to avoid the upgrades being forgotten.
<!-- end extra content -->

---

#### `newConfigWarningIssue`

Always create a new issue if there's a config problem (for visibility).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "configWarningReuseIssue": false
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Note that issue creation is not supported in Azure DevOps as of writing.

<!-- end extra content -->

---

#### `pinActions`

Pin action versions.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchDepTypes": ["action"],
      "pinDigests": true
    },
    {
      "groupName": "Pin GitHub Actions versions",
      "matchDepTypes": ["action"],
      "matchUpdateTypes": ["pin", "pinDigest"],
      "group": {
        "commitMessageTopic": "GitHub Actions versions",
        "commitMessageExtra": ""
      }
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Actions should be pinned to a specific immutable commit hash for security.

<!-- end extra content -->

---

<!-- end presets -->

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
