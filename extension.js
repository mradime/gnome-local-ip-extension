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
            // Execute ip command to get network addresses
            let [success, stdout, stderr] = GLib.spawn_command_line_sync(
                'ip -o addr show scope global'
            );

            if (success) {
                let output = new TextDecoder().decode(stdout);
                let ip = this._parseIPAddress(output);
                
                if (ip) {
                    this._currentIP = ip;
                    this._label.set_text(ip);
                } else {
                    this._currentIP = null;
                    this._label.set_text('No IP');
                }
            } else {
                this._currentIP = null;
                this._label.set_text('Error');
            }
        } catch (e) {
            console.error('Error updating IP:', e);
            this._currentIP = null;
            this._label.set_text('Error');
        }
    }

    _parseIPAddress(output) {
        let lines = output.split('\n');
        let ipv4 = null;
        let ipv6 = null;

        for (let line of lines) {
            // Skip loopback and docker interfaces
            if (line.includes('lo') || line.includes('docker') || line.includes('veth')) {
                continue;
            }

            // Match IPv4 address (inet)
            let ipv4Match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
            if (ipv4Match && !ipv4) {
                ipv4 = ipv4Match[1];
            }

            // Match IPv6 address (inet6) - exclude link-local (fe80::)
            let ipv6Match = line.match(/inet6\s+([0-9a-f:]+)/);
            if (ipv6Match && !ipv6 && !ipv6Match[1].startsWith('fe80')) {
                ipv6 = ipv6Match[1].split('/')[0]; // Remove prefix length
            }
        }

        // Prioritize IPv4
        return ipv4 || ipv6;
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
