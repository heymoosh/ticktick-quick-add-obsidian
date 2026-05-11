import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import TickTickPlugin from './main';

export interface TickTickSettings {
    accessToken: string;
    refreshToken?: string;
    tokenExpiry?: number;
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
    tempCodeVerifier?: string;
    tempState?: string;
    selectionMode: 'line' | 'paragraph';
    tagPosition: 'append' | 'prepend';
}

export const DEFAULT_SETTINGS: TickTickSettings = {
    accessToken: '',
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://ticktick-quick-add-obsidian-6yawfmvnj-mooshs-projects-0635287d.vercel.app',
    selectionMode: 'line',
    tagPosition: 'append'
};

export class TickTickSettingTab extends PluginSettingTab {
    plugin: TickTickPlugin;

    constructor(app: App, plugin: TickTickPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        if (this.plugin.settings.accessToken) {
            this.renderConnectedView(containerEl);
        } else {
            this.renderSetupView(containerEl);
        }
    }

    private renderSetupView(containerEl: HTMLElement): void {
        containerEl.createEl('h2', { text: 'Set up TickTick' });
        containerEl.createEl('p', {
            text: 'Connect this plugin to your TickTick account in two steps. You only need to do this once.'
        });

        new Setting(containerEl)
            .setName('Step 1 — Enter your TickTick app credentials')
            .setHeading();

        const step1 = containerEl.createEl('p');
        step1.appendText('Sign in to the ');
        const portalLink = step1.createEl('a', {
            text: 'TickTick Developer Portal',
            href: 'https://developer.ticktick.com/'
        });
        portalLink.setAttr('target', '_blank');
        portalLink.setAttr('rel', 'noopener');
        step1.appendText(', create an app, and copy its Client ID and Client Secret into the fields below. In the portal, set the app\'s Redirect URI to the value shown in the Redirect URI field.');

        new Setting(containerEl)
            .setName('Client ID')
            .addText(text =>
                text
                    .setPlaceholder('Your Client ID')
                    .setValue(this.plugin.settings.clientId || '')
                    .onChange(async (value) => {
                        this.plugin.settings.clientId = value.trim();
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Client Secret')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('••••••••••')
                    .setValue(this.plugin.settings.clientSecret || '')
                    .onChange(async (value) => {
                        this.plugin.settings.clientSecret = value.trim();
                        await this.plugin.saveSettings();
                    });
                return text;
            });

        new Setting(containerEl)
            .setName('Redirect URI')
            .setDesc('Copy this exact value into your TickTick app\'s Redirect URI field in the developer portal. Only change it here if you self-host the callback page.')
            .addText(text =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.redirectUri!)
                    .setValue(this.plugin.settings.redirectUri || '')
                    .onChange(async (value) => {
                        this.plugin.settings.redirectUri = value.trim();
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Step 2 — Authorize')
            .setHeading();

        containerEl.createEl('p', {
            text: 'Tap Connect, then tap the link in the popup to sign in to TickTick and approve access. The callback page will either return you to Obsidian automatically, or show you an authorization code — if you see a code, copy it and paste it in the field below.'
        });

        new Setting(containerEl)
            .setName('Connect to TickTick')
            .addButton(button => {
                button.setButtonText('Connect').setCta().onClick(async () => {
                    await this.plugin.startAuthFlow();
                });
            });

        new Setting(containerEl)
            .setName('Authorization code')
            .setDesc('Only needed if the callback page showed you a code instead of returning you to Obsidian automatically.')
            .addText(text =>
                text
                    .setPlaceholder('Paste authorization code')
                    .onChange(async (code) => {
                        if (code.trim()) {
                            await this.plugin.exchangeAuthCodeForToken(code.trim());
                            text.setValue('');
                            this.display();
                        }
                    })
            );
    }

    private renderConnectedView(containerEl: HTMLElement): void {
        containerEl.createEl('h2', { text: 'Connected to TickTick' });
        containerEl.createEl('p', {
            text: 'Use the "Create TickTick task" command from any note to send the current line or paragraph to TickTick.'
        });

        new Setting(containerEl)
            .setName('Plugin behavior')
            .setHeading();

        new Setting(containerEl)
            .setName('Selection mode')
            .setDesc('Capture only the current line or the entire paragraph.')
            .addDropdown(dropdown =>
                dropdown
                    .addOption('line', 'Current line')
                    .addOption('paragraph', 'Entire paragraph')
                    .setValue(this.plugin.settings.selectionMode)
                    .onChange(async (value: string) => {
                        this.plugin.settings.selectionMode = value as 'line' | 'paragraph';
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Tag position')
            .setDesc('Where the #ticktick tag is added relative to the text.')
            .addDropdown(dropdown =>
                dropdown
                    .addOption('append', 'Append (end)')
                    .addOption('prepend', 'Prepend (beginning)')
                    .setValue(this.plugin.settings.tagPosition)
                    .onChange(async (value: string) => {
                        this.plugin.settings.tagPosition = value as 'append' | 'prepend';
                        await this.plugin.saveSettings();
                    })
            );

        const details = containerEl.createEl('details', { cls: 'ticktick-advanced' });
        details.style.marginTop = '2em';
        const summary = details.createEl('summary', { text: 'Advanced — Connection details' });
        summary.style.cursor = 'pointer';
        summary.style.fontWeight = '600';
        summary.style.padding = '0.5em 0';

        new Setting(details)
            .setName('Reconnect')
            .setDesc('Re-run the OAuth flow. Use if your token can no longer be refreshed.')
            .addButton(button => {
                button.setButtonText('Reconnect').onClick(async () => {
                    await this.plugin.startAuthFlow();
                });
            });

        new Setting(details)
            .setName('Authorization code')
            .setDesc('Manual fallback if reconnecting did not return you to Obsidian automatically.')
            .addText(text =>
                text
                    .setPlaceholder('Paste authorization code')
                    .onChange(async (code) => {
                        if (code.trim()) {
                            await this.plugin.exchangeAuthCodeForToken(code.trim());
                            text.setValue('');
                            this.display();
                        }
                    })
            );

        new Setting(details)
            .setName('Disconnect')
            .setDesc('Clear stored tokens. You will need to authorize again to create tasks.')
            .addButton(button => {
                button.setButtonText('Disconnect').setWarning().onClick(async () => {
                    this.plugin.settings.accessToken = '';
                    this.plugin.settings.refreshToken = undefined;
                    this.plugin.settings.tokenExpiry = undefined;
                    await this.plugin.saveSettings();
                    new Notice('Disconnected from TickTick.');
                    this.display();
                });
            });

        new Setting(details)
            .setName('Client ID')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.clientId || '')
                    .onChange(async (value) => {
                        this.plugin.settings.clientId = value.trim();
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(details)
            .setName('Client Secret')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('••••••••••')
                    .setValue(this.plugin.settings.clientSecret || '')
                    .onChange(async (value) => {
                        this.plugin.settings.clientSecret = value.trim();
                        await this.plugin.saveSettings();
                    });
                return text;
            });

        new Setting(details)
            .setName('Redirect URI')
            .addText(text =>
                text
                    .setValue(this.plugin.settings.redirectUri || '')
                    .onChange(async (value) => {
                        this.plugin.settings.redirectUri = value.trim();
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(details)
            .setName('Access token')
            .setDesc('Stored access token (read-only).')
            .addText(text => {
                text.inputEl.readOnly = true;
                text.setValue(this.plugin.settings.accessToken || '');
            });

        new Setting(details)
            .setName('Refresh token')
            .setDesc('Stored refresh token (read-only).')
            .addText(text => {
                text.inputEl.readOnly = true;
                text.setValue(this.plugin.settings.refreshToken || '');
            });
    }
}
