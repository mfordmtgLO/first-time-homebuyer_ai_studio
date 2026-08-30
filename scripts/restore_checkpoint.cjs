const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Initiating rollback to Restore Point (v1.0.0-restore-point)...');

const rootDir = path.resolve(__dirname, '..');
const backupArchive = path.join(rootDir, 'backups', 'restore_point_v1_working_model.tar.gz');

try {
  // Attempt git reset first
  execSync('git reset --hard v1.0.0-restore-point', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Git repository successfully restored to tag "v1.0.0-restore-point".');
} catch (gitErr) {
  console.warn('⚠️ Git reset failed or not available, extracting backup tarball...');
  if (fs.existsSync(backupArchive)) {
    execSync(`tar -xzf ${backupArchive} -C ${rootDir}`, { stdio: 'inherit' });
    console.log('✅ Extracted backup archive successfully.');
  } else {
    console.error('❌ Could not find backup tarball at', backupArchive);
    process.exit(1);
  }
}

console.log('🎉 Restore complete! Run "npm run build" or check your live preview.');
