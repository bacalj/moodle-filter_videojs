YUI.add('moodle-filter_videojs-transcript', function (Y, NAME) {

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
                return;
            }

            // Log success.

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

        p.setData('out', '');
        p.setData('in', 0);
        p.setData('playerID', p._node.id);
        var vjsp = videojs(p.getData('playerID'));
        vjsp.on('timeupdate', function() {
            console.log(p.getData('out'));
            if (p.getData('out') === '') {
                return;
            }
            if (this.currentTime() > p.getData('out')) {
                this.currentTime(p.getData('out'));
                this.pause();
            }
        });

        var clips = VJS.videos[p._node.id].clips;
        if (clips.length > 0) {
            var clipUL = Y.Node.create("<ul></ul>");
            p.insert(clipUL, 'before');
            for (var i=0; i < clips.length; i++) {
                var n = i+1;
                var clipParams = clips[i].params;
                var clipLabel = clipParams.label;
                var clipConnector = ': ';
                if (clipLabel == '') {
                    clipConnector = '';
                }
                var clipLink = Y.Node.create("<a href='#'>Clip " + n + clipConnector + clipLabel + "</a>");
                clipLink.setData('params', clipParams);
                clipLink.setData('playerID', p._node.id);
                clipLink.on("click", function (e) {
                    e.preventDefault();
                    var params = this.getData('params');
                    var playerID = this.getData('playerID');
                    p.setData('out', params.out);
                    vjsp = videojs(playerID);
                    vjsp.play();
                    vjsp.currentTime(params.in);
                    // vjsp.on('timeupdate', VJS.stopper(playerID,params.out));
                    // vjsp.on('timeupdate', function () {
                    //     if (this.currentTime() > params.out) {
                    //         this.pause();
                    //     }
                    // });
                });
                var clipLI = Y.Node.create("<li></li>");
                clipLI.append(clipLink);
                clipUL.append(clipLI);
            }
        }
    });
}


}, '@VERSION@', {"requires": ["base", "node", "event", "get"]});
