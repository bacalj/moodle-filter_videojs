"use_strict";
/*jslint browser: true*/
/*global M*/
/*global Y*/

var CSS = {
IPA_CBLOCK  : 'qtype-ipa-cblock',
IPA_PREVIEW : 'qtype-ipa-preview'
},
SELECTORS = {
IPA_CBLOCK  : '.' + CSS.IPA_CBLOCK,
IPA_PREVIEW : '.' + CSS.IPA_PREVIEW
},
NS;

M.filter_videojs = M.filter_videojs || {};
VJS = M.filter_videojs.transcript = {};


VJS.init = function (params) {
    Y.one('#example').set('innerHTML', 'Example content');
    alert("Whoo-hooo!");
}
