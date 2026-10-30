# F-Droid packaging status

Package ID: `vn.caphenpro.sohuithongminh`
Current upstream version: `2.0.0` (versionCode `20000` in the Android build workflow)
License: `GPL-3.0-or-later`
Source: https://github.com/caphenpro/Sohuithongminh

## Upstream metadata

Fastlane-compatible descriptions and changelogs are maintained under `fastlane/metadata/android/`.

## Before submitting to the official F-Droid repository

- Audit every direct and transitive dependency and every bundled asset for license compatibility.
- Ensure the app does not require a developer-provided API key or a non-free online service for its core features. F-Droid does not supply API keys.
- Add an upstream release tag matching the version name and verify the source archive can build on F-Droid's build server.
- Prepare the `fdroiddata` metadata recipe and test it with `fdroid lint` and an actual `fdroid build` in a supported environment.
- Add a raster app icon and real device screenshots to the metadata if required by the submission/review process.
- Submit a merge request to the official `fdroiddata` repository and wait for review. This repository has not yet been accepted or published by F-Droid.

## Build notes

The GitHub Actions APK workflow is a preliminary CI build, not proof of an F-Droid reproducible build. F-Droid builds and signs packages using its own source-build and review process. The unsigned release APK is not directly installable as-is.
