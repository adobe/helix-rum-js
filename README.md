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
```html
<script defer type="text/javascript" src="https://rum.hlx.page/.rum/@adobe/helix-rum-js@^2/dist/rum-standalone.js"></script>
```
If you understand the details of a high performance page, it might be advisable to load the script after the [LCP](https://web.dev/articles/lcp) event

Check the following link for [advanced configuration options](docs/STANDALONE-ADVANCED-CONFIG.md).

Also, you can instrument your website with [RUM using Google Tag Manager](docs/STANDALONE-GTM.md)

### Content Security Policy
If your website implements a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) it is important to ensure
that the origin `https://rum.hlx.page` is allowed both as a script source and as a destination for `navigator.sendBeacon` API.

### Testing the setup

1. Access a page of your website where you have included the RUM script.
2. Adding to the url the request parameter `rum=on` and reload the page
3. Open browser console and check that `ping` messages are being written.
   
   ![ping-messages-in-console](https://github.com/adobe/helix-rum-js/assets/43381734/0a2f4b25-0198-41b2-b386-740489b1f7b3)

4. Open the network tab of your browser and validate that ping requests using `POST` method to domain `rum.hlx.page` are being sent and that the response status is `201`
   
   ![rum-requests-in-network-tab](https://github.com/adobe/helix-rum-js/assets/43381734/766f1c45-223b-40e3-ba57-1237f44c9c15)



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


