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
- CI checks that the manifest and Gradle files do not reintroduce those network-related declarations.
- CI installs JavaScript dependencies from the committed npm lockfile, runs app tests and production build, syncs Capacitor, and builds Debug and unsigned Release APKs.
- Fastlane text metadata exists for Vietnamese and English.
- Android launcher mipmap resources are present.
- License is GPL-3.0-or-later.

## Current CI verification

Latest successful Android build:
https://github.com/caphenpro/Sohuithongminh/actions/runs/41024741373

Latest successful application test and web build:
https://github.com/caphenpro/Sohuithongminh/actions/runs/41024741327

The latest CI run generated an installable Debug APK for device testing, an unsigned Release APK, and an Android source project archive. The unsigned Release APK is not directly installable and is not a substitute for F-Droid's own source build and signing process.

## Remaining work before an F-Droid submission

1. **Reproducible offline build:** F-Droid builds must not download arbitrary dependencies during the build. The Gradle wrapper points to a remote Gradle distribution, and Gradle/Maven dependencies still need to be supplied through an F-Droid-accepted mechanism. The successful GitHub Actions build uses network access and does not prove offline reproducibility.
2. **F-Droid build recipe:** create and validate metadata YAML in the separate `fdroiddata` repository, including version, commit, build commands, Gradle configuration and required prebuild steps.
3. **Store assets:** add genuine screenshots and verify launcher artwork and asset licenses. Native launcher mipmap resources exist, but Fastlane screenshot/icon metadata has not been verified as complete.
4. **Runtime validation:** test core workflows on a physical Android device in airplane mode, including create/edit hui, collection/payment records, PIN lock, JSON export and restore.
5. **Static and build validation:** run `fdroid lint` and `fdroid build` against the exact tagged source revision in a supported fdroidserver environment.
6. **Submission:** open a merge request to F-Droid's separate `fdroiddata` repository and address reviewer feedback.

## Offline and privacy notes

The absence of Android's `INTERNET` permission is a strong platform-level restriction for this build. It does not replace a source audit or physical-device testing. PIN hashing is not full-database encryption; users should protect exported JSON backups.
