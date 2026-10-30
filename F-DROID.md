# F-Droid packaging status

Package ID: `vn.caphenpro.sohuithongminh`  
Upstream version: `2.0.0` (versionCode `20000`)  
License: `GPL-3.0-or-later`  
Source: https://github.com/caphenpro/Sohuithongminh

## Current status: preparation, not published

The project has not been submitted to or accepted by F-Droid. A successful upstream GitHub Actions build is not proof that F-Droid can reproduce the APK in its isolated build environment.

## Completed upstream preparation

- Native Android Gradle project and Gradle wrapper are committed under `android/`.
- The app manifest does not request Android's `INTERNET` permission.
- The Google Services Gradle plugin has been removed.
- CI checks that the manifest and Gradle files do not reintroduce those declarations.
- Unused Gemini/server packages were removed from `package.json`; npm and Bun lockfiles are regenerated and committed by CI.
- CI installs dependencies, runs tests and production build, syncs Capacitor, and builds Debug and unsigned Release APKs.
- Vietnamese and English Fastlane descriptions and changelogs exist.
- Native launcher mipmap resources exist.
- License is GPL-3.0-or-later.

## Latest verified build

Commit: `e093425beb404b422b84f3a84d5bc1f531ee5d9a`

Android build:
https://github.com/caphenpro/Sohuithongminh/actions/runs/41026286152

Application tests and web build:
https://github.com/caphenpro/Sohuithongminh/actions/runs/41026286175

Latest APK SHA-256:
- Unsigned Release: `f95514967d79afd23794667a24a4d7d34b25710a400acd19ef7460ad3e3cbca4`
- Debug: `925613b084421b8c07d3969836a9d7d0e72bab0c6c9ddcfe19de81ffb415e337`

Artifacts:
- Debug APK: https://github.com/caphenpro/Sohuithongminh/actions/runs/41026286152/artifacts/12963961759
- Unsigned Release APK: https://github.com/caphenpro/Sohuithongminh/actions/runs/41026286152/artifacts/12963831843
- Android source project: https://github.com/caphenpro/Sohuithongminh/actions/runs/41026286152/artifacts/12963682201

The unsigned Release APK is not directly installable and is not a substitute for F-Droid's own source build and signing process.

## Remaining work before an F-Droid submission

1. **Reproducible offline build:** The Gradle wrapper points to a remote Gradle distribution. Gradle and Maven dependencies must be available through an F-Droid-accepted mechanism. GitHub Actions currently builds with network access, so this does not prove offline reproducibility.
2. **F-Droid recipe:** `fdroiddata-template.yml` is only a draft. Copy and validate it in the separate `fdroiddata` repository. The Gradle recipe and build output path must be tested with fdroidserver; do not submit it unverified.
3. **Store assets:** Fastlane text metadata and native mipmap launcher resources exist. F-Droid screenshots have not been added or verified. Add genuine screenshots from the running app and verify all artwork licenses.
4. **Runtime validation:** Test core workflows on a physical Android device in airplane mode: create/edit hui, collection/payment records, PIN lock, JSON export and restore.
5. **Static and build validation:** Run `fdroid lint` and `fdroid build` against the exact tagged source revision in a supported fdroidserver environment.
6. **Submission:** Open a merge request to F-Droid's separate `fdroiddata` repository and address reviewer feedback.

## Offline and privacy notes

The absence of Android's `INTERNET` permission is a strong platform-level restriction for this build. It does not replace a source audit or physical-device testing. PIN hashing is not full-database encryption; users should protect exported JSON backups.
