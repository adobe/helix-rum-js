# [2.18.0](https://github.com/adobe/helix-rum-js/compare/v2.17.0...v2.18.0) (2026-11-26)


### Bug Fixes

* **ci:** fail the backfill workflow when the script refuses ([ffa0049](https://github.com/adobe/helix-rum-js/commit/ffa004953ac2139c98d94f6cb7f3abad86070fe2))
* **ci:** isolate release credentials from branch workflows ([#369](https://github.com/adobe/helix-rum-js/issues/369)) ([b2aafea](https://github.com/adobe/helix-rum-js/commit/b2aafea2988ae470c36a338088f05197254a03ca))
* **ci:** publish releases without a bot account ([#371](https://github.com/adobe/helix-rum-js/issues/371)) ([b77bdfe](https://github.com/adobe/helix-rum-js/commit/b77bdfe5ca46509531b252c6758523c4d591e215))
* **ci:** push release branches with the publisher App ([#373](https://github.com/adobe/helix-rum-js/issues/373)) ([111e8f9](https://github.com/adobe/helix-rum-js/commit/111e8f92cde504acc5528eb5b272432109a7e897))
* **release:** check exact-branch availability before publishing; reject ambiguous versions ([#378](https://github.com/adobe/helix-rum-js/issues/378)) ([ea74a97](https://github.com/adobe/helix-rum-js/commit/ea74a971174d6539fcf806264f9932b580034be1)), closes [adobe/helix-rum-enhancer#645](https://github.com/adobe/helix-rum-enhancer/issues/645)
* **release:** require the manifest source commit to match HEAD ([cf02d3a](https://github.com/adobe/helix-rum-js/commit/cf02d3a235411efe77d3d374b67fe2c357b04e3f))


### Features

* **release:** publish a manifest of every built file and make exact releases write-once ([#376](https://github.com/adobe/helix-rum-js/issues/376)) ([3e520a2](https://github.com/adobe/helix-rum-js/commit/3e520a2222c062027f7839ccac5bfd58f76f02d4))
