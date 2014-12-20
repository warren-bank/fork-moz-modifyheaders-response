# [moz-modifyheaders-response](https://github.com/warren-bank/moz-modifyheaders-response/tree/response)

Firefox add-on: Add, modify and filter the HTTP response headers received from web servers.

## Summary

* Forked from [v0.7.1.1  of "Modify Headers"](https://github.com/garethhunt/modifyheaders/tree/v0.7.1.1) by [Gareth Hunt](https://addons.mozilla.org/en-US/firefox/user/gareth-hunt/)
  * [project home](http://www.garethhunt.com/modifyheaders/)
  * [github repo](https://github.com/garethhunt/modifyheaders)
  * [AMO](https://addons.mozilla.org/en-US/firefox/addon/modify-headers/)

* The ["response" branch](https://github.com/warren-bank/moz-modifyheaders-response/tree/response) has been modified from the original/official addon to achieve the following objectives:
  * same UI
  * modifies __RESPONSE__ headers, rather than REQUEST
  * the 2 addons can run side-by-side

## AMO <sub>(addons.mozilla.org)</sub>

* ["Modify Response Headers"](https://addons.mozilla.org/en-US/firefox/addon/modify-response-headers/)

## Comments

* The [`moz-rewrite`](https://github.com/warren-bank/moz-rewrite) project currently contains 3 addon variations:
  * Javascript (evaluated by `Cu.evalInSandbox()`):
    * [`js/Cu.evalInSandbox/master` branch](https://github.com/warren-bank/moz-rewrite/tree/js/Cu.evalInSandbox/master)
    * [AMO](https://addons.mozilla.org/en-US/firefox/addon/moz-rewrite-js/)
  * Javascript (evaluated by `eval()`):
    * [`js/eval/master` branch](https://github.com/warren-bank/moz-rewrite/tree/js/eval/master)
    * not hosted on AMO
  * JSON (parsed by `JSON.parse()`):
    * [`json/master` branch](https://github.com/warren-bank/moz-rewrite/tree/json/master)
    * [AMO](https://addons.mozilla.org/en-US/firefox/addon/moz-rewrite-json/)
* Any one of these variations makes the functionality of "Modify Headers" feel like a child's toy
* All variations require that the data be input/edited externally. The data is saved to text files, and must obey a format convention.
* Nevertheless, some individuals feel that the format of the input data is too complicated
* This class of user:
  * isn't shy to ask for a tool that is simpler and more user-friendly
  * is familiar with "Modify Headers" and comfortable using its UI
  * wants a version of "Modify Headers" that can modify response HTTP headers
* I have no intention to add another branch to [`moz-rewrite`](https://github.com/warren-bank/moz-rewrite) for the purpose of including a UI to display/edit input data. To do so doesn't solve the problem of complexity.
* Authoring the ["response" branch](https://github.com/warren-bank/moz-modifyheaders-response/tree/response) of this fork seemed to be the best all-around solution
  * [`moz-rewrite`](https://github.com/warren-bank/moz-rewrite) remains intact
  * ["Modify Response Headers"](https://addons.mozilla.org/en-US/firefox/addon/modify-response-headers/) satisfies the needs for this class of user

## License
  > [MPL v1.1](https://www.mozilla.org/MPL/1.1/index.txt)

  > Copyright (c) 2005, Gareth Hunt

  > Copyright (c) 2014, Warren Bank
