const path = require('path');
const config = require('config');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

const packageconfigFileName = './config/config.json';
const packageconfigPath = path.resolve(__dirname, packageconfigFileName);

fs.writeFileSync(packageconfigPath, JSON.stringify(config));

const commonWebpackConfig = {
	entry: {
		'nuls-js': './src/index.ts'
	},
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.txt$/,
				use: 'raw-loader'
			},
			{
				test: /\.(png|jp(e*)g|svg)$/,
				use: [{
					loader: 'url-loader',
					options: {
						limit: 8000, // Convert images < 8kb to base64 strings
						name: 'images/[hash]-[name].[ext]'
					}
				}]
			}
		]
	},
	node: {
		fs: 'empty'
	},
	resolve: {
		extensions: ['.ts', '.js', '.txt', '.png'],
		alias: {
			config: path.resolve(__dirname, './config/config.json'),
			'@': path.join(__dirname, './src')
		}
	},
	output: {
		library: '@nuls/[name]',
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'src/assets', to: 'assets' }
		])
	]
};

const serverWebpackConfig = merge(commonWebpackConfig, {
	target: 'node',
	externals: [nodeExternals({
		whitelist: ['config']
	})],
	output: {
		libraryTarget: 'commonjs2',
		filename: '[name].cjs.js'
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.browser': false
		})
	]
});

const clientWebpackConfig = merge(commonWebpackConfig, {
	target: 'web',
	output: {
		libraryTarget: 'umd',
		filename: '[name].umd.js'
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.browser': true
		})
	]
});

module.exports = [serverWebpackConfig, clientWebpackConfig];
