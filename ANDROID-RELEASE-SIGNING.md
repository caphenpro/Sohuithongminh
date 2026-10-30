# Android release signing

The repository does not contain a signing keystore or signing passwords. Never commit them.

## Create a private release keystore

Run locally on a trusted computer with Java's `keytool`:

```bash
keytool -genkeypair -v -keystore so-hui-release.jks -alias so-hui-release -keyalg RSA -keysize 4096 -validity 10000
```

Keep at least two secure offline backups of the keystore and its passwords. Losing the keystore can prevent future updates signed with the same app identity. Do not send the keystore or passwords in chat.

## Add GitHub Actions secrets

In GitHub repository Settings → Secrets and variables → Actions, create:

- `ANDROID_KEYSTORE_BASE64`: Base64 encoding of the JKS file (`base64 -w 0 so-hui-release.jks` on Linux; `base64 < so-hui-release.jks | tr -d '\n'` on macOS).
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: alias used when creating the key.
- `ANDROID_KEY_PASSWORD`: private-key password.

## Build signed release

After all four secrets are configured, open Actions → Sign Android Release → Run workflow. The workflow runs tests, builds the web app, syncs Capacitor, signs APK and AAB, verifies the APK signature, and uploads checksums.

The workflow intentionally fails if signing secrets are absent. It does not create or expose a keystore. F-Droid builds and signs independently; do not upload a privately signed APK as an F-Droid source-build substitute.
