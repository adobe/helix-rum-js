# AEM RUM JS - Standalone Advanced Configuration

Standalone mode for RUM is available from version 2.x on.

## Selecting specific version
Normally you would instrument your website with AEM RUM by adding the following script tag
```
<script defer type="text/javascript" src="https://rum.hlx.page/.rum/@adobe/helix-rum-js@^2/dist/rum-standalone.js"/>
```

You can pin a specific version number by using a URL like `https://rum.hlx.page/.rum/@adobe/helix-rum-js@2.3.4/dist/rum-standalone.js` instead.

## Customizing Origin for extra scripts and data collection

If you use RUM in an standalone mode and you want to minimize the performance impact, you could route RUM requests via the same domain that serves your website.
You could achieve that it by setting the global variable `window.RUM_BASE` before loading the script.
Please note, that the origin you set, must route `/.rum/*` requests to `https://rum.hlx.page/.rum/*`

E.g.
```javascript
window.RUM_BASE = window.origin;
```

## Adjusting the sampling rate

The default sampling rate for RUM data is 1 out of 100 requests. For some use cases, like when running experiments on low traffic pages, or during specific short-lived marketing campaigns, you may want to sample at a higher rate to gather more data for your reporting.
You can achieve this by setting the global variable `window.RUM_SAMPLING_RATE` before loading the script.
Please note that the maximum sampling rate we accept is `10` so we can guarantee the privacy-first principle, and any value > 10 will be accepted.

E.g.
```javascript
window.RUM_BASE = 10;
```
