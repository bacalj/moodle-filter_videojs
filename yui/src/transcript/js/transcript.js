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
        Y.Get.load([params.sources.css_source, params.sources.js_source], function (err) {
            // Log any error loading the VideoJS files
            if (err) {
                Y.log('Error loading CSS: ' + err[0].error, 'error');
                return;
            }

            // Log success.
            Y.log('CSS loaded successfully');

            // Load the VideoJS Flash player after the main .js has loaded.
            videojs.options.flash.swf = params.sources.swf_source;

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
};

// Build the clip menu.
VJS.buildClipMenu = function () {

    // First, get an array of all the players.
    VJS.players = Y.all('.video-js');

    // Then do for each of the players.
    VJS.players.each(function (p) {

        p.setData('out', '');
        p.setData('in', 0);
        p.setData('playerID', p._node.id);
        p.setData('srctypes', '');
        // var vjsp = videojs(p.getData('playerID'));
        var vjsp = videojs(p.get('id'));
        if (vjsp.techName === 'Flash') {
            alert('The Video.js Flash player does not support all of the Video.js Filter functionality. Please try a different browser.');
            return;
        }
        vjsp.ready(function () {
            this.load();
        });
        vjsp.on('timeupdate', function() {
            if (this.currentTime() < p.getData('in')) {
                this.currentTime(p.getData('in'));
            }
            if (p.getData('out') === '') {
                return;
            }
            if (this.currentTime() > p.getData('out')) {
                this.currentTime(p.getData('out'));
                this.pause();
            }
        });

        var clips = VJS.videos[p.getData('playerID')].clips;
        if (clips.length > 0) {
            var clipUL = Y.Node.create("<ul></ul>");
            Y.one('#' + p.getData('playerID')).insert(clipUL, 'before');
            for (var i=0; i < clips.length; i++) {
                var n = i+1;
                var clipParams = clips[i].params;
                var clipLabel = clipParams.label;
                var clipConnector = ': ';
                if (clipLabel === '') {
                    clipConnector = '';
                }
                var clipLink = Y.Node.create("<a href='#' class='filter-vjs-cliplink clip" + n + "'>Clip " + n + clipConnector + clipLabel + "</a>");
                clipLink.setData('params', clipParams);
                clipLink.setData('playerID', p._node.id);
                clipLink.setData('clipSrc', 'http://kevinwiliarty.com/openvideo/remote-conbowling.ogv');
                clipLink.setData('clipNumber', i);
                var clipLI = Y.Node.create("<li></li>");
                clipLI.append(clipLink);
                clipUL.append(clipLI);
                if (i === 0) {
                    p.setData('in', clipParams.in);
                    p.setData('out', clipParams.out);
                    p.setData('srctypes', clipParams.srctypes);
                }
            }
        }
        vjsp = videojs(p.getData('playerID'));
        vjsp.load();
        if (p.getData('srctypes') != '') {
            vjsp.src(p.getData('srctypes'));
        }
    });

    Y.on('domready', function () {
        linkList = Y.all('.filter-vjs-cliplink');
        linkList.each(function (clip) {
            clip.on('click', function (e) {
                e.preventDefault();
                VJS.playClip(this);
            });
        });
    });
};

VJS.playClip = function (link) {
    var params = link.getData('params');
    var playerID = link.getData('playerID');
    var vjsp = videojs(playerID);
    vjsp.load();
    var vjspNode = Y.one('#'+playerID);
    vjspNode.setData('in', params.in);
    vjspNode.setData('out', params.out);
    vjsp.ready(function () {
        vjsp.src(params.srctypes);
        vjsp.bigPlayButton.hide();
        vjsp.controlBar.show();
        vjsp.play();
    });
};
