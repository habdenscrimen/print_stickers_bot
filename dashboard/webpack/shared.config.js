const path = require('path')
// const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')
// const { PinoWebpackPlugin } = require('pino-webpack-plugin')

module.exports = {
  entry: {
    dashboardHandler: path.resolve(process.cwd(), 'cmd/dashboardHandler.ts'),
  },
  target: 'node',
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: '[name].js',
    library: ['dashboardHandler'],
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
    // new PinoWebpackPlugin({ transports: ['pino-pretty'] }),
    // new PinoWebpackPlugin({ transports: ['pino-pretty'] }),
    new CleanWebpackPlugin(),
    new Dotenv({
      safe: true,
    }),
  ],
}
