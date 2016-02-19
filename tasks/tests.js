import gulp from 'gulp';
import mocha from 'gulp-mocha';
import buffer from 'vinyl-buffer';
import del from 'del';
import connect from 'gulp-connect';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import watchify from 'watchify';

var paths = {
    tests: 'tests',
    build: 'build'
};

gulp.task('tests', function(done) {
    return gulp.src(`${paths.tests}/index.js`, { read: false })
        .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('clean', function() {
    return del([ paths.build ]);
});

gulp.task('tests-debug-scripts', [ 'clean' ], function(done) {
    var b = null,
        params = {
            entries: [ `${paths.tests}/index.js` ],
            debug: true,
            cache: {},
            packageCache: {},
            fullPaths: true
        };

        b = browserify(params);
        b = watchify(b);
        b.on('update', bundle);

    return bundle();

    function bundle() {
        return b
            .on('error', function(err) { console.error(err) })
            .bundle()
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(gulp.dest(paths.build));
    }
});


gulp.task('tests-debug-connect', [ 'tests-debug-scripts' ], function() {
    connect.server({
        root: [ paths.build, paths.tests, './node_modules' ],
        port: 54321,
        livereload: true
    });
});

gulp.task('tests-debug', [ 'tests-debug-connect' ]);
