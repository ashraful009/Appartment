const fs = require('fs');
const path = require('path');

const logError = (name, error) => {
  try {
    const logMsg = `\n--- ${new Date().toISOString()}: ${name} ---\n${error.stack || error}\n`;
    fs.appendFileSync(path.join(__dirname, '../../server_error.log'), logMsg);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
};

module.exports = { logError };
