// @ts-check

"use strict";

const { Command } = require("@lerna/command");
const { getFilteredPackages } = require("@lerna/filter-options");
const { ValidationError } = require("@lerna/validation-error");
const { watch } = require("../../../../../nx/build/packages/nx/src/command-line/watch");

module.exports = factory;

function factory(argv) {
  return new WatchCommand(argv);
}

class WatchCommand extends Command {
  get requiresGit() {
    return false;
  }

  async initialize() {
    if (!this.options.command) {
      throw new ValidationError("ENOCOMMAND", "A command to execute is required");
    }

    this.filteredPackages = await getFilteredPackages(this.packageGraph, this.execOpts, this.options);

    this.count = this.filteredPackages.length;
    this.packagePlural = this.count === 1 ? "package" : "packages";
  }

  async execute() {
    this.logger.info(
      "watch",
      "Executing command %j on changes in %d %s.",
      this.options.command,
      this.count,
      this.packagePlural
    );

    await watch({
      command: this.options.command,
      projectNameEnvName: "LERNA_PACKAGE_NAME",
      fileChangesEnvName: "LERNA_FILE_CHANGES",
      includeDependentProjects: false, // dependent projects are accounted for via lerna filter options
      projects: this.filteredPackages.map((p) => p.name),
      verbose: this.options.verbose,
    });
  }
}

module.exports.WatchCommand = WatchCommand;
