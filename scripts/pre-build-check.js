const { execSync } = require('child_process');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         Pre-Build Verification Checks                   ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

let allPassed = true;

// Check 1: Version Consistency
console.log('📋 Step 1: Checking version consistency...');
try {
  execSync('node scripts/verify-versions.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✓ Version checks passed\n');
} catch (error) {
  console.log('✗ Version checks failed\n');
  allPassed = false;
}

// Check 2: CDN Availability
console.log('🌐 Step 2: Verifying CDN availability...');
try {
  execSync('powershell -ExecutionPolicy Bypass -File scripts/verify-cdn.ps1', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✓ CDN checks passed\n');
} catch (error) {
  console.log('✗ CDN checks failed\n');
  allPassed = false;
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('✅ All pre-build checks passed! Ready to build.');
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.log('❌ Some pre-build checks failed! Please fix before building.');
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(1);
}
