#!/bin/bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH

cd /Applications/Personal/BhaktiVani_App/android
./gradlew assembleRelease --no-daemon
