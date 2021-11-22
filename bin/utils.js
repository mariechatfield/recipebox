const fs = require("fs");

const BUILD_DIRECTORY = "build";
const CATALOG_DIRECTORY = `${BUILD_DIRECTORY}/catalog`;
const RECIPE_DIRECTORY = `${BUILD_DIRECTORY}/recipes/`;
const STATIC_DIRECTORY = `${RECIPE_DIRECTORY}/static`;

// Location of the hand-written metadata profile TTL files
const METADATA_PROFILE_DIRECTORY = "catalog";

const AUDIT_LOG = `${STATIC_DIRECTORY}/auditLog.json`;
const IGNORED_IDS = `${STATIC_DIRECTORY}/ignoredIds.json`;

function startProcess(processName) {
  console.log(`\n----------  ${processName}  ----------\n`);
  init();
}

function initDirectory(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function initJSON(path) {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, "{}", { encoding: "utf-8" });
  }
}

function init() {
  initDirectory(BUILD_DIRECTORY);
  initDirectory(CATALOG_DIRECTORY);
  initDirectory(RECIPE_DIRECTORY);
  initDirectory(STATIC_DIRECTORY);
  initJSON(AUDIT_LOG);
  initJSON(IGNORED_IDS);
}

function escapeForFilePath(originalString) {
  return (
    originalString
      // Strip out apostrophes and periods
      .replace(/['’.]/g, "")
      // Any non-alpha character becomes an underscore
      .replace(/[^\w]/g, "_")
      // Strip out multiple underscores in a row
      .replace(/_+/g, "_")
  );
}

function mapByUID(resultArray) {
  return resultArray.reduce(
    (memo, data) => ({ ...memo, [data.uid]: data }),
    {}
  );
}

async function getAuditDataFromRecipe(recipeFile) {
  const filePath = `${RECIPE_DIRECTORY}/${recipeFile}`;
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf-8" }, (err, rawData) => {
      if (err) {
        reject(err);
      }

      try {
        const recipeData = JSON.parse(rawData);
        resolve({
          uid: recipeData.uid,
          filePath: recipeFile,
          hash: recipeData.hash,
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function updateAuditLog() {
  const allRecipes = fs
    .readdirSync(RECIPE_DIRECTORY)
    .filter((file) => file.endsWith(".json"));

  const allRecipeData = await Promise.all(
    allRecipes.map(getAuditDataFromRecipe)
  );

  const auditData = mapByUID(allRecipeData);

  fs.writeFileSync(AUDIT_LOG, JSON.stringify(auditData, null, 2), {
    encoding: "utf-8",
  });
}

async function ignoreId(recipeId, reason) {
  const currentIgnoredIds = JSON.parse(
    fs.readFileSync(IGNORED_IDS, { encoding: "utf-8" })
  );

  currentIgnoredIds[recipeId] = {
    reason,
  };

  fs.writeFileSync(IGNORED_IDS, JSON.stringify(currentIgnoredIds, null, 2), {
    encoding: "utf-8",
  });
}

module.exports = {
  AUDIT_LOG,
  CATALOG_DIRECTORY,
  METADATA_PROFILE_DIRECTORY,
  IGNORED_IDS,
  RECIPE_DIRECTORY,
  escapeForFilePath,
  ignoreId,
  mapByUID,
  startProcess,
  updateAuditLog,
};
