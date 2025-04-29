import stream from 'node:stream';

import gulp from 'gulp';
import Vinyl from 'vinyl';

export const file = {
    createFile: createFileTask,
    createJsonFile: createJsonFileTask,
};

function createFileTask(filepath, contents) {
    return function createFile() {
        return stream.Readable.from([
            new Vinyl({
                cwd: null,
                base: null,
                path: filepath,
                contents: Buffer.from(contents, 'utf-8'),
            }),
        ]).pipe(gulp.dest('./'));
    };
}

function createJsonFileTask(filepath, json) {
    return createFileTask(filepath, JSON.stringify(json, null, 2));
}
