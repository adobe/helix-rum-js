# AEM RUM JS - Edge Delivery Services Projects

Projects based on the boilerplate are already instrumented with RUM, there is no need for you to do any specific action.

`sampleRUM` will be initialized in aem-lib and the main checkpoints will be tracked automatically for you.

For Edge Delivery Services projects not based on the boilerplate, it is recommended to use the [standalone instrumentation](../README.md).

### Customizing Origins: extra scripts and data collection

Loading of additional scripts such as RUM enhancer and data tracking are using the same origin, by default `https://rum.hlx.page`.

These origins can be customized by setting the variables, after importing `sampleRUM` and before invoking the function.
* `sampleRUM.baseURL`: <b>URL</b> used as a base for loading additional scripts
* `sampleRUM.collectBaseURL` : <b>URL</b> used as a base for data collection.

Starting on *Helix5 architecture* it is possible collect data using the current website domain, which would optimize data collection and prevent it from being blocked:
```javascript
sampleRUM.collectBaseURL = new URL(window.origin);
```

## UPGRADES FROM RUM-JS 1.X
1. Find the `function sampleRUM()` definition in your `aem.js` or `lib-franklin.js`
2. Replace the content of the function by the content of the file `src/index.js`
3. Find the `init()` function and replace any existing `sampleRUM` call by simply:
```javascript
sampleRUM()
```

`load`, `error`, and other default checkpoints are automatically tracked by the RUM code. There's no need to add additional listeners


### BREAKING CHANGES in version 2.x

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

## Extending sampleRUM usage

For usage of the `sampleRUM` function, follow the [API documentation](docs/API.md), but note that you should not and do not have to call the function directly anymore.
