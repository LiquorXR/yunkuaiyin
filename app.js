var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const hbs = require('hbs');
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

hbs.registerHelper('formatDate', function (date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
});

hbs.registerHelper('getFileIcon', function (filename) {
  if (!filename) return 'fa-file';
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    'pdf': 'fa-file-pdf text-[#E84118]',
    'doc': 'fa-file-word text-[#2B579A]',
    'docx': 'fa-file-word text-[#2B579A]',
    'xls': 'fa-file-excel text-[#217346]',
    'xlsx': 'fa-file-excel text-[#217346]',
    'ppt': 'fa-file-powerpoint text-[#D24726]',
    'pptx': 'fa-file-powerpoint text-[#D24726]',
    'jpg': 'fa-file-image text-[#44BD32]',
    'jpeg': 'fa-file-image text-[#44BD32]',
    'png': 'fa-file-image text-[#44BD32]',
    'zip': 'fa-file-archive text-[#F1C40F]',
    'rar': 'fa-file-archive text-[#F1C40F]',
    'txt': 'fa-file-alt text-[#7F8C8D]'
  };
  return icons[ext] || 'fa-file text-[#7F8C8D]';
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', adminRouter);
app.use('/admin', (req, res) => res.redirect('/'));
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
