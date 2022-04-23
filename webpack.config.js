const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: "development",
    output: {
        filename: 'etherforms.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
