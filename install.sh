#!/bin/bash

# Local IP Address Extension - Installation Script
# This script installs the extension to your local GNOME Shell extensions directory

set -e

EXTENSION_UUID="local-ip@mradime"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

echo "🚀 Installing Local IP Address Extension..."

# Create extension directory
echo "📁 Creating extension directory..."
mkdir -p "$EXTENSION_DIR"

# Copy files
echo "📋 Copying extension files..."
cp metadata.json extension.js "$EXTENSION_DIR/"

echo "✅ Extension files installed to: $EXTENSION_DIR"

# Check if gnome-extensions command is available
if command -v gnome-extensions &> /dev/null; then
    echo ""
    echo "🔄 Attempting to enable extension..."
    
    # Try to enable the extension
    if gnome-extensions enable "$EXTENSION_UUID" 2>/dev/null; then
        echo "✅ Extension enabled successfully!"
    else
        echo "⚠️  Could not enable extension automatically."
        echo "   This is normal on first install."
    fi
    
    echo ""
    echo "📊 Extension status:"
    gnome-extensions info "$EXTENSION_UUID" 2>/dev/null || echo "   Extension needs GNOME Shell restart to be detected"
else
    echo "⚠️  gnome-extensions command not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo ""
echo "1. Restart GNOME Shell:"
if [ "$XDG_SESSION_TYPE" = "wayland" ]; then
    echo "   • Log out and log back in (you're on Wayland)"
else
    echo "   • Press Alt+F2, type 'r', and press Enter (you're on X11)"
fi
echo ""
echo "2. Enable the extension:"
echo "   gnome-extensions enable $EXTENSION_UUID"
echo ""
echo "   Or use GNOME Extensions app (GUI)"
echo ""
echo "3. Your IP address should appear in the top panel!"
echo "   Click it to copy to clipboard."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
