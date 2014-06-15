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
                Y.log('Error loading CSS: ' + err[0].error, 'error');
                return;
            }
            Y.log('CSS loaded successfully');
            videojs.options.flash.swf = "http://eik.local/videojs/dist/video-js/video-js.swf";
            VJS.buildClips();
        });
        VJS.initialized = 'initialized';
        VJS.videos = [];
    }
    var jsonClips = JSON.parse(clips);
    VJS.videos[jsonClips.id]=jsonClips;
}

VJS.buildClips = function () {
    VJS.players = Y.all('.video-js');
    VJS.players.each(function (p) {
        console.log(p);
        console.log(p._node.id);
        console.log(VJS.videos[p._node.id].clips);
    });
}


}, '@VERSION@', {"requires": ["base", "node", "get"]});
