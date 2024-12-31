import { deleteAsync } from 'del';

export function cleanTask(patterns, options) {
    return function clean() {
        return deleteAsync(patterns, options);
    };
}
