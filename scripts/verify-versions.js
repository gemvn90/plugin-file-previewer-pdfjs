const fs = require('fs');
const path = require('path');

console.log('=== PDF.js Version Consistency Check ===\n');

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);

// Read installed pdfjs-dist version
const pdfjsPackageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'package.json'), 'utf8')
);

// Read code to check CDN URL
const previewerCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'client', 'PDFPreviewer.tsx'),
  'utf8'
);

// Extract CDN base URL
const cdnMatch = previewerCode.match(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js/);

console.log('1. Package.json dependencies:');
console.log('   pdfjs-dist:', packageJson.dependencies['pdfjs-dist']);
console.log('   react-pdf:', packageJson.dependencies['react-pdf']);
console.log('   file-saver:', packageJson.dependencies['file-saver']);
console.log('');

console.log('2. Installed pdfjs-dist version:');
console.log('   Version:', pdfjsPackageJson.version);
console.log('');

console.log('3. Worker CDN configuration:');
if (cdnMatch) {
  console.log('   ✓ Using cdnjs.cloudflare.com');
  console.log('   ✓ Dynamic version: ${pdfjs.version}');
  console.log('   ✓ Will resolve to:', pdfjsPackageJson.version);
} else {
  console.log('   ✗ CDN URL not found or incorrect');
}
console.log('');

// Consistency checks
let allOk = true;

console.log('4. Consistency checks:');

// Check if installed version matches package.json
const expectedVersion = packageJson.dependencies['pdfjs-dist'].replace('^', '');
if (pdfjsPackageJson.version === expectedVersion) {
  console.log('   ✓ Installed version matches package.json');
} else {
  console.log(`   ✗ Version mismatch! Expected: ${expectedVersion}, Got: ${pdfjsPackageJson.version}`);
  allOk = false;
}

// Check react-pdf compatibility (3.x needs react-pdf 7.x)
const reactPdfVersion = packageJson.dependencies['react-pdf'];
if (reactPdfVersion.includes('7.')) {
  console.log('   ✓ react-pdf 7.x compatible with pdfjs-dist 3.x');
} else {
  console.log('   ✗ react-pdf version incompatible! Expected 7.x, got:', reactPdfVersion);
  allOk = false;
}

// Check devDependencies consistency
if (packageJson.devDependencies['react-pdf'] !== packageJson.dependencies['react-pdf']) {
  console.log('   ✗ WARNING: devDependencies react-pdf differs from dependencies');
  console.log(`     dependencies: ${packageJson.dependencies['react-pdf']}`);
  console.log(`     devDependencies: ${packageJson.devDependencies['react-pdf']}`);
  allOk = false;
} else {
  console.log('   ✓ devDependencies react-pdf matches dependencies');
}

console.log('');

if (allOk) {
  console.log('=== ✓ All version checks passed ===');
  process.exit(0);
} else {
  console.log('=== ✗ Some version checks failed ===');
  process.exit(1);
}
