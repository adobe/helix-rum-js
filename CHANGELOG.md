## [1.8.1](https://github.com/adobe/helix-rum-js/compare/v1.8.0...v1.8.1) (2024-06-07)


### Bug Fixes

* change id generation ([94af448](https://github.com/adobe/helix-rum-js/commit/94af448b078963d24395dc65c862003c9c448a79))
* **release:** pass release branches to semantic-release dry-run ([ca5fd73](https://github.com/adobe/helix-rum-js/commit/ca5fd73cae3baf7c9ec086b78cd182d10dc2b2b0))

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
