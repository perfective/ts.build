import gulp from 'gulp';

export default function copyTask(source, destination) {
    return function copy() {
        return gulp.src(source).pipe(gulp.dest(destination));
    };
}
