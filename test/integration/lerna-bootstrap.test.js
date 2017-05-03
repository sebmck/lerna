import execa from "execa";
import getPort from "get-port";
import globby from "globby";
import tempy from "tempy";
import normalizePath from "normalize-path";

import { LERNA_BIN } from "../helpers/constants";
import initFixture from "../helpers/initFixture";
import copyFixture from "../helpers/copyFixture";

describe("lerna bootstrap", () => {
  describe("from CLI", () => {
    test.concurrent("bootstraps all packages", async () => {
      const cwd = await initFixture("BootstrapCommand/integration");
      const args = [
        "bootstrap",
      ];

      const stderr = await execa.stderr(LERNA_BIN, args, { cwd });
      expect(stderr).toMatchSnapshot("simple: stderr");

      const stdout = await execa.stdout(LERNA_BIN, ["run", "test", "--", "--silent"], { cwd });
      expect(stdout).toMatchSnapshot("simple: stdout");
    });

    test.concurrent("respects ignore flag", async () => {
      const cwd = await initFixture("BootstrapCommand/integration");
      const args = [
        "bootstrap",
        "--ignore",
        "@integration/package-1",
      ];

      const stderr = await execa.stderr(LERNA_BIN, args, { cwd });
      expect(stderr).toMatchSnapshot("ignore: stderr");
    });

    test.concurrent("git repo check is ignored by default", async () => {
      const cwd = await tempy.directoryAsync();
      await copyFixture(cwd, "BootstrapCommand/integration");
      const args = [
        "bootstrap",
      ];

      const stderr = await execa.stderr(LERNA_BIN, args, { cwd });
      expect(stderr).toMatchSnapshot("simple-no-git-check: stdout");
    });

    test.concurrent("errors if --no-skip-git-check is provided and repo is not initialized", async () => {
      const cwd = await tempy.directoryAsync();
      await copyFixture(cwd, "BootstrapCommand/integration");
      const args = [
        "bootstrap",
        "--no-skip-git-check"
      ];
      let expectedError = null;

      try {
        await execa(LERNA_BIN, args, { cwd });
      } catch (err) {
        expectedError = err;
      }
      expect(expectedError.toString()).toContain("ENOGIT");
    });

    test.concurrent("--npm-client yarn", async () => {
      const cwd = await initFixture("BootstrapCommand/integration");
      const args = [
        "bootstrap",
        "--npm-client",
        "yarn",
      ];

      const stderr = await execa.stderr(LERNA_BIN, args, { cwd });
      expect(stderr).toMatchSnapshot("--npm-client yarn: stderr");

      const lockfiles = await globby(["package-*/yarn.lock"], { cwd }).then(
        (globbed) => globbed.map((fp) => normalizePath(fp))
      );
      expect(lockfiles).toMatchSnapshot("--npm-client yarn: lockfiles");

      const stdout = await execa.stdout(LERNA_BIN, ["run", "test", "--", "--silent"], { cwd });
      expect(stdout).toMatchSnapshot("--npm-client yarn: stdout");
    });
  });

  describe("from npm script", async () => {
    test.concurrent("bootstraps all packages", async () => {
      const cwd = await initFixture("BootstrapCommand/integration-lifecycle");
      await execa("npm", ["install", "--cache-min=99999"], { cwd });

      const { stdout, stderr } = await execa("npm", ["test", "--silent"], { cwd });
      expect(stdout).toMatchSnapshot("npm postinstall: stdout");
      expect(stderr).toMatchSnapshot("npm postinstall: stderr");
    });

    test.skip("works with yarn install", async () => {
      const cwd = await initFixture("BootstrapCommand/integration-lifecycle");

      const port = await getPort(42042);
      const mutex = ["--mutex", `network:${port}`];

      // NOTE: yarn doesn't support linking binaries from transitive dependencies,
      // so it's important to test _both_ lifecycle variants.
      // TODO: ...eventually :P
      // FIXME: yarn doesn't understand file:// URLs... /sigh
      await execa("yarn", ["install", "--no-lockfile", ...mutex], { cwd });

      const { stdout, stderr } = await execa("yarn", ["test", "--silent", ...mutex], { cwd });
      expect(stdout).toMatchSnapshot("yarn postinstall: stdout");
      expect(stderr).toMatchSnapshot("yarn postinstall: stderr");
    });
  });
});
