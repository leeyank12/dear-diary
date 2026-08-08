// Root entry point wrapper for Render web service deployment
const path = require('path');
process.chdir(path.join(__dirname, 'backend'));
require('./server.js');
