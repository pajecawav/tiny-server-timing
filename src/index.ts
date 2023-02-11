export interface ServerTimingOptions {
	autoEnd?: boolean;
	precision?: number;
	allowOrigin?: string;
}

export interface ServerTimingHeaders {
	"Server-Timing": string;
	"Timing-Allow-Origin"?: string;
}

interface FinishedTiming {
	name: string;
	durationMs: number;
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

	constructor(options: ServerTimingOptions = {}) {
		this.autoEnd = options.autoEnd ?? false;
		this.precision = options.precision ?? 2;
		this.allowOrigin = options.allowOrigin;
	}

	start(name: string, description?: string) {
		this.pending.set(name, { startedAt: now(), description });
	}

	end(name: string) {
		const endedAt = now();

		const pendingTiming = this.pending.get(name);
		if (!pendingTiming) {
			throw new Error(`end() was called but there is no pending task '${name}'`);
		}
		this.pending.delete(name);

		const durationMs = endedAt - pendingTiming.startedAt;

		this.add(name, durationMs, pendingTiming.description);
	}

	add(name: string, durationMs: number, description?: string) {
		this.finished.push({ name, durationMs, description });
	}

	time<T>(name: string, fn: () => T, description?: string): T {
		this.start(name, description);
		const result = fn();
		this.end(name);
		return result;
	}

	async timeAsync<T>(name: string, fn: () => Promise<T>, description?: string): Promise<T> {
		this.start(name, description);
		const result = await fn();
		this.end(name);
		return result;
	}

	getHeaders(): ServerTimingHeaders {
		if (this.autoEnd) {
			for (const name of this.pending.keys()) {
				this.end(name);
			}
		}

		const entries: string[] = [];
		for (const timing of this.finished) {
			const dur = timing.durationMs.toFixed(this.precision);
			const values = [timing.name, `dur=${dur}`];

			if (timing.description) {
				values.push(`desc="${timing.description}"`);
			}

			entries.push(values.join(";"));
		}

		const headers: ServerTimingHeaders = {
			"Server-Timing": entries.join(", "),
		};

		if (this.allowOrigin) {
			headers["Timing-Allow-Origin"] = this.allowOrigin;
		}

		return headers;
	}
}
