

// export type TestEvent = Event;

type EventCallback<T extends Function> = {
	func: T;
	this: any;
};

export class Event<T extends Function> {
	private callbacks: EventCallback<T>[] = [];

	constructor() {

	}

	public addCallback(func: T, thisArg?: any) {
		if (!func) {
			throw new Error("Callback can't be null!");
		}
		// Detect the usage of func.bind() - it kills optimization therefore is not allowed.
		if (typeof func.prototype !== "object" && (func as any).name.substr(0, 5) === "bound") {
			throw new Error("Don't use .bind() on functions! (" + (func as any).name + ")");
		}
		this.callbacks.push({
			func: func,
			this: thisArg
		});
	}

	public clearCallbacks() {
		this.callbacks = [];
	}

	public removeCallback(func: T, thisArg?: any) {
		const callbacks = Array.from(this.callbacks);
		for (let i = callbacks.length - 1; i >= 0; i--) {
			const callback = callbacks[i];
			if (callback.func === func && callback.this === thisArg) {
				callbacks.splice(i, 1);
			}
		}
		this.callbacks = callbacks;
	}

	public hasCallback(func: T, thisArg?: any) {
		for (let i = this.callbacks.length - 1; i >= 0; i--) {
			const callback = this.callbacks[i];
			if (callback.func === func && callback.this === thisArg) {
				return true;
			}
		}
		return false;
	}

	public execute: T;
}

Event.prototype.execute = function (this: Event<Function>) {
	const callbacks = (this as any).callbacks;
	const length = callbacks.length;
	for (let i = 0; i < length; i++) {
		const callback = callbacks[i];
		callback.func.apply(callback.this, arguments);
	}
};

type PromiseEventCallback<T extends Function> = {
	func: T;
	this: any;
};

export class PromiseEvent<T extends Function> {
	private callbacks: EventCallback<T>[] = [];

	constructor() {

	}

	public addCallback(func: T, thisArg?: any) {
		if (!func) {
			throw new Error("Callback can't be null!");
		}
		// Detect the usage of func.bind() - it kills optimization therefore is not allowed.
		if (typeof func.prototype !== "object" && (func as any).name.substr(0, 5) === "bound") {
			throw new Error("Don't use .bind() on functions! (" + (func as any).name + ")");
		}
		this.callbacks.push({
			func: func,
			this: thisArg
		});
	}

	public clearCallbacks() {
		this.callbacks = [];
	}

	public removeCallback(func: T, thisArg?: any) {
		const callbacks = Array.from(this.callbacks);
		for (let i = callbacks.length - 1; i >= 0; i--) {
			const callback = callbacks[i];
			if (callback.func === func && callback.this === thisArg) {
				callbacks.splice(i, 1);
			}
		}
		this.callbacks = callbacks;
	}

	public hasCallback(func: T, thisArg?: any) {
		for (let i = this.callbacks.length - 1; i >= 0; i--) {
			const callback = this.callbacks[i];
			if (callback.func === func && callback.this === thisArg) {
				return true;
			}
		}
		return false;
	}

	public execute: T;
}

PromiseEvent.prototype.execute = async function (this: PromiseEvent<Function>) {
	const callbacks = (this as any).callbacks;
	const length = callbacks.length;
	for (let i = 0; i < length; i++) {
		const callback = callbacks[i];
		await callback.func.apply(callback.this, arguments);
	}
};