// Simple test script to verify the local setup
console.log('Testing Church CMS Local Setup...');

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'src/main.tsx',
  'src/App.tsx'
];

console.log('\nChecking required files:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('\n✓ node_modules directory exists');
} else {
  console.log('\n✗ node_modules directory missing');
  allFilesExist = false;
}

// Check package.json scripts
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('\nAvailable scripts:');
  Object.keys(packageJson.scripts).forEach(script => {
    console.log(`  npm run ${script}`);
  });
} catch (error) {
  console.log('\n✗ Error reading package.json');
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n🎉 Local setup appears to be working correctly!');
  console.log('\nTo start development server: npm run dev');
  console.log('To build for production: npm run build');
} else {
  console.log('\n❌ Some issues found with the local setup');
}
