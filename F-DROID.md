# F-Droid packaging status

Package ID: `vn.caphenpro.sohuithongminh`  
Current upstream version: `2.0.0` (versionCode `20000` in the Android CI build)  
License: `GPL-3.0-or-later`  
Source: https://github.com/caphenpro/Sohuithongminh

## Upstream metadata

Fastlane-compatible descriptions and changelogs are maintained under `fastlane/metadata/android/`. The package manifest declares `GPL-3.0-or-later`.

## Current status: preparation only

This project has **not** been accepted or published by F-Droid. The GitHub Actions APK workflow is a preliminary CI build and does not prove that F-Droid can reproduce the APK from the public source.

## Required before official submission

- Run the GitHub Actions workflow **F-Droid dependency license audit** and manually review every direct and transitive dependency, including license expressions reported by the tool. A machine-generated report is an aid, not a legal determination.
- Remove unused dependencies and regenerate/commit a consistent lockfile. The repository currently has `bun.lock`, while the APK workflow uses `npm install`; dependency resolution is therefore not yet pinned consistently for the F-Droid build.
- Commit a stable Android Gradle project and wrapper, or document a supported source-generation step that can run reproducibly in F-Droid's build environment. At present, the CI workflow generates the Capacitor Android project during the build.
- Verify the project builds without developer-only API keys or non-free services. F-Droid does not provide API keys.
- Review remotely loaded assets such as Google Fonts and ensure the app remains fully functional offline.
- Add a raster launcher icon and genuine screenshots to the metadata.
- Create and publish a source release/tag, then test the exact source revision using `fdroid lint` and `fdroid build` in a supported fdroidserver environment.
- Prepare the metadata file for the separate `fdroiddata` repository and submit a merge request for review.

## Build notes

The unsigned release APK is not directly installable as-is. F-Droid builds and signs apps through its own source-build process; do not upload the unsigned APK as a substitute for a source-build recipe.
