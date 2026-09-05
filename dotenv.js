// Simple dotenv implementation
const fs = require('fs');
const path = require('path');

function config() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || line.trim() === '') return;
      
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2];
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith('\'') && value.endsWith('\'')) {
          value = value.slice(1, -1);
        }
        
        process.env[key] = value;
      }
    });
    
    return { parsed: process.env };
  } catch (error) {
    console.error('Error loading .env file:', error);
    return { error };
  }
}

module.exports = { config };