#!/bin/sh

gpg --quiet --batch --yes --decrypt --passphrase="$GPG_PASSPHRASE" \
--output $HOME/firebase-admin-service-account.json $HOME/firebase-admin-service-account.json.gpg