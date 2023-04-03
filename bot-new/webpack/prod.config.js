const { merge } = require('webpack-merge')
const Dotenv = require('dotenv-webpack')
const sharedConfig = require('./shared.config')

module.exports = merge(sharedConfig, {
  mode: 'production',
  watch: false,
  optimization: {
    // FIXME: lambda functions does not work with terser-webpack-plugin
    minimize: false,
  },
  plugins: [
    new Dotenv({
      safe: true,
      path: '.env',
    }),
  ],
})
