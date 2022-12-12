# Event Listener Introspection
Install this in your greasemonkey script to enable control over event listeners: inspection, modification, and removal.
```javascript
// ==UserScript==
// ...
// @require     https://raw.githubusercontent.com/andreasxp/event-listener-introspection/main/eli.js
// ...
// ==/UserScript==

installEventListenerIntrospection();

(function() {
    'use strict';

    let obj = document.getElementById("block-clicks-here");
	obj.removeEventListeners("click");
})();
```

# Installation
Add the following line to your greasemonkey script header:
```javascript
// @require     https://raw.githubusercontent.com/andreasxp/event-listener-introspection/main/eli.js
```
Then install the introspection patch by calling the function as early as possible:
```javascript
installEventListenerIntrospection();
``` 
