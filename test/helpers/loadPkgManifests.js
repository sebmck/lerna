import globby from "globby";
import loadJsonFile from "load-json-file";

export default loadPkgManifests;

async function loadPkgManifests(cwd) {
  const files = await globby(
    [
      // all child packages, at any level
      "**/package.json",
      // but not the root
      "!package.json",
      // and not installed
      "!**/node_modules",
    ],
    {
      cwd,
      absolute: true,
    },
  );

  return Promise.all(files.map(fp => loadJsonFile(fp)));
}
