const express    = require('express');
const simpleGit  = require('simple-git');
const archiver   = require('archiver');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const { exec }   = require('child_process');
const { promisify } = require('util');
const execAsync  = promisify(exec);

// ── CONFIG ────────────────────────────────────────────────────────────────
const EXT_PATH    = 'C:\\Users\\mituy\\Downloads\\pocketoption-config';
const BUILDER_DIR = __dirname;
const PORT        = 3847;
const HISTORY_FILE = path.join(BUILDER_DIR, 'release-history.json');
const UPLOAD_DIR   = path.join(BUILDER_DIR, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app  = express();
const git  = simpleGit(EXT_PATH);
const upload = multer({ dest: UPLOAD_DIR });

app.use(express.json());
app.use(express.static(path.join(BUILDER_DIR, 'ui')));
app.use('/uploads', express.static(UPLOAD_DIR));

// ── HELPERS ───────────────────────────────────────────────────────────────
function readManifest() {
    const p = path.join(EXT_PATH, 'manifest.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeManifest(m) {
    const p = path.join(EXT_PATH, 'manifest.json');
    fs.writeFileSync(p, JSON.stringify(m, null, 2));
}

function readHistory() {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); }
    catch(e) { return []; }
}

function writeHistory(h) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(h, null, 2));
}

function bumpVersion(version, type) {
    const parts = version.split('.').map(Number);
    while (parts.length < 3) parts.push(0);
    if (type === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0; }
    else if (type === 'minor') { parts[1]++; parts[2] = 0; }
    else { parts[2]++; }
    return parts.join('.');
}

function updateVersionJson(version) {
    const p = path.join(EXT_PATH, 'version.json');
    fs.writeFileSync(p, JSON.stringify({ version }, null, 2));
}

function updateUpdatesXml(version, extId) {
    const p = path.join(EXT_PATH, 'updates.xml');
    const xml = `<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${extId}'>
    <updatecheck codebase='https://github.com/meatballsong1/po-extension/releases/latest/download/extension.crx' version='${version}' />
  </app>
</gupdate>`;
    fs.writeFileSync(p, xml);
}

