"use strict";

// local modules _must_ be explicitly mocked
jest.mock("../lib/git-push");
jest.mock("../lib/is-anything-committed");
jest.mock("../lib/is-behind-upstream");
jest.mock("../lib/remote-branch-exists");

const path = require("path");

// mocked modules
const runLifecycle = require("@lerna/run-lifecycle");
const loadJsonFile = require("load-json-file");

// helpers
const initFixture = require("@lerna-test/init-fixture")(path.resolve(__dirname, "../../publish/__tests__"));

// test command
const lernaVersion = require("@lerna-test/command-runner")(require("../command"));

describe("lifecycle scripts", () => {
  const npmLifecycleEvent = process.env.npm_lifecycle_event;

  afterEach(() => {
    process.env.npm_lifecycle_event = npmLifecycleEvent;
  });

  it("calls version lifecycle scripts for root and packages", async () => {
    const cwd = await initFixture("lifecycle");

    await lernaVersion(cwd)();

    expect(runLifecycle).toHaveBeenCalledTimes(6);

    ["preversion", "version", "postversion"].forEach(script => {
      // "lifecycle" is the root manifest name
      expect(runLifecycle).toHaveBeenCalledWith(expect.objectContaining({ name: "lifecycle" }), script);
      expect(runLifecycle).toHaveBeenCalledWith(expect.objectContaining({ name: "package-1" }), script);
    });

    // package-2 lacks version lifecycle scripts
    expect(runLifecycle).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "package-2" }),
      expect.any(String)
    );

    expect(runLifecycle.getOrderedCalls()).toEqual([
      ["lifecycle", "preversion"],
      ["package-1", "preversion"],
      ["package-1", "version"],
      ["lifecycle", "version"],
      ["package-1", "postversion"],
      ["lifecycle", "postversion"],
    ]);

    expect(loadJsonFile.registry).toMatchInlineSnapshot(`
Map {
  "/packages/package-1" => 2,
  "/packages/package-2" => 2,
}
`);
  });

  it("does not execute recursive root scripts", async () => {
    const cwd = await initFixture("lifecycle");

    process.env.npm_lifecycle_event = "version";

    await lernaVersion(cwd)();

    expect(runLifecycle.getOrderedCalls()).toEqual([
      ["package-1", "preversion"],
      ["package-1", "version"],
      ["package-1", "postversion"],
    ]);
  });
});
