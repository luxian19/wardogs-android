import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('www/vendor', { recursive: true });
await copyFile('node_modules/three/build/three.min.js', 'www/vendor/three.min.js');
console.log('Three.js copied into www/vendor');
