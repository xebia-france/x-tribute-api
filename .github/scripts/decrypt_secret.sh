#!/bin/sh

mkdir $HOME/secrets
gpg --quiet --batch --yes --decrypt --passphrase="$GPG_PASSPHRASE" \
--output $HOME/firebase-admin-service-account.json firebase-admin-service-account.json.gpg