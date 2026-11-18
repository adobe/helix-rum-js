module.exports = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "release-notes.md",
    }],
    "@semantic-release/npm",
    ["@semantic-release/github", {
      "assets": [{ "path": "release-notes.md", "label": "Release notes" }]
    }]
  ],
  branches: ['main', '1.x'],
};
