# F-Droid packaging status

Package ID: `vn.caphenpro.sohuithongminh`  
Current upstream version: `2.0.0` (versionCode `20000`)  
License: `GPL-3.0-or-later`  
Source: https://github.com/caphenpro/Sohuithongminh

## Current status: preparation only

This project has **not** been accepted or published by F-Droid. Successful GitHub Actions builds are upstream CI results; they do not prove that F-Droid can reproduce the APK in its own build environment.

## Checks completed

- A committed `package-lock.json` is now used by CI with `npm ci`.
- GitHub Actions passed the application test suite, TypeScript check, Vite production build, Capacitor Android project generation, and both Android APK build variants.
- The production dependency license audit completed successfully against the committed lockfile: 167 entries were reported, with no unknown license expressions. The report contains one `UNLICENSED` entry for the private root package `so-hui-thong-minh@2.0.0`; this is the application itself, not an unidentified third-party dependency. Third-party entries reported MIT, BSD-3-Clause, Apache-2.0, MPL-2.0, ISC, BSD-2-Clause, and 0BSD. This automated report is not a substitute for manual review of dependency and asset licenses.

## Remaining blockers before submission

- **Stable Android source project:** the current workflow runs `npx cap add android` during CI. The generated Android Gradle project and wrapper are not committed. F-Droid needs a reproducible source-build recipe that can create the app without depending on network access during the build. This is the primary packaging blocker.
- **Offline dependency availability:** npm packages and Gradle dependencies must be available to the F-Droid build process through an accepted reproducible mechanism; a lockfile alone does not make an offline build possible.
- **App assets and metadata:** add a raster launcher icon and genuine screenshots under the Fastlane metadata directories; verify all artwork licenses.
- **Runtime review:** verify every runtime network request, optional AI/API integration, and core workflow in airplane mode. Do not require developer-only API keys or proprietary services for core use.
- **Release validation:** create a source tag/release, then run `fdroid lint` and `fdroid build` against the exact source revision in a supported fdroidserver environment.
- **Submission:** prepare the app metadata/build recipe for the separate `fdroiddata` repository and submit a merge request for F-Droid review.

## APK notes

The CI workflow publishes an installable debug APK for testing and an unsigned release APK as a build artifact. The unsigned APK is not directly installable as-is and is not a substitute for F-Droid's own source build and signing process.
