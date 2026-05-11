# TickTick Quick Add for Obsidian

Send the line or paragraph at your cursor straight to TickTick as a new task — with a one-tap link back to the exact spot in your note. Works on desktop and on mobile (iOS and Android).

When you trigger the command, the plugin:
- Appends a `#ticktick` tag and a unique block anchor to the text (so you can find it again, and so the deep link works).
- Creates a TickTick task with that text as the title.
- Puts an `obsidian://advanced-uri` link in the task body that opens the note at that exact block when you tap it from TickTick.

## Prerequisites

- **Advanced URI** community plugin — required for the deep link back from TickTick to work. Install from Settings → Community plugins → Browse → "Advanced URI".
- A **TickTick account** with API credentials. See *Setup* below.

## Installation

### Recommended (mobile or desktop)

Install directly from Obsidian's Community Plugins directory:

1. Settings → Community plugins → turn off **Restricted Mode** if it's on.
2. Browse → search "TickTick Quick Add Task" → Install → Enable.

### Beta / pre-release via BRAT

If you want a version newer than what's in the Community Plugins directory, use [BRAT](https://github.com/TfTHacker/obsidian42-brat) to sideload it from GitHub:

1. Install **Obsidian42 - BRAT** from Community plugins.
2. Settings → BRAT → "Add beta plugin" → paste: `heymoosh/ticktick-quick-add-obsidian`.
3. Go back to Community plugins and enable **TickTick Quick Add Task**.

### Mobile (manual)

1. On a desktop, navigate to your vault's hidden `.obsidian/plugins/` folder. For iCloud-synced vaults this is at:
   - macOS: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/<VaultName>/.obsidian/plugins/`
   - Windows: `iCloudDrive\iCloud~md~obsidian\<VaultName>\.obsidian\plugins\`
2. Create a folder named `ticktick-quickadd-task` inside `plugins/`.
3. Drop `main.js` and `manifest.json` into it.
4. Wait for iCloud to sync, then force-close and reopen Obsidian on your phone.
5. Settings → Community plugins → enable **TickTick Quick Add Task**.

> Why not just create `.obsidian` on iOS? iOS's Files app refuses to create folders whose names start with a dot. The folder already exists if Obsidian has ever opened the vault — but it's hidden from iOS Files. The desktop path above sidesteps this.

### Desktop (manual / for developers)

If you want to build from source instead of using the directory:

1. Clone the repo and build:
   ```bash
   git clone https://github.com/heymoosh/ticktick-quick-add-obsidian.git
   cd ticktick-quick-add-obsidian
   npm install
   npm run build
   ```
2. Copy `main.js` and `manifest.json` into `<YourVault>/.obsidian/plugins/ticktick-quickadd-task/`.
3. In Obsidian: Settings → Community plugins → enable **TickTick Quick Add Task**.

## Setup

Open the plugin's settings tab. You'll see a two-step "Set up TickTick" view.

### Step 1 — Enter your TickTick app credentials

1. Sign in to the [TickTick Developer Portal](https://developer.ticktick.com/) and create an app.
2. In the developer portal, set your app's **Redirect URI** to the value shown in the plugin's "Redirect URI" field (the default points at a Vercel callback page that hands you back to Obsidian via a deep link).
3. Copy the **Client ID** and **Client Secret** from the developer portal into the corresponding plugin fields.

### Step 2 — Authorize

1. Tap **Connect**.
2. A small popup appears with a tappable "Open TickTick login" link. Tap it.
3. Your browser opens TickTick's authorization page. Sign in and approve access.
4. The callback page should redirect you straight back into Obsidian. You'll see "TickTick access token obtained successfully!"
5. **If the callback page instead shows you an authorization code as text**, copy that code and paste it into the "Authorization code" field in the plugin settings. The plugin will exchange it for a token immediately.

Once connected, the settings view collapses into the day-to-day view: Plugin behavior options up top, plus an **Advanced — Connection details** section (collapsed) with your credentials, tokens, a reconnect button, and a disconnect button.

## Using the plugin

Place the cursor on the line you want to send (or anywhere in the paragraph if you've set Selection mode to "Entire paragraph"), then trigger the command **"Create TickTick task"** in one of these ways:

### On mobile (recommended)

- **Three-dot menu** — tap the `⋯` button in the top-right of any note. "Create TickTick task" appears alongside Bookmark, Find, Copy Advanced URI, etc. No setup required.
- **Mobile toolbar** — Settings → Mobile → Manage toolbar → "+" → search "Create TickTick task" → add. A tappable button now sits above your keyboard, one tap away whenever you're editing a note.
- **Command palette** — the palette isn't bound to the three-dot menu on mobile; you have to add it to the toolbar yourself: Settings → Mobile → Manage toolbar → "+" → search "Command palette" → add. Tap that toolbar button to open the searchable command list, then type "ticktick".

### On desktop

- **Three-dot menu** — the `⋯` button in any note's tab bar / header includes "Create TickTick task".
- **Hotkey** — Settings → Hotkeys → search "Create TickTick task" → assign a shortcut.
- **Command palette** — `Ctrl/Cmd+P` → type "ticktick" → enter.

After triggering, you'll see a notice confirming the task was created.

> Don't manually delete the `^xxxxxxxx` block anchor the plugin adds — that's what makes the "Open in Obsidian" link in TickTick work. The `#ticktick` tag is just for your own bookkeeping; you can change or remove it without breaking anything.

