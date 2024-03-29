# Helix RUM JS

> Helix RUM Event Generator for JavaScript

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-rum-js.svg)](https://codecov.io/gh/adobe/helix-rum-js)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/adobe/helix-rum-js/main.yaml)](https://github.com/adobe/helix-rum-js/actions/workflows/main.yaml)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/issues)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage
If you want to use `sampleRUM` in project based on the boilerplate, and you are using a compatible aem-lib version
there is no need for you to do any specific action.
`sampleRUM` will be initialized in aem-lib and the main checkpoints will be tracked automatically for you.

If you are not sure if your aem-lib version is compatible, open `aem.js` find the `init()` function and replace any
existing `sampleRUM` call by simply:
```javascript
sampleRUM()
```
`load` checkpoint is automatically tracked by the rum code. There's no need to add a listener to track it in the `init()` of `aem.js`.


If you want to use `sampleRUM` in a project not based on boilerplate, simply add the following code, at the very beginning
of the page load:
```javascript
import('https://rum.hlx.page/.rum/@adobe/helix-rum-js@^2/src/index.js').then((f)=> f.sampleRUM());
```

You can pin a version number by using a URL like `https://rum.hlx.page/.rum/@adobe/helix-rum-js@1.0.0/src/index.js` instead.
For usage of the `sampleRUM` function, follow the [API documentation](docs/API.md).

## BREAKING CHANGES

`sampleRUM.on` and `sampleRUM.always.on` hooks are no longer available.

They are replaced by a `CustomEvent` called `rum`.
The `detail` of the custom event is an object containing the keys:
```
{
  checkpoint: checkpoint-name,
  data: { checkpoint-data},
}
```

Simplified sample code to listen to this event:
```
  document.addEventListener('rum', (event) => {
    if(event.detail) {
      const checkpoint = event.detail.checkpoint;
      const data = event.detail.data;
      console.log(`RUM Event: checkpoint ${checkpoint} source: ${data.source}`};
    }
  });
```


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
