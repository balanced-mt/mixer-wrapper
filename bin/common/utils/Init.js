if (process.env["VSCODE_PID"] !== undefined) {
    const oldPromise = global.Promise;
    class CustomPromise extends oldPromise {
        constructor(executor) {
            super(executor);
            this.callbacks = [];
            Object.setPrototypeOf(this, new.target.prototype);
            this.stacktrace = new Error().stack;
        }
        then(onfulfilled, onrejected) {
            if (onfulfilled) {
                this.callbacks.push({ type: "fulfilled", callback: onfulfilled, stacktrace: new Error().stack });
            }
            if (onrejected) {
                this.callbacks.push({ type: "rejected", callback: onrejected, stacktrace: new Error().stack });
            }
            return super.then(onfulfilled, onrejected);
        }
    }
    global.Promise = CustomPromise;
    // yes VSCode I'm tired of your shit... no, seriously... I'm done!
    global.Promise.race = (promises) => {
        let finished = false;
        promises = promises.map(promise => {
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
            }
            else {
                return promise;
            }
        });
        return oldPromise.race(promises);
    };
    console.warn("[Bootstrap] Injecting dirty VSCode hacks!");
}
else {
    const oldPromise = global.Promise;
    class CustomPromise extends oldPromise {
        constructor(executor) {
            super(executor);
            Object.setPrototypeOf(this, new.target.prototype);
            this.stacktrace = new Error().stack;
        }
    }
    global.Promise = CustomPromise;
    console.log("[Bootstrap] Injecting promise constructor stacktraces!");
}
process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at:", p, "reason:", reason);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9jb21tb24vdXRpbHMvSW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBUyxFQUFFO0lBRTVDLE1BQU0sVUFBVSxHQUF3QixNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3ZELG1CQUF1QixTQUFRLFVBQWE7UUFFM0MsWUFBWSxRQUFxRztZQUNoSCxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFLakIsY0FBUyxHQUlILEVBQUUsQ0FBQztZQVJSLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFVBQVUsR0FBUSxJQUFJLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUMxQyxDQUFDO1FBUUQsSUFBSSxDQUFxQixXQUFxRSxFQUFFLFVBQXVFO1lBQ3RLLElBQUksV0FBVyxFQUFFO2dCQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQU8sSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ3RHO1lBQ0QsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFPLElBQUksS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUNwRztZQUNELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDNUMsQ0FBQztLQUNEO0lBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7SUFFL0Isa0VBQWtFO0lBQzVELE1BQU0sQ0FBQyxPQUFRLENBQUMsSUFBSSxHQUFHLENBQUksUUFBMEIsRUFBYyxFQUFFO1FBQzFFLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixRQUFRLEdBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN0QyxJQUFJLE9BQU8sWUFBWSxhQUFhLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDcEIsUUFBUSxHQUFHLElBQUksQ0FBQzt3QkFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNkLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUNWLElBQUksQ0FBQyxRQUFRLEVBQUU7NEJBQ2QsUUFBUSxHQUFHLElBQUksQ0FBQzs0QkFDaEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUNaO3dCQUNELFFBQVEsR0FBRyxJQUFJLENBQUM7b0JBQ2pCLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO2FBQ0g7aUJBQU07Z0JBQ04sT0FBTyxPQUFPLENBQUM7YUFDZjtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQztJQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQztDQUMxRDtLQUFNO0lBQ04sTUFBTSxVQUFVLEdBQXdCLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDdkQsbUJBQXVCLFNBQVEsVUFBYTtRQUUzQyxZQUFZLFFBQXFHO1lBQ2hILEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxVQUFVLEdBQVEsSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDMUMsQ0FBQztLQUNEO0lBQ0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7SUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO0NBQ3RFO0FBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBTSxvQkFBb0IsRUFBRSxDQUFDLE1BQVcsRUFBRSxDQUFNLEVBQUUsRUFBRTtJQUM3RCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEUsQ0FBQyxDQUFDLENBQUMifQ==