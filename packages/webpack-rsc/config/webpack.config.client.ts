import path from "node:path";
import { Configuration } from "webpack";
import { __rootname, baseConfig } from './webpack.config.base.ts'
import HtmlWebpackPlugin from 'html-webpack-plugin'

// @ts-ignore
import ReactServerWebpackPlugin from 'react-server-dom-webpack/plugin';

const config: Configuration = {
  ...baseConfig,
  target: 'web',
  entry: './src/client.ts',
  output: {
    chunkFilename: '[name].chunk.js',
    clean: true,
    filename: '[name].js',
    path: path.resolve(__rootname, 'dist/client'),
    publicPath: '/client/'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic', importSource: 'react' }],
              '@babel/preset-typescript'
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      template: './public/index.html',
    }),
    // 关键：处理客户端引用（'use client'）
    new ReactServerWebpackPlugin({ isServer: false }),
  ],
  devtool: 'source-map', // 方便调试
}

export default config