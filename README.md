# Cookie IPTV

A Tsinghua IPTV client written in Flutter for Android TV devices.

## Build & Run

<details>
<summary>Development Container</summary>

[VS Code Development Container](https://code.visualstudio.com/docs/remote/containers) is used to provide Flutter SDK and Android SDK environment.

Corresponding UID and GID are set by `containerUser` option at `.devcontainer/devcontainer.json` to avoid permission issues. Certain directories' permission also need changing at `.devcontainer/Dockerfile` or Flutter will complain.
</details>

<details>
<summary>Mirrors in China</summary>

To access Flutter SDK and packages from China, the following environment variables need to be set (already set at `.devcontainer/devcontainer.json`):
```
PUB_HOSTED_URL=https://pub.flutter-io.cn
FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```

To access maven dependencies from google (https://dl.google.com), mavenCentral (https://repo.maven.apache.org), and flutter (I believe the url is https://storage.googleapis.com/download.flutter.io from [flutter.gradle](https://github.com/flutter/flutter/blob/master/packages/flutter_tools/gradle/flutter.gradle#L166)) in China, the following changes are required (thanks to https://github.com/flutter/flutter/issues/41520#issuecomment-1193649786) so that all dependencies including that from Flutter plugins are covered:

- `android/setting.gradle` (already modified)
  
  append the following:
    ```groovy
    dependencyResolutionManagement {
        repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
        repositories {
            maven { url 'https://maven.aliyun.com/repository/google' }
            maven { url 'https://maven.aliyun.com/repository/central' }
            maven { url 'https://storage.flutter-io.cn/download.flutter.io' }
        }
        repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    }
    ```
- `android/build.gradle` (already modified)
    ```groovy
    buildscript {
        //...
        repositories {
            maven {
                maven { url 'https://maven.aliyun.com/repository/google' }
                maven { url 'https://maven.aliyun.com/repository/central' }
            }
        }
        // ...
    }

    allprojects {
        buildscript {
            repositories {
                maven {
                    maven { url 'https://maven.aliyun.com/repository/google' }
                    maven { url 'https://maven.aliyun.com/repository/central' }
                }
            }
        }
        repositories {
            maven {
                maven { url 'https://maven.aliyun.com/repository/google' }
                maven { url 'https://maven.aliyun.com/repository/central' }
            }
        }
    }
    ```
- `${FLUTTER_SDK_PATH}/packages/flutter_tools/gradle/flutter.gradle` (modified at `.devcontainer/Dockerfile`)
    ```groovy
    buildscript {
        repositories {
            maven { url 'https://maven.aliyun.com/repository/google' }
            maven { url 'https://maven.aliyun.com/repository/central' }
        }
        // ...
    }
    ```
</details>

### Build

```
flutter build apk
```

### Debug Run

```
flutter run
```
(`flutter pub get` is implied)


