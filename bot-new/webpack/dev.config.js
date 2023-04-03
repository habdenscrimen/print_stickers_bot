const { merge } = require('webpack-merge')
const Dotenv = require('dotenv-webpack')
const sharedConfig = require('./shared.config')

module.exports = merge(sharedConfig, {
  mode: 'development',
  watch: false,
  plugins: [
    new Dotenv({
      safe: true,
      path: '.env.development',
    }),
  ],
})
