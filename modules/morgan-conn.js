const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');

const logStream = rfs.createStream('access.log', {
	interval: '1d',
	path: path.join(__dirname, '../logs')
});

const logger = morgan('combined', {stream: logStream});

module.exports = logger;