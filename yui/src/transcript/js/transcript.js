"use_strict";
/*jslint browser: true*/
/*global M*/
/*global Y*/

var VJS;

M.filter_videojs = M.filter_videojs || {};
VJS = M.filter_videojs.transcript = {};

VJS.init = function (clips) {

Y.Get.load(['http://eik.local/videojs/dist/video-js/video-js.css', 'http://eik.local/videojs/dist/video-js/video.js'], function (err) {
    if (err) {
        Y.log('Error loading CSS: ' + err[0].error, 'error');
        return;
    }

    Y.log('CSS loaded successfully');
    videojs.options.flash.swf = "http://eik.local/videojs/dist/video-js/video-js.swf";

    console.log(JSON.parse(clips));

});

// console.log(JSON.parse(params));
    // Y.one('#example').set('innerHTML', 'Example content');
    // alert("Whoo-hooo!");
}
