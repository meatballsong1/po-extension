const express    = require('express');
const simpleGit  = require('simple-git');
const archiver   = require('archiver');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const https      = require('https');
const { exec }   = require('child_process');
const { promisify } = require('util');
const execAsync  = promisify(exec);

// ── CONFIG ────────────────────────────────────────────────────────────────
const EXT_PATH    = 'C:\\Users\\Shadow\\Desktop\\po-extension-main';
const BUILDER_DIR = __dirname;
const PORT        = 3847;
const HISTORY_FILE = path.join(BUILDER_DIR, 'release-history.json');
const UPLOAD_DIR   = path.join(BUILDER_DIR, 'uploads');
let   isPublishing = false;  // Lock to prevent auto-sync during publish
const TOKEN_FILE   = path.join(BUILDER_DIR, 'github-token.txt');

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

function compareVersions(a, b) {
    // Returns >0 if a > b, <0 if a < b, 0 if equal
    const pa = (a || '0').split('.').map(Number);
    const pb = (b || '0').split('.').map(Number);
    while (pa.length < 3) pa.push(0);
    while (pb.length < 3) pb.push(0);
    for (let i = 0; i < 3; i++) {
        if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
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

function updateChangelogInContentJs(version, title, subtitle, items, mode, image) {
    const p = path.join(EXT_PATH, 'content.js');
    let content = fs.readFileSync(p, 'utf8');

    // Build items array string
    const itemsStr = items.map(i => `        '${i.replace(/'/g, "\\'")}',`).join('\n');
    const imageStr = image || '';

    // Replace version
    content = content.replace(
        /version:\s*'[^']+',/,
        `version: '${version}',`
    );
    // Replace title
    content = content.replace(
        /title:\s*'[^']*',/,
        `title: '${title.replace(/'/g, "\\'")}',`
    );
    // Replace subtitle
    content = content.replace(
        /subtitle:\s*'[^']*',/,
        `subtitle: '${subtitle.replace(/'/g, "\\'")}',`
    );
    // Replace image
    content = content.replace(
        /image:\s*'[^']*',/,
        `image: '${imageStr}',`
    );
    // Replace mode
    content = content.replace(
        /mode:\s*'[^']*',/,
        `mode: '${mode}',`
    );

    // Replace items array
    content = content.replace(
        /items:\s*\[([\s\S]*?)\],(\s*\/\/ Used when mode is 'text')/,
        `items: [\n${itemsStr}\n    ],$2`
    );

    // Also update VEIL_CURRENT_VERSION if present
    content = content.replace(
        /var VEIL_CURRENT_VERSION\s*=\s*'[^']*';/,
        `var VEIL_CURRENT_VERSION = '${version}';`
    );

    fs.writeFileSync(p, content);
}

function getGithubToken() {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
}

function getTokenUrl() {
    const token = getGithubToken();
    if (token) {
        return `https://${token}@github.com/meatballsong1/po-extension.git`;
    }
    return null;
}

async function pushWithToken(cwd) {
    const tokenUrl = getTokenUrl();
    const cleanUrl = 'https://github.com/meatballsong1/po-extension.git';
    if (tokenUrl) {
        // Temporarily set origin URL with token for auth, then reset
        await execAsync(`git -C "${cwd}" remote set-url origin "${tokenUrl}"`);
    }
    try {
        const result = await execAsync(
            `git -C "${cwd}" push origin main --verbose`,
            { timeout: 30000 }
        );
        return { success: true, stdout: result.stdout, stderr: result.stderr };
    } finally {
        if (tokenUrl) {
            // Always reset the URL to remove the token from git config
            await execAsync(`git -C "${cwd}" remote set-url origin "${cleanUrl}"`).catch(() => {});
        }
    }
}

// ── API ROUTES ────────────────────────────────────────────────────────────

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

// ── GIT HELPERS ───────────────────────────────────────────────────────────
function isGitRepo() {
    return fs.existsSync(path.join(EXT_PATH, '.git'));
}

