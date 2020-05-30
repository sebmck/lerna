"use strict";

const { CHANGELOG_HEADER_TEMPLATE, COMMIT_GUIDELINE, EOL } = require("./constants");

module.exports = getChangeLogHeader;

/**
 * Changes default change log header with the provided header
 * @param {String} header
 * @returns {String} updated header
 */
function getChangeLogHeader(header = "Change Log") {
  const changeLogHeader = [...CHANGELOG_HEADER_TEMPLATE, COMMIT_GUIDELINE];
  changeLogHeader[0] = `# ${header}`;
  return changeLogHeader.join(EOL);
}