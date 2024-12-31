import { deleteAsync } from 'del';

export default function cleanTask(patterns, options) {
    return function clean() {
        return deleteAsync(patterns, options);
    };
}