function updateChangelogInContentJs(version, title, subtitle, items, mode, image, buttonLabel) {
    const p = path.join(EXT_PATH, 'content.js');
    let content = fs.readFileSync(p, 'utf8');

    // Find the CHANGELOG object block and replace it entirely — no risky field-by-field regexes
    const itemsStr = (items || []).map(i => `        '${i.replace(/\\/g,'\\\\').replace(/'/g, "\\'")}',`).join('\n');
    const imageStr = (image || '').replace(/\\/g,'\\\\').replace(/'/g, "\\'");
    const titleStr = (title || '').replace(/\\/g,'\\\\').replace(/'/g, "\\'");
    const subStr   = (subtitle || '').replace(/\\/g,'\\\\').replace(/'/g, "\\'");
    const btnStr   = (buttonLabel || 'Got it').replace(/\\/g,'\\\\').replace(/'/g, "\\'");

    const newBlock = `var CHANGELOG = {
    version: '${version}',

    title: '${titleStr}',
    subtitle: '${subStr}',

    image: '${imageStr}',

    // 'bullets' | 'text' | 'links' | 'none'
    mode: '${mode || 'bullets'}',

    items: [
${itemsStr}
    ],

    text: '',

    buttonLabel: '${btnStr}',
};`;

    content = content.replace(/var CHANGELOG\s*=\s*\{[\s\S]*?\};(\s*\/\/ ={3,})/, newBlock + '$1');

    // Update VEIL_CURRENT_VERSION
    content = content.replace(
        /var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/,
        `var VEIL_CURRENT_VERSION = '${version}';`
    );

    fs.writeFileSync(p, content);
}

// ── API ROUTES ────────────────────────────────────────────────────────────

const https = require('https');

function fetchGithubVersion() {
    return new Promise((resolve) => {
        const url = 'https://raw.githubusercontent.com/meatballsong1/po-extension/main/version.json?t=' + Date.now();
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data).version || null); }
                catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// GET current state
app.get('/api/status', async (req, res) => {
    try {
        const manifest   = readManifest();
        const history    = readHistory();
        const gitStatus  = await git.status();
        const commits    = await git.log(['--oneline', '-20']).catch(() => ({ all: [] }));
        const githubVer  = await fetchGithubVersion();

        // Auto-sync all local version references to GitHub if they differ
        if (githubVer && githubVer !== manifest.version) {
            manifest.version = githubVer;
            writeManifest(manifest);
            updateVersionJson(githubVer);
            const contentPath = path.join(EXT_PATH, 'content.js');
            if (fs.existsSync(contentPath)) {
                let c = fs.readFileSync(contentPath, 'utf8');
                c = c.replace(/var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/, `var VEIL_CURRENT_VERSION = '${githubVer}';`);
                fs.writeFileSync(contentPath, c);
            }
        }

        const finalVersion = githubVer || manifest.version;

        res.json({
            version:        finalVersion,
            githubVersion:  githubVer,
            name:           manifest.name,
            extPath:        EXT_PATH,
            isClean:        gitStatus.isClean(),
            uncommitted:    gitStatus.files.length,
            modifiedFiles:  gitStatus.files.map(f => f.path),
            history,
            recentCommits:  commits.all || [],
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST sync-version — pulls version from GitHub and updates all local files
app.post('/api/sync-version', async (req, res) => {
    try {
        const version = req.body.version;
        if (!version) return res.status(400).json({ error: 'no version' });

        // Update manifest.json
        const manifest = readManifest();
        manifest.version = version;
        writeManifest(manifest);

        // Update version.json
        updateVersionJson(version);

        // Update VEIL_CURRENT_VERSION in content.js
        const contentPath = path.join(EXT_PATH, 'content.js');
        if (fs.existsSync(contentPath)) {
            let c = fs.readFileSync(contentPath, 'utf8');
            c = c.replace(/var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/, `var VEIL_CURRENT_VERSION = '${version}';`);
            fs.writeFileSync(contentPath, c);
        }

        res.json({ success: true, version });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// Upload image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const ext  = path.extname(req.file.originalname) || '.png';
    const name = 'changelog-banner' + ext;
    const dest = path.join(UPLOAD_DIR, name);
    fs.renameSync(req.file.path, dest);
    // Also copy to extension folder so it can be bundled
    fs.copyFileSync(dest, path.join(EXT_PATH, name));
    res.json({ url: '/uploads/' + name, filename: name });
});

// GET git diff (uncommitted changes detail)
app.get('/api/diff', async (req, res) => {
    try {
        const diff = await git.diff();
        const status = await git.status();
        res.json({ diff: diff.slice(0, 8000), files: status.files });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST publish — the big one
app.post('/api/publish', async (req, res) => {
    const { bumpType, title, subtitle, items, mode, imageUrl, imageIsUrl, extId, buttonLabel } = req.body;

    try {
        // 1. Read current version — always from manifest (already synced to GitHub on startup)
        const manifest    = readManifest();
        const oldVersion  = manifest.version;
        const newVersion  = bumpVersion(oldVersion, bumpType || 'patch');

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.flushHeaders();

        const send = (msg, type = 'log') => {
            res.write(`data: ${JSON.stringify({ type, msg })}\n\n`);
        };

        send(`Starting publish: ${oldVersion} → ${newVersion}`);

        // 2. Update manifest version
        manifest.version = newVersion;
        writeManifest(manifest);
        send('Updated manifest.json');

        // 3. Update version.json
        updateVersionJson(newVersion);
        send('Updated version.json');

        // 4. Update updates.xml
        if (extId) {
            updateUpdatesXml(newVersion, extId);
            send('Updated updates.xml');
        }

        // 5. Update changelog in content.js
        const imageField = imageIsUrl ? imageUrl : (imageUrl ? path.basename(imageUrl) : '');
        updateChangelogInContentJs(newVersion, title, subtitle, items || [], mode || 'bullets', imageField, buttonLabel || 'Got it');
        send('Updated changelog in content.js');

        // 6. Check git status
        const status = await git.status();
        if (status.files.length === 0) {
            send('No changes to commit', 'warn');
        } else {
            // 7. Stage all
            await git.add('.');
            send(`Staged ${status.files.length} file(s)`);

            // 8. Commit with version as message
            const commitMsg = `v${newVersion}: ${title}`;
            await git.commit(commitMsg);
            send(`Committed: "${commitMsg}"`);
        }

        // 9. Create zip of extension (simpler than crx, works for distribution)
        const zipPath = path.join(BUILDER_DIR, `extension-v${newVersion}.zip`);
        await new Promise((resolve, reject) => {
            const output  = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            const SKIP    = ['node_modules', '.git', 'builder'];
            archive.pipe(output);
            archive.glob('**/*', {
                cwd: EXT_PATH,
                ignore: ['*.zip', '*.crx', 'builder/**', '.git/**', 'node_modules/**'],
            });
            output.on('close', resolve);
            archive.on('error', reject);
            archive.finalize();
        });
        send(`Created extension-v${newVersion}.zip (${Math.round(fs.statSync(zipPath).size / 1024)}KB)`);

        // 10. Push to GitHub
        try {
            await git.push('origin', 'main');
            send('Pushed to GitHub!', 'success');
        } catch(pushErr) {
            send('Push failed (check GitHub auth): ' + pushErr.message, 'warn');
        }

        // 11. Create GitHub Release + upload zip
        try {
            const GITHUB_OWNER = 'meatballsong1';
            const GITHUB_REPO  = 'po-extension';
            const tokenPath    = path.join(BUILDER_DIR, 'github-token.txt');

            if (!fs.existsSync(tokenPath)) {
                send('No github-token.txt found — skipping GitHub Release. Create builder/github-token.txt with your PAT to enable this.', 'warn');
            } else {
                const GITHUB_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();

                // Create the release
                const releaseBody = JSON.stringify({
                    tag_name:         `v${newVersion}`,
                    target_commitish: 'main',
                    name:             `v${newVersion} — ${title}`,
                    body:             subtitle || '',
                    draft:            false,
                    prerelease:       false,
                });

                const releaseRes = await new Promise((resolve, reject) => {
                    const opts = {
                        hostname: 'api.github.com',
                        path:     `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
                        method:   'POST',
                        headers:  {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Content-Type':  'application/json',
                            'User-Agent':    'po-extension-builder',
                            'Content-Length': Buffer.byteLength(releaseBody),
                        },
                    };
                    const req = https.request(opts, (res) => {
                        let data = '';
                        res.on('data', c => data += c);
                        res.on('end', () => resolve(JSON.parse(data)));
                    });
                    req.on('error', reject);
                    req.write(releaseBody);
                    req.end();
                });

                if (!releaseRes.upload_url) {
                    send('GitHub Release failed: ' + (releaseRes.message || JSON.stringify(releaseRes)), 'warn');
                } else {
                    send(`GitHub Release v${newVersion} created!`, 'success');

                    // Upload the zip to the release
                    const uploadUrl  = releaseRes.upload_url.replace('{?name,label}', '');
                    const zipName    = `extension-v${newVersion}.zip`;
                    const zipContent = fs.readFileSync(zipPath);

                    await new Promise((resolve, reject) => {
                        const opts = {
                            hostname: 'uploads.github.com',
                            path:     new URL(uploadUrl).pathname + `?name=${zipName}`,
                            method:   'POST',
                            headers:  {
                                'Authorization': `token ${GITHUB_TOKEN}`,
                                'Content-Type':  'application/zip',
                                'User-Agent':    'po-extension-builder',
                                'Content-Length': zipContent.length,
                            },
                        };
                        const req = https.request(opts, (res) => {
                            let data = '';
                            res.on('data', c => data += c);
                            res.on('end', () => resolve(JSON.parse(data)));
                        });
                        req.on('error', reject);
                        req.write(zipContent);
                        req.end();
                    });

                    send(`ZIP uploaded to GitHub Release!`, 'success');
                }
            }
        } catch(releaseErr) {
            send('GitHub Release error: ' + releaseErr.message, 'warn');
        }

        // 11. Save to history
        const history = readHistory();
        history.unshift({
            version:   newVersion,
            date:      new Date().toISOString(),
            title,
            subtitle,
            items:     items || [],
            mode,
            image:     imageField,
            zipFile:   `extension-v${newVersion}.zip`,
            committed: status.files.length > 0,
        });
        writeHistory(history);
        send(`Saved to release history`, 'success');
        send(`DONE: v${newVersion} published!`, 'done');

        res.end();

    } catch(e) {
        res.write(`data: ${JSON.stringify({ type: 'error', msg: e.message })}\n\n`);
        res.end();
    }
});

// GET/POST github token
app.get('/api/get-token', (req, res) => {
    const p = path.join(BUILDER_DIR, 'github-token.txt');
    if (!fs.existsSync(p)) return res.json({ token: null });
    res.json({ token: fs.readFileSync(p, 'utf8').trim() });
});
app.post('/api/save-token', (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'no token' });
        fs.writeFileSync(path.join(BUILDER_DIR, 'github-token.txt'), token.trim());
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET download zip
app.get('/api/download/:version', (req, res) => {
    const zipPath = path.join(BUILDER_DIR, `extension-v${req.params.version}.zip`);
    if (!fs.existsSync(zipPath)) return res.status(404).json({ error: 'not found' });
    res.download(zipPath);
});

// GET history
app.get('/api/history', (req, res) => {
    res.json(readHistory());
});

// ── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('\n  PO Extension Builder');
    console.log('  ─────────────────────');
    console.log(`  Running at: http://localhost:${PORT}`);
    console.log(`  Extension:  ${EXT_PATH}`);
    console.log('\n  Open the URL above in your browser.\n');

    // Auto-open browser
    const { platform } = process;
    const cmd = platform === 'win32' ? `start http://localhost:${PORT}` :
                platform === 'darwin' ? `open http://localhost:${PORT}` :
                `xdg-open http://localhost:${PORT}`;
    exec(cmd);
});