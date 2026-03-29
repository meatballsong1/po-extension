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

// ── BAT GENERATOR ─────────────────────────────────────────────────────────
// Generates a self-contained installer bat locked to a specific version.
// The download URL points directly to the exact release asset on GitHub
// using the /releases/download/vX.X.X/ path, NOT /latest/, so it will
// always grab that exact version no matter what gets released after.
function generateInstallerBat(version) {
    const zipAssetName = `extension-v${version}.zip`;
    // Direct asset URL — locked to this specific release tag
    const downloadUrl  = `https://github.com/meatballsong1/po-extension/releases/download/v${version}/${zipAssetName}`;

    return `@echo off
setlocal enabledelayedexpansion
title PocketOption Config ^| Installing v${version}
color 0A

echo.
echo  ================================================
echo   PocketOption Config Installer
echo   Version: ${version}
echo   Download: locked to this specific version
echo  ================================================
echo.

:: ── PATHS ────────────────────────────────────────────────────────────────
set "VERSION=${version}"
set "ZIP_NAME=extension-v${version}.zip"
set "DOWNLOAD_URL=${downloadUrl}"
set "DOWNLOADS=%USERPROFILE%\\Downloads"
set "WORK_DIR=%DOWNLOADS%\\po-ext-v${version}"
set "ZIP_PATH=%DOWNLOADS%\\%ZIP_NAME%"
set "EXTRACT_DIR=%WORK_DIR%"

:: ── PREP ─────────────────────────────────────────────────────────────────
if exist "%WORK_DIR%" rd /s /q "%WORK_DIR%"
mkdir "%WORK_DIR%"

:: ── DOWNLOAD ─────────────────────────────────────────────────────────────
echo  [1/3] Downloading v%VERSION% from GitHub...
echo        %DOWNLOAD_URL%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%ZIP_PATH%' -UseBasicParsing; Write-Host '  OK' } catch { Write-Host ('  FAIL: ' + $_.Exception.Message); exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Download failed. Possible reasons:
    echo    - No internet connection
    echo    - Release v%VERSION% does not exist on GitHub yet
    echo    - GitHub is temporarily unavailable
    echo.
    echo  Try downloading manually:
    echo  %DOWNLOAD_URL%
    echo.
    pause
    exit /b 1
)

if not exist "%ZIP_PATH%" (
    echo  [ERROR] ZIP file not found after download. Aborting.
    pause
    exit /b 1
)

for %%A in ("%ZIP_PATH%") do set "ZIP_SIZE=%%~zA"
echo  [OK] Downloaded %ZIP_NAME% (%ZIP_SIZE% bytes)
echo.

:: ── EXTRACT ──────────────────────────────────────────────────────────────
echo  [2/3] Extracting...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { Expand-Archive -Path '%ZIP_PATH%' -DestinationPath '%EXTRACT_DIR%' -Force; Write-Host '  OK' } catch { Write-Host ('  FAIL: ' + $_.Exception.Message); exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Extraction failed. The ZIP may be corrupt.
    echo  Try downloading it manually and extracting yourself.
    pause
    exit /b 1
)

:: Find the actual extension folder — handles flat zip or nested folder
set "EXT_FOLDER=%EXTRACT_DIR%"
for /d %%D in ("%EXTRACT_DIR%\\*") do (
    if exist "%%D\\manifest.json" set "EXT_FOLDER=%%D"
)

if not exist "%EXT_FOLDER%\\manifest.json" (
    echo  [ERROR] Could not find manifest.json in extracted folder.
    echo  The ZIP structure may be unexpected.
    echo  Extracted to: %EXTRACT_DIR%
    echo.
    explorer "%EXTRACT_DIR%"
    pause
    exit /b 1
)

echo  [OK] Extracted to:
echo       %EXT_FOLDER%
echo.

:: ── OPEN ─────────────────────────────────────────────────────────────────
echo  [3/3] Opening folder and Chrome Extensions page...
echo.
echo  ================================================
echo   HOW TO LOAD THE EXTENSION:
echo.
echo   1. Chrome Extensions page will open
echo   2. Turn on "Developer mode" (top right toggle)
echo   3. Click "Load unpacked"
echo   4. Select the folder that just opened in Explorer
echo   5. Remove the old version of the extension
echo  ================================================
echo.

:: Open the extracted folder in Explorer
explorer "%EXT_FOLDER%"

:: Small delay so Explorer opens first
timeout /t 1 /nobreak >nul

:: Try to open Chrome extensions page — check multiple install paths
set "CHROME_EXE="
for %%P in (
    "%PROGRAMFILES%\\Google\\Chrome\\Application\\chrome.exe"
    "%PROGRAMFILES(X86)%\\Google\\Chrome\\Application\\chrome.exe"
    "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"
    "%PROGRAMFILES%\\Chromium\\Application\\chrome.exe"
    "%LOCALAPPDATA%\\Chromium\\Application\\chrome.exe"
) do (
    if exist %%P (
        if not defined CHROME_EXE set "CHROME_EXE=%%P"
    )
)

if defined CHROME_EXE (
    start "" "%CHROME_EXE%" "chrome://extensions"
    echo  [OK] Opened Chrome Extensions page.
) else (
    echo  [WARN] Could not find Chrome automatically.
    echo  Please open chrome://extensions in your browser manually.
)

:: ── CLEANUP ──────────────────────────────────────────────────────────────
echo.
echo  Cleaning up downloaded ZIP...
del /f /q "%ZIP_PATH%" >nul 2>&1
echo  [OK] Done.

echo.
echo  ================================================
echo   v%VERSION% is ready to load into Chrome!
echo   The extracted folder is in your Downloads:
echo   %EXT_FOLDER%
echo  ================================================
echo.
echo  This window closes in 15 seconds...
timeout /t 15 /nobreak >nul
exit /b 0
`;
}

