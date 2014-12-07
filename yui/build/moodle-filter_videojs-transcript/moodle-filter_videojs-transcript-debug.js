YUI.add('moodle-filter_videojs-transcript', function (Y, NAME) {

"use_strict";
/*jslint browser: true*/
/*global M*/
/*global Y*/

var VJS;

M.filter_videojs = M.filter_videojs || {};
VJS = M.filter_videojs.transcript = {};

/*
 * This is the function that will be called by the PHP part of the filter.
 * It loads the CSS, JavaScript and Flash player. It cues up the menu building
 * function, and it builds an array of videos and their details.
 *
 */

VJS.init = function (params) {

    // If the function has run once, skip the following steps
    if (typeof VJS.initialized === 'undefined') {

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

            // Cue up the clip menu builder to run when the DOM is ready.
            Y.on('domready', function () {
                VJS.buildClipMenu();
            });
        });

        // Prevent additional executions.
        VJS.initialized = 'initialized';

        // Create the array to contain all the video objects.
        VJS.videos = [];
    }

    // For each run of this function, parse the information passed in from the PHP.
    var jsonClips = JSON.parse(params.clips);

    // Create the array, keyed to each video id.
    VJS.videos[jsonClips.id]=jsonClips;
};

/**
 * Build the clip menus.
 *
 * Get the players from the HTML and store video details in their YUI nodes.
 */

VJS.buildClipMenu = function () {

    // First, get an array of all the HTML video elements processed by VideoJS.
    VJS.players = Y.all('.video-js');

    // Then, for each of the YUI player nodes (p):
    VJS.players.each(function (p) {

        p.setData('out', '');
        p.setData('in', 0);
        p.setData('playerID', p._node.id);
        p.setData('srctypes', '');
        p.setData('tracks', []);

        // Create a variable for the current VideoJS player object.
        var vjsp = videojs(p.get('id'));

        // If we need to use Flash, then warn users that functionality will be limited.
        if (vjsp.techName === 'Flash') {
            alert('The Video.js Flash player does not support all of the Video.js Filter functionality. Please try a different browser.');
            return;
        }

        // Load the VideoJS player when it is ready
        vjsp.ready(function () {
            this.load();
        });

        // Set up the functions to run on timeupdate: Keeps the video within the in and out times.
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

        // Get the array of clips for the current video from the json data
        var clips = VJS.videos[p.getData('playerID')].clips;

        // If there are any clips ...
        if (clips.length > 0) {

            // Start preparing an ordered list to contain the clip menu
            var clipOL = Y.Node.create("<ol></ol>");
            clipOL.addClass('video-js-cliplist');

            // Append the list ordered list before the video
            Y.one('#' + p.getData('playerID')).insert(clipOL, 'before');

            // Then, for each clip in the array ...
            for (var i=0; i < clips.length; i++) {

                // We'll want to know the number of the clip
                var n = i+1;
                // And we'll want to know the in and out times, etc.
                var clipParams = clips[i].clipparams;
                var clipLabel = clipParams.label;
                if (clipLabel === '') {
                    clipLabel = 'Clip';
                }

                // Then we prepare the actual link node and store the parameters in it
                var clipLink = Y.Node.create("<a href='#' class='filter-vjs-cliplink clip" + n + "'>" + clipLabel + "</a>");
                clipLink.setData('params', clipParams);
                clipLink.setData('playerID', p._node.id);
                clipLink.setData('clipNumber', n);

                // And we're going to insert the link into a list item, and the list item into the list.
                var clipLI = Y.Node.create("<li></li>");
                clipLI.append(clipLink);
                clipOL.append(clipLI);

                // Store the settings for the first clip in the YUI player node
                if (i === 0) {
                    p.setData('in', clipParams.in);
                    p.setData('out', clipParams.out);
                    p.setData('srctypes', clipParams.srctypes);
                }
            }
        }

        // In case of loading trouble, try uncommenting the two lines immediately below.
        // vjsp = videojs(p.getData('playerID'));
        // vjsp.load();
        if (p.getData('srctypes') != '') {
            vjsp.src(p.getData('srctypes'));
        }
    });

    // When the DOM is ready add an on-click behavior for each of the clip links
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

/**
 * This is the function to run when a clip link is clicked.
 */

VJS.playClip = function (link) {

    // Get the data stored in the link's YUI node
    var params = link.getData('params');
    var playerID = link.getData('playerID');
    var clipNumber = link.getData('clipNumber');

    // We also need to manage some styling to distinguish the active link from others
    var activeClipClass = '.clip' + clipNumber;
    var clipMenu = link.ancestor('ol');
    clipMenu.all('.filter-vjs-cliplink').setStyle('fontWeight', 'normal');
    clipMenu.one(activeClipClass).setStyle('fontWeight', 'bold');
    clipMenu.one(activeClipClass).blur();

    // Get the YUI node for the div that contains the HTML <video> tag,
    // and store the in and out times there.
    var vjspNode = Y.one('#'+playerID);
    vjspNode.setData('in', params.in);
    vjspNode.setData('out', params.out);

    // Now we need the VideoJS player object
    var vjsp = videojs(playerID);

    // By default we'll hide the captions button
    vjsp.controlBar.captionsButton.hide();

    // Disable any text track from a previously played clip.
    if (vjsp.textTracks_[0]) {
      vjsp.textTracks_[0].disable();
      vjsp.controlBar.captionsButton.menu.children_[1].el().remove();
    }

    // Then get rid of the text tracks
    vjsp.textTracks_ = [];

    // If there is any track information stored in the YUI link node ...
    if (params.tracks.length > 0) {

      //Get the data (for the first track) out of the node
      // TODO: allow multiple tracks
      var kind = params.tracks[0].params.kind;
      var label = params.tracks[0].params.label;
      var srclang = params.tracks[0].params.srclang;
      var src = params.tracks[0].params.src;

      // Add a track to the VideoJS player object,
      vjsp.addTextTrack(kind, label, srclang);
      // and set the source for the text track
      vjsp.textTracks_[0].src_ = src;

      // If there's a leftover item in the track menu, remove it
      if (vjsp.controlBar.captionsButton.menu.getChild('vjsTrack') != undefined) {
        var vjsTrackEl = vjsp.controlBar.captionsButton.menu.getChild('vjsTrack').el();
        vjsTrackEl.remove();
      }

      // Create the menu item for the newly added track, naming it so it can be removed later
      newTrack = new vjs.TextTrackMenuItem(vjsp, {'track': vjsp.textTracks_[0], 'name': 'vjsTrack'});
      vjsp.controlBar.captionsButton.menu.addItem(newTrack);

      // Show the captions button
      // TODO: select the new track automatically if the previous one had been selected
      vjsp.controlBar.captionsButton.show();

      // Get the transcript from the clipparams
      var transcript = params.tracks[0].transcript;
      console.log(transcript);
      var transcriptNode = transcript.html;

      // Attach the transcript after the video
      vjspNode.insert(transcriptNode, 'after');

    }

    // Now load that player
    vjsp.load();

    // And when it's ready ...
    vjsp.ready(function () {
        vjsp.src(params.srctypes);
        vjsp.bigPlayButton.hide();
        vjsp.controlBar.show();
        vjsp.play();
    });
};


}, '@VERSION@', {"requires": ["base", "node", "event", "get"]});
