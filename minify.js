var fs = require('fs'),
    boxen = require('boxen'),
    chalk = require('chalk'),
    gzip = require('gzip-size'),
    bytes = require('bytes'),
    minify = require('uglify-js').minify,
    pkg = require('./package.json');

const bundle = fs.readFileSync(pkg.build.dest, 'utf-8');
const minified = minify(bundle, {
  fromString: true,
  outSourceMap: pkg.build.destMap.replace('build/', ''),
  warnings: true,
  mangle: true,
  output: { comments: /^!/ },
  compress: {
    screw_ie8: true,
    drop_console: true
  }
});

fs.writeFile(pkg.main, minified.code, (err) => {
  if (err) throw err;

  const bundleSize = bytes(Buffer.byteLength(bundle));
  const minSize = bytes(Buffer.byteLength(minified.code));
  const bundleGzip = bytes(gzip.sync(bundle));
  const minGzip = bytes(gzip.sync(minified.code));

  console.log(boxen(
    chalk.green.bold('Bundle: ') +
    chalk.yellow.bold(bundleSize) + ', ' +
    chalk.green.bold('Gzipped: ') +
    chalk.yellow.bold(bundleGzip) + ' - ' +
    chalk.green.bold('Minified: ') +
    chalk.yellow.bold(minSize) + ', ' +
    chalk.green.bold('Gzipped: ') +
    chalk.yellow.bold(minGzip), { padding: 1 }
  ));

  fs.writeFileSync(pkg.build.destMap, minified.map);
});
