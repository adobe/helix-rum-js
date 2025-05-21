module.exports = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md",
    }],
    "@semantic-release/npm",
    ["@semantic-release/exec", {
      "publishCmd": "./tagger.sh ${nextRelease.version} --push"
    }],
    ["@semantic-release/git", {
      "assets": [
        "package.json",
        "CHANGELOG.md",
      ],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    ["@semantic-release/github", {
      "assets": [
        {
          "path": "dist/rum-standalone.js",
          "label": "RUM Standalone JS"
        },
        {
          "path": "dist/rum-standalone.md5",
          "label": "RUM Standalone Hash"
        },
        {
          "path": "dist/rum-standalone.sri",
          "label": "RUM Standalone SRI Hash (sha384)"
        },
        {
          "path": "dist/rum-standalone-404.js",
          "label": "RUM Standalone 404 JS"
        },
        {
          "path": "dist/rum-standalone-404.md5",
          "label": "RUM Standalone 404 Hash"
        },
        {
          "path": "dist/rum-standalone-404.sri",
          "label": "RUM Standalone 404 SRI Hash (sha384)"
        }
      ]
    }],
    ["semantic-release-slack-bot", {
      notifyOnSuccess: true,
      notifyOnFail: true,
      markdownReleaseNotes: true,
      slackChannel: "optel-explorers",
    }],
  ],
  branches: ['main', '1.x'],
};
