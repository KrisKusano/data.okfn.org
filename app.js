var express = require('express')
  , path = require('path')
  , fs = require('fs')
  , nunjucks = require('nunjucks')
  ;

var app = express();

//CORS middleware
var CORSSupport = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/templates');
  // app.set('view engine', 'html');
  // app.engine('html', require('hbs').__express);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(CORSSupport);
  app.use(express.static(path.join(__dirname, 'public')));
});

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'));
env.express(app);

app.get('/', function(req, res) {
  res.render('index.html', {
  });
})

app.get('/about', function(req, res) {
  res.render('about.html', {});
});

app.get('/about/contribute', function(req, res) {
  res.render('contribute.html', {});
});

app.get('/data', function(req, res) {
  datasets = catalog.query();
  total = datasets.length;
  res.render('data/index.html', {
    total: total,
    datasets: datasets
  });
})

app.get('/data/search', function(req, res) {
  q = req.query.q || '';
  // datasets = catalog.query(q)
  datasets = [];
  total = datasets.length;
  res.render('data/search.html', {q: q, datasets: datasets, total: total});
});

app.get('/data/:id', function(req, res) {
  var id = req.params.id;
  var dataset = catalog.get(id)
  if (!dataset) {
    res.send(404, 'Not Found');
  }
  if (dataset.files && dataset.files.length > 0) {
      dataset.download_url = dataset.files[0].url;
      var raw_data_file = dataset.files[0];
      raw_data_file.dataset_name = dataset.id;
  }
  res.render('data/dataset.html', {
    dataset: dataset,
    raw_data_file: JSON.stringify(raw_data_file)
  });
});

var model = require('./model.js');
// TODO: put this in a config
var url = 'http://raw.github.com/datasets/registry/master/index.json';
var catalog = new model.Catalog();

catalog.loadURL(url, function(err) {
  if (err) {
    console.error('Failed to load dataset info');
  }
  app.listen(app.get('port'), function() {
    console.log("Listening on " + app.get('port'));
  });
});
