module.exports = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "release-notes.md",
    }],
    ["@semantic-release/npm", {
      "npmPublish": true,
      "provenance": true
    }],
    ["@semantic-release/github", {
      "assets": [
        { "path": "release-notes.md", "label": "Release notes" },
        { "path": "release-manifest.json", "label": "Release manifest (SHA-384 of every served file)" },
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
        },
        {
          "path": "dist/micro.js",
          "label": "Operational Telemetry Micro JS"
        },
        {
          "path": "dist/micro.sri",
          "label": "Operational Telemetry Micro SRI Hash (sha384)"
        }
      ]
    }],
    ["@semantic-release/exec", {
      "publishCmd": "./tagger.sh ${nextRelease.version} --manifest release-manifest.json package.json package-lock.json release-notes.md --push"
    }],
    ["semantic-release-slack-bot", {
      notifyOnSuccess: true,
      notifyOnFail: true,
      markdownReleaseNotes: true,
      slackChannel: "optel-explorers",
    }],
  ],
  branches: ['main'],
};
