const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         CDN URL Verification in Source Code             ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Read all source files
const srcDir = path.join(__dirname, '..', 'src');
const files = [];

function walkDir(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
      files.push(fullPath);
    }
  });
}

walkDir(srcDir);

// Find all CDN URLs
const cdnUrls = new Set();
const cdnPatterns = [
  /https?:\/\/[^\s'"`)]+\.(js|mjs|css|woff|woff2|ttf|svg)/gi,
  /cdnjs\.cloudflare\.com[^\s'"`)]+/gi,
  /unpkg\.com[^\s'"`)]+/gi,
  /jsdelivr\.net[^\s'"`)]+/gi
];

console.log('📁 Scanning source files...\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  
  cdnPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Clean up the URL
        let url = match.replace(/['"`)]+$/, '').replace(/^['"`(]+/, '');
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        cdnUrls.add({ url, file: relativePath });
      });
    }
  });
});

console.log(`Found ${cdnUrls.size} CDN references:\n`);

// Check for dynamic URLs (template strings)
console.log('🔍 Checking for dynamic CDN URLs...\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  
  // Look for template strings with CDN
  const dynamicPattern = /`[^`]*(?:cdnjs|unpkg|jsdelivr)[^`]*`/g;
  const matches = content.match(dynamicPattern);
  
  if (matches) {
    matches.forEach(match => {
      console.log(`  📌 ${relativePath}:`);
      console.log(`     ${match}`);
      console.log('');
    });
  }
});

// Check for hardcoded versions
console.log('🔢 Checking for hardcoded versions...\n');

const versionPattern = /\d+\.\d+\.\d+/g;
let foundHardcoded = false;

cdnUrls.forEach(({ url, file }) => {
  const versions = url.match(versionPattern);
  if (versions) {
    console.log(`  ⚠️  ${file}:`);
    console.log(`     ${url}`);
    console.log(`     Version: ${versions.join(', ')}`);
    console.log('');
    foundHardcoded = true;
  }
});

if (!foundHardcoded) {
  console.log('  ✓ No hardcoded versions found (good!)\n');
}

// Expected dynamic URL for PDF.js 3.x
console.log('═══════════════════════════════════════════════════════════');
console.log('Expected CDN URL pattern for PDF.js 3.x:\n');
console.log('  Worker: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js');
console.log('  Format: .js (NOT .mjs)');
console.log('  Version: Dynamic (from pdfjs.version)');
console.log('═══════════════════════════════════════════════════════════\n');

// Verify pdfjs.version usage
console.log('🔍 Verifying pdfjs.version usage...\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  
  if (content.includes('pdfjs.version')) {
    console.log(`  ✓ ${relativePath} uses pdfjs.version`);
  }
});

console.log('');

// Check for .mjs references
console.log('⚠️  Checking for .mjs references (should be NONE for 3.x)...\n');

let mjsFound = false;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  
  if (content.includes('.mjs')) {
    console.log(`  ❌ ${relativePath} contains .mjs reference`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('.mjs')) {
        console.log(`     Line ${idx + 1}: ${line.trim()}`);
      }
    });
    console.log('');
    mjsFound = true;
  }
});

if (!mjsFound) {
  console.log('  ✓ No .mjs references found (correct for PDF.js 3.x)\n');
}

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ CDN verification complete');
console.log('═══════════════════════════════════════════════════════════\n');
