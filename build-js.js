var fs = require('fs'),
    boxen = require('boxen'),
    chalk = require('chalk'),
    gzip = require('gzip-size'),
    bytes = require('bytes'),
    rollup = require('rollup'),
    buble = require('rollup-plugin-buble'),
    json = require('rollup-plugin-json'),
    minify = require('uglify-js').minify,
    pkg = require('./package.json');

var banner = fs.readFileSync('banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${version}', pkg.version)
  .replace('${time}', new Date());

rollup.rollup({
  entry: pkg.build.entry,
  plugins: [
    json(),
    buble()
  ]
}).then(bundle => {
  var result = bundle.generate({
    format: 'umd',
    moduleName: pkg.build.moduleName,
    banner: banner
  });

  fs.writeFileSync(pkg.build.dest, result.code);

  const minified = minify(result.code, {
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

    const bundleSize = bytes(Buffer.byteLength(result.code));
    const minSize = bytes(Buffer.byteLength(minified.code));
    const bundleGzip = bytes(gzip.sync(result.code));
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
});
