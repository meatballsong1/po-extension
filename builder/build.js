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
    const clPath = path.join(EXT_PATH, 'changelog.json');
    const clData = {
        version,
        title:       title       || '',
        subtitle:    subtitle    || '',
        image:       image       || '',
        mode:        mode        || 'bullets',
        items:       (items || []).map(i =>
            typeof i === 'string' ? i : (i.text ? (i.url ? { text: i.text, url: i.url } : i.text) : i)
        ),
        text:        '',
        buttonLabel: buttonLabel || 'Got it',
    };
    fs.writeFileSync(clPath, JSON.stringify(clData, null, 2));

    const contentPath = path.join(EXT_PATH, 'content.js');
    if (fs.existsSync(contentPath)) {
        let content = fs.readFileSync(contentPath, 'utf8');
        content = content.replace(
            /var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/,
            `var VEIL_CURRENT_VERSION = '${version}';`
        );
        fs.writeFileSync(contentPath, content);
    }

    const bgPath = path.join(EXT_PATH, 'background.js');
    if (fs.existsSync(bgPath)) {
        let bg = fs.readFileSync(bgPath, 'utf8');
        bg = bg.replace(/var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/, `var VEIL_CURRENT_VERSION = '${version}';`);
        fs.writeFileSync(bgPath, bg);
    }
}

function updateChangelogJsonVersion(version) {
    const clPath = path.join(EXT_PATH, 'changelog.json');
    if (!fs.existsSync(clPath)) return;
    try {
        const cl = JSON.parse(fs.readFileSync(clPath, 'utf8'));
        cl.version = version;
        fs.writeFileSync(clPath, JSON.stringify(cl, null, 2));
    } catch(e) {}
}

// ── API ROUTES ────────────────────────────────────────────────────────────

const https = require('https');

