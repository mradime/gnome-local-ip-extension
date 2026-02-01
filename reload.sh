#!/bin/bash

# Extension Reload Script - Update and reload without restarting GNOME Shell
# Perfect for development and testing on Wayland!

set -e

EXTENSION_UUID="local-ip@mradime"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

echo "🔄 Reloading Local IP Address Extension..."

# Check if extension exists
if [ ! -d "$EXTENSION_DIR" ]; then
    echo "❌ Extension not installed yet. Run ./install.sh first!"
    exit 1
fi

# Disable the extension (if enabled)
echo "⏸️  Disabling extension..."
gnome-extensions disable "$EXTENSION_UUID" 2>/dev/null || true

# Small delay to ensure it's fully disabled
sleep 0.5

# Copy updated files
echo "📋 Copying updated files..."
cp metadata.json extension.js "$EXTENSION_DIR/"

# Small delay before re-enabling
sleep 0.5

# Re-enable the extension
echo "▶️  Re-enabling extension..."
gnome-extensions enable "$EXTENSION_UUID"

echo ""
echo "✅ Extension reloaded successfully!"
echo ""
echo "💡 Tips:"
echo "   • The IP should update in the panel within a few seconds"
echo "   • To see logs: journalctl -f -o cat /usr/bin/gnome-shell | grep 'Local IP'"
echo "   • To test IP detection: ./debug-ip.sh"
