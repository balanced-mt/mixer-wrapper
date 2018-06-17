if (process.env["VSCODE_PID"] !== undefined) {

	const oldPromise: typeof Promise = <any>global.Promise;
	class CustomPromise<T> extends oldPromise<T> {
		stacktrace: string;
		constructor(executor: (resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => void) {
			super(executor);
			Object.setPrototypeOf(this, new.target.prototype);
			this.stacktrace = <any>new Error().stack;
		}

		callbacks: {
			type: "fulfilled" | "rejected",
			callback: any,
			stacktrace: string
		}[] = [];

		then<T1 = T, T2 = never>(onfulfilled?: ((value: T) => T1 | PromiseLike<T1>) | undefined | null, onrejected?: ((reason: any) => T2 | PromiseLike<T2>) | undefined | null): Promise<T1 | T2> {
			if (onfulfilled) {
				this.callbacks.push({ type: "fulfilled", callback: onfulfilled, stacktrace: <any>new Error().stack });
			}
			if (onrejected) {
				this.callbacks.push({ type: "rejected", callback: onrejected, stacktrace: <any>new Error().stack });
			}
			return super.then(onfulfilled, onrejected);
		}
	}

	global.Promise = CustomPromise;

	// yes VSCode I'm tired of your shit... no, seriously... I'm done!
	(<any>global.Promise).race = <T>(promises: PromiseLike<T>[]): Promise<T> => {
		let finished = false;
		promises = <any>promises.map(promise => {
			if (promise instanceof CustomPromise) {
				return new Promise((resolve, reject) => {
					promise.then((val) => {
						finished = true;
						resolve(val);
					}, (err) => {
						if (!finished) {
							finished = true;
							reject(err);
						}
						finished = true;
					});
				});
			} else {
				return promise;
			}
		});
		return oldPromise.race(promises);
	};
	console.warn("[Bootstrap] Injecting dirty VSCode hacks!");
} else {
	const oldPromise: typeof Promise = <any>global.Promise;
	class CustomPromise<T> extends oldPromise<T> {
		stacktrace: string;
		constructor(executor: (resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => void) {
			super(executor);
			Object.setPrototypeOf(this, new.target.prototype);
			this.stacktrace = <any>new Error().stack;
		}
	}
	global.Promise = CustomPromise;
	console.log("[Bootstrap] Injecting promise constructor stacktraces!");
}

process.on(<any>"unhandledRejection", (reason: any, p: any) => {
	console.error("Unhandled Rejection at:", p, "reason:", reason);
});