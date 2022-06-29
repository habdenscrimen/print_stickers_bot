const path = require('path')
// const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: {
    botWebhookHandler: path.resolve(process.cwd(), 'cmd/botWebhookHandler.ts'),
  },
  target: 'node',
  // externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  // externals: [
  //   nodeExternals({
  //     allowlist: ['grammy'],
  //   }),
  // ],
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: '[name].js',
    library: ['botWebhookHandler'],
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      internal: path.resolve(process.cwd(), 'internal'),
      config: path.resolve(process.cwd(), 'config'),
      pkg: path.resolve(process.cwd(), 'pkg'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv({
      safe: true,
    }),
  ],
}
