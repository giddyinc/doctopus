// @ts-check

'use strict';

const gulp = require('gulp');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');

const plumber = require('gulp-plumber');
const del = require('del');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('static', () => gulp.src(['src/**/*.{js,ts}'])
  .pipe(excludeGitignore())
  .pipe(tsProject())
);

gulp.task('test', cb => {
  let mochaErr;
  return gulp.src([
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

gulp.task('watch', gulp.series(['test', () => {
  gulp.watch(['lib/**/*.js', 'test/**'], gulp.series(['test']));
}]));

gulp.task('clean', () => del('dist'));

gulp.task('compile', gulp.series([
  'clean',
  () => gulp.src([
    'lib/**/*.{js,ts}',
    '!lib/**/*.test.{js,ts}'
  ])
    .pipe(tsProject())
    .pipe(gulp.dest('dist'))
]));

gulp.task('prepublish', gulp.series(['compile']));
gulp.task('default', gulp.series(['static', 'test']));
