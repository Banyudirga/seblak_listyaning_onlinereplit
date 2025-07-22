// Script to copy PWA assets to the build output directory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'client', 'public');
const targetDir = path.join(rootDir, 'dist', 'public');

// Function to copy a file
function copyFile(source, target) {
  // Create target directory if it doesn't exist
  const targetDir = path.dirname(target);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy the file
  fs.copyFileSync(source, target);
  console.log(`Copied: ${source} -> ${target}`);
}

// Function to copy a directory recursively
function copyDir(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Read source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  // Copy each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDir(sourcePath, targetPath);
    } else {
      // Copy file
      copyFile(sourcePath, targetPath);
    }
  }
}

// Main function
function main() {
  console.log('Copying PWA assets to build output directory...');
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }
  
  try {
    copyDir(sourceDir, targetDir);
    console.log('PWA assets copied successfully!');
  } catch (error) {
    console.error('Error copying PWA assets:', error);
    process.exit(1);
  }
}

// Run the script
main();