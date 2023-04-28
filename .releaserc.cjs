// semantic release config
module.exports = {
  branches: ['v2'],
  plugins: [
    // Analyze commits according to conventional commits format
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    // Generate notes for github release and changelog
    '@semantic-release/release-notes-generator',
    // Update changelog
    '@semantic-release/changelog',
    // Fix/add tag references in config files' "extends" settings to ensure they reference the
    // correct branch: e.g. for "v1" branch append "#v1"
    ['@semantic-release/exec', { prepareCmd: 'yarn update-refs <%= nextRelease.gitTag %>' }],
    // Commit and push
    ['@semantic-release/git', { assets: ['CHANGELOG.md', '*.json'] }],
    // Create github release
    '@semantic-release/github',
  ],
};
