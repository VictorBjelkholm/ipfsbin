var path = require('path');
var webpack = require('webpack');
var OfflinePlugin = require('offline-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin')

var output_path = path.join(__dirname, 'dist');
if(process.env.CIRCLE_ARTIFACTS) {
  output_path = process.env.CIRCLE_ARTIFACTS
}

var config = {
  entry: [
    './src/index'
  ],
  output: {
    path: output_path,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
    ]
    },
	node: {
		fs: 'empty'
	}
}

var offline_plugin = new OfflinePlugin({
  version: () => {
    if(process.env.DEV) {
      return (new Date()).toString()
    } else {
      // TODO read from package.json
      return 'v1.0.4'
    }
  },
  ServiceWorker: false,
  AppCache: {
    directory: '/'
  }
})

if(process.env.DEV) {
  config.plugins = [
    new webpack.HotModuleReplacementPlugin()
  ]
  config.entry.push('webpack-dev-server/client?http://localhost:3000')
  config.entry.push('webpack/hot/only-dev-server')
  config.devtool = 'eval'
} else {
  config.plugins = [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress : {
        // TODO removes all the modes from codemirror (facepalm)
        'unused'    : false,
        'dead_code' : false,
        'warnings': false
      }
    })
  ]
}

var minify_options = {}
if(!process.env.DEV) {
  minify_options = {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeOptionalTags: true,
    removeIgnored: true,
    removeEmptyElements: true,
    minifyCSS: true,
    minifyURLs: true
  }
}

config.plugins.push(new HtmlWebpackPlugin({
  hash: !!process.env.DEV,
  template: 'index.html',
  favicon: 'favicon.png',
  minify: minify_options
}))
config.plugins.push(offline_plugin)

module.exports = config
