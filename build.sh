#!/usr/bin/env bash

# portable, can run on render linux
set -o errexit
set -o nounset

# bật corepack (Render có sẵn)
# corepack enable

# kích hoạt đúng yarn version
corepack prepare yarn@1.22.22 --activate

# cài dependencies (không cho thay đổi lockfile)
yarn install --immutable

# Build commands set to this
# npm install -g corepack && corepack enable && yarn set version 1.22.22 && yarn install &&  yarn start:prod 
