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
// Usage in aem-lib.js
// sampleRUM();
// Usage in non-boilerplate
// import(sampleRUM.js).then((f)=> f.sampleRUM());

If you want to use `sampleRUM` in project based on the boilerplate, and you are using a compatible aem-lib version
there is no need for you to do any specific action.
`sampleRUM` will be initialized in aem-lib and the main checkpoints will be tracked automatically for you.

If you are not sure if your aem-lib version is compatible, open `aem.js` find the `init()` function and replace any
existing `sampleRUM` call by simply:
```javascript
sampleRUM()
```
`error` and `load` listeners are added automatically in the rum enhancer code. There's no need to add them in the `init()` of `aem.js`.


If you want to use `sampleRUM` in a project not based on boilerplate, simply add the following code, at the very beginning
of the page load:
```javascript
import('https://rum.hlx.page/.rum/@adobe/helix-rum-js@^2/src/index.js').then((f)=> f.sampleRUM());
```

You can pin a version number by using a URL like `https://rum.hlx.page/.rum/@adobe/helix-rum-js@1.0.0/src/index.js` instead.
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
