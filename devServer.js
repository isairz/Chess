var path = require('path');
var httpProxy = require('http-proxy');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(express.static('asserts'));

const proxy = httpProxy.createProxyServer({
  target: 'http://' + 'localhost' + ':' + 3040,
   ws: true
});
app.use('/api', (req,res) => {
  proxy.web(req, res);
});

app.listen(3000, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
