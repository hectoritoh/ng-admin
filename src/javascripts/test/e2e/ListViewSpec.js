/*global describe,it,expect,$$,element,browser,by*/
describe('ListView', function () {
    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl + '#/posts/list');
    });

    describe('Edition link', function () {
        it('should allow edition of an entity', function () {
            // Retrieve first edit button
            $$('table tr:nth-child(1) ma-edit-button').then(function (buttons) {
                // Click on it
                buttons[0].click().then(function() {
                    // Check browser URL
                    browser.getLocationAbsUrl().then(function(url) {
                        expect(url).toContain('/posts/edit/');
                    });
                });
            });
        });
    });

    describe('Show link', function () {
        it('should allow display of an entity', function () {
            // Retrieve first edit button
            $$('table tr:nth-child(1) ma-show-button').then(function (buttons) {
                // Click on it
                buttons[0].click().then(function() {
                    // Check browser URL
                    browser.getLocationAbsUrl().then(function(url) {
                        expect(url).toContain('/posts/show/');
                    });
                });
            });
        });
    });

    describe('ma-list-button', function () {
        var listUrl;

        beforeEach(function() {
            listUrl = encodeURI(browser.baseUrl + '/#/comments/list?search={"post_id":"9"}&page=1');
            browser.get(listUrl);
        });

        it('should restore the list with filter when used from edit', function () {
            browser.executeScript('window.scrollTo(810, 481)').then(function () {
                $$('ma-edit-button a').then(function (elements) {
                    expect(elements[0].getText()).toBe(' Edit');
                    elements[0].click();
                    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + '/#/comments/edit/2');
                    $$('ma-list-button a').then(function (elements) {
                        elements[0].click();
                        expect(browser.getCurrentUrl()).toBe(listUrl);
                    });
                });
            });
        });

        it('should restore the list with filter when used from delete', function () {
            browser.get(listUrl);
            browser.executeScript('window.scrollTo(810, 481)').then(function () {

                $$('ma-delete-button a').then(function (elements) {
                    expect(elements[0].getText()).toBe(' Delete');
                    elements[0].click();
                    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + '/#/comments/delete/2');
                    $$('button.btn-default').then(function (elements) {
                        elements[0].click();
                        expect(browser.getCurrentUrl()).toBe(browser.baseUrl + '/#/comments/edit/2');

                        $$('ma-list-button a').then(function (elements) {
                            elements[0].click();
                            expect(browser.getCurrentUrl()).toBe(listUrl);
                        });
                    });
                });
            });
        });
    });
});