// ── API ROUTES ────────────────────────────────────────────────────────────

const https = require('https');

// ── GITHUB CONSTANTS ──────────────────────────────────────────────────────
const GITHUB_OWNER = 'meatballsong1';
const GITHUB_REPO  = 'po-extension';

function getGithubToken() {
    const p = path.join(BUILDER_DIR, 'github-token.txt');
    if (!fs.existsSync(p)) return null;
    return fs.readFileSync(p, 'utf8').trim();
}

// Generic GitHub API request
function ghRequest(token, method, reqPath, body) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: 'api.github.com',
            path: reqPath,
            method,
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type':  'application/json',
                'User-Agent':    'po-extension-builder',
                'Accept':        'application/vnd.github+json',
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
}

// Upload an asset to a GitHub release
function ghUpload(token, uploadUrl, assetName, fileBuffer, contentType) {
    return new Promise((resolve, reject) => {
        const baseUrl = uploadUrl.replace('{?name,label}', '');
        const parsed  = new URL(baseUrl);
        const opts = {
            hostname: 'uploads.github.com',
            path:     parsed.pathname + `?name=${encodeURIComponent(assetName)}`,
            method:   'POST',
            headers:  {
                'Authorization':  `token ${token}`,
                'Content-Type':   contentType,
                'User-Agent':     'po-extension-builder',
                'Accept':         'application/vnd.github+json',
                'Content-Length': fileBuffer.length,
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
        req.write(fileBuffer);
        req.end();
    });
}

// Get the upload_url for an existing release tag (returns null if not found)
async function getReleaseUploadUrl(token, version) {
    const res = await ghRequest(token, 'GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/v${version}`);
    if (res.status === 200 && res.body && res.body.upload_url) return res.body.upload_url;
    return null;
}

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
                    resolve(tag ? tag.replace(/^v/, '') : null);
                } catch(e) { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.end();
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

// POST sync-version
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

        // Pre-publish cleanup
        const preDirty = await git.status();
        if (!preDirty.isClean()) {
            await git.add('.');
            await git.commit(`v${oldVersion}: pre-publish cleanup`);
            send(`Cleaned up ${preDirty.files.length} leftover file(s) from previous run`);
        }

        // Update all version references
        manifest.version = newVersion;
        writeManifest(manifest);
        send('Updated manifest.json');

        updateVersionJson(newVersion);
        send('Updated version.json');

        if (extId) {
            updateUpdatesXml(newVersion, extId);
            send('Updated updates.xml');
        }

        // imageUrl is either a full URL (imageIsUrl=true) or a local /uploads/filename.ext path.
        // In both cases we need to: (a) set the right value in changelog.json, and
        // (b) make sure the file is physically present in EXT_PATH so git picks it up.
        let imageField = '';
        if (imageUrl) {
            if (imageIsUrl) {
                // External URL — store as-is, no local copy needed
                imageField = imageUrl;
            } else {
                // Local upload — imageUrl is like '/uploads/changelog-banner.png'
                const imgFilename = path.basename(imageUrl);
                imageField = imgFilename;
                // Re-copy from UPLOAD_DIR to EXT_PATH in case it wasn't copied on upload
                // (handles cases where the builder was restarted between upload and publish)
                const srcPath = path.join(UPLOAD_DIR, imgFilename);
                const dstPath = path.join(EXT_PATH, imgFilename);
                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, dstPath);
                    send('Copied image ' + imgFilename + ' to extension folder');
                } else {
                    send('Warning: uploaded image ' + imgFilename + ' not found in uploads dir', 'warn');
                }
            }
        }
        updateChangelogInContentJs(newVersion, title, subtitle, items || [], mode || 'bullets', imageField, buttonLabel || 'Got it');
        send('Updated changelog.json + content.js + background.js');

        // ── CREATE ZIP ────────────────────────────────────────────────────
        const zipName = `extension-v${newVersion}.zip`;
        const zipPath = path.join(BUILDER_DIR, zipName);
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
        send(`Created ${zipName} (${Math.round(fs.statSync(zipPath).size / 1024)}KB)`);

        // ── CREATE BAT ───────────────────────────────────────────────────
        // Generated AFTER zip so download URL is guaranteed to be correct.
        // The bat uses /releases/download/vX.X.X/ (not /latest/) so it's
        // permanently locked to this exact version.
        const batName = `install-v${newVersion}.bat`;
        const batPath = path.join(BUILDER_DIR, batName);
        fs.writeFileSync(batPath, generateInstallerBat(newVersion), { encoding: 'utf8' });
        send(`Created ${batName} — locked to v${newVersion} download URL`);

        // ── GIT COMMIT + PUSH ─────────────────────────────────────────────
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

        try {
            await git.push('origin', 'main');
            send('Pushed to GitHub!', 'success');
        } catch(pushErr) {
            send('Push failed (check GitHub auth): ' + pushErr.message, 'warn');
        }

        // ── GITHUB RELEASE ────────────────────────────────────────────────
        try {
            const tokenPath    = path.join(BUILDER_DIR, 'github-token.txt');

            if (!fs.existsSync(tokenPath)) {
                send('No github-token.txt found — skipping GitHub Release.', 'warn');
            } else {
                const GITHUB_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
                // Use top-level ghRequest / ghUpload helpers

                // Clean up any existing release + tag for this version
                const existing = await ghRequest(GITHUB_TOKEN, 'GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/v${newVersion}`);
                if (existing.status === 200 && existing.body.id) {
                    await ghRequest(GITHUB_TOKEN, 'DELETE', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${existing.body.id}`);
                    send(`Deleted existing release for v${newVersion}`);
                }
                const tagDel = await ghRequest(GITHUB_TOKEN, 'DELETE', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/tags/v${newVersion}`);
                if (tagDel.status === 204) send(`Deleted existing tag v${newVersion}`);

                // Create the release
                const releaseRes = await ghRequest(GITHUB_TOKEN, 'POST', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`, {
                    tag_name:         `v${newVersion}`,
                    target_commitish: 'main',
                    name:             `v${newVersion} — ${title}`,
                    body:             subtitle || '',
                    draft:            false,
                    prerelease:       false,
                });

                if (!releaseRes.body || !releaseRes.body.upload_url) {
                    send('GitHub Release creation failed: ' + (releaseRes.body && releaseRes.body.message ? releaseRes.body.message : JSON.stringify(releaseRes.body)), 'warn');
                } else {
                    send(`GitHub Release v${newVersion} created!`, 'success');

                    const uploadUrl = releaseRes.body.upload_url;

                    // Upload ZIP asset
                    const zipBuffer = fs.readFileSync(zipPath);
                    const zipUpRes  = await ghUpload(GITHUB_TOKEN, uploadUrl, zipName, zipBuffer, 'application/zip');
                    if (zipUpRes.status === 201) {
                        send(`ZIP uploaded: ${zipName}`, 'success');
                    } else {
                        send(`ZIP upload returned status ${zipUpRes.status}`, 'warn');
                    }

                    // Upload BAT installer asset — locked to this version's download URL
                    const batBuffer = fs.readFileSync(batPath);
                    const batUpRes  = await ghUpload(GITHUB_TOKEN, uploadUrl, batName, batBuffer, 'application/octet-stream');
                    if (batUpRes.status === 201) {
                        send(`BAT installer uploaded: ${batName}`, 'success');
                    } else {
                        send(`BAT upload returned status ${batUpRes.status}`, 'warn');
                    }
                }
            }
        } catch(releaseErr) {
            send('GitHub Release error: ' + releaseErr.message, 'warn');
        }

        // ── SAVE HISTORY ──────────────────────────────────────────────────
        const history = readHistory();
        history.unshift({
            version:   newVersion,
            date:      new Date().toISOString(),
            title,
            subtitle,
            items:     items || [],
            mode,
            image:     imageField,
            zipFile:   zipName,
            batFile:   batName,
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

// GET / POST github token
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

// GET download ZIP
app.get('/api/download/:version', (req, res) => {
    const zipPath = path.join(BUILDER_DIR, `extension-v${req.params.version}.zip`);
    if (!fs.existsSync(zipPath)) return res.status(404).json({ error: 'not found' });
    res.download(zipPath);
});

// GET download BAT installer
app.get('/api/download-bat/:version', (req, res) => {
    const batPath = path.join(BUILDER_DIR, `install-v${req.params.version}.bat`);
    if (!fs.existsSync(batPath)) return res.status(404).json({ error: 'not found' });
    res.setHeader('Content-Type', 'application/octet-stream');
    res.download(batPath);
});

// GET history
app.get('/api/history', (req, res) => {
    res.json(readHistory());
});

// DELETE history item
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

// ── BAT MANAGEMENT ROUTES ────────────────────────────────────────────────

// GET list all bat files in builder dir with their version + whether zip exists
app.get('/api/bats', (req, res) => {
    try {
        const files = fs.readdirSync(BUILDER_DIR);
        const bats = files
            .filter(f => f.startsWith('install-v') && f.endsWith('.bat'))
            .map(f => {
                const version = f.replace('install-v', '').replace('.bat', '');
                const batPath  = path.join(BUILDER_DIR, f);
                const zipName  = `extension-v${version}.zip`;
                const zipPath  = path.join(BUILDER_DIR, zipName);
                const stat     = fs.statSync(batPath);
                return {
                    filename:    f,
                    version,
                    batExists:   true,
                    zipExists:   fs.existsSync(zipPath),
                    zipFilename: zipName,
                    sizeBytes:   stat.size,
                    modified:    stat.mtime.toISOString(),
                };
            })
            .sort((a, b) => b.modified.localeCompare(a.modified));
        res.json(bats);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE a bat file
app.delete('/api/bats/:version', (req, res) => {
    try {
        const version = req.params.version;
        const batPath = path.join(BUILDER_DIR, `install-v${version}.bat`);
        if (!fs.existsSync(batPath)) return res.status(404).json({ error: 'not found' });
        fs.unlinkSync(batPath);
        res.json({ success: true, deleted: `install-v${version}.bat` });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE all bat files
app.delete('/api/bats', (req, res) => {
    try {
        const files = fs.readdirSync(BUILDER_DIR)
            .filter(f => f.startsWith('install-v') && f.endsWith('.bat'));
        files.forEach(f => fs.unlinkSync(path.join(BUILDER_DIR, f)));
        res.json({ success: true, deleted: files });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST regenerate a bat for a specific version (rewrites with current template)
app.post('/api/bats/regenerate/:version', (req, res) => {
    try {
        const version = req.params.version;
        const batPath = path.join(BUILDER_DIR, `install-v${version}.bat`);
        const batContent = generateInstallerBat(version);
        fs.writeFileSync(batPath, batContent, { encoding: 'utf8' });
        const stat = fs.statSync(batPath);
        res.json({
            success: true,
            filename: `install-v${version}.bat`,
            version,
            sizeBytes: stat.size,
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST regenerate ALL bat files (for every version that has a zip)
app.post('/api/bats/regenerate-all', (req, res) => {
    try {
        const files = fs.readdirSync(BUILDER_DIR)
            .filter(f => f.startsWith('extension-v') && f.endsWith('.zip'));
        const results = [];
        files.forEach(f => {
            const version = f.replace('extension-v', '').replace('.zip', '');
            const batPath = path.join(BUILDER_DIR, `install-v${version}.bat`);
            const batContent = generateInstallerBat(version);
            fs.writeFileSync(batPath, batContent, { encoding: 'utf8' });
            results.push({ version, filename: `install-v${version}.bat` });
        });
        res.json({ success: true, regenerated: results });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST generate a bat for a custom/arbitrary version string
app.post('/api/bats/generate', (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'version required' });
        const batPath = path.join(BUILDER_DIR, `install-v${version}.bat`);
        const batContent = generateInstallerBat(version);
        fs.writeFileSync(batPath, batContent, { encoding: 'utf8' });
        const stat = fs.statSync(batPath);
        res.json({
            success: true,
            filename: `install-v${version}.bat`,
            version,
            sizeBytes: stat.size,
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// ── BAT GITHUB UPLOAD ROUTES ─────────────────────────────────────────────

// POST upload a single bat to its GitHub release
app.post('/api/bats/upload/:version', async (req, res) => {
    const version = req.params.version;
    try {
        const token = getGithubToken();
        if (!token) return res.status(400).json({ error: 'No github-token.txt found' });

        const batName = `install-v${version}.bat`;
        const batPath = path.join(BUILDER_DIR, batName);
        if (!fs.existsSync(batPath)) return res.status(404).json({ error: `${batName} not found locally` });

        const uploadUrl = await getReleaseUploadUrl(token, version);
        if (!uploadUrl) return res.status(404).json({ error: `No GitHub release found for v${version}` });

        // Delete existing bat asset if present so we can re-upload
        const assetsRes = await ghRequest(token, 'GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets`);
        // Get release id first
        const releaseRes = await ghRequest(token, 'GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/v${version}`);
        if (releaseRes.status === 200 && releaseRes.body.assets) {
            for (const asset of releaseRes.body.assets) {
                if (asset.name === batName) {
                    await ghRequest(token, 'DELETE', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets/${asset.id}`);
                    break;
                }
            }
        }

        const batBuffer = fs.readFileSync(batPath);
        const result = await ghUpload(token, uploadUrl, batName, batBuffer, 'application/octet-stream');

        if (result.status === 201) {
            res.json({ success: true, version, filename: batName, url: result.body.browser_download_url });
        } else {
            res.status(500).json({ error: `Upload failed with status ${result.status}`, detail: result.body });
        }
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST regenerate + upload a single bat
app.post('/api/bats/regen-upload/:version', async (req, res) => {
    const version = req.params.version;
    try {
        const token = getGithubToken();
        if (!token) return res.status(400).json({ error: 'No github-token.txt found' });

        // Regenerate locally first
        const batName = `install-v${version}.bat`;
        const batPath = path.join(BUILDER_DIR, batName);
        fs.writeFileSync(batPath, generateInstallerBat(version), { encoding: 'utf8' });

        const uploadUrl = await getReleaseUploadUrl(token, version);
        if (!uploadUrl) return res.status(404).json({ error: `No GitHub release found for v${version} — bat was regenerated locally but not uploaded` });

        // Remove old asset
        const releaseRes = await ghRequest(token, 'GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/v${version}`);
        if (releaseRes.status === 200 && releaseRes.body.assets) {
            for (const asset of releaseRes.body.assets) {
                if (asset.name === batName) {
                    await ghRequest(token, 'DELETE', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets/${asset.id}`);
                    break;
                }
            }
        }

        const batBuffer = fs.readFileSync(batPath);
        const result = await ghUpload(token, uploadUrl, batName, batBuffer, 'application/octet-stream');

        if (result.status === 201) {
            res.json({ success: true, version, filename: batName, url: result.body.browser_download_url, regenerated: true });
        } else {
            res.status(500).json({ error: `Upload failed with status ${result.status}`, regenerated: true });
        }
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// POST regenerate ALL bats + upload each to its GitHub release
app.post('/api/bats/regen-upload-all', async (req, res) => {
    try {
        const token = getGithubToken();
        if (!token) return res.status(400).json({ error: 'No github-token.txt found' });

        const zips = fs.readdirSync(BUILDER_DIR)
            .filter(f => f.startsWith('extension-v') && f.endsWith('.zip'));

        const results = [];

        for (const zipFile of zips) {
            const version = zipFile.replace('extension-v', '').replace('.zip', '');
            const batName = `install-v${version}.bat`;
            const batPath = path.join(BUILDER_DIR, batName);

            // Regenerate
            fs.writeFileSync(batPath, generateInstallerBat(version), { encoding: 'utf8' });
            const entry = { version, filename: batName, regenerated: true, uploaded: false, error: null };

            // Upload
            try {
                const uploadUrl = await getReleaseUploadUrl(token, version);
                if (!uploadUrl) {
                    entry.error = 'no GitHub release found';
                    results.push(entry);
                    continue;
                }

                // Remove old asset
                const releaseRes = await ghRequest(token, 'GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/v${version}`);
                if (releaseRes.status === 200 && releaseRes.body.assets) {
                    for (const asset of releaseRes.body.assets) {
                        if (asset.name === batName) {
                            await ghRequest(token, 'DELETE', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets/${asset.id}`);
                            break;
                        }
                    }
                }

                const batBuffer = fs.readFileSync(batPath);
                const result = await ghUpload(token, uploadUrl, batName, batBuffer, 'application/octet-stream');
                entry.uploaded = result.status === 201;
                if (result.status !== 201) entry.error = `status ${result.status}`;
            } catch(uploadErr) {
                entry.error = uploadErr.message;
            }

            results.push(entry);
        }

        res.json({
            success: true,
            results,
            uploaded: results.filter(r => r.uploaded).length,
            failed:   results.filter(r => r.error).length,
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// Serve bat manager UI
app.get('/bats', (req, res) => {
    res.sendFile(path.join(BUILDER_DIR, 'ui', 'bat-manager.html'));
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