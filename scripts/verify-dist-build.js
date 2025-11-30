const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         Dist Build Verification                         ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

const distFile = path.join(__dirname, '..', 'dist', 'client', 'index.js');

if (!fs.existsSync(distFile)) {
  console.log('❌ ERROR: dist/client/index.js not found!');
  console.log('   Please run: npm run build\n');
  process.exit(1);
}

const content = fs.readFileSync(distFile, 'utf8');

console.log('📋 Checking built bundle...\n');

// Check 1: PDF.js version
console.log('1. PDF.js Version:');
const versionMatch = content.match(/const version = "(\d+\.\d+\.\d+)"/);
if (versionMatch) {
  const version = versionMatch[1];
  console.log(`   Found: ${version}`);
  
  if (version.startsWith('3.')) {
    console.log('   ✅ Correct! (PDF.js 3.x)\n');
  } else if (version.startsWith('5.')) {
    console.log('   ❌ ERROR: Old build with PDF.js 5.x detected!');
    console.log('   Expected: 3.11.174');
    console.log('   Please rebuild: npm run build\n');
    process.exit(1);
  } else {
    console.log(`   ⚠️  Unexpected version: ${version}\n`);
  }
} else {
  console.log('   ⚠️  Version string not found in standard format\n');
}

// Check 2: Worker URL
console.log('2. Worker URL Configuration:');
const workerMatches = content.match(/https:\/\/[^\s"']+pdf\.worker[^\s"']*/g);
if (workerMatches && workerMatches.length > 0) {
  const uniqueUrls = [...new Set(workerMatches)];
  uniqueUrls.forEach(url => {
    console.log(`   ${url}`);
    
    if (url.includes('.mjs')) {
      console.log('   ❌ ERROR: .mjs worker detected! Should be .js for PDF.js 3.x');
      process.exit(1);
    } else if (url.includes('.js')) {
      console.log('   ✅ Correct format (.js)');
    }
    
    if (url.includes('cdnjs.cloudflare.com')) {
      console.log('   ✅ Using cdnjs.cloudflare.com');
    } else {
      console.log('   ⚠️  Not using cdnjs');
    }
  });
  console.log('');
} else {
  console.log('   ⚠️  Worker URL not found in expected format\n');
}

// Check 3: Dynamic version usage
console.log('3. Dynamic Version Usage:');
if (content.includes('pdfjs.version') || content.match(/\$\{[^}]*version[^}]*\}/)) {
  console.log('   ✅ Uses dynamic version (good!)\n');
} else if (content.match(/3\.11\.174/)) {
  console.log('   ⚠️  Hardcoded version 3.11.174 detected');
  console.log('   Consider using dynamic version: ${pdfjs.version}\n');
} else {
  console.log('   ⚠️  Version reference not clear\n');
}

// Check 4: No .mjs references
console.log('4. Checking for .mjs references:');
const mjsMatches = content.match(/\.mjs['"`]/g);
if (mjsMatches && mjsMatches.length > 0) {
  console.log(`   ❌ Found ${mjsMatches.length} .mjs reference(s)`);
  console.log('   This indicates PDF.js 5.x code!');
  process.exit(1);
} else {
  console.log('   ✅ No .mjs references (correct for PDF.js 3.x)\n');
}

// Check 5: Bundle size
console.log('5. Bundle Size:');
const stats = fs.statSync(distFile);
const sizeKB = (stats.size / 1024).toFixed(1);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
console.log(`   ${sizeKB} KB (${sizeMB} MB)`);

if (stats.size > 900000 && stats.size < 950000) {
  console.log('   ✅ Size looks correct for bundled PDF.js 3.x\n');
} else if (stats.size < 100000) {
  console.log('   ⚠️  Bundle seems too small - dependencies might not be bundled\n');
} else {
  console.log('   ⚠️  Unexpected bundle size\n');
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
console.log('✅ Dist build verification complete');
console.log('═══════════════════════════════════════════════════════════\n');
