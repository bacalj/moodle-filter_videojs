"use_strict";
/*jslint browser: true*/
/*global M*/
/*global Y*/

var VJS;

M.filter_videojs = M.filter_videojs || {};
VJS = M.filter_videojs.transcript = {};

VJS.init = function (params) {
    if (typeof VJS.initialized === 'undefined') {
        Y.Get.load(['http://eik.local/videojs/dist/video-js/video-js.css', 'http://eik.local/videojs/dist/video-js/video.js'], function (err) {
            if (err) {
                Y.log('Error loading CSS: ' + err[0].error, 'error');
                return;
            }

            Y.log('CSS loaded successfully');
            videojs.options.flash.swf = "http://eik.local/videojs/dist/video-js/video-js.swf";

            Y.on('domready', function () {
                VJS.buildClipMenu();
            });
        });
        VJS.initialized = 'initialized';
        VJS.videos = [];
    }
    var jsonClips = JSON.parse(params.clips);
    VJS.videos[jsonClips.id]=jsonClips;
}

VJS.buildClipMenu = function () {
    VJS.players = Y.all('.video-js');
    VJS.players.each(function (p) {
        console.log(p);
        console.log(p._node.id);
        var clips = VJS.videos[p._node.id].clips;
        console.log(clips);
        for (var i=0; i < clips.length; i++) {
            console.log(clips[i]);
            var clip = clips[i];
            var n = i+1;
            p.insert(Y.Node.create("<p>Clip " + n + ": " + clip.params.label + "</p>"), 'before');
        }
    });
}
