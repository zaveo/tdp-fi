const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')
const marked = require('marked')
const frontMatter = require('front-matter')
const minify = require('node-minify');
const ejs = require('ejs')

const sourceDir = './src'
const publicDir = './public'

function renderFile(path, options){
  return new Promise(function(resolve, reject){
    ejs.renderFile( path, options, function(err, body){
      if(err) reject(err)
      else resolve(body)
    })
  });
}
async function build() {
  await fse.emptyDir(publicDir)
  await fse.copy(sourceDir + '/assets', publicDir + '/assets').catch(console.log)
  await minify.minify({
    compressor: 'uglifyjs',
    input: sourceDir + '/js/*.js',
    output: publicDir + '/main.js'
  }).catch(console.log);

  await minify.minify({
    compressor: 'clean-css',
    input: sourceDir + '/css/*.css',
    output: publicDir + '/main.css'
  }).catch(console.log);

  let files = glob.sync('**/*', { cwd: sourceDir + '/pages' });
  await Promise.all(files.map(async function(filename){
    let body = await fse.readFile(sourceDir + '/pages/' + filename, 'utf-8')

    let pageData = frontMatter(body)

    let template = ( pageData.attributes.template ) ? pageData.attributes.template : 'page';

    body = await renderFile( sourceDir + '/templates/' + template + '.ejs', {
      attributes : pageData.attributes,
      body: marked(pageData.body)
    });

    await fse.writeFile(publicDir + '/' + filename.replace(/\.[^\.]+$/, '') + '.html', body);

  }));
  console.log('build ready');
}
if(require.main == module) {
  let p = build();
  p.then(function(){
    console.log('ready')
  })

}
module.exports = build;
