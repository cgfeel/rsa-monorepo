import path from "node:path";
import { Configuration } from "webpack";

export const __filename = new URL(import.meta.url).pathname;
export const __dirname = path.dirname(__filename);
export const __rootname = path.resolve(__dirname, '..');
export const baseConfig: Configuration = {
  mode: "development",
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  },
}