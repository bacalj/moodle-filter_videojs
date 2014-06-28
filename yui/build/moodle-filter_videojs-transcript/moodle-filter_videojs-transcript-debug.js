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
    console.log(jsonClips);

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
            // console.log(p.getData('clipSrc'));
            // this.src(p.getData('clipSrc'));
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
                var clipLink = Y.Node.create("<a href='#' class='filter-vjs-cliplink'>Clip " + n + clipConnector + clipLabel + "</a>");
                clipLink.setData('params', clipParams);
                clipLink.setData('playerID', p._node.id);
                clipLink.setData('clipSrc', 'http://kevinwiliarty.com/openvideo/remote-conbowling.ogv');
                var clipLI = Y.Node.create("<li></li>");
                clipLI.append(clipLink);
                clipUL.append(clipLI);
            }
        }
    });

    Y.on('domready', function () {
        alert('ready');
        linkList = Y.all('.filter-vjs-cliplink');
        console.log(linkList);
        linkList.each(function (clip) {
            console.log(clip);
            clip.on('click', function (e) {
                e.preventDefault();
                VJS.playClip(this);
            });
            // VJS.playClip(this);
        });
    });
}

VJS.playClip = function (link) {
    var params = link.getData('params');
    var playerID = link.getData('playerID');
    var vjsp = videojs(playerID);
    var vjspNode = Y.one('#'+playerID);
    vjspNode.setData('in', params.in);
    vjspNode.setData('out', params.out);
    vjsp.src('http://kevinwiliarty.com/openvideo/remote-conbowling.ogv');
    vjsp.bigPlayButton.hide();
    vjsp.controlBar.show();
    vjsp.play();
    console.log(params.in);
    return;
                clipLink.on("click", function (e) {
                    e.preventDefault();
                    var params = this.getData('params');
                    var playerID = this.getData('playerID');
                    p.setData('out', params.out);
                    p.setData('in', params.in);
                    vjsp = videojs(playerID);
                    vjsp.currentTime(0);
                    // var srctypes = [];
                    // for(var i in params.srctypes) {
                    //     srctypes.push(params.srctypes[i]);
                    // }
                    // console.log(vjsp.src());
                    // vjsp.one('play', function () {
                    //     var source = params.mimes.ogg
                    //     vjsp.src([
                    //         {type: "video/ogg", src: "http://kevinwiliarty.com/openvideo/remote-conbowling.ogv"},
                    //     ]);
                    //     vjsp.currentTime(params.in);
                    // });
                    // vjsp.src({type: 'video/ogg', src: 'http://kevinwiliarty.com/openvideo/remote-conbowling.ogv'});
                    // vjsp.src(params.srctypes);
                    // var source = params.mimes.ogg
                    // vjsp.src([
                    //     {type: "video/ogg", src: source},
                    // ]);
                    // vjsp.src('http://kevinwiliarty.com/openvideo/remote-conbowling.ogv');
                    // vjsp.load();
                    // vjsp.ready(function(){
                    //     this.currentTime(params.in);
                    //     this.play();
                    // });
                });
}


}, '@VERSION@', {"requires": ["base", "node", "event", "get"]});
