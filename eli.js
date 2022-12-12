/**
 * **Install introspection functions for event listeners, similar to those in Chrome debug console.**
 *
 * Every event target gains the following methods in addition to addEventListener and removeEventListener:
 *  - `getEventListeners()` - return an object mapping installed listener types to an array of listeners;
 *  - `getEventListeners(type)` - return an array of installed listeners for this type, or an empty array.
 *  - `removeAllEventListeners()` - remove all event listeners;
 *  - `removeAllEventListeners(type)` - remove all event listeners of this particular type.
 *
 * Each entry in an array of installed listeners is an object with the fields `type`, `listener`, `capture`, `passive`,
 * `once`, and `signal`. Each field corresponds to a similarly-named argument for an
 * [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
 *
 * @example Remove all 'click' event listeners from an object
 * ```javascript
 * let obj = document.getElementById("click-monitor");
 * obj.removeEventListeners("click");
 * ```
 */
function installEventListenerIntrospection() {
	let cls = EventTarget.prototype;

	if (cls._eli_addEventListener !== undefined) return;

	// addEventListener patch ------------------------------------------------------------------------------------------
	cls._eli_addEventListener = cls.addEventListener
	cls.addEventListener = function (type, listener, extra) {
		if (this._eli_data === undefined) this._eli_data = {};
		if (this._eli_data[type] === undefined) this._eli_data[type] = new Array();

		let info = {
			type: type,
			listener: listener,
			capture: false,
			passive: false,
			once: false,
			signal: null
		};

		if (extra === undefined) { }
		else if (typeof extra === 'boolean') info.capture = extra;
		else {
			if (extra.capture !== undefined) info.capture = extra.capture;
			if (extra.passive !== undefined) info.passive = extra.passive;
			if (extra.once !== undefined) info.once = extra.once;
			if (extra.signal !== undefined) info.signal = extra.signal;
		}

		this._eli_data[type].push(info);
		this._eli_addEventListener(type, listener, extra);
	}

	// removeEventListener patch ---------------------------------------------------------------------------------------
	cls._eli_removeEventListener = cls.removeEventListener
	cls.removeEventListener = function (type, listener, extra) {
		if (this._eli_data === undefined || this._eli_data[type] === undefined) {
			this._eli_removeEventListener(type, listener, extra);
			return;
		}

		let capture = false;
		if (extra === undefined) { }
		else if (typeof extra === 'boolean') capture = extra;
		else if (extra.capture !== undefined) capture = extra.capture;

		this._eli_data[type] = this._eli_data[type].filter(el => !(el.listener === listener && el.capture === capture));
		this._eli_removeEventListener(type, listener, extra);
	}

	// getEventListeners -----------------------------------------------------------------------------------------------
	function cloneEventListener(obj) {
		return {
			type: obj.type,
			listener: obj.listener,
			capture: obj.capture,
			passive: obj.passive,
			once: obj.once,
			signal: obj.signal
		};
	}

	function cloneEventListenerArray(arr) {
		let result = new Array();
		for (const el of arr) result.push(cloneEventListener(el));
		return result;
	}

	cls.getEventListeners = function (type) {
		if (type === undefined) {
			if (this._eli_data === undefined) return {};

			let result = {};
			for (const type in this._eli_data) {
				if (!Object.hasOwn(this._eli_data, type)) continue;

				if (this._eli_data[type].length > 0) result[type] = this.getEventListeners(type);
			}

			return result;
		}

		if (this._eli_data === undefined || this._eli_data[type] === undefined) {
			return new Array();
		}

		return cloneEventListenerArray(this._eli_data[type]);
	}

	// removeAllEventListeners -----------------------------------------------------------------------------------------
	cls.removeAllEventListeners = function (type) {
		if (this._eli_data === undefined) return;

		if (type === undefined) {
			for (const type in this._eli_data) {
				if (!Object.hasOwn(this._eli_data, type)) continue;

				this.removeAllEventListeners(type);
			}
			return;
		}

		while (this._eli_data[type].length > 0) {
			this.removeEventListener(type, this._eli_data[type][0].listener, this._eli_data[type][0].capture);
		}
	}
}
