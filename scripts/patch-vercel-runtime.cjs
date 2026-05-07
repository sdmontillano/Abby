const fs = require('fs');
const path = require('path');

const functionsDir = '.vercel/output/functions';
if (!fs.existsSync(functionsDir)) {
  console.log('[patch] No .vercel/output/functions directory found, skipping');
  process.exit(0);
}

let patched = 0;
const dirs = fs.readdirSync(functionsDir);
for (const dir of dirs) {
  const configPath = path.join(functionsDir, dir, '.vc-config.json');
  if (fs.existsSync(configPath)) {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (cfg.runtime !== 'nodejs20.x') {
      console.log('[patch] ' + dir + ': ' + cfg.runtime + ' -> nodejs20.x');
      cfg.runtime = 'nodejs20.x';
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
      patched++;
    }
  }
}

console.log('[patch] Patched ' + patched + ' function(s) to nodejs20.x');
process.exit(0);
