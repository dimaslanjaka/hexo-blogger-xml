//console.log(path.join(process.cwd(), "node_modules/hexo-blogger-xml"));

const isDev = process.env.NODE_ENV == 'development';
if (typeof hexo != 'undefined') global.hexo = hexo;
if (isDev) {
  require('ts-node').register({ transpileOnly: true });
  require('./src');
} else {
  require('./dist/index');
}
