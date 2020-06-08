#!/bin/sh

gpg --quiet --batch --yes --decrypt --passphrase="$GPG_PASSPHRASE" \
--output firebase-admin-service-account.json firebase-admin-service-account.json.gpg