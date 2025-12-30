*For those who are on git, this is a little note page for myself. I plan to add settings at some point*

How to configs in Swarmtunes

Configs are not just values and not just JSON. JSON is storage **NOT** The config itself.
What does that mean? Configs should have schema! They should be strongly typed on both client and server!

I this case I think JSON schema *(not storage)* is ideal for cross compatiblity. Eg:
```JSON
"name": "ShowYouTubeResults",
"type": "boolean",
"default": false,
"scope": "all",
"requiresRestart": false,
```

- **name**: The name of the config
- **type**: Value type
- **accepted**: for enums this is possible values
- **default**: default value
- **scope**: How the value is stored. Eg: For only logged in (server side), on device, temperaily, or all of the above
- **requiresRestart**: Reload the page or no

This is very strict for good reasion. The UI needs to know what to draw, and the server needs to know what to accept.

For the client side it just does *PATCH* reqests to server and stores it in local or session storage.\
On the server side it compaires the values with the expected schemea and reports success.

For migration the client is requires to send version info and the server only has to store migration infomation. So it only saves the most up to date config info and the client is expected to accept that. Also maybe server reverse it so the server talks correctly to old clients if possible? But not matter what the server stores most up to date configs when possible!