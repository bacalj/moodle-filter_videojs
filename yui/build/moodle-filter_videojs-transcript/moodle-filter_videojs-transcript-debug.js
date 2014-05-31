YUI.add('moodle-filter_videojs-transcript', function (Y, NAME) {

"use_strict";
/*jslint browser: true*/
/*global M*/
/*global Y*/

var VJS;

M.filter_videojs = M.filter_videojs || {};
VJS = M.filter_videojs.transcript = {};

VJS.init = function (params) {

Y.Get.css('http://eik.local/videojs/dist/video-js/video-js.css', function (err) {
    if (err) {
        Y.log('Error loading CSS: ' + err[0].error, 'error');
        return;
    }

    Y.log('CSS loaded successfully');
});
// console.log(JSON.parse(params));
    // Y.one('#example').set('innerHTML', 'Example content');
    // alert("Whoo-hooo!");
}


}, '@VERSION@', {"requires": ["base", "node", "get"]});
