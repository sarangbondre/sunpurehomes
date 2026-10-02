import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  AVAILABILITY_FILES,
  PROJECT_FILES,
  SCENE_FILES,
} from "@/lib/content-files";

/**
 * The content used to be read from these directories at runtime. It is
 * imported now, so nothing reads the directory and nothing would notice a
 * file that was added and never imported. This is that check, moved to the
 * one place that still has a filesystem: the test run.
 */
const onDisk = (dir: string) =>
  readdirSync(join(process.cwd(), "content", dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();

describe("content-files", () => {
  for (const [dir, imported] of [
    ["projects", PROJECT_FILES],
    ["scenes", SCENE_FILES],
    ["availability", AVAILABILITY_FILES],
  ] as const) {
    it(`imports every file in content/${dir}`, () => {
      assert.deepEqual(Object.keys(imported).sort(), onDisk(dir));
    });
  }

  it("keys each file by its own slug", () => {
    for (const [slug, raw] of Object.entries(PROJECT_FILES)) {
      assert.equal((raw as { slug: string }).slug, slug);
    }
  });
});
