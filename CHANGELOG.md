## [2.10.4](https://github.com/adobe/helix-rum-js/compare/v2.10.3...v2.10.4) (2025-04-11)


### Bug Fixes

* trigger release ([a82e930](https://github.com/adobe/helix-rum-js/commit/a82e93039347d9f050acc9563f754df8f11a5a60))

## [2.10.3](https://github.com/adobe/helix-rum-js/compare/v2.10.2...v2.10.3) (2025-04-11)


### Reverts

* Revert "chore: ignore psi check not needed ([#246](https://github.com/adobe/helix-rum-js/issues/246))" ([7c6f137](https://github.com/adobe/helix-rum-js/commit/7c6f137d6bcbd04a5b4f403e0699ff2ac7f67367))

## [2.10.2](https://github.com/adobe/helix-rum-js/compare/v2.10.1...v2.10.2) (2025-04-08)


### Bug Fixes

* don't allow enhance function to be redefined as noop ([#253](https://github.com/adobe/helix-rum-js/issues/253)) ([9e56efa](https://github.com/adobe/helix-rum-js/commit/9e56efadf75159db23d02466021e644ab988bf7d))

## [2.10.1](https://github.com/adobe/helix-rum-js/compare/v2.10.0...v2.10.1) (2025-03-13)


### Bug Fixes

* increase browserStartTimeout for Firefox to 120s in CI tests ([9c4f746](https://github.com/adobe/helix-rum-js/commit/9c4f746822ec7f911f5e12702896535661d018d9))
* use global browserStartTimeout increase instead of browser-specific config ([e9fff0e](https://github.com/adobe/helix-rum-js/commit/e9fff0e0a4d0b22c6ec637a17124259a1609adc6))

# [2.10.0](https://github.com/adobe/helix-rum-js/compare/v2.9.0...v2.10.0) (2024-11-12)


### Features

* **standalone:** Use data attribute for 404 tracking (avoid separate script) ([a793f13](https://github.com/adobe/helix-rum-js/commit/a793f13851080ce85bcfaf80e03f9a1da323c6b5))

# [2.9.0](https://github.com/adobe/helix-rum-js/compare/v2.8.0...v2.9.0) (2024-11-08)


### Features

* use Performance API to get response status and sample accordingly ([#224](https://github.com/adobe/helix-rum-js/issues/224)) ([7702404](https://github.com/adobe/helix-rum-js/commit/770240446d500d383de78c0dc7dd854c46301aa6))

# [2.8.0](https://github.com/adobe/helix-rum-js/compare/v2.7.0...v2.8.0) (2024-11-01)


### Features

* allow specific version for enhancer in 404 script ([8511ed2](https://github.com/adobe/helix-rum-js/commit/8511ed229b757178cabc1ffa8cc787644adb8e10))
* **enhancer-version:** allow selecting a specific enhancer version in standalone ([4cf9762](https://github.com/adobe/helix-rum-js/commit/4cf9762deee38b98af58e37fd11eeba019b07e55))

# [2.7.0](https://github.com/adobe/helix-rum-js/compare/v2.6.0...v2.7.0) (2024-10-17)


### Features

* allow rum=off to stabilize tests ([#218](https://github.com/adobe/helix-rum-js/issues/218)) ([eb1b8a1](https://github.com/adobe/helix-rum-js/commit/eb1b8a160a02bd05c97a2f9a28b40d5be483b140))
* allow to enhance only once ([#220](https://github.com/adobe/helix-rum-js/issues/220)) ([af1a21c](https://github.com/adobe/helix-rum-js/commit/af1a21c601312a9676cb306f12133a0a13cd02af))

# [2.6.0](https://github.com/adobe/helix-rum-js/compare/v2.5.3...v2.6.0) (2024-09-19)


### Bug Fixes

* **index:** better way of setting search parameters ([584de2c](https://github.com/adobe/helix-rum-js/commit/584de2c170988713eddf46d19f74bf35cb1de105))
* **index:** do not show question mark if no URL parameters are set ([e650367](https://github.com/adobe/helix-rum-js/commit/e650367facd8aad274ed004ba83b1de0d65a2f56))


### Features

* **index:** support `window.RUM_PARAMS` to attach custom URL parameters to collection URL ([4e0d22d](https://github.com/adobe/helix-rum-js/commit/4e0d22dffc7792aa80d664c442aa7a5302128ada))
* **rum-params:** in standalone replace extra params by data attributes ([ec4e6ea](https://github.com/adobe/helix-rum-js/commit/ec4e6ea52d236962cef174f5c02de6c6bdb9b3f4))

## [2.5.3](https://github.com/adobe/helix-rum-js/compare/v2.5.2...v2.5.3) (2024-09-18)


### Bug Fixes

* **release:** use github relase attachments instead of git repo checkins ([6fcee18](https://github.com/adobe/helix-rum-js/commit/6fcee18902852ae05209f1f451e16f996656f48c))

## [2.5.2](https://github.com/adobe/helix-rum-js/compare/v2.5.1...v2.5.2) (2024-09-18)


### Bug Fixes

* **release:** include explicit list of assets ([4452c2d](https://github.com/adobe/helix-rum-js/commit/4452c2d80de57a70ad30afa43e9a5ac5e06bcd86))

## [2.5.1](https://github.com/adobe/helix-rum-js/compare/v2.5.0...v2.5.1) (2024-09-18)


### Bug Fixes

* **index:** better comment ([152b477](https://github.com/adobe/helix-rum-js/commit/152b4779c19f0c939319cc51a260a31e69ff8180))

# [2.5.0](https://github.com/adobe/helix-rum-js/compare/v2.4.0...v2.5.0) (2024-09-17)


### Features

* **build:** create hashsums for generated files ([3b690ed](https://github.com/adobe/helix-rum-js/commit/3b690edb8643b0cebaee7ecf8f8ea1319d30478b))

# [2.4.0](https://github.com/adobe/helix-rum-js/compare/v2.3.1...v2.4.0) (2024-09-09)


### Features

* Simplify script inclusion when using same domain ([98073a4](https://github.com/adobe/helix-rum-js/commit/98073a48084c2f6bf916fe7a3a9f02ef4940dd60)), closes [#201](https://github.com/adobe/helix-rum-js/issues/201)

## [2.3.1](https://github.com/adobe/helix-rum-js/compare/v2.3.0...v2.3.1) (2024-08-22)


### Bug Fixes

* add missing license to packaged code ([#195](https://github.com/adobe/helix-rum-js/issues/195)) ([7e8bfb1](https://github.com/adobe/helix-rum-js/commit/7e8bfb1c5535d0a92feefe224ad542ced9086b0d))

# [2.3.0](https://github.com/adobe/helix-rum-js/compare/v2.2.0...v2.3.0) (2024-08-19)


### Features

* allow increasing the sampling rate up to 1/10 for specific use cases ([f96e713](https://github.com/adobe/helix-rum-js/commit/f96e713c7b9c5ab03c933683499a527b5e98f57e))
* **minirum:** allow increasing the sampling rate up to 1/10 for specific use cases ([05f6da7](https://github.com/adobe/helix-rum-js/commit/05f6da700072cd5462e50368054ac420581e64f6)), closes [#156](https://github.com/adobe/helix-rum-js/issues/156)

# [2.2.0](https://github.com/adobe/helix-rum-js/compare/v2.1.4...v2.2.0) (2024-08-13)


### Bug Fixes

* **404:** send referrer ([84a6556](https://github.com/adobe/helix-rum-js/commit/84a655650b273382d1e1e606ab413dc67f4f77e4))
* release process ([#191](https://github.com/adobe/helix-rum-js/issues/191)) ([f40a949](https://github.com/adobe/helix-rum-js/commit/f40a9498373b5f963d8f6821d24b9b720b6cbca9))


### Features

* **bundle:** release a standalone 404.js that can be used to track error pages ([33d70b5](https://github.com/adobe/helix-rum-js/commit/33d70b530c278ed63e700ac1d73b03b1dab60c84))
* improve errors capture ([#189](https://github.com/adobe/helix-rum-js/issues/189)) ([d7448eb](https://github.com/adobe/helix-rum-js/commit/d7448eb9c58be26407ef4b7a86a81ac6722c6920))
* improving enhancer loading timing ([#175](https://github.com/adobe/helix-rum-js/issues/175)) ([d9c690e](https://github.com/adobe/helix-rum-js/commit/d9c690ef717432fe93e753105d6bdd3318065b02))
* trigger release ([7d8f4e0](https://github.com/adobe/helix-rum-js/commit/7d8f4e03fba48481148612a2dd69bcdf322a8fdf))

## [2.1.4](https://github.com/adobe/helix-rum-js/compare/v2.1.3...v2.1.4) (2024-06-05)


### Bug Fixes

* **docs:** don't use self-closing HTML tags ([5cbe559](https://github.com/adobe/helix-rum-js/commit/5cbe5599ef8f3df84fe7d4f4d87cdcccf6824ad2))

## [2.1.3](https://github.com/adobe/helix-rum-js/compare/v2.1.2...v2.1.3) (2024-06-05)


### Bug Fixes

* immediately load the enhancer ([#164](https://github.com/adobe/helix-rum-js/issues/164)) ([aa5aafc](https://github.com/adobe/helix-rum-js/commit/aa5aafc28e3e83c29cc78565ec084904e8a5bc85))

## [2.1.2](https://github.com/adobe/helix-rum-js/compare/v2.1.1...v2.1.2) (2024-05-31)


### Bug Fixes

* avoid exceptions when error events don't have the expected structure ([ac388d8](https://github.com/adobe/helix-rum-js/commit/ac388d811378b9945a57c5b3d7ba8223e436e3b3))

## [2.1.1](https://github.com/adobe/helix-rum-js/compare/v2.1.0...v2.1.1) (2024-05-15)


### Bug Fixes

* semantic release standalone ([8be7e79](https://github.com/adobe/helix-rum-js/commit/8be7e7943f54bb9186b9061775a00247e1a7b82f))

# [2.1.0](https://github.com/adobe/helix-rum-js/compare/v2.0.1...v2.1.0) (2024-05-15)


### Features

* **rum-standalone:** adapt rum for using standalone ([9ce880c](https://github.com/adobe/helix-rum-js/commit/9ce880ce475715068ea969d25d91bdda774086f6))

## [2.0.1](https://github.com/adobe/helix-rum-js/compare/v2.0.0...v2.0.1) (2024-04-18)


### Bug Fixes

* change id generation ([e27cc90](https://github.com/adobe/helix-rum-js/commit/e27cc9087fc9984a1e3c07dbf8f1b9dab0af0a09))

# [2.0.0](https://github.com/adobe/helix-rum-js/compare/v1.8.0...v2.0.0) (2024-01-19)


### Bug Fixes

* add checkpoint in downstream event ([ca432e5](https://github.com/adobe/helix-rum-js/commit/ca432e581a2bfb5ff19253f31fa6301258c08159))


### Features

* **minirum:** reduce overall code size by 50% ([e8dbd19](https://github.com/adobe/helix-rum-js/commit/e8dbd195b4da7ea073cd7ab4bcf0f7e04f49a215))


### BREAKING CHANGES

* **minirum:** instrumentation has been simplified, this requires changes in project code. Enhancer is requested from same origin, which requires CDN config change.

# [1.8.0](https://github.com/adobe/helix-rum-js/compare/v1.7.0...v1.8.0) (2023-12-11)


### Bug Fixes

* round timestamp ([69ab356](https://github.com/adobe/helix-rum-js/commit/69ab3564bb45679b1aa59d2f9bb348ac819487fd))


### Features

* add noise to page view counter for privacy ([e7048e6](https://github.com/adobe/helix-rum-js/commit/e7048e69fe54f7173b6c45a6e7820fbda800a8ef))
* use performance api when available for timing ([d5adf48](https://github.com/adobe/helix-rum-js/commit/d5adf48dfc1d355c958a6db7b6772c588216cc09))

# [1.7.0](https://github.com/adobe/helix-rum-js/compare/v1.6.0...v1.7.0) (2023-10-25)


### Features

* **checkpoint:** track pages viewed per session ([d224c64](https://github.com/adobe/helix-rum-js/commit/d224c64919b92a0b9915ef9a7ee8205e99704cef))

# [1.6.0](https://github.com/adobe/helix-rum-js/compare/v1.5.0...v1.6.0) (2023-10-18)


### Features

* **cwv:** add support for TTFB ([70b283a](https://github.com/adobe/helix-rum-js/commit/70b283a142bedb3a45142e876b2177bc3091ec93))

# [1.5.0](https://github.com/adobe/helix-rum-js/compare/v1.4.1...v1.5.0) (2023-09-21)


### Features

* **index:** enable configurable base url ([b1dace5](https://github.com/adobe/helix-rum-js/commit/b1dace5f11288117b92b0a3eb55b74fb58811a7c))
* **index:** enable relative URL as beacon destination ([528ce77](https://github.com/adobe/helix-rum-js/commit/528ce775e0ed7ffe3d8b9a4801cf47ec8decef52))
* **index:** simplify code ([7085202](https://github.com/adobe/helix-rum-js/commit/7085202da0237dfebb3fab88c5d15f9c5942259e))

## [1.4.1](https://github.com/adobe/helix-rum-js/compare/v1.4.0...v1.4.1) (2023-09-14)


### Bug Fixes

* **cwv:** add cwv metrics to known properties ([a8048c5](https://github.com/adobe/helix-rum-js/commit/a8048c5e9eb399b992acc71a3a6bba3164f8c239))

# [1.4.0](https://github.com/adobe/helix-rum-js/compare/v1.3.0...v1.4.0) (2023-09-07)


### Features

* filter unknown properties out from the beacon ([629feb7](https://github.com/adobe/helix-rum-js/commit/629feb7e113c33a7533a64fb9091f75d478d0272))

# [1.3.0](https://github.com/adobe/helix-rum-js/compare/v1.2.0...v1.3.0) (2023-09-05)


### Features

* lower entropy of rum id. Add millis since first read ([5295681](https://github.com/adobe/helix-rum-js/commit/5295681b6c6f7e5c7f541e058a6bde55892ecc32))
* lower entropy of rum id. Add millis since first read ([51c0a59](https://github.com/adobe/helix-rum-js/commit/51c0a5954c70128fde553c6ab0e0438799b56db0))

# [1.2.0](https://github.com/adobe/helix-rum-js/compare/v1.1.0...v1.2.0) (2023-08-22)


### Features

* enable listeners to all RUM events, not just the sampled ones ([26d9b2e](https://github.com/adobe/helix-rum-js/commit/26d9b2e8afd00458d3b050d3fd152fb55a26adcb))

# [1.1.0](https://github.com/adobe/helix-rum-js/compare/v1.0.1...v1.1.0) (2023-06-29)


### Features

* **rum:** update to latest boilerplate RUM code ([b2216c2](https://github.com/adobe/helix-rum-js/commit/b2216c29287ebfcf4653da33028889db1784b285))

## [1.0.1](https://github.com/adobe/helix-rum-js/compare/v1.0.0...v1.0.1) (2023-01-12)


### Bug Fixes

* Use node 18 for circleci and AWS ([#44](https://github.com/adobe/helix-rum-js/issues/44)) ([ef58e12](https://github.com/adobe/helix-rum-js/commit/ef58e12db11bcbe601fa8728bf491caede2956ea))

# 1.0.0 (2022-02-18)


### Features

* **index:** initial code drop, extracted from helix-project-boilerplate ([7d2960b](https://github.com/adobe/helix-rum-js/commit/7d2960b63f863c3bf6aa250c0d99180840685269))
