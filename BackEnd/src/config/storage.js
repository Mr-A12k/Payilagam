const path = require('path');

const resourceStoragePath = path.resolve(process.env.RESOURCE_STORAGE_PATH || path.join(__dirname, '../../resources'));
module.exports = { resourceStoragePath };