## Settings reference

**Plugin behavior** (shown once connected):

- **Selection mode** — `Current line` (default) sends just the line your cursor is on; `Entire paragraph` sends the consecutive block of non-empty lines around the cursor.
- **Tag position** — `Append (end)` (default) puts `#ticktick` at the end of the text; `Prepend (beginning)` puts it at the start.

**Advanced — Connection details** (collapsed by default once connected):

- **Reconnect** — re-run the OAuth flow without clearing your current connection. Useful if your refresh token stops working.
- **Authorization code** — manual paste fallback for the OAuth flow.
- **Disconnect** — clear stored tokens. You'll need to authorize again to create more tasks.
- **Client ID / Client Secret / Redirect URI** — your TickTick app credentials.
- **Access token / Refresh token** — current tokens, read-only.

## Troubleshooting

- **"TickTick auth failed: state mismatch"** — the OAuth flow expired or was started in a different session. Tap Connect again and complete the flow without delays.
- **"Failed to obtain access token"** — most often a bad Client ID or Secret, or the Redirect URI you set in the TickTick developer portal doesn't exactly match the one in the plugin. Copy/paste both rather than typing.
- **The Connect popup link does nothing** — make sure your default browser is set and you've allowed Obsidian to open external links. Try long-pressing the link to copy it, then paste into Safari/Chrome.
- **Callback page shows the code as text instead of returning to Obsidian** — that's the manual-fallback case. Paste the code into the "Authorization code" field; the plugin will exchange it for a token. (This happens if the callback page hasn't been deployed with the deep-link redirect.)
- **The "Open in Obsidian" link in TickTick does nothing** — confirm the Advanced URI plugin is installed and enabled in the same vault.
- **Plugin doesn't appear in Community plugins on mobile** — confirm the files are at `<vault>/.obsidian/plugins/ticktick-quickadd-task/main.js` and `…/manifest.json`, then force-close and relaunch Obsidian.

## Privacy & security

- The plugin stores credentials only in Obsidian's local plugin data — nothing is sent to third-party servers other than TickTick itself.
- OAuth uses PKCE and a CSRF state check; the state parameter is verified before the auth code is accepted.
- The callback URL is a static Vercel-hosted page whose only job is to redirect back to `obsidian://ticktick-callback?...`. It does not see your tokens; the token exchange happens directly between the plugin and TickTick.
- No tracking, no analytics.

## License

[MIT](./LICENSE)
