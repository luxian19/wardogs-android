import { mkdir, copyFile, cp } from 'node:fs/promises';

await mkdir('www/vendor', { recursive: true });

await copyFile(
  'node_modules/three/build/three.min.js',
  'www/vendor/three.min.js'
);

await copyFile(
  'node_modules/three/examples/js/libs/meshopt_decoder.js',
  'www/vendor/meshopt_decoder.js'
);

await copyFile(
  'node_modules/three/examples/js/utils/SkeletonUtils.js',
  'www/vendor/SkeletonUtils.js'
);

await copyFile(
  'node_modules/three/examples/js/loaders/GLTFLoader.js',
  'www/vendor/GLTFLoader.js'
);

await copyFile(
  'node_modules/three/examples/js/loaders/DRACOLoader.js',
  'www/vendor/DRACOLoader.js'
);

await cp(
  'node_modules/three/examples/js/libs/draco/gltf',
  'www/vendor/draco',
  { recursive: true }
);

console.log('Three.js, GLTFLoader, DRACOLoader and Draco decoder copied.');
