# tiny-server-timing [![npm](https://img.shields.io/npm/v/tiny-server-timing)](https://www.npmjs.com/package/tiny-server-timing) [![build](https://github.com/pajecawav/tiny-server-timing/actions/workflows/ci.yml/badge.svg)](https://github.com/pajecawav/tiny-server-timing/actions/workflows/ci.yml)

A simple library for measuring execution time of your functions and building [Server-Timing](https://developer.mozilla.org/docs/Web/HTTP/Headers/Server-Timing) HTTP header.

## Install

```sh
npm install tiny-server-timing

# or

yarn add tiny-server-timing

# or

pnpm add tiny-server-timing
```

## Usage

```ts
import { ServerTiming } from "tiny-server-timing";

const timing = new ServerTiming();

timing.start("task");
runSomeTask();
timing.end("task");

// or you can manually add a timing entry
timing.add("foo", 123456);

const headers = timing.getHeaders();

console.log(headers);
// { 'Server-Timing': 'task;dur=45.08, foo;dur=123456.00' }
```

You can also use `time` and `timeAsync` methods to automatically time a task:

```ts
import { ServerTiming } from "tiny-server-timing";

function getSomeDataFromDb() {
    // do some work here
    return "foobar";
}

const timing = new ServerTiming();

const dataFromDb = timing.time("db", () => getSomeDataFromDb());

console.log(dataFromDb);
// foobar
console.log(timing.getHeaders());
// { 'Server-Timing': 'db;dur=0.11' }
```

`ServerTiming` constructor can also accept options:

```ts
import { ServerTiming } from "tiny-server-timing";

const timing = new ServerTiming({
    autoEnd: false, // automatically end all pending tasks when getHeaders is called
    precision: 2, // how many decimal points to use for timings
    allowOrigin: "https://example.com, https://foo.bar", // value of Timing-Allow-Origin header
});

timing.add("bar", 123);

console.log(timing.getHeaders());
// {
//   'Server-Timing': 'bar;dur=123.00',
//   'Timing-Allow-Origin': 'https://example.com, https://foo.bar'
// }
```
