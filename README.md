# Recipebox

A tiny catalog collector for my personal collection of recipes.

View the [live catalog](https://ddw-corewebapp.dev.data.world/recipebox).

- Maintain metadata profile with my custom cooking ontology
- Sync recipes from [Paprika app](https://www.paprikaapp.com/)
- Transform Paprika recipes into TTL
- Upload TTL to ddw

## One Time Setup

Requires:

- `git`
- `node`
- `npm`

```bash
git clone git@github.com:mariechatfield/recipebox.git
cd recipebox
npm install
```

## Prerequisites

In order to run the scripts, you must have the following environment variables set up.

```bash
# Email and password used to log into my Paprika account
export PAPRIKA_USERNAME="marie.chatfield@gmail.com"
export PAPRIKA_PASSWORD="XXXXX"

# Personal API token for the ddw environment with access to recipebox org
export DDW_TOKEN="XXXXX"
```

## Usage

### Sync Paprika recipes to data.world catalog via cloud sync

```bash
npm run sync
```

- Sync local recipe files with Paprika's cloud recipe files
- Run the collector over all the recipe data
- Upload the catalog TTL files to data.world

### Parse a Paprika recipe export

```bash
./bin/sync-recipes path/to/export.paprikarecipes
```

After exporting your Paprika recipes:

- Parses a local export from Paprika and syncs local recipe files to match
- Does _not_ automatically catalog and upload

### Update metadata profile

```bash
./bin/upload-to-ddw
```

After making changes to any TTL files that are _not_ part of the automatic sync, use this command to upload your changes to data.world

### Run the recipe collector

```bash
./bin/run-collector
```

Runs the collector over any recipe data and generates updated TTL files. Does _not_ automatically upload to data.world.

## Architecture

```yaml
- catalog/
  # All the TTL files that comprise the recipebox catalog.
  # Any file ending in .ttl will be uploaded to the ddw-catalogs dataset.

    - metadata-profile.ttl
      # The main TTL file that contains all metadata profile set up,
      # attribute and class definitions, and catalogs.
      # No _instances_ are created here.

    - menu.ttl
      # Hand-written _instances_ of :Menu classes.

- bin/
  # Node scripts to perform syncing, collecting, and uploading actions.
  # See the Usage section for details.

- build/
  # Generated files, created and updated by the Node scripts

    - recipes/
      # The collection of JSON files synced directly from Paprika,
      # with minimal adaptation.

        - static/
          # Files that are _not_ directly recipes but contain relevant
          # information about Paprika recipes by UID.

            - auditLog.json
              # Map of Paprika recipe UID to the current hash and
              # file location. Used to determine which recipes (if any)
              # need to be created/updated/deleted during syncs.
              # Automatically updated after every sync or export parse.

            - ignoredIds.json
              # Map of Paprika recipe UIDs to skip when syncing from cloud.
              # Manually update this if there is a recipe that Paprika cloud
              # stores but that we do not want to sync.

    - catalog/
      # Copy of the metadata profile TTL files from /catalog, plus the
      # generated TTL files from the collector, to upload to DDW

        - recipes.ttl
          # Generated _instances_ of :Recipe classes.
          # Updated by running the recipe collector.
```
