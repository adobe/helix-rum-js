# Helix RUM JS

> Helix RUM Event Generator for JavaScript

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-rum-js.svg)](https://codecov.io/gh/adobe/helix-rum-js)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/helix-rum-js.svg)](https://circleci.com/gh/adobe/helix-rum-js)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/issues)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/helix-rum-js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/helix-rum-js)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage

If you want to collect a RUM event programmatically, use this in your JavaScript code:


```javascript
import { sampleRUM } from 'https://rum.hlx.page/.rum/@adobe/helix-rum-js@^1/src/index.js';

sampleRUM('top');
window.addEventListener('load', () => sampleRUM('load'));
document.addEventListener('click', () => sampleRUM('click'));
```

You can pin a version number by using a URL like `https://rum.hlx.page/.rum/@adobe/helix-rum-js@1.0.0/src/index.js` instead.

To enable advanced RUM functionality, such as reporting of Core Web Vitals, fire the `lazy` checkpoint as soon as your render-critical Javascript has executed.

```javascript
// after all render-critical Javascript has been run
sampleRUM('lazy');
```

For usage of the `sampleRUM` function, follow the [API documentation](docs/API.md).

## Development

### Build

```bash
$ npm install
```

### Test

```bash
$ npm test
```

### Lint

```bash
$ npm run lint
```
