#!/bin/bash

echo "Setting secrets"

for key in GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET FACEBOOK_CLIENT_ID FACEBOOK_CLIENT_SECRET; do
  echo -n "${!key}" | tr -d '\n' | npx ampx sandbox secret set "$key"
done

echo "Done!"
