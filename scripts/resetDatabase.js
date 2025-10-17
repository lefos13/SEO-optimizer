/**
 * Database Reset Script
 * Completely wipes out the database for a clean start
 * Run with: node scripts/resetDatabase.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function resetDatabase() {
  console.log('🔄 [RESET] Starting database reset...\n');

  // Determine database paths
  const devDbPath = path.join(os.tmpdir(), 'seo-optimizer', 'seo-optimizer.db');
  const prodDbPath = path.join(
    os.homedir(),
    '.seo-optimizer',
    'data',
    'seo-optimizer.db'
  );

  let deletedCount = 0;

  // Delete development database
  if (fs.existsSync(devDbPath)) {
    try {
      fs.unlinkSync(devDbPath);
      console.log('✅ [RESET] Deleted development database:');
      console.log(`   ${devDbPath}\n`);
      deletedCount++;
    } catch (error) {
      console.error('❌ [RESET] Failed to delete development database:');
      console.error(`   ${error.message}\n`);
    }
  } else {
    console.log('ℹ️  [RESET] Development database not found:');
    console.log(`   ${devDbPath}\n`);
  }

  // Delete production database
  if (fs.existsSync(prodDbPath)) {
    try {
      fs.unlinkSync(prodDbPath);
      console.log('✅ [RESET] Deleted production database:');
      console.log(`   ${prodDbPath}\n`);
      deletedCount++;
    } catch (error) {
      console.error('❌ [RESET] Failed to delete production database:');
      console.error(`   ${error.message}\n`);
    }
  } else {
    console.log('ℹ️  [RESET] Production database not found:');
    console.log(`   ${prodDbPath}\n`);
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (deletedCount > 0) {
    console.log(`🎉 [RESET] Successfully deleted ${deletedCount} database(s)`);
    console.log('   The database will be recreated with the latest schema');
    console.log('   when you restart the application.\n');
  } else {
    console.log('ℹ️  [RESET] No databases found to delete.');
    console.log(
      '   The database will be created when you start the application.\n'
    );
  }
  console.log('✅ [RESET] Reset complete!\n');
}

// Run the reset
resetDatabase();
