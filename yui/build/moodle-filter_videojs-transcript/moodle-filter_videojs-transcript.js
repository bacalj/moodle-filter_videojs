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
            VJS.buildClips();
        });
        // VJS.setInitialized();
        VJS.initialized = 'initialized';
        VJS.videos = [];
    }
    VJS.videos.push(JSON.parse(clips));
}

VJS.buildClips = function () {
    for (video in VJS.videos) {
        if (!VJS.videos.hasOwnProperty(video)) {
            continue;
        }
        //VJS.videos[video].player = videojs(VJS.videos[video].id);
        //console.debug(VJS.videos[video].player);
    }
    console.log(VJS);
}


}, '@VERSION@', {"requires": ["base", "node", "get"]});
