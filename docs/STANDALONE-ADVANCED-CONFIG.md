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
In this case, simply load the standalone script from the same domain and all RUM requests are routed through the same domain.
```
<script defer type="text/javascript" src="/.rum/@adobe/helix-rum-js@^2/dist/rum-standalone.js"/>
```

Please note, that the origin you set, must route `/.rum/*` requests to `https://rum.hlx.page/.rum/*`

For more complex setups, a different option is to the global variable `window.RUM_BASE` before loading the script. All RUM requests will then use that domain.

E.g.
```javascript
window.RUM_BASE = window.origin;
```
