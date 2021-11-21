const fs = require("fs");

const CATALOG_DIRECTORY = "catalog";
const RECIPE_DIRECTORY = "recipes";
const STATIC_DIRECTORY = `${RECIPE_DIRECTORY}/static`;

const AUDIT_LOG = `${STATIC_DIRECTORY}/auditLog.json`;
const IGNORED_IDS = `${STATIC_DIRECTORY}/ignoredIds.json`;

function startProcess(processName) {
  console.log(`\n----------  ${processName}  ----------\n`);
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

module.exports = {
  AUDIT_LOG,
  CATALOG_DIRECTORY,
  IGNORED_IDS,
  RECIPE_DIRECTORY,
  escapeForFilePath,
  mapByUID,
  startProcess,
  updateAuditLog,
};
