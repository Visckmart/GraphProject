const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    entry: ['./Drawing/General.js','./Drawing/Interaction.js', './Drawing/GraphView.js', './Drawing/Initialization.js'],
    devServer: {
        contentBase: '../',
    },
    output: {
        publicPath: '../dist/',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    plugins: [new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: './Pages/drawing.html',
            minify: {
                scriptLoading: 'blocking',
                removeRedundantAttributes: false
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", {

                        }],
                        plugins: [
                            ["@babel/transform-runtime"]
                        ]
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            config: path.resolve(__dirname, 'postcss.config.js'),
                        },
                    },
                },],
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