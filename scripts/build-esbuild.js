const { build } = require('esbuild');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

console.log('🔨 Building with esbuild...');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Find server files only (exclude client - will be built by rollup)
const serverFiles = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.test.tsx', 'src/client/**']
});

console.log(`Found ${serverFiles.length} server files`);

// Build server code with CommonJS
build({
  entryPoints: serverFiles,
  outdir: 'dist',
  outbase: 'src',
  format: 'cjs',
  platform: 'node',
  target: 'es2019',
  sourcemap: false,
  minify: false,
  bundle: false
}).then(() => {
  console.log('✅ esbuild completed (server only)');
  
  // Copy locale files
  const srcLocale = path.join(srcDir, 'locale');
  const distLocale = path.join(distDir, 'locale');
  
  if (fs.existsSync(srcLocale)) {
    if (!fs.existsSync(distLocale)) {
      fs.mkdirSync(distLocale, { recursive: true });
    }
    
    const localeFiles = fs.readdirSync(srcLocale);
    localeFiles.forEach(file => {
      fs.copyFileSync(
        path.join(srcLocale, file),
        path.join(distLocale, file)
      );
    });
    console.log(`✅ Copied ${localeFiles.length} locale files`);
  }
  
  // Generate TypeScript declarations
  console.log('');
  console.log('📝 Generating TypeScript declarations...');
  const { execSync } = require('child_process');
  try {
    execSync('npx tsc --declaration --emitDeclarationOnly --outDir dist', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    console.log('✅ TypeScript declarations generated');
  } catch (error) {
    console.warn('⚠ Warning: Could not generate TypeScript declarations');
    console.warn('   This is optional and the plugin will still work');
  }
  
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
