YUI.add('moodle-filter_videojs-transcript', function (Y, NAME) {

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
//        console.log(p);
//        console.log(p._node.id);
        var clips = VJS.videos[p._node.id].clips;
        if (clips.length > 0) {
            var clipUL = Y.Node.create("<ul></ul>");
            p.insert(clipUL, 'before');
            for (var i=0; i < clips.length; i++) {
                var clip = clips[i];
                var n = i+1;
                var clipLabel = clip.params.label;
                var clipConnector = ': ';
                if (clipLabel == '') {
                    clipConnector = '';
                }
                var clipLink = Y.Node.create("<a href='#'>Clip " + n + clipConnector + clipLabel + "</a>");
                console.log(clipLink);
                var clipLI = Y.Node.create("<li>" + clipLink._node.outerHTML + "</li>");
                clipUL.append(clipLI);
            }
        }
    });
}


}, '@VERSION@', {"requires": ["base", "node", "get"]});
