import path from "node:path";
import { __rootname } from "./webpack.config.base";
import { readFileSync, writeFileSync } from "node:fs";

const manifestPath = path.resolve(__rootname, 'dist/client/react-client-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
const fixedManifest: Record<string, unknown> = {};

for (const [key, value] of Object.entries(manifest)) {
    if (key.startsWith('file://')) {
        const absolutePath = key.replace(`file://${__rootname}`, '.');
        fixedManifest[absolutePath] = value;
    } else {
        fixedManifest[key] = value;
    }
}

writeFileSync(manifestPath, JSON.stringify(fixedManifest, null, 2), 'utf-8');
console.log('Manifest paths fixed to relative', manifestPath);