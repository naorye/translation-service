# Translation Service

> A Full Featured Translation Service

This is an implementation of a Translation Service that supports:

- Fetching new languages on demand
- String Interpolation
- Pluralization

More information can be found here: <a href="http://www.webdeveasy.com/building-a-full-featured-translation-service" target="_blank">http://www.webdeveasy.com/building-a-full-featured-translation-service</a>

## Usage

1. Define your translation files.
    ```json
    {
        "messages": {
            "writtenBy": "Commenter: {{name}}",
            "messagesCount": {
                "zero": "",
                "1": "1 Message",
                "2": "Only 2 messages, let's add some noise to this chat!",
                "48": "Wow, 48 messages! Keep talking!"
                "many": "{{messagesCount}} Messages"
            }
        },
        "share": {
            "facebook": "Share on Facebook",
            "twitter": "Share on Twitter",
            "email": {
                "send": "Send Email",
                "subject": "@{{name}} has shared a topic with you",
                "content": "Topic: {{topic}}"
            }
        }
    }
    ```
2. Create an instance of `TranslationService` for your application.
    ```js
    import TranslationService from 'translation-service';
    import enTranslationObject from './en.json';
    ...
    ...

    function translationFetcher(language) {
        return new Promise(function(resolve, reject) {
            ...
            ...
            ...
        });
    }

    var translationService = new TranslationService('en', enTranslationObject, translationFetcher);

    export default translationService;
    ```
3. Use it.
    ```js
    import translation from 'translation';

    var text = translation.translate('messages.writtenBy', { name: 'Charles Dickens' });
    console.log(`${text} is equal to "Commenter: Charles Dickens"`);

    var messagesCount = 2;
    text = translation.translate('messages.messagesCount', { messagesCount: messagesCount }, messagesCount);
    console.log(`${text} is equal to "Only 2 messages, let's add some noise to this chat!"`);

    text = translation.translate('share.facebook');
    console.log(`${text} is equal to "Share on Facebook"`);

    text = translation.translate('share.email.subject', { name: 'NaorYe' });
    console.log(`${text} is equal to @NaorYe has shared a topic with you"`);

    await translation.setLanguage('es');
    text = translation.translate('share.email.subject', { name: 'NaorYe' });
    ...
    ...
    ...
    ```

* * *

Copyright (c) 2016 naorye
