# Local IP Address GNOME Extension

This extension displays your local IPv4 or IPv6 address in the GNOME top panel.
Click the IP address to copy it to your clipboard.

## Installation Instructions

### Method 1: Manual Installation (Recommended for first-time extension creators)

1. **Create the extension directory:**

   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/local-ip@mradime
   ```

2. **Copy the extension files:**

   ```bash
   cp metadata.json extension.js ~/.local/share/gnome-shell/extensions/local-ip@mradime/
   ```

3. **Restart GNOME Shell:**
   - On X11: Press `Alt + F2`, type `r`, and press Enter
   - On Wayland: Log out and log back in

4. **Enable the extension:**

   ```bash
   gnome-extensions enable local-ip@mradime
   ```

   Or use GNOME Extensions app (install with: `sudo dnf install gnome-extensions-app`)

### Method 2: Pack and Install as ZIP

1. **Pack the extension:**

   ```bash
   cd local-ip-extension
   gnome-extensions pack \
     --extra-source=extension.js \
     --extra-source=metadata.json \
     --out-dir=../build
   ```

   Or manually create a ZIP:

   ```bash
   cd local-ip-extension
   zip -r ../local-ip@mradime.shell-extension.zip metadata.json extension.js
   ```

2. **Install the packed extension:**

   ```bash
   gnome-extensions install local-ip@mradime.shell-extension.zip
   ```

3. **Restart GNOME Shell and enable** (same as Method 1, steps 3-4)

## Troubleshooting

**Check if extension is installed:**

```bash
gnome-extensions list
```

**Check extension status:**

```bash
gnome-extensions info local-ip@mradime
```

**View extension logs:**

```bash
journalctl -f /usr/bin/gnome-shell
```

Or use Looking Glass (Alt + F2, then type 'lg' and press Enter)

**Disable extension:**

```bash
gnome-extensions disable local-ip@mradime
```

**Uninstall extension:**

```bash
gnome-extensions uninstall local-ip@mradime
```

## Features

- Shows your local network IPv4 or IPv6 address
- Prioritizes IPv4 when both are available
- Click to copy IP to clipboard
- Updates every 10 seconds
- Ignores loopback and Docker interfaces
- Clean and minimal design

## Customization

You can modify the update interval in `extension.js` by changing this line:

```javascript
this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
```

Change `10` to your preferred number of seconds.

## Credits

Built with assistance from Claude (Anthropic)
