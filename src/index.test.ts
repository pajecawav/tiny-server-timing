import { describe, expect, it } from "vitest";
import { ServerTiming } from ".";

const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));

describe("ServerTiming", () => {
	it("returns Server-Timing header", () => {
		const timing = new ServerTiming();
		for (const name of ["foo", "bar"]) {
			timing.start(name);
			timing.end(name);
		}

		const headers = timing.getHeaders();
		const value = headers["Server-Timing"];

		expect(value).toBeTypeOf("string");
		expect(value).toContain("foo;dur=");
		expect(value).toContain("bar;dur=");
	});

	it("adds description when provided", () => {
		const timing = new ServerTiming();

		timing.start("test", "fizz buzz");
		timing.end("test");

		const headers = timing.getHeaders();
		const value = headers["Server-Timing"];

		expect(value).toContain('desc="fizz buzz"');
	});

	it("handles multiple timings with same name", () => {
		const timing = new ServerTiming();
		for (let i = 0; i < 3; i++) {
			timing.start("foobar");
			timing.end("foobar");
		}

		const value = timing.getHeaders()["Server-Timing"];
		const matches = [...value.matchAll(/foobar/g)];
		expect(matches).toHaveLength(3);
	});

	it("throws when trying to end non-pending timing", () => {
		const timing = new ServerTiming();
		expect(() => timing.end("foo")).toThrow(/no pending task/i);
	});

	it("auto-ends timings when autoEnd is 'true'", () => {
		const timing = new ServerTiming({ autoEnd: true });
		timing.start("hello");

		const headers = timing.getHeaders();
		const value = headers["Server-Timing"];

		expect(value).toContain("hello");
	});

	it("adds Timing-Allow-Origin when provided", () => {
		const timing = new ServerTiming({ allowOrigin: "https://example.com" });

		const headers = timing.getHeaders();
		const origin = headers["Timing-Allow-Origin"];

		expect(origin).toEqual("https://example.com");
	});

	it("rounds duration to a given precision", async () => {
		const timing = new ServerTiming({ precision: 0 });

		timing.start("foobar");
		await sleep(100);
		timing.end("foobar");

		const value = timing.getHeaders()["Server-Timing"];
		expect(value).toMatch(/^foobar;dur=\d+$/);
	});

	it("'time' automatically tracks execution time of a function", () => {
		const timing = new ServerTiming({ precision: 0 });

		const result = timing.time("foo", () => 123);
		expect(result).toBe(123);

		const value = timing.getHeaders()["Server-Timing"];
		expect(value).toContain("foo");
	});

	it("'timeAsync' automatically tracks execution time of an async function", async () => {
		const timing = new ServerTiming({ precision: 0 });

		const result = await timing.timeAsync(
			"bar",
			() => new Promise<string>(r => setTimeout(r, 10, "456"))
		);
		expect(result).toBe("456");

		const value = timing.getHeaders()["Server-Timing"];
		expect(value).toContain("bar");
	});
});
