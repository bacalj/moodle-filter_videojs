YUI.add('moodle-filter_videojs-transcript', function (Y, NAME) {

"use_strict";
/*jslint browser: true*/
/*global M*/
/*global Y*/

var VJS;

M.filter_videojs = M.filter_videojs || {};
VJS = M.filter_videojs.transcript = {};

VJS.init = function (clips) {
    if (typeof VJS.initialized === 'undefined') {
        Y.Get.load(['http://eik.local/videojs/dist/video-js/video-js.css', 'http://eik.local/videojs/dist/video-js/video.js'], function (err) {
            if (err) {
                return;
            }
            videojs.options.flash.swf = "http://eik.local/videojs/dist/video-js/video-js.swf";
        });
        // VJS.setInitialized();
        VJS.initialized = 'initialized';
        VJS.clips = [];
    }
    VJS.clips.push(JSON.parse(clips));
    console.log(VJS);
}


}, '@VERSION@', {"requires": ["base", "node", "get"]});
