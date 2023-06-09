#!/usr/bin/env -S deno run
import { parse } from "https://deno.land/std@0.184.0/flags/mod.ts";
import { delay } from "https://deno.land/std@0.184.0/async/delay.ts";
import { writeAll } from "https://deno.land/std@0.184.0/streams/write_all.ts";

type Args = {
  help: boolean;
  inplace: boolean;
  multiline: boolean;
  count: number;
  interval: number;
};

const encoder = new TextEncoder();

function parseArgs(args: string[]): Args {
  const { help, inplace, count, interval, multiline } = parse(args, {
    alias: {
      "h": "help",
      "I": "inplace",
      "c": "count",
      "i": "interval",
      "m": "multiline",
    },
    boolean: [
      "help",
      "inplace",
      "multiline",
    ],
    string: [
      "count",
      "interval",
    ],
    default: {
      "count": "10",
      "interval": "100",
    },
  });
  return {
    help,
    inplace,
    multiline,
    "count": Number(count),
    "interval": Number(interval),
  };
}

function formatProgress(i: number, count: number): string {
  const digits = count.toString(10).length;
  return `${i.toString(10).padStart(digits, "0")}/${count}`;
}

async function main(): Promise<void> {
  const { help, inplace, count, interval, multiline } = parseArgs(Deno.args);
  if (help) {
    console.log("Usage: progresstest [OPTIONS]");
    console.log();
    console.log("Options:");
    console.log("  -h, --help               Print help");
    console.log("  -I, --inplace            Update progress inplace");
    console.log("  -m, --multiline          Print multiple lines");
    console.log("  -c, --count=COUNT        Progress count");
    console.log(
      "  -i, --interval=INTERVAL  Progress interval in milli seconnds",
    );
    Deno.exit(1);
  }
  const w = Deno.stderr;
  if (multiline) {
    await writeAll(
      w,
      encoder.encode(
        "**********************************************************\n",
      ),
    );
    await writeAll(w, encoder.encode("This is multiline progress test\n"));
    await writeAll(
      w,
      encoder.encode(
        "**********************************************************\n",
      ),
    );
  }
  for (let i = 0; i < count; i++) {
    await delay(interval);
    const m = `Progress... ${formatProgress(i + 1, count)}${
      inplace ? "\r" : "\n"
    }`;
    await writeAll(w, encoder.encode(m));
  }
}

main();
