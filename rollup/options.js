import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import jetpack from 'fs-jetpack';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import buble from '@rollup/plugin-buble';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const filename = fileURLToPath(import.meta.url);
const resolvePath = (file) => resolve(dirname(filename), file);
const pkg = JSON.parse(readFileSync(resolvePath('../package.json')));

const external = [];
const globals = {};

const olDeps = [
  ['ol/control/Control', 'ol.control.Control'],
  ['ol/style/Style', 'ol.style.Style'],
  ['ol/style/Icon', 'ol.style.Icon'],
  ['ol/layer/Vector', 'ol.layer.Vector'],
  ['ol/source/Vector', 'ol.source.Vector'],
  ['ol/geom/Point', 'ol.geom.Point'],
  ['ol/proj', 'ol.proj'],
  ['ol/Feature', 'ol.Feature'],
];

olDeps.forEach((each) => {
  external.push(each[0]);
  globals[each[0]] = each[1];
});

export function createOnWarn(subscriber) {
  return (warning) => {
    // skip certain warnings
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

    if (warning.code === 'NON_EXISTENT_EXPORT') {
      subscriber.error(warning.message);

      return;
    }

    subscriber.next({ status: 'warn', message: warning.message });
  };
}

export function getInputOptions(minify = true) {
  const plugins = [
    postcss({ minimize: true, modules: true }),
    nodeResolve(),
    commonjs(),
    buble(),
    minify && terser({ output: { comments: /^!/u } }),
  ];

  return { input: resolvePath('../src/entry.js'), plugins, external };
}

export function getOutputOptions(minify = true) {
  jetpack.dir(resolvePath('../dist'));

  const file = minify
    ? resolvePath('../dist/ol-geocoder.js')
    : resolvePath('../dist/ol-geocoder-debug.js');

  const banner = `
    /*!
    * ${pkg.name} - v${pkg.version}
    * Built: ${new Date()}
    */
  `;

  return { globals, banner, file, format: 'umd', name: 'Geocoder' };
}
