#!/usr/bin/env bash

source .env.local
mongo "mongodb+srv://$DB_USERNAME:$DB_PASSWORD@$DB_CLUSTER/$DATABASE_NAME" --eval "db.features.remove({})"
mongoimport --uri="mongodb+srv://$DB_USERNAME:$DB_PASSWORD@$DB_CLUSTER/$DATABASE_NAME" --collection=features --file=./dbScripts/features.json --jsonArray
mongo "mongodb+srv://$DB_USERNAME:$DB_PASSWORD@$DB_CLUSTER/$DATABASE_NAME" --eval "db.games.remove({})"
