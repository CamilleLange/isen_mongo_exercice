//
// File: ./src/config.js
// Description: Loads and merges YAML configuration files.
// The environment-specific file (e.g. production.yml) overrides the defaults.
//
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../.local/config');

/**
 * Loads a YAML configuration file from the config directory.
 * @param {string} filename - The name of the file to load (e.g., 'default.yml').
 * @returns {object} The parsed configuration object, or an empty object if the file doesn't exist.
 */
function loadConfigFile(filename) {
  const filePath = path.join(CONFIG_PATH, filename);
  if (fs.existsSync(filePath)) {
    return yaml.load(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}

const defaultConfig = loadConfigFile('default.yml');

const env = process.env.NODE_ENV || 'development';
const envConfig = loadConfigFile(`${env}.yml`);

// Shallow merge: environment-specific keys override the defaults.
const config = { ...defaultConfig, ...envConfig };

module.exports = config;
