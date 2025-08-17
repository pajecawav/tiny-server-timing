export interface ServerTimingOptions {
	autoEnd?: boolean;
	precision?: number;
	allowOrigin?: string;
}

interface FinishedTiming {
	name: string;
	duration: number;
	description?: string;
}

interface PendingTiming {
	startedAt: number;
	description?: string;
}

function now() {
	if (typeof globalThis.process?.hrtime?.bigint === "function") {
		return Number(process.hrtime.bigint()) / 1e6;
	} else if (typeof globalThis.performance?.now === "function") {
		return performance.now();
	}
	return Date.now();
}

export class ServerTiming {
	private finished: FinishedTiming[] = [];
	private pending: Map<string, PendingTiming> = new Map();

	private autoEnd: boolean;
	private precision: number;
	private allowOrigin?: string;

	public constructor(options: ServerTimingOptions = {}) {
		this.autoEnd = options.autoEnd ?? false;
		this.precision = options.precision ?? 2;
		this.allowOrigin = options.allowOrigin;
	}

	public start(name: string, description?: string) {
		this.pending.set(name, { startedAt: now(), description });
	}

	public end(name: string) {
		const endedAt = now();

		const pendingTiming = this.pending.get(name);
		if (!pendingTiming) {
			throw new Error(`end() was called but there is no pending task '${name}'`);
		}
		this.pending.delete(name);

		const duration = endedAt - pendingTiming.startedAt;

		this.add(name, duration, pendingTiming.description);
	}

	public add(name: string, duration: number, description?: string) {
		this.finished.push({ name, duration, description });
	}

	public time<T>(name: string, fn: () => T, description?: string): T {
		this.start(name, description);
		const result = fn();
		this.end(name);
		return result;
	}

	public async timeAsync<T>(
		name: string,
		fn: () => Promise<T>,
		description?: string,
	): Promise<T> {
		this.start(name, description);
		const result = await fn();
		this.end(name);
		return result;
	}

	public getHeaders(): Record<string, string> {
		const entries = this.getEntries().map(timing => {
			const dur = timing.duration.toFixed(this.precision);
			const values = [timing.name, `dur=${dur}`];

			if (timing.description) {
				values.push(`desc="${timing.description}"`);
			}

			return values.join(";");
		});

		const headers: Record<string, string> = {
			"Server-Timing": entries.join(", "),
		};

		if (this.allowOrigin) {
			headers["Timing-Allow-Origin"] = this.allowOrigin;
		}

		return headers;
	}

	public getEntries(): FinishedTiming[] {
		if (this.autoEnd) {
			for (const name of this.pending.keys()) {
				this.end(name);
			}
		}

		return this.finished;
	}
}
