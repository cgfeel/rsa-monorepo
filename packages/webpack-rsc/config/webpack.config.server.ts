import path from 'node:path'
import nodeExternals from 'webpack-node-externals';
import webpack, { type Configuration } from 'webpack'
import { __rootname, baseConfig } from './webpack.config.base.ts'

const config: Configuration = {
  ...baseConfig,
  target: 'node',
  entry: './src/App.tsx',
  output: {
    path: path.resolve(__rootname, 'dist'),
    filename: 'index.js',
    clean: true,
    library: { type: 'module' },
    chunkFormat: 'module',
  },
  externals: [nodeExternals({
    importType: 'module',
    allowlist: [/\.tsx?$/, /\.ts?$/]
  })],
  experiments: {
    outputModule: true
  },
  externalsPresets: { node: true }, // 启用 Node.js 外部预设
  // 新增：resolve 配置，确保 TSX 文件被正确解析，兜底支持 RSC 指令
  resolve: {
    conditionNames: ['react-server', 'node', 'import', 'default'],
    extensions: ['.tsx', '.ts', '.js', '.mjs'],
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
              ['@babel/preset-react', {
                runtime: 'automatic',
                development: false,
                // 核心：保留 'use client' 指令
                preserveReactApi: true
              }],
              // 显式配置 @babel/preset-typescript，避免隐式转译指令
              ['@babel/preset-typescript', {
                isTSX: true,
                allExtensions: true,
                allowDeclareFields: true,
                onlyRemoveTypeImports: true,
              }]
            ],
          }
        }
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};

export default config;