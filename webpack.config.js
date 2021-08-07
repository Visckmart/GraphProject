const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    entry: ['./Drawing/General.js','./Drawing/Interaction.js', './Drawing/GraphView.js', './Drawing/Initialization.js'],
    output: {
        publicPath: '../dist/',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    plugins: [new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: './Pages/drawing.html',
            minify: {
                removeRedundantAttributes: false
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
                options: {
                    sources: false,
                    preprocessor: (content, loaderContext) => {
                        let array = content.split('\n')
                        array = array.filter(a => {
                            if(a.includes('link')) {
                                return !a.includes('href')
                            }
                            if(a.includes('script')) {
                                return !a.includes('src')
                            }
                            return true
                        })
                        return array.join('\n');
                    },
                }
            },
        ],
    },
};