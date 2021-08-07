const path = require('path');

module.exports = {
    mode: "development",
    entry: ['./Drawing/General.js','./Drawing/Interaction.js', './Drawing/GraphView.js', './Drawing/Initialization.js'],
    output: {
        publicPath: '../dist/',
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};