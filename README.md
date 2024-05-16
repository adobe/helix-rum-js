# AEM RUM JS

> AEM RUM Event Generator for JavaScript

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-rum-js.svg)](https://codecov.io/gh/adobe/helix-rum-js)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/adobe/helix-rum-js/main.yaml)](https://github.com/adobe/helix-rum-js/actions/workflows/main.yaml)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-rum-js.svg)](https://github.com/adobe/helix-rum-js/issues)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Instrument your website with RUM

If your website is not built using AEM Edge Delivery Services it is recommended to setup RUM in standalone mode.

To do it, simply add the following script to your pages.
```
<script defer type="text/javascript" src="https://rum.hlx.page/.rum/@adobe/helix-rum-js@^2/dist/rum-standalone.js"/>
```
It is recommended to add the script tag, after the [LCP](https://web.dev/articles/lcp) of your page. If you don't know where the LCP of your page is, simply add the script at the bottom of the page.

Check the following link for [advanced configuration options](docs/STANDALONE-ADVANCED-CONFIG.md).


## Edge Delivery Service Projects

Note that websites implemented with Adobe Edge Delivery Services, based on the boilerplate are already instrumented with RUM.

For more details about RUM in Edge Delivery Projects, upgrading from previous versions of RUM, or customization options, you can check the page [RUM in Edge Delivery Services projects](docs/RUM-IN-EDGE-DELIVERY-SERVICES.md)


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


