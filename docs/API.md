<a name="sampleRUM"></a>

## sampleRUM(checkpoint, data)
log RUM if part of the sample.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| checkpoint | <code>string</code> | identifies the checkpoint in funnel |
| data | <code>Object</code> | additional data for RUM sample |
| data.source | <code>string</code> | DOM node that is the source of a checkpoint event, identified by #id or .classname |
| data.target | <code>string</code> | subject of the checkpoint event, for instance the href of a link, or a search term |

