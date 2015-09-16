module.paths.push('/usr/local/lib/node_modules');
var
    fs = require('fs'),
    path = require('path'),
    UglifyJS = require('uglify-js'),
    read = function(f) {
        return fs.readFileSync(f).toString();
    },
    log = function(t){console.log(t)},
    js_str = '',
    src_dir = __dirname + '/src/',
    js_files = [
        'base.js',
        'nominatim.js',
        'utils.js'
    ],
    
    out_dir = __dirname + '/',
    out_js_file_combined = out_dir + 'ol3-geocoder-debug.js',
    out_js_file_min = out_dir + 'ol3-geocoder.js',
    i = -1
;


//JS
while(++i < js_files.length){
    js_str += read(src_dir + js_files[i]);
}
var wrapper = read(fs.realpathSync(src_dir + 'wrapper.js'));
var js_str_combined = wrapper.replace('{CODE_HERE}', js_str);

fs.writeFile(out_js_file_combined, js_str_combined, function(error) {
    if (error) {
        log('JS:' + error);
    } else {
        var result_js = UglifyJS.minify(out_js_file_combined);
        
        fs.writeFile(out_js_file_min, result_js.code, function(error) {
            if (error) {
                log('JS MIN:' + error);
            } else {
                log('JS written');
            }
        });
    }
});