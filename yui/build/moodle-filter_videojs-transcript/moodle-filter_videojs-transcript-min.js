YUI.add("moodle-filter_videojs-transcript",function(e,t){"use_strict";var n;M.filter_videojs=M.filter_videojs||{},n=M.filter_videojs.transcript={},n.init=function(t){typeof n.initialized=="undefined"&&(e.Get.load(["http://eik.local/videojs/dist/video-js/video-js.css","http://eik.local/videojs/dist/video-js/video.js"],function(e){if(e)return;videojs.options.flash.swf="http://eik.local/videojs/dist/video-js/video-js.swf",n.buildClips()}),n.initialized="initialized",n.videos=[]),n.videos.push(JSON.parse(t))},n.buildClips=function(){console.log(n)}},"@VERSION@",{requires:["base","node","get"]});
