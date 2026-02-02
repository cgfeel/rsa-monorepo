import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  environments: {
    web: {
      source: {
        entry: {
          index: './src/index'
        }
      }
    },
    node: {
      output: {
        module: true,
        target: 'node',
        distPath: {
          root: 'dist/server'
        }
      },
      source: {
        entry: {
          index: './src/index.server'
        }
      }
    }
  },
  html: {
    template: './public/template.html'
  }
});
