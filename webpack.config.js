module.exports = {
    entry: './Drawing/GraphView.js',
    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    mode: "production",
    output: {
        publicPath: ''
    }
};