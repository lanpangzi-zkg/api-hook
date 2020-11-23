const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './test/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [
            {
                test:/\.js(x)?$/,
                use:[{
                    loader: 'babel-loader',
                    options: {
                        extends: path.join(__dirname, '.babelrc'),
                        cacheDirectory: true,
                    },
                }],
            }, {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
    ]
};