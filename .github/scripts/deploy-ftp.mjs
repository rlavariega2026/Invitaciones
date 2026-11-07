import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(path.join(process.env.RUNNER_TEMP, 'ftp-client', 'package.json'));
const { Client } = require('basic-ftp');
const required = ['FTP_SERVER', 'FTP_USERNAME', 'FTP_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error('Missing required GitHub secret: ' + key);
}
const port = Number(process.env.FTP_PORT || 21);
const client = new Client(15000);
client.ftp.verbose = true;
const candidates = [];
const initialCandidates = [];
client.ftp.log = (message) => {
  if (!String(message).toLowerCase().includes('pass')) console.log('[FTP]', message);
};
try {
  await client.access({
    host: process.env.FTP_SERVER,
    user: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    port,
    secure: false,
  });
  const initial = await client.pwd();
  console.log('FTP initial directory:', initial);

  // Read-only directory discovery: identify every plausible Invitaciones folder
  // visible to this FTP account before selecting or changing any destination.
  for (const probe of ['/', '/public_html', '/domains', '/domains/lavdigitalagency.com', '/domains/lavdigitalagency.com/public_html']) {
    try {
      await client.cd(probe);
      const here = await client.pwd();
      const listing = await client.list();
      console.log('[FTP DISCOVERY]', here, listing.map(x => (x.isDirectory ? 'DIR ' : 'FILE ') + x.name).join(' | '));
    } catch (error) {
      console.log('[FTP DISCOVERY] unavailable:', probe, String(error?.message || error));
    }
  }
  await client.cd(initial);
  // Inspect the explicit no-upload marker and the alternate public_html subtree.
  try {
    await client.cd('/domains/lavdigitalagency.com');
    const marker = path.join(process.env.RUNNER_TEMP || '/tmp', 'lav-do-not-upload-marker.txt');
    await client.downloadTo(marker, 'DO_NOT_UPLOAD_HERE');
    console.log('[FTP SAFETY MARKER]', (await fs.readFile(marker, 'utf8')).slice(0, 2000));
  } catch (error) {
    console.log('[FTP SAFETY MARKER] unavailable:', String(error?.message || error));
  }
  try {
    await client.cd('/public_html/public_html');
    console.log('[FTP ALTERNATE TREE] /public_html/public_html', (await client.list()).map(x => (x.isDirectory ? 'DIR ' : 'FILE ') + x.name).join(' | '));
  } catch (error) {
    console.log('[FTP ALTERNATE TREE] unavailable:', String(error?.message || error));
  }
  // Compare existing entry-point fingerprints in both same-named folders.
  for (const probe of ['/public_html/Invitaciones', '/public_html/public_html/Invitaciones', '/domains/lavdigitalagency.com/public_html/Invitaciones']) {
    try {
      await client.cd(probe);
      const tmp = path.join(process.env.RUNNER_TEMP || '/tmp', 'lav-probe-' + probe.replace(/[^a-z0-9]/gi, '_') + '.html');
      await client.downloadTo(tmp, 'index.html');
      const html = await fs.readFile(tmp, 'utf8');
      const asset = html.match(/\/Invitaciones\/assets\/[^"']+\.js/)?.[0] || html.match(/assets\/[^"']+\.js/)?.[0] || 'NO JS ASSET FOUND';
      console.log('[FTP INDEX FINGERPRINT]', probe, 'asset:', asset, 'bytes:', Buffer.byteLength(html));
    } catch (error) {
      console.log('[FTP INDEX FINGERPRINT] unavailable:', probe, String(error?.message || error));
    }
  }
  const normalizedInitial = initial.replace(/\\+/g, '/').replace(/\/+$/, '') || '/';
  const domainRoot = '/domains/lavdigitalagency.com/public_html';
  // Hostinger's live domain document root is lavdigitalagency.com/public_html;
  // from this FTP account's filesystem root its absolute path is /domains/lavdigitalagency.com/public_html.
  if (normalizedInitial.toLowerCase().endsWith(domainRoot)) initialCandidates.push('Invitaciones');
  if (normalizedInitial.toLowerCase().endsWith('/domains')) initialCandidates.push('lavdigitalagency.com/public_html/Invitaciones');
  if (normalizedInitial === '/') {
    initialCandidates.push('domains/lavdigitalagency.com/public_html/Invitaciones');
    initialCandidates.push('public_html/Invitaciones');
  } else if (!normalizedInitial.toLowerCase().endsWith('/public_html')) {
    initialCandidates.push('domains/lavdigitalagency.com/public_html/Invitaciones');
    initialCandidates.push('public_html/Invitaciones');
  }

  let targetPwd = null;
  // Resolve the exact Hostinger File Manager folder relative to the FTP account's
  // starting directory. In the /domains directory this is:
  // lavdigitalagency.com/public_html/Invitaciones/
  for (const candidate of [...new Set(initialCandidates)]) {
    try {
      await client.cd(initial);
      await client.cd(candidate);
      const resolved = (await client.pwd()).replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
      const valid = resolved.endsWith('/domains/lavdigitalagency.com/public_html/invitaciones');
      if (valid) {
        targetPwd = await client.pwd();
        console.log('Verified Hostinger destination: lavdigitalagency.com/public_html/Invitaciones/');
        console.log('FTP directory identity verified:', targetPwd);
        break;
      }
      console.log('Skipping FTP directory outside the requested Hostinger destination:', resolved);
    } catch {
      console.log('Requested Hostinger directory is not available from FTP start directory:', candidate);
    }
  }
  if (!targetPwd) {
    throw new Error('Could not verify the live Hostinger document root lavdigitalagency.com/public_html/Invitaciones/; no files were uploaded.');
  }


  const root = path.resolve('deployment');
  const entries = [];
  async function walk(dir, relative = '') {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await walk(full, rel);
      else if (entry.isFile()) entries.push({ full, rel });
    }
  }
  await walk(root);
  // Upload every asset and backend file first; publish index.html last so the
  // public entry point never points at bundles that have not arrived yet.
  entries.sort((a, b) => Number(a.rel === 'index.html') - Number(b.rel === 'index.html'));
  if (!entries.some((entry) => entry.rel === 'index.html') || !entries.some((entry) => entry.rel === 'api.php')) {
    throw new Error('Deployment package is incomplete; expected index.html and api.php.');
  }

  for (const entry of entries) {
    const directory = path.posix.dirname(entry.rel);
    await client.cd(targetPwd);
    if (directory !== '.') await client.ensureDir(directory);
    const filename = path.posix.basename(entry.rel);
    // Publish the entry point through a fresh temporary file. Some Hostinger
    // FTP/CDN combinations acknowledge STOR over an existing index.html while
    // the old document remains live; replacing by rename avoids that stale file.
    if (entry.rel === 'index.html') {
      const temporaryName = '.lav-index-' + (process.env.GITHUB_SHA || Date.now()) + '.html';
      try {
        await client.remove(temporaryName);
      } catch (error) {
        if (!String(error?.message || error).includes('550')) throw error;
      }
      await client.uploadFrom(entry.full, temporaryName);
      try {
        await client.remove(filename);
      } catch (error) {
        if (!String(error?.message || error).includes('550')) throw error;
      }
      await client.rename(temporaryName, filename);
      const verificationFile = path.join(process.env.RUNNER_TEMP || '/tmp', 'lav-index-ftp-readback.html');
      await client.downloadTo(verificationFile, filename);
      const [localIndex, remoteIndex] = await Promise.all([fs.readFile(entry.full), fs.readFile(verificationFile)]);
      if (!localIndex.equals(remoteIndex)) throw new Error('FTP read-back mismatch: index.html in /public_html/Invitaciones is not the uploaded build.');
      console.log('FTP read-back verified: /public_html/Invitaciones/index.html exactly matches this build.');
    } else {
      const temporaryName = '.in.' + filename;
      try {
        await client.remove(temporaryName);
        console.log('Removed stale temporary upload:', temporaryName);
      } catch (error) {
        if (!String(error?.message || error).includes('550')) throw error;
      }
      await client.uploadFrom(entry.full, filename);
    }
  }
  console.log('Uploaded', entries.length, 'files. No remote files were deleted.');
} finally {
  client.close();
}
