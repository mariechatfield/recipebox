const fs = require("fs");

const OUTPUT_DIRECTORY = "recipes";
const AUDIT_LOG = "auditLog.json";
const IGNORED_IDS = "ignoredIds.json";

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

async function getAuditDataFromRecipe(recipeFile) {
  const filePath = `${OUTPUT_DIRECTORY}/${recipeFile}`;
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
    .readdirSync(OUTPUT_DIRECTORY)
    .filter((file) => file.endsWith(".json"));

  const allRecipeData = await Promise.all(
    allRecipes.map(getAuditDataFromRecipe)
  );

  const auditData = allRecipeData.reduce(
    (memo, recipeData) => ({
      ...memo,
      [recipeData.uid]: recipeData,
    }),
    {}
  );

  fs.writeFileSync(AUDIT_LOG, JSON.stringify(auditData, null, 2), {
    encoding: "utf-8",
  });
}

module.exports = {
  AUDIT_LOG,
  IGNORED_IDS,
  OUTPUT_DIRECTORY,
  escapeForFilePath,
  startProcess,
  updateAuditLog,
};
