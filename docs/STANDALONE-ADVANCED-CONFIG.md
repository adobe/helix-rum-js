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
