import en from './en.json';
import es from './es.json';
import he from './he.json';

export const NOT_SUPPORTED_ERROR = 'Language not supported';

export function translationFetcher(language) {
    return new Promise(function(resolve, reject) {
        switch(language) {
            case 'en': resolve(en); break;
            case 'es': resolve(es); break;
            case 'he': resolve(he); break;
            default: reject(NOT_SUPPORTED_ERROR); break;
        }
    });
}