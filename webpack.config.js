const CircularDependencyPlugin = require("circular-dependency-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    entry: './index.js',
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/i,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {}
                }, "css-loader"],
            },
            {
                test: /\.(png|svg)/,
                type: 'asset'
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    preprocessor: (content, loaderContext) => {
                        let linkPattern = /.*<link.*>.*/g
                        let scriptPattern = /.*<script.*src.*>/g
                        content = content.replace(linkPattern, '')
                        content = content.replace(scriptPattern, '')
                        return content
                    }
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: "./Pages/Drawing.html"
        }),
        new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: /a\.js|node_modules/,
            // add errors to webpack instead of warnings
            failOnError: true,
            // allow import cycles that include an asyncronous import,
            // e.g. via import(/* webpackMode: "weak" */ './file.js')
            allowAsyncCycles: false,
            // set the current working directory for displaying module paths
            cwd: process.cwd(),
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            new HtmlMinimizerPlugin()
        ],
    },
    devServer: {
        compress: true,
    },
    mode: "production",
    output: {
        publicPath: '/compat'
    }
};