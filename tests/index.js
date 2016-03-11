import chai, { expect, assert } from 'chai';
import { spy } from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import TranslationService from '../index';
import { translationFetcher, NOT_SUPPORTED_ERROR } from './translation-fetcher';
import en from './en.json';
import es from './es.json';

chai.use(chaiAsPromised);



describe('translation-service', function() {
    var phrase, promise, translationService, changeSpy, translationFetcherSpy;

    /****************************
     * Simple Translation Usage *
     ****************************/

    it('should translate keys in any nesting level', function() {
        translationService = new TranslationService('en', en);

        phrase = translationService.translate('result');
        expect(phrase).to.equal('level 0 success');

        phrase = translationService.translate('level1.result');
        expect(phrase).to.equal('level 1 success');

        phrase = translationService.translate('level1.level2.result');
        expect(phrase).to.equal('level 2 success');

        phrase = translationService.translate('level1.level2.level3.result');
        expect(phrase).to.equal('level 3 success');

        phrase = translationService.translate('level1.level2.level3.level4.result');
        expect(phrase).to.equal('level 4 success');
    });

    it('should return empty string for non-existing key', function() {
        translationService = new TranslationService('en', en);

        phrase = translationService.translate('non.existing.key');
        expect(phrase).to.equal('');
    });

    it('should return empty string for key of an object ', function() {
        translationService = new TranslationService('en', en);

        phrase = translationService.translate('level1');
        expect(phrase).to.equal('');
    });

    /********************
     * Change Languages *
     ********************/
    it('should change the current language', function() {
        translationService = new TranslationService('en', en);

        expect(translationService.currentLanguage).to.equal('en');
        phrase = translationService.translate('level1.result');
        expect(phrase).to.equal('level 1 success');

        promise = translationService.setLanguage('es', es);

        return Promise.all([
            expect(promise).eventually.fulfilled,
            promise.then(() => {
                expect(translationService.currentLanguage).to.equal('es');
            }),
            promise.then(() => {
                phrase = translationService.translate('level1.result');
                expect(phrase).to.equal('nivel 1 éxito');
            })
        ]);
    });

    it('should not change the current language since it is the same', function() {
        translationService = new TranslationService('en', en);

        changeSpy = spy();
        translationService.onChange(changeSpy);

        promise = translationService.setLanguage('en', en);

        return Promise.all([
            expect(promise).eventually.fulfilled,
            promise.then(() => {
                assert(changeSpy.notCalled, 'Change event fired');
            })
        ]);
    });

    it('should not change the current language when no language and reject', function() {
        translationService = new TranslationService('en', en);


        promise = translationService.setLanguage();

        return Promise.all([
            expect(promise).eventually.rejectedWith('setLanguage: language is mandatory')
        ]);
    });

    it('should not change the current language when no translation object and reject', function() {
        translationService = new TranslationService('en', en);

        expect(translationService.currentLanguage).to.equal('en');
        phrase = translationService.translate('level1.result');
        expect(phrase).to.equal('level 1 success');

        promise = translationService.setLanguage('es');

        return Promise.all([
            expect(promise).eventually.rejectedWith('Cannot resolve translation object'),
            promise.then(null, () => {
                expect(translationService.currentLanguage).to.equal('en');
            }),
            promise.then(null, () => {
                phrase = translationService.translate('level1.result');
                expect(phrase).to.equal('level 1 success');
            })
        ]);
    });

    /****************
     * Change Event *
     ****************/

    it('should fire change event upon language change', function() {
        translationService = new TranslationService('en', en);

        changeSpy = spy();
        translationService.onChange(changeSpy);

        promise = translationService.setLanguage('es', es);

        return Promise.all([
            expect(promise).eventually.fulfilled,
            promise.then(() => {
                assert(changeSpy.calledOnce, 'Change event did not fire or fired more than once');
            })
        ]);
    });

    it('should not fire change event upon failed language change', function() {
        translationService = new TranslationService('en', en);

        changeSpy = spy();
        translationService.onChange(changeSpy);

        promise = translationService.setLanguage('es');

        return Promise.all([
            expect(promise).eventually.rejected,
            promise.then(null, () => {
                assert(changeSpy.notCalled, 'Change event fired');
            })
        ]);
    });

    /*************************
     * Fetching Translations *
     *************************/

    it('should call translation fetcher and fail', function() {
        translationFetcherSpy = spy();
        translationService = new TranslationService('en', en, translationFetcherSpy);

        expect(translationService.currentLanguage).to.equal('en');

        promise = translationService.setLanguage('es');

        return Promise.all([
            expect(promise).eventually.rejectedWith('translationFetcher should return a promise'),
            promise.then(null, () => {
                expect(translationService.currentLanguage).to.equal('en');
            })
        ]);
    });

    it('should fail when ask to fetch not supported language', function() {
        translationService = new TranslationService('en', en, translationFetcher);

        promise = translationService.setLanguage('de');

        return Promise.all([
            expect(promise).eventually.rejectedWith(`translationFetcher failed: ${NOT_SUPPORTED_ERROR}`),
            promise.then(null, () => {
                expect(translationService.currentLanguage).to.equal('en');
            })
        ]);
    });

    it('should fetch the requested language', function() {
        translationService = new TranslationService('en', en, translationFetcher);

        promise = translationService.setLanguage('es');

        return Promise.all([
            expect(promise).eventually.fulfilled,
            promise.then(null, () => {
                expect(translationService.currentLanguage).to.equal('es');
            })
        ]);
    });

    /*****************
     * Interpolation *
     *****************/

    it('should interpolate variables', function() {
        translationService = new TranslationService('en', en, translationFetcher);

        phrase = translationService.translate('level1.interpolationTest', { name: 'Dan', age: 19 });
        expect(phrase).to.equal('My name is Dan and my age is 19');
    });

    it('should set empty string for missing interpolation', function() {
        translationService = new TranslationService('en', en, translationFetcher);

        phrase = translationService.translate('level1.interpolationTest', { age: 19 });
        expect(phrase).to.equal('My name is  and my age is 19');
    });

    /*****************
     * Pluralization *
     *****************/

    it('should return empty translation when pluralization value not provided', function() {
        translationService = new TranslationService('en', en, translationFetcher);

        phrase = translationService.translate('level1.pluralizationTest');
        expect(phrase).to.equal('');
    });

    it('should return correct translation for zero, 1, 39 and many', function() {
        translationService = new TranslationService('en', en, translationFetcher);

        phrase = translationService.translate('level1.pluralizationTest', { count: 12 }, 0);
        expect(phrase).to.equal('No items');

        phrase = translationService.translate('level1.pluralizationTest', { count: 12 }, 1);
        expect(phrase).to.equal('Only one item');

        phrase = translationService.translate('level1.pluralizationTest', { count: 12 }, 12);
        expect(phrase).to.equal('There are 12 items');

        phrase = translationService.translate('level1.pluralizationTest', { count: 12 }, 39);
        expect(phrase).to.equal('Exactly 39 items');
    });
});