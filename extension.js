import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const IPIndicator = GObject.registerClass(
class IPIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'IP Address Indicator', false);

        // Create label to display IP address
        this._label = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'ip-address-label'
        });

        this.add_child(this._label);

        // Update IP address immediately and then every 10 seconds
        this._updateIP();
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
            this._updateIP();
            return GLib.SOURCE_CONTINUE;
        });

        // Connect click event
        this.connect('button-press-event', this._copyToClipboard.bind(this));
    }

    _updateIP() {
        try {
            // Try multiple methods to get IP address
            let ip = this._getIPFromHostname() || this._getIPFromIpCommand();
            
            if (ip) {
                this._currentIP = ip;
                this._label.set_text(ip);
            } else {
                this._currentIP = null;
                this._label.set_text('No IP');
                // Log for debugging
                console.log('[Local IP] No IP address found');
            }
        } catch (e) {
            console.error('[Local IP] Error updating IP:', e);
            this._currentIP = null;
            this._label.set_text('Error');
        }
    }

    _getIPFromHostname() {
        try {
            // Method 1: Use hostname -I (simpler and more reliable)
            let [success, stdout] = GLib.spawn_command_line_sync('hostname -I');
            
            if (success && stdout.length > 0) {
                let output = new TextDecoder().decode(stdout).trim();
                let ips = output.split(/\s+/);
                
                // Look for IPv4 first
                for (let ip of ips) {
                    if (this._isIPv4(ip)) {
                        console.log('[Local IP] Found IPv4 via hostname:', ip);
                        return ip;
                    }
                }
                
                // Fall back to IPv6 if no IPv4
                for (let ip of ips) {
                    if (this._isIPv6(ip)) {
                        console.log('[Local IP] Found IPv6 via hostname:', ip);
                        return ip;
                    }
                }
            }
        } catch (e) {
            console.log('[Local IP] hostname -I failed:', e);
        }
        
        return null;
    }

    _getIPFromIpCommand() {
        try {
            // Method 2: Parse ip addr output
            let [success, stdout] = GLib.spawn_command_line_sync('ip addr show');
            
            if (!success) {
                return null;
            }
            
            let output = new TextDecoder().decode(stdout);
            return this._parseIPAddress(output);
        } catch (e) {
            console.log('[Local IP] ip addr failed:', e);
            return null;
        }
    }

    _parseIPAddress(output) {
        let lines = output.split('\n');
        let ipv4 = null;
        let ipv6 = null;
        let currentInterface = null;

        for (let line of lines) {
            // Track current interface
            if (line.match(/^\d+:/)) {
                let ifaceMatch = line.match(/^\d+:\s+(\S+):/);
                if (ifaceMatch) {
                    currentInterface = ifaceMatch[1];
                }
            }

            // Skip loopback, docker, and virtual interfaces
            if (currentInterface && (
                currentInterface === 'lo' ||
                currentInterface.startsWith('docker') ||
                currentInterface.startsWith('veth') ||
                currentInterface.startsWith('br-') ||
                currentInterface.startsWith('virbr')
            )) {
                continue;
            }

            // Match IPv4 address (inet)
            let ipv4Match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
            if (ipv4Match && !ipv4) {
                let ip = ipv4Match[1];
                // Skip link-local IPv4 (169.254.x.x)
                if (!ip.startsWith('169.254.')) {
                    ipv4 = ip;
                    console.log('[Local IP] Found IPv4:', ip, 'on', currentInterface);
                }
            }

            // Match IPv6 address (inet6) - exclude link-local (fe80::)
            let ipv6Match = line.match(/inet6\s+([0-9a-f:]+)/);
            if (ipv6Match && !ipv6) {
                let ip = ipv6Match[1].split('/')[0];
                if (!ip.startsWith('fe80') && !ip.startsWith('::1')) {
                    ipv6 = ip;
                    console.log('[Local IP] Found IPv6:', ip, 'on', currentInterface);
                }
            }
        }

        // Prioritize IPv4
        return ipv4 || ipv6;
    }

    _isIPv4(ip) {
        return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip) && 
               !ip.startsWith('127.') && 
               !ip.startsWith('169.254.');
    }

    _isIPv6(ip) {
        return /^[0-9a-f:]+$/.test(ip) && 
               !ip.startsWith('fe80') && 
               !ip.startsWith('::1') &&
               ip.includes(':');
    }

    _copyToClipboard() {
        if (!this._currentIP) {
            return Clutter.EVENT_PROPAGATE;
        }

        // Copy to clipboard
        St.Clipboard.get_default().set_text(
            St.ClipboardType.CLIPBOARD,
            this._currentIP
        );

        // Show notification
        Main.notify(
            'IP Address Copied',
            `Copied ${this._currentIP} to clipboard`
        );

        return Clutter.EVENT_STOP;
    }

    destroy() {
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }
        super.destroy();
    }
});

export default class LocalIPExtension extends Extension {
    enable() {
        this._indicator = new IPIndicator();
        Main.panel.addToStatusArea('ip-address-indicator', this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