function fetchGithubVersion() {
    return new Promise((resolve) => {
        const opts = {
            hostname: 'api.github.com',
            path: '/repos/meatballsong1/po-extension/releases/latest',
            method: 'GET',
            headers: {
                'User-Agent': 'po-extension-builder',
                'Accept': 'application/vnd.github+json',
            },
        };
        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const tag = JSON.parse(data).tag_name || null;
                    // strip leading 'v' so it matches local version format
                    resolve(tag ? tag.replace(/^v/, '') : null);
                } catch(e) { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}
// GET current state — READ ONLY, never writes to disk
app.get('/api/status', async (req, res) => {
    try {
        const manifest   = readManifest();
        const history    = readHistory();
        const gitStatus  = await git.status();
        const commits    = await git.log(['--oneline', '-20']).catch(() => ({ all: [] }));
        const githubVer  = await fetchGithubVersion();

        res.json({
            version:        manifest.version,
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

// POST sync-version — manually triggered only, updates all local files to match GitHub
app.post('/api/sync-version', async (req, res) => {
    try {
        const version = req.body.version;
        if (!version) return res.status(400).json({ error: 'no version' });

        const manifest = readManifest();
        manifest.version = version;
        writeManifest(manifest);

        updateVersionJson(version);

        const contentPath = path.join(EXT_PATH, 'content.js');
        if (fs.existsSync(contentPath)) {
            let c = fs.readFileSync(contentPath, 'utf8');
            c = c.replace(/var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/, `var VEIL_CURRENT_VERSION = '${version}';`);
            fs.writeFileSync(contentPath, c);
        }

        const bgPath = path.join(EXT_PATH, 'background.js');
        if (fs.existsSync(bgPath)) {
            let bg = fs.readFileSync(bgPath, 'utf8');
            bg = bg.replace(/var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/, `var VEIL_CURRENT_VERSION = '${version}';`);
            fs.writeFileSync(bgPath, bg);
        }

        updateChangelogJsonVersion(version);

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

        const preDirty = await git.status();
        if (!preDirty.isClean()) {
            await git.add('.');
            await git.commit(`v${oldVersion}: pre-publish cleanup`);
            send(`Cleaned up ${preDirty.files.length} leftover file(s) from previous run`);
        }

        manifest.version = newVersion;
        writeManifest(manifest);
        send('Updated manifest.json');

        updateVersionJson(newVersion);
        send('Updated version.json');

        if (extId) {
            updateUpdatesXml(newVersion, extId);
            send('Updated updates.xml');
        }

        const imageField = imageIsUrl ? imageUrl : (imageUrl ? path.basename(imageUrl) : '');
        updateChangelogInContentJs(newVersion, title, subtitle, items || [], mode || 'bullets', imageField, buttonLabel || 'Got it');
        send('Updated changelog in content.js');

        await git.add('.');
        const status = await git.status();
        if (status.files.length === 0) {
            send('No changes detected after patching — already up to date', 'warn');
        } else {
            send(`Staged ${status.files.length} file(s)`);
            const commitMsg = `v${newVersion}: ${title}`;
            await git.commit(commitMsg);
            send(`Committed: "${commitMsg}"`);
        }

        const zipPath = path.join(BUILDER_DIR, `extension-v${newVersion}.zip`);
        await new Promise((resolve, reject) => {
            const output  = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
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

        try {
            await git.push('origin', 'main');
            send('Pushed to GitHub!', 'success');
        } catch(pushErr) {
            send('Push failed (check GitHub auth): ' + pushErr.message, 'warn');
        }

        try {
            const GITHUB_OWNER = 'meatballsong1';
            const GITHUB_REPO  = 'po-extension';
            const tokenPath    = path.join(BUILDER_DIR, 'github-token.txt');

            if (!fs.existsSync(tokenPath)) {
                send('No github-token.txt found — skipping GitHub Release.', 'warn');
            } else {
                const GITHUB_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();

                const ghRequest = (method, path, body) => new Promise((resolve, reject) => {
                    const bodyStr = body ? JSON.stringify(body) : null;
                    const opts = {
                        hostname: 'api.github.com',
                        path,
                        method,
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Content-Type':  'application/json',
                            'User-Agent':    'po-extension-builder',
                            ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
                        },
                    };
                    const req = https.request(opts, (res) => {
                        let data = '';
                        res.on('data', c => data += c);
                        res.on('end', () => {
                            try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                            catch(e) { resolve({ status: res.statusCode, body: data }); }
                        });
                    });
                    req.on('error', reject);
                    if (bodyStr) req.write(bodyStr);
                    req.end();
                });

                const existing = await ghRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/v${newVersion}`);
                if (existing.status === 200 && existing.body.id) {
                    await ghRequest('DELETE', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${existing.body.id}`);
                    send(`Deleted existing release for v${newVersion}`, 'log');
                }

                const tagDel = await ghRequest('DELETE', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/tags/v${newVersion}`);
                if (tagDel.status === 204) send(`Deleted existing tag v${newVersion}`, 'log');

                const releaseRes = await ghRequest('POST', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`, {
                    tag_name:         `v${newVersion}`,
                    target_commitish: 'main',
                    name:             `v${newVersion} — ${title}`,
                    body:             subtitle || '',
                    draft:            false,
                    prerelease:       false,
                });

                if (!releaseRes.body.upload_url) {
                    send('GitHub Release failed: ' + (releaseRes.body.message || JSON.stringify(releaseRes.body)), 'warn');
                } else {
                    send(`GitHub Release v${newVersion} created!`, 'success');

                    const uploadUrl  = releaseRes.body.upload_url.replace('{?name,label}', '');
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
                            res.on('end', () => resolve());
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

// DELETE history item by index
app.delete('/api/delete-history/:idx', (req, res) => {
    try {
        const idx = parseInt(req.params.idx);
        const history = readHistory();
        if (isNaN(idx) || idx < 0 || idx >= history.length) return res.status(400).json({ error: 'invalid index' });
        history.splice(idx, 1);
        writeHistory(history);
        res.json({ success: true, history });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('\n  PO Extension Builder');
    console.log('  ─────────────────────');
    console.log(`  Running at: http://localhost:${PORT}`);
    console.log(`  Extension:  ${EXT_PATH}`);
    console.log('\n  Open the URL above in your browser.\n');

    const { platform } = process;
    const cmd = platform === 'win32' ? `start http://localhost:${PORT}` :
                platform === 'darwin' ? `open http://localhost:${PORT}` :
                `xdg-open http://localhost:${PORT}`;
    exec(cmd);
});