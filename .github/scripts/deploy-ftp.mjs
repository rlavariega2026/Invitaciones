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

  const normalizedInitial = initial.replace(/\\+/g, '/').replace(/\/+$/, '') || '/';
  const domainRoot = '/domains/lavdigitalagency.com/public_html';
  if (normalizedInitial.toLowerCase().endsWith(domainRoot)) initialCandidates.push('Invitaciones');
  if (normalizedInitial.toLowerCase().endsWith('/public_html')) initialCandidates.push('Invitaciones');
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
      const resolved = (await client.pwd()).replace(/\\+/g, '/').replace(/\\/+$/, '').toLowerCase();
      const valid = resolved.endsWith('/lavdigitalagency.com/public_html/invitaciones')
        || resolved.endsWith('/public_html/invitaciones');
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
    throw new Error('Could not verify lavdigitalagency.com/public_html/Invitaciones/; no files were uploaded.');
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
  if (!entries.some((entry) => entry.rel === 'index.html') || !entries.some((entry) => entry.rel === 'api.php')) {
    throw new Error('Deployment package is incomplete; expected index.html and api.php.');
  }

  for (const entry of entries) {
    const directory = path.posix.dirname(entry.rel);
    await client.cd(targetPwd);
    if (directory !== '.') await client.ensureDir(directory);
    const filename = path.posix.basename(entry.rel);
    const temporaryName = '.in.' + filename;
    try {
      await client.remove(temporaryName);
      console.log('Removed stale temporary upload:', temporaryName);
    } catch (error) {
      if (!String(error?.message || error).includes('550')) throw error;
    }
    await client.uploadFrom(entry.full, filename);
  }
  console.log('Uploaded', entries.length, 'files. No remote files were deleted.');
} finally {
  client.close();
}
