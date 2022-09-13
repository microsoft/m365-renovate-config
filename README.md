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
    "github>microsoft/m365-renovate-config:somePreset#v1.2.0",

    // Use a major version of a preset (see note below)
    "github>microsoft/m365-renovate-config:somePreset#v1"
  ]
}
```

Note that **semver ranges are not supported for preset versions** because Renovate only supports resolving presets to specific tags or branches. The supported tags and branches are:

- Specific versions listed on the [Releases page](https://github.com/microsoft/m365-renovate-config/releases)
- Major version branches: `v1`

## Presets in this repo

<!--
Most content in this section is generated by scripts/updateReadme.js.

The preset's primary description should be defined and edited in its .json file.

In this section, ONLY edit between "extra content" marker comments!
-->

<!-- start presets TOC -->

- [Full config presets](#full-config-presets)
  - [default](#default)
  - [libraryRecommended](#libraryrecommended)
  - [beachballLibraryRecommended](#beachballlibraryrecommended)
- [Grouping presets](#grouping-presets)
  - [groupMore](#groupmore)
  - [groupD3](#groupd3)
  - [groupEslint](#groupeslint)
  - [groupFixtureUpdates](#groupfixtureupdates)
  - [groupFluent](#groupfluent)
  - [groupJest](#groupjest)
  - [groupNodeMajor](#groupnodemajor)
  - [groupReact](#groupreact)
  - [groupRollup](#grouprollup)
  - [groupTypes](#grouptypes)
  - [groupYargs](#groupyargs)
- [Compatibility presets](#compatibility-presets)
  - [disableEsmVersions](#disableesmversions)
  - [restrictNode](#restrictnodearg0)
- [Other presets](#other-presets)
  - [automergeDevLock](#automergedevlock)
  - [automergeTypes](#automergetypes)
  - [dependencyDashboardMajor](#dependencydashboardmajor)
  - [keepFresh](#keepfresh)
  - [newConfigWarningIssue](#newconfigwarningissue)
  - [scheduleNoisy](#schedulenoisy)
  <!-- end presets TOC -->

<!-- start presets -->

### Full config presets

#### `default`

Recommended config which is intended to be appropriate for most projects.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "extends": [
    ":ignoreModulesAndTests",
    ":semanticPrefixFixDepsChoreOthers",
    "group:monorepos",
    "group:recommended",
    "workarounds:all",
    "github>microsoft/m365-renovate-config:groupReact",
    "github>microsoft/m365-renovate-config:newConfigWarningIssue"
  ],
  "dependencyDashboard": true,
  "prConcurrentLimit": 10,
  "prHourlyLimit": 2,
  "printConfig": true,
  "vulnerabilityAlerts": {
    "enabled": true
  }
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This config should be kept somewhat basic. It's somewhat similar to Renovate's [`config:base`](https://docs.renovatebot.com/presets-config/#configbase) but does _not_ enable any dependency pinning by default and adds a few extra settings.

- General extensions:
  - `:ignoreModulesAndTests`: Ignore packages under `node_modules` or common test/fixture directory names
  - [`:semanticPrefixFixDepsChoreOthers`](https://docs.renovatebot.com/presets-default/#semanticprefixfixdepschoreothers): If the repo uses semantic commits, Renovate will use `fix` for dependencies and `chore` for others
  - [`workarounds:all`](https://docs.renovatebot.com/presets-workarounds/#workaroundsall): Workarounds for known problems with packages
- Package grouping extensions:
  - [`group:monorepos`](https://docs.renovatebot.com/presets-group/#groupmonorepos): Group known monorepos
  - [`group:recommended`](https://docs.renovatebot.com/presets-group/#grouprecommended): Other known groupings (mostly not relevant for node)
  - [`groupReact`](#groupreact) (from this repo): Group React-related packages and types
- `dependencyDashboard`: Create a dashboard issue showing update status and allowing updates to be manually triggered (GitHub only)
- PR limits (`prHourlyLimit` and `prConcurrentLimit`): Prevent Renovate from creating an overwhelming number of PRs all at once. It's _highly encouraged_ to adjust these in your repo to fit your team's needs!
- `printConfig`: Log the final resolved config to make debugging easier
- `vulnerabilityAlerts`: Enable PRs to address security vulnerabilities. Note that this **only** works for GitHub and currently is **only** able to update direct dependencies (except in repos using `npm` 6 or older).
<!-- end extra content -->

---

#### `libraryRecommended`

Recommended config for a JS library repo or monorepo, including pinning `devDependencies`.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "extends": [
    "github>microsoft/m365-renovate-config",
    "github>microsoft/m365-renovate-config:dependencyDashboardMajor"
  ],
  "rangeStrategy": "replace",
  "pin": {
    "group": {
      "commitMessageTopic": "devDependencies"
    }
  },
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "commitMessageTopic": "devDependency {{{depName}}}",
      "rangeStrategy": "pin"
    },
    {
      "matchDepTypes": ["peerDependencies"],
      "rangeStrategy": "widen"
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

- Extensions:
  - This repo's [default config](#default)
  - Require dependency dashboard approval for major upgrades
- Set the [`rangeStrategy`](https://docs.renovatebot.com/configuration-options/#rangestrategy) for different update types:
  - Pin `devDependencies` (see below)
  - Widen ranges when updating `peerDependencies`
  - For other updates (including `dependencies`), replace the range with a newer one if the new version falls outside it, and update nothing otherwise
- `commitMessageTopic`: Where appropriate, use "devDependencies" in commit messages (instead of the default "dependencies") to be clearer about what is being modified

"Dependency pinning" refers to using a specific version of a dependency (`1.2.3`) rather than a range (`^1.2.3`, `~1.2.3`, etc). Pinning has its pros and cons for different situations, some of which are discussed in [this article from Renovate](https://docs.renovatebot.com/dependency-pinning/). This preset's strategy of pinning _only_ `devDependencies` is less aggressive than the "auto" strategy used in Renovate's `config:base` to reduce the risk of creating unnecessary duplicates in library or tool consumer repos.

<!-- end extra content -->

---

#### `beachballLibraryRecommended`

Dependency management strategy for library repos, including Beachball change file generation.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "extends": ["github>microsoft/m365-renovate-config:libraryRecommended"],
  "gitAuthor": "Renovate Bot <renovate@whitesourcesoftware.com>",
  "postUpgradeTasks": {
    "commands": [
      "git add --all",
      "npx beachball change --no-fetch --no-commit --type patch --message '{{{commitMessage}}}'",
      "git reset"
    ],
    "fileFilters": ["**/*"],
    "executionMode": "branch"
  },
  "pin": {
    "group": {
      "postUpgradeTasks": {
        "commands": [
          "git add --all",
          "npx beachball change --no-fetch --no-commit --type none --message '{{{commitMessage}}}'",
          "git reset"
        ],
        "fileFilters": ["**/*"],
        "executionMode": "branch"
      }
    }
  },
  "lockFileMaintenance": {
    "postUpgradeTasks": {
      "commands": [
        "git add --all",
        "npx beachball change --no-fetch --no-commit --type none --message '{{{commitMessage}}}'",
        "git reset"
      ],
      "fileFilters": ["**/*"],
      "executionMode": "branch"
    }
  },
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "postUpgradeTasks": {
        "commands": [
          "git add --all",
          "npx beachball change --no-fetch --no-commit --type none --message '{{{commitMessage}}}'",
          "git reset"
        ],
        "fileFilters": ["**/*"],
        "executionMode": "branch"
      }
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This extends the rules from [`libraryRecommended`](#beachballLibraryRecommended) to also generate appropriate change files after upgrades:

- Change type `none` for updating or pinning `devDependencies`
- Change type `patch` for all other changes

These change types will be correct the majority of the time, but if a different change type is appropriate, you can always edit the change file in the PR before it merges.

Note that in the GitHub app, commands in [`postUpgradeTasks`](https://docs.renovatebot.com/configuration-options/#postupgradetasks) are limited to a specific set of strings for security reasons. As of writing, only the specific commands used in this config are allowed (though `--no-fetch` can optionally be removed).

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
    "github>microsoft/m365-renovate-config:groupD3",
    "github>microsoft/m365-renovate-config:groupEslint",
    "github>microsoft/m365-renovate-config:groupFixtureUpdates",
    "github>microsoft/m365-renovate-config:groupFluent",
    "github>microsoft/m365-renovate-config:groupJest",
    "github>microsoft/m365-renovate-config:groupNodeMajor",
    "github>microsoft/m365-renovate-config:groupReact",
    "github>microsoft/m365-renovate-config:groupRollup",
    "github>microsoft/m365-renovate-config:groupYargs"
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

To use this preset but disable an individual grouping, add its name to the `ignorePresets` array.

<!-- end extra content -->

---

#### `groupD3`

Group D3 updates (except when initially pinning).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "D3 packages",
      "matchPackagePrefixes": ["d3-", "@types/d3-"],
      "matchUpdateTypes": ["major", "minor", "patch", "bump", "digest"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

<!-- end extra content -->

---

#### `groupEslint`

Group all eslint-related updates (except when initially pinning).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "eslint packages",
      "matchPackagePatterns": ["eslint"],
      "matchUpdateTypes": ["major", "minor", "patch", "bump", "digest"]
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
      "schedule": ["before 5am"],
      "matchPaths": ["**/__fixtures__/**/package.json"],
      "matchPackagePatterns": ["*"],
      "matchDepTypes": ["dependencies", "devDependencies", "peerDependencies", "resolutions"],
      "major": {
        "dependencyDashboardApproval": false
      },
      "rangeStrategy": "replace",
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

- Exclude individual packages: `{ "groupName": "fixture dependencies", "excludePackageNames": ["foo"] }` (or other [exclusion options](https://docs.renovatebot.com/configuration-options/#excludepackagenames))
- Limit the allowed versions for a specific package: `{ "matchPackageNames": ["foo"], "allowedVersions": "<6.0.0 }`
<!-- end extra content -->

---

#### `groupFluent`

Group Fluent UI and related package updates (except when initially pinning).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "Fluent UI React v9 packages",
      "matchPackagePrefixes": ["@fluentui/"],
      "matchUpdateTypes": ["major", "minor", "patch", "bump", "digest"],
      "matchCurrentVersion": ">=9.0.0-alpha.0"
    },
    {
      "groupName": "Fluent UI React v9 packages",
      "matchPackagePrefixes": ["@griffel/"],
      "matchUpdateTypes": ["major", "minor", "patch", "bump", "digest"]
    },
    {
      "groupName": "Fluent UI React v8 packages",
      "matchPackagePrefixes": ["@fluentui/"],
      "matchUpdateTypes": ["minor", "patch", "bump", "digest"],
      "matchCurrentVersion": "/^[1234568]\\./",
      "excludePackageNames": [
        "@fluentui/eslint-plugin",
        "@fluentui/react-conformance",
        "@fluentui/react-teams"
      ]
    },
    {
      "groupName": "Fluent UI React v8 packages",
      "matchPackageNames": ["@fluentui/react-cards"],
      "matchUpdateTypes": ["minor", "patch", "bump", "digest"]
    },
    {
      "groupName": "Fluent UI React Northstar packages",
      "matchPackagePrefixes": ["@fluentui/"],
      "matchUpdateTypes": ["minor", "patch", "bump", "digest"],
      "matchCurrentVersion": "0.x",
      "excludePackageNames": [
        "@fluentui/eslint-plugin",
        "@fluentui/react-cards",
        "@fluentui/react-conformance",
        "@fluentui/public-docsite-setup"
      ]
    },
    {
      "groupName": "Fabric packages",
      "matchUpdateTypes": ["minor", "patch", "bump", "digest"],
      "matchPackageNames": ["office-ui-fabric-react"],
      "matchPackagePrefixes": ["@uifabric/"]
    },
    {
      "groupName": "Fabric packages",
      "matchUpdateTypes": ["minor", "patch", "bump", "digest"],
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

Group jest, ts-jest, jest types, and related packages (except when initially pinning).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "jest monorepo",
      "matchPackagePrefixes": ["@types/jest-", "jest-"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

This uses the same name as (and therefore extends) the built-in configs [`group:jestMonorepo`](https://docs.renovatebot.com/presets-group/#groupjestmonorepo), [`group:jestPlusTSJest`](https://docs.renovatebot.com/presets-group/#groupjestplustsjest), and [`group:jestPlusTypes`](https://docs.renovatebot.com/presets-group/#groupjestplustypes).

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

Group React packages and types (except when initially pinning).

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

Group all rollup-related updates (except when initially pinning).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "rollup packages",
      "matchPackagePrefixes": ["@rollup"],
      "matchPackagePatterns": ["^rollup"],
      "matchUpdateTypes": ["major", "minor", "patch", "bump", "digest"]
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
      "schedule": ["before 8am"],
      "matchPackagePrefixes": ["@types/"],
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "matchCurrentVersion": ">1.0.0",
      "excludePackageNames": [
        "@types/jest",
        "@types/react",
        "@types/react-dom",
        "@types/react-is",
        "@types/react-test-renderer",
        "@types/scheduler"
      ]
    },
    {
      "groupName": "@types devDependencies",
      "matchPackagePrefixes": ["@types/"],
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
  "excludePackageNames": ["some-package"]
}
```

<!-- end extra content -->

---

#### `groupYargs`

Group yargs, yargs-parser, and their types (except when initially pinning).

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "groupName": "yargs packages",
      "matchPackageNames": ["yargs", "yargs-parser", "@types/yargs", "@types/yargs-parser"],
      "matchUpdateTypes": ["major", "minor", "patch", "bump", "digest"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

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
      "matchPackageNames": ["chalk"],
      "allowedVersions": "<5.0.0"
    },
    {
      "matchPackageNames": ["execa", "find-up", "pretty-bytes"],
      "allowedVersions": "<6.0.0"
    },
    {
      "matchPackageNames": ["globby"],
      "allowedVersions": "<12.0.0"
    },
    {
      "matchPackageNames": ["p-limit"],
      "allowedVersions": "<4.0.0"
    },
    {
      "matchPackageNames": ["supports-color"],
      "allowedVersions": "<9.0.0"
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

Restrict Node version to the range `arg0`.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@types/node", "node", "nodejs/node"],
      "allowedVersions": "{{arg0}}"
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
      "stabilityDays": 2,
      "internalChecksFilter": "strict",
      "excludePackageNames": ["typescript"]
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
      "matchPackagePrefixes": ["@types/"],
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "excludePackageNames": ["@types/react", "@types/react-dom"],
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

#### `dependencyDashboardMajor`

Require dependency dashboard approval for major upgrades (and minor upgrades of deps known not to follow semver).

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
      "matchCurrentVersion": "0.x",
      "matchUpdateTypes": ["minor"],
      "dependencyDashboardApproval": true
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

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

#### `keepFresh`

Keep locally-used dependency versions deduplicated and updated.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "lockFileMaintenance": {
    "enabled": true,
    "schedule": ["before 8am on Monday"]
  },
  "postUpdateOptions": ["yarnDedupeFewer", "npmDedupe"]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

- [`lockFileMaintenance`](https://docs.renovatebot.com/configuration-options/#lockfilemaintenance): Completely re-create lock files every Monday. This will update direct and indirect dependency versions used _only within the repo_ to the latest versions that satisfy semver.
- [`postUpdateOptions`](https://docs.renovatebot.com/configuration-options/#postupdateoptions):
  - `yarnDedupeFewer`: If using yarn, run `yarn-deduplicate --strategy fewer` after updates.
  - `npmDedupe`: If using npm, run `npm dedupe` after updates. WARNING: This may slow down Renovate runs significantly.

It's **highly recommended** to manually run the deduplication command before enabling this preset. In a large repo that hasn't been regularly deduplicated (or had its lock file refreshed), it's likely that initial deduplication will cause build breaks due to implicit reliance on subtle interactions between particular old versions.

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

<!-- end extra content -->

---

#### `scheduleNoisy`

Update "noisy" (frequently-updating) packages once a week.

<details><summary><b>Show config JSON</b></summary>

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@types/node"],
      "schedule": ["before 8am on Monday"]
    },
    {
      "matchPackageNames": ["renovate"],
      "schedule": ["before 8am on Tuesday"]
    }
  ]
}
```

</details>

<!-- start extra content (EDITABLE between these comments) -->

Certain packages tend to publish updates multiple times per week, and getting a PR for every one of those updates can be annoying. This rule includes a list of packages known to update frequently and spreads them out throughout the week (to avoid attempting to create too many PRs at once and being rate limited).

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

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
