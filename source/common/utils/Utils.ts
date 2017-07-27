declare var process: any;

export class Utils {

	public static RangeInt(min: number, max: number): number {
		min = (min) | 0;
		max = (max) | 0;
		return ((Math.random() * (max - min)) + min) | 0;
	}

	public static RangeFloat(min: number, max: number): number {
		min = +(min);
		max = +(max);
		return +((Math.random() * (max - min)) + min);
	}

	public static PickArray<T>(array: T[]): T | undefined {
		if (array.length <= 0) {
			return undefined;
		}
		return array[Utils.RangeInt(0, array.length)];
	}

	public static async Timeout(ms: number): Promise<number> {
		let lastTime = Date.now();
		return new Promise<number>(resolve => {
			setTimeout((args, ms) => {
				resolve(Date.now()-lastTime);
			}, ms);
		});
	}

	public static async Immediate<T>(value?: T): Promise<T> {
		return new Promise<T>(resolve => {
			setImmediate(() => resolve(value));
		});
	}

	public static async NextTick<T>(value?: T): Promise<T> {
		return new Promise<T>(resolve => {
			if (process !== undefined) {
				process.nextTick(() => resolve(value));
			} else {
				setImmediate(() => resolve(value));
			}
		});
	}

	private static hidIndex = 0;
	public static generateHID() {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let text = "";
		const time = new Date().valueOf();
		for (let i = 0; i < 8; i++) {
			text += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		for (let i = 0; i < 2; i++) {
			text += chars.charAt(Math.floor(i > 0 ? Utils.hidIndex / Math.pow(chars.length, i) : Utils.hidIndex) % chars.length);
		}
		Utils.hidIndex++;
		for (let i = 0; i < 6; i++) {
			text += chars.charAt(Math.floor(i > 0 ? time / Math.pow(chars.length, i) : time) % chars.length);
		}
		return text;
	}
}
