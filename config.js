require('./dotenv').config();
const path = require('path');

module.exports = {
  // Bot Configuration
  bot: {
    name: process.env.BOT_NAME || 'WhatsApp Assistant'
  },
  
  // Google API Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
  },
  
  // AI API Keys
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    aiGartisanApiKey: process.env.AI_GARTISAN_API_KEY
  },
  
  // Database Configuration
  database: {
    path: process.env.DB_PATH || path.join(__dirname, 'data', 'whatsapp_bot.db'),
    enableGroupDatabases: process.env.ENABLE_GROUP_DATABASES === 'true',
    groupDbDir: process.env.GROUP_DB_DIR || path.join(__dirname, 'data', 'group_databases')
  },
  
  // Admin Configuration
  admin: {
    numbers: process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : []
  },
  
  // Storage Configuration
  storage: {
    tempDir: process.env.TEMP_DIR || path.join(__dirname, 'temp'),
    dataDir: process.env.DATA_DIR || path.join(__dirname, 'data'),
    uploadsDir: process.env.UPLOADS_DIR || path.join(__dirname, 'data', 'uploads'),
    stickersDir: process.env.STICKERS_DIR || path.join(__dirname, 'data', 'stickers')
  },
  
  // Feature Toggles
  features: {
    enableAI: process.env.ENABLE_AI === 'true',
    enableDrive: process.env.ENABLE_DRIVE === 'true',
    enableKeep: process.env.ENABLE_KEEP === 'true',
    enableSQLiteLogging: process.env.ENABLE_SQLITE_LOGGING === 'true',
    enableDocs: process.env.ENABLE_DOCS === 'true',
    enableCalendar: process.env.ENABLE_CALENDAR === 'true',
    enableTasks: process.env.ENABLE_TASKS === 'true',
    enableWikipedia: process.env.ENABLE_WIKIPEDIA === 'true'
  },
  
  // Wikipedia Configuration
  wikipedia: {
    apiKey: process.env.WIKIPEDIA_API_KEY
  }
};