// GET current state
app.get('/api/status', async (req, res) => {
    try {
        const manifest  = readManifest();
        const history   = readHistory();
        const githubVer = await fetchGithubVersion();

        // If no git repo yet, return early with a friendly flag
        if (!isGitRepo()) {
            return res.json({
                version:       manifest.version,
                githubVersion: githubVer,
                name:          manifest.name,
                extPath:       EXT_PATH,
                gitReady:      false,
                isClean:       true,
                uncommitted:   0,
                modifiedFiles: [],
                history,
                recentCommits: [],
            });
        }

        const gitStatus = await git.status();
        const commits   = await git.log(['--oneline', '-20']).catch(() => ({ all: [] }));

        // Auto-sync: only pull GitHub version forward if local is BEHIND
        // Never sync during a publish (would revert the version bump)
        if (!isPublishing && githubVer && compareVersions(githubVer, manifest.version) > 0) {
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
            version:       finalVersion,
            githubVersion: githubVer,
            name:          manifest.name,
            extPath:       EXT_PATH,
            gitReady:      true,
            isClean:       gitStatus.isClean(),
            uncommitted:   gitStatus.files.length,
            modifiedFiles: gitStatus.files.map(f => f.path),
            history,
            recentCommits: commits.all || [],
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST init-git — initializes the git repo in EXT_PATH and wires up the remote
app.post('/api/init-git', async (req, res) => {
    const { remoteUrl } = req.body;
    const remote = remoteUrl || 'https://github.com/meatballsong1/po-extension';

    try {
        if (isGitRepo()) {
            const remotes = await git.getRemotes(true);
            const origin  = remotes.find(r => r.name === 'origin');
            if (!origin) await git.addRemote('origin', remote);
            return res.json({ success: true, message: 'Git repo already exists. Remote verified.' });
        }

        await git.init();
        await git.addRemote('origin', remote);
        await git.fetch('origin');
        await git.raw(['reset', '--mixed', 'origin/main']);

        res.json({ success: true, message: `Connected to existing repo at ${remote}. Your local files are untouched.` });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST sync-version — pulls version from GitHub and updates all local files
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

        res.json({ success: true, version });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST save-token — saves the github auth token for pushing
app.post('/api/save-token', (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'no token provided' });
        
        fs.writeFileSync(TOKEN_FILE, token.trim());
        res.json({ success: true, message: 'token saved' });
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

// GET git diff
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
    const { bumpType, title, subtitle, items, mode, imageUrl, imageIsUrl, extId } = req.body;

    if (!isGitRepo()) {
        return res.status(400).json({ error: 'Git repo not initialized. Call /api/init-git first.' });
    }

    // Lock to prevent auto-sync from reverting our version bump
    isPublishing = true;

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
        updateChangelogInContentJs(newVersion, title, subtitle, items || [], mode || 'bullets', imageField);
        send('Updated changelog in content.js');

        const statusResult = await execAsync(`git -C "${EXT_PATH}" status --porcelain`);
        const changedFiles = statusResult.stdout.trim().split('\n').filter(Boolean);
        let committed = false;

        if (changedFiles.length === 0) {
            send('No changes to commit', 'warn');
        } else {
            await execAsync(`git -C "${EXT_PATH}" add -A`);
            send(`Staged ${changedFiles.length} file(s)`);

            const commitMsg = `v${newVersion}: ${title}`;
            const safeMsg = commitMsg.replace(/"/g, '\\"');
            await execAsync(`git -C "${EXT_PATH}" commit -m "${safeMsg}"`);
            send(`Committed: "${commitMsg}"`);
            committed = true;
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

        let pushOk = false;
        try {
            const pushResult = await pushWithToken(EXT_PATH);
            const pushOut = (pushResult.stdout + pushResult.stderr).trim();
            const safeOut = pushOut.replace(/https:\/\/[^@]+@/g, 'https://***@');
            const firstLine = safeOut ? ' → ' + safeOut.split('\n')[0] : '';
            send('Pushed to GitHub!' + firstLine, 'success');
            pushOk = true;
        } catch(pushErr) {
            let detail = (pushErr.stderr || pushErr.stdout || pushErr.message || '').trim();
            detail = detail.replace(/https:\/\/[^@]+@/g, 'https://***@');
            send('⚠️ PUSH FAILED: ' + (detail || 'unknown error'), 'error');
            send('Your build was created locally but NOT pushed to GitHub.', 'warn');
            send('Click "Retry Push" or run: git -C "' + EXT_PATH + '" push origin main', 'warn');
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
            committed: committed,
            pushed:    pushOk,
        });
        writeHistory(history);
        send(`Saved to release history`, 'success');

        if (pushOk) {
            send(`DONE: v${newVersion} published and pushed!`, 'done');
        } else {
            send(`DONE: v${newVersion} built locally (push failed — retry below)`, 'done');
        }

        res.end();

    } catch(e) {
        res.write(`data: ${JSON.stringify({ type: 'error', msg: e.message })}\n\n`);
        res.end();
    } finally {
        isPublishing = false;
    }
});

// POST push — standalone push so you can retry without republishing
app.post('/api/push', async (req, res) => {
    if (!isGitRepo()) return res.status(400).json({ error: 'Git repo not initialized.' });
    try {
        const result = await pushWithToken(EXT_PATH);
        let out = (result.stdout + result.stderr).trim();
        out = out.replace(/https:\/\/[^@]+@/g, 'https://***@');
        res.json({ success: true, output: out });
    } catch(e) {
        let detail = (e.stderr || e.stdout || e.message || '').trim();
        detail = detail.replace(/https:\/\/[^@]+@/g, 'https://***@');
        res.status(500).json({ success: false, error: detail });
    }
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

    const { platform } = process;
    const cmd = platform === 'win32' ? `start http://localhost:${PORT}` :
                platform === 'darwin' ? `open http://localhost:${PORT}` :
                `xdg-open http://localhost:${PORT}`;
    exec(cmd);
});