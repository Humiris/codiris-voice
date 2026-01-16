#!/bin/bash

# Codiris Voice - Build, Sign, and Notarize Script
# Team ID: 23865CR7LA

set -e

# Configuration
APP_NAME="Codiris Voice"
BUNDLE_ID="com.codiris.voice"
TEAM_ID="23865CR7LA"
DEVELOPER_ID="Developer ID Application: Joel AGBOGLO (23865CR7LA)"

# Paths
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$PROJECT_DIR/dist"
APP_PATH="$DIST_DIR/$APP_NAME.app"
DMG_PATH="$DIST_DIR/$APP_NAME.dmg"
ZIP_PATH="$DIST_DIR/$APP_NAME.zip"

echo "=========================================="
echo "Building $APP_NAME"
echo "=========================================="

cd "$PROJECT_DIR"

# Step 1: Build with PyInstaller
echo "Step 1: Building with PyInstaller..."
python3 -m PyInstaller -y --windowed --onedir --name "$APP_NAME" \
    --icon voicetype/assets/AppIcon.icns \
    --add-data "voicetype/assets:voicetype/assets" \
    --osx-bundle-identifier "$BUNDLE_ID" \
    voicetype/main.py

# Step 2: Sign all binaries inside the app
echo "Step 2: Code signing the app..."

# Sign all .so and .dylib files first
find "$APP_PATH" -type f \( -name "*.so" -o -name "*.dylib" \) | while read -r file; do
    echo "Signing: $file"
    codesign --force --options runtime --timestamp --sign "$DEVELOPER_ID" "$file"
done

# Sign all executables in Frameworks and MacOS
find "$APP_PATH/Contents/Frameworks" -type f -perm +111 2>/dev/null | while read -r file; do
    if file "$file" | grep -q "Mach-O"; then
        echo "Signing: $file"
        codesign --force --options runtime --timestamp --sign "$DEVELOPER_ID" "$file"
    fi
done

# Sign the main executable
echo "Signing main executable..."
codesign --force --options runtime --timestamp --sign "$DEVELOPER_ID" "$APP_PATH/Contents/MacOS/$APP_NAME"

# Sign the entire app bundle
echo "Signing app bundle..."
codesign --force --options runtime --timestamp --sign "$DEVELOPER_ID" "$APP_PATH"

# Verify signature
echo "Verifying signature..."
codesign --verify --deep --strict --verbose=2 "$APP_PATH"

echo "Step 3: Creating ZIP for notarization..."
cd "$DIST_DIR"
ditto -c -k --keepParent "$APP_NAME.app" "$APP_NAME.zip"

echo "=========================================="
echo "Build complete!"
echo "=========================================="
echo ""
echo "App location: $APP_PATH"
echo "ZIP location: $ZIP_PATH"
echo ""
echo "Next step: Notarize the app with:"
echo "  xcrun notarytool submit \"$ZIP_PATH\" --apple-id YOUR_APPLE_ID --team-id $TEAM_ID --password YOUR_APP_SPECIFIC_PASSWORD --wait"
echo ""
echo "After notarization, staple the ticket:"
echo "  xcrun stapler staple \"$APP_PATH\""
echo ""
echo "Then create DMG:"
echo "  ./scripts/create_dmg.sh"
