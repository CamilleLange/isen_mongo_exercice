#!/bin/bash

# This script runs on the first start of the container.
# It iterates over all .json files in the /data/json-import directory
# and imports them into collections with the same name as the file (without extension).

set -e # Exit immediately if a command exits with a non-zero status.

echo "--- Starting MongoDB data initialization ---"

# The init script is run by the 'mongo' user, so we have access to the environment variables
# set in the docker-compose.yml file.
MONGO_IMPORT_COMMAND="mongoimport --host localhost --db $MONGO_INITDB_DATABASE --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin"

# Loop through all JSON files in the mounted data directory
for f in /data/json-import/*.json
do
  # Get the filename without the extension to use as the collection name
  collection=$(basename "$f" .json)
  echo "Importing $f into collection '$collection'..."

  # Run the mongoimport command
  # The --jsonArray flag is used because our sample files are arrays of JSON objects.
  # Remove this flag if your files contain one JSON object per line.
  $MONGO_IMPORT_COMMAND --collection "$collection" --file "$f" --jsonArray
done

echo "--- MongoDB data initialization finished ---"