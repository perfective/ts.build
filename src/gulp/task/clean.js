import del from 'del';

export default function cleanTask(patterns, options) {
    return function clean() {
        return del(patterns, options);
    };
}
