# Helix RUM JS

> Helix RUM Event Generator for JavaScript

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-rum-js.svg)](https://codecov.io/gh/adobe/helix-rum-js)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/adobe/helix-rum-js/main.yaml)](https://github.com/adobe/helix-rum-js/actions/workflows/main.yaml)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/issues)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage
### A. Edge Deliver Service Projects
If you want to use `sampleRUM` in project based on the boilerplate, and you are using a compatible aem-lib version
there is no need for you to do any specific action.
`sampleRUM` will be initialized in aem-lib and the main checkpoints will be tracked automatically for you.


<u>Customizing Origins: extra scripts and data collection</u>

Loading of additional scripts such as RUM enhancer and data tracking are using the same origin, by default `https://rum.hlx.page`.

These origins can be customized by setting the variables, after importing `sampleRUM` and before invoking the function.
* `sampleRUM.baseURL`: <b>URL</b> used as a base for loading additional scripts
* `sampleRUM.collectBaseURL` : <b>URL</b> used as a base for data collection.

Starting on *Helix5 architecture* it is possible collect data using the current website domain, which would optimize data collection and prevent it from being blocked:
```javascript
sampleRUM.collectBaseURL = new URL(window.origin);
```

### B. Standalone
Available from version 2.x on.

If you want to use RUM in non Edge Delivery Service Project or an  Edge Delivery Service Project which is not based on boilerplate,
simply add the following script, at the very beginning of the page:
```
<script type="text/javascript" src="https://rum.hlx.page/.rum/@adobe/helix-rum-js@^2/dist/rum-standalone.js"/>
```

You can pin a version number by using a URL like `https://rum.hlx.page/.rum/@adobe/helix-rum-js@2.3.4/dist/rum-standalone.js` instead.

<u>Customizing Origins: extra scripts and data collection</u>u>

If you use RUM in an standalone mode and you want to route any RUM requests via a custom domain, you can do it by setting the global variable `window.RUM_BASE` before loading the script.
Please note, that the origin you set, must route `/.rum/*` requests to `https://rum.hlx.page/.rum/*`

E.g.
```javascript
window.RUM_BASE = window.origin;
```

## UPGRADES FROM RUM-JS 1.X
1. Find the `function sampleRUM()` definition in your `aem.js` or `lib-franklin.js`
2. Replace the content of the function by the content of the file `src/index.js`
3. Find the `init()` function and replace any existing `sampleRUM` call by simply:
```javascript
sampleRUM()
```

`load`, `error`, and other default checkpoints are automatically tracked by the RUM code. There's no need to add additional listeners


### BREAKING CHANGES

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
#### Build standalone

```bash
$ npm run build-standalone
```

### Test

```bash
$ npm test
```

### Lint

```bash
$ npm run lint
```


