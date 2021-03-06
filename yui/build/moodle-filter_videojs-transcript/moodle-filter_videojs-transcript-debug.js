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
    VJS.players.each(function (player) {

        // Create a variable for the current VideoJS player object.
        var vjsp = videojs(player.get('id'));

        var p = Y.one(vjsp.contentEl());

        p.setData('out', '');
        p.setData('in', 0);
        p.setData('playerID', p._node.id);
        p.setData('srctypes', '');
        p.setData('tracks', []);

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
            //Y.one('#' + p.getData('playerID')).insert(clipOL, 'before');
            var vjspNode = Y.one(vjsp.contentEl());
            vjspNode.insert(clipOL, 'before');
            Y.one(vjsp.contentEl()).insert(clipOL, 'before');

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
        if (p.getData('srctypes') !== '') {
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

    // Get the data stored in the link's YUI node.
    var params = link.getData('params');
    var playerID = link.getData('playerID');
    var clipNumber = link.getData('clipNumber');

    // Distinguish the active link from others.
    var activeClipClass = '.clip' + clipNumber;
    var clipMenu = link.ancestor('ol');
    clipMenu.all('.filter-vjs-cliplink').setStyle('fontWeight', 'normal');
    clipMenu.one(activeClipClass).setStyle('fontWeight', 'bold');
    clipMenu.one(activeClipClass).blur();

    // Now we need the VideoJS player object
    var vjsp = videojs(playerID);

    // Get the YUI node for the div that contains the HTML <video> tag,
    // and store the in and out times there.
    vjspNode = Y.one(vjsp.contentEl());
    vjspNode.setData('in', params.in);
    vjspNode.setData('out', params.out);

    // By default we'll hide the captions button
    vjsp.controlBar.captionsButton.hide();
    var menuLength = vjsp.controlBar.captionsButton.menu.children().length;
    for (var i=0; i<menuLength; i++) {
      vjsp.controlBar.captionsButton.menu.children()[i].el().remove();
    }

    // Remove any old transcripts and captions.
    var oldTranscript = vjspNode.ancestor('div').one('.videojs-transcript-area');
    if ( oldTranscript !== null ) {
      oldTranscript.remove();
    }
    var oldCaptions = vjspNode.one('.filter-videojs-captions-div');
    if ( oldCaptions !== null ) {
      oldCaptions.remove();
    }

    // If there is any track information stored in the YUI link node ...
    if (params.tracks.length > 0) {

      //Get the data (for the first track) out of the node
      // TODO: allow multiple tracks
      // var kind = params.tracks[0].params.kind;
      var label = params.tracks[0].params.label;
      // var srclang = params.tracks[0].params.srclang;
      // var src = params.tracks[0].params.src;

      // Show the captions button
      // TODO: select the new track automatically if the previous one had been selected
      var captionsOnButton = new videojs.MenuItem(vjsp, {
        'label': label
      });
      captionsOnButton.addClass('captionsOnButton');
      var captionsOffButton = new videojs.MenuItem(vjsp, {
        'label': label + ' off'
      });
      captionsOnButton.on(captionsOffButton, 'click', function() {
        this.removeClass('vjs-selected');
      });
      vjsp.controlBar.captionsButton.menu.addChild(captionsOffButton, {});
      vjsp.controlBar.captionsButton.menu.addChild(captionsOnButton, {});
      vjsp.controlBar.captionsButton.show();

      // Get the captions div from the clipparams
      var transcript = params.tracks[0].transcript;
      var captionsHTML = transcript.captions;

      // Attach the captions div inside the video.
      var captionsArea = Y.DOM.create(captionsHTML);
      var controlBarNode = vjspNode.one('.vjs-control-bar');
      // vjspNode.append(captionsArea);
      controlBarNode.insert(captionsArea, 'before');
      var captionsAreaNode = Y.Node(captionsArea);
      var captionsCues = captionsAreaNode.all('div');
      captionsCues.each(function (c) {
        var classList = c.getAttribute('class');
        var timeInMatches = classList.match('.*filter-videojs-caption-in-([0-9_]*) ');
        var timeIn = timeInMatches[1].replace('_', '.');
        var timeOutMatches = classList.match('.*filter-videojs-caption-out-([0-9_]*)');
        var timeOut = timeOutMatches[1].replace('_', '.');
        vjsp.on('timeupdate', function() {
          if ((vjsp.currentTime() > timeIn) && (vjsp.currentTime() < timeOut) && (captionsOnButton.hasClass('vjs-selected'))) {
            if (!(c.hasClass('filter-videojs-active-caption'))) {
              c.addClass('filter-videojs-active-caption');
            }
          } else {
            if (c.hasClass('filter-videojs-active-caption')) {
              c.removeClass('filter-videojs-active-caption');
            }
          }
        });
      });

      // Get the transcript from the clipparams
      var transcriptHTML = transcript.html;

      // Attach the transcript after the video
      if (params.tracks[0].transatts.transcript === 'display') {
        var transcriptArea = Y.DOM.create(transcriptHTML);
        vjspNode.insert(transcriptArea, 'after');
        var transcriptAreaNode = Y.Node(transcriptArea);
        var transcriptTableNode = transcriptAreaNode.one('table');
        transcriptAreaNode.on('mouseenter', function () {
          transcriptAreaNode.addClass('hovered');
        });
        transcriptAreaNode.on('mouseleave', function () {
          transcriptAreaNode.removeClass('hovered');
        });
        var transcriptRows = transcriptTableNode.all('tr');
        transcriptRows.each(function (r) {
          var classList = r.getAttribute('class');
          var timeInMatches = classList.match('.*filter-videojs-in-([0-9_]*) ');
          var timeIn = timeInMatches[1].replace('_', '.');
          var timeOutMatches = classList.match('.*filter-videojs-out-([0-9_]*) ');
          var timeOut = timeOutMatches[1].replace('_', '.');
          vjsp.on('timeupdate', function() {
            if ((vjsp.currentTime() > timeIn) && (vjsp.currentTime() < timeOut)) {
              if (!(r.hasClass('filter-videojs-active-cue'))) {
                r.addClass('filter-videojs-active-cue');
                var ty = transcriptTableNode.getY();
                var ry = r.getY();
                var ydelta = ry-ty;
                a = new Y.Anim(
                  {
                    node: transcriptAreaNode,
                    to: { scrollTop: ydelta-80 },
                    duration: 0.3,
                    easing: Y.Easing.easeBoth
                  }
                );
                if (!(transcriptAreaNode.hasClass('hovered'))) {
                  a.run();
                }
              }
            } else {
              if (r.hasClass('filter-videojs-active-cue')) {
                r.removeClass('filter-videojs-active-cue');
              }
            }
          });
          r.on('click', function () {
            vjsp.currentTime(timeIn);
          });
        });
      }

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


}, '@VERSION@', {"requires": ["base", "node", "event", "get", "node-screen", "anim", "event-mouseenter"]});
