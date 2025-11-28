const fs = require('fs');
const path = require('path');

console.log('📦 Checking client bundle...');

const distDir = path.join(__dirname, '..', 'dist');
const clientIndexPath = path.join(distDir, 'client', 'index.js');

if (fs.existsSync(clientIndexPath)) {
  // Rollup already created the AMD bundle correctly
  // Just verify it exists and skip esbuild re-bundling to preserve AMD format
  console.log('✅ Client bundle exists (AMD format from Rollup)');
} else {
  console.log('⚠ Client index not found');
}

console.log('\n✅ Build completed!');
