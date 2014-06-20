"use_strict";
/*jslint browser: true*/
/*global M*/
/*global Y*/

var VJS;

M.filter_videojs = M.filter_videojs || {};
VJS = M.filter_videojs.transcript = {};

// This is the function that will be called by the PHP part of the filter.
VJS.init = function (params) {

    // Test to see whether this function needs to run.
    if (typeof VJS.initialized === 'undefined') {

        // These are things that should run only once per page.

        // Load the VideoJS .js and .css.
        Y.Get.load(['http://eik.local/videojs/dist/video-js/video-js.css', 'http://eik.local/videojs/dist/video-js/video.js'], function (err) {
            // Log any error loading the VideoJS files
            if (err) {
                Y.log('Error loading CSS: ' + err[0].error, 'error');
                return;
            }

            // Log success.
            Y.log('CSS loaded successfully');

            // Load the VideoJS Flash player after the main .js has loaded.
            videojs.options.flash.swf = "http://eik.local/videojs/dist/video-js/video-js.swf";

            // When the DOM is ready, process the clip menus.
            Y.on('domready', function () {
                VJS.buildClipMenu();
            });
        });

        // Prevent additional executions.
        VJS.initialized = 'initialized';

        // Create the array to contain all the video objects.
        VJS.videos = [];
    }

    // Parse the information passed in from the PHP.
    var jsonClips = JSON.parse(params.clips);

    // Create the array, keyed to each video id.
    VJS.videos[jsonClips.id]=jsonClips;
}

VJS.buildClipMenu = function () {
    VJS.players = Y.all('.video-js');
    VJS.players.each(function (p) {
        var clipParams = [];

        var clips = VJS.videos[p._node.id].clips;
        // console.log(VJS.videos);
        // console.log(clips[0]);
        if (clips.length > 0) {
            var clipUL = Y.Node.create("<ul></ul>");
            p.insert(clipUL, 'before');
            for (var i=0; i < clips.length; i++) {
                var clip = clips[i];
                console.log(clip);
                var n = i+1;
                clipParams[i] = clips[i].params
                var clipLabel = clipParams[i].label;
                var clipConnector = ': ';
                if (clipLabel == '') {
                    clipConnector = '';
                }
                var clipLink = Y.Node.create("<a href='#'>Clip " + n + clipConnector + clipLabel + "</a>");
                clipLink.set('data-clipiterator', i);
                clipLink.set('rel', i);
                clipLink.on("click", function (e) {
                    e.preventDefault();
                    var vjsp = videojs(p._node.id);
                    var iterator = this.get('rel');
                    var clipSettings = VJS.videos[p._node.id].clips[iterator].params;
                    vjsp.play();
                    vjsp.currentTime(clipSettings.in);
                });
                var clipLI = Y.Node.create("<li></li>");
                clipLI.append(clipLink);
                clipUL.append(clipLI);
            }
            console.log(clipParams);
        }
    });
}

VJS.playClip = function (player, clip) {
    console.log(player);
    console.log(clip);
    player.currentTime(5);
}
