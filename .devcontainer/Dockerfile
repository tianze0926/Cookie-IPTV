FROM tz039e/flutter-android

# Mirrors in China
RUN sed -e "s/google()/maven { url 'https:\/\/maven.aliyun.com\/repository\/google' }/" \
        -e "s/mavenCentral()/maven { url 'https:\/\/maven.aliyun.com\/repository\/central' }/" \
        /usr/flutter/packages/flutter_tools/gradle/flutter.gradle -i

# Permissions
RUN chown -R 1000:1001 /usr/flutter /root /opt/android-sdk-linux
