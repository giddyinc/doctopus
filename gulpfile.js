'use strict';

const path = require('path');
const gulp = require('gulp');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const coveralls = require('gulp-coveralls');
const del = require('del');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('static', () => gulp.src(['src/**/*.{js,ts}'])
  .pipe(excludeGitignore())
  .pipe(tsProject())
);

gulp.task('nsp', cb => {
  nsp({
    package: path.resolve('package.json')
  }, cb);
});

gulp.task('test', [], cb => {
  let mochaErr;
  gulp.src([
    'lib/**/*.test.{js,ts}',
    'test/**/*.{js,ts}'
  ])
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'dot',
      require: [
        'ts-node/register'
      ]
    }))
    .on('error', err => {
      mochaErr = err;
    })
    // .pipe(istanbul.writeReports())
    .on('end', () => {
      cb(mochaErr);
    });
});

gulp.task('watch', ['test'], () => {
  gulp.watch(['lib/**/*.js', 'test/**'], ['test']);
});

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('compile', ['clean'], () => gulp.src([
  'lib/**/*.{js,ts}',
  '!lib/**/*.test.{js,ts}'
])
  .pipe(tsProject())
  .pipe(gulp.dest('dist')));

gulp.task('clean', () => del('dist'));

gulp.task('prepublish', ['nsp', 'compile']);
gulp.task('default', ['static', 'test', 'coveralls']);
