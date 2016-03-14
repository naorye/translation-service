class TranslationService {
    constructor(language, translationObject, translationFetcher = null) {
        this.currentLanguage = language;
        this.translationsDictionary = {
            [language]: translationObject
        };
        this.translationFetcher = translationFetcher;
        this.changeHandlers = [];
    }

    onChange(callback) {
        if (callback && typeof callback === 'function') {
            this.changeHandlers.push(callback);
        }
    }

    setLanguage(language, translationObject = null) {
        if (!translationObject) {
            translationObject = this.translationsDictionary[language];
        }
        return new Promise((resolve, reject) => {
            // Now, only language is required
            if (language) {
                if (this.currentLanguage === language) {
                    resolve();
                } else if (translationObject) {
                    this.applyLanguage(language, translationObject);
                    resolve();
                } else {
                    this.resolveTranslationObject(language)
                        .then(
                            (translationObject) => {
                                this.applyLanguage(language, translationObject);
                                resolve();
                            },
                            (reason) => reject(reason)
                        );
                }
            } else {
                reject('setLanguage: language is mandatory');
            }
        });
    }

    applyLanguage(language, translationObject) {
        this.currentLanguage = language;
        this.translationsDictionary[language] = translationObject;
        this.changeHandlers.forEach((callback) => callback(language));
    }

    resolveTranslationObject(language) {
        return new Promise((resolve, reject) => {
            if (this.translationFetcher && typeof this.translationFetcher === `function`) {
                var promise = this.translationFetcher(language);
                if (!promise || typeof promise.then !== 'function') {
                    reject('translationFetcher should return a promise');
                }

                promise.then(
                        (translationObject) => {
                            if (translationObject) {
                                resolve(translationObject);
                            } else {
                                reject('translationFetcher resolved without translation object');
                            }
                        },
                        (reason) => reject(`translationFetcher failed: ${reason}`)
                    );
            } else {
                reject('Cannot resolve translation object');
            }
        });
    }

    translate(key, interpolation = undefined, pluralValue = undefined) {
        var tokens = key.split('.');
        var value = this.translationsDictionary[this.currentLanguage];
        for (let i = 0; i < tokens.length && value !== undefined; i++) {
            value = value[tokens[i]];
        }

        if (value === undefined) {
            value = '';
        }

        // Handle pluralization
        if (typeof value === 'object') {
            if (typeof pluralValue === 'number') {
                let pluralization = value;
                // If pluralValue holds the number `X`, check whether `X` is a key in pluralization.
                // If it is, use the phrase of `X`. Otherwise, use `zero` or `many`.
                if (pluralization.hasOwnProperty(pluralValue)) {
                    value = pluralization[pluralValue];
                } else {
                    if (pluralValue === 0) {
                        value = pluralization.zero;
                    } else { // pluralValue is a number and not equals to 0, therefore pluralValue > 0
                        value = pluralization.many;
                    }
                }
            } else {
                value = '';
            }
        }

        // Handle interpolation
        if (interpolation) {
            value = value.replace(/{{(\w*)}}/gi, function(m, param) {
                let match = '';
                if (interpolation.hasOwnProperty(param)) {
                    match = interpolation[param];
                }
                return match;
            });
        }

        return value;
    }
}

export default TranslationService;
