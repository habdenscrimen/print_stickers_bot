const { merge } = require('webpack-merge')
// const TerserPlugin = require('terser-webpack-plugin')

const sharedConfig = require('./shared.config')

module.exports = merge(sharedConfig, {
  mode: 'production',
  watch: false,
  optimization: {
    // FIXME: lambda functions does not work with terser-webpack-plugin
    minimize: false,
  },
})
