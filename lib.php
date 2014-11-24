<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Video JS Filter
 *
 * Replaces a shortcode with a Video JS player
 *
 * @package    filter_videojs
 * @copyright  2014 onwards Kevin Wiliarty {@link http://kevinwiliarty.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Video JS base class.
 *
 * Core properties and methods to be available to various component objects built from the shortcodes.
 * To a considerable extent, this class is about parsing the shortcodes.
 * The child classes contain more information about how to render them into objects.
 *
 * @package    filter_videojs
 * @copyright  2014 onwards Kevin Wiliarty {@link http://kevinwiliarty.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class filter_videojs_base {

    /*
     * The full shortcode passed from the filter
     */
    protected $shortcode;

    /*
     * The tag
     */
    protected $tag;

    /* 
     * The shortcode with all internal tags removed
     */
    protected $toplevel;

    /*
     * The shortcode with all internal clip tags removed and other internal tags intact
     */
    protected $noclips;

    /*
     * This will be a variable to hold transcript lines
     */
    protected $transcript;

    /*
     * The HTML markup for the shortcode
     */
    protected $html;

    /*
     * An array of raw shortcodes for all the child clips
     */
    protected $clips = array();

    /*
     * An array of all the top-level tracks
     */
    protected $tracks = array();

    /*
     * An array of the various source types we need to look for
     */
    protected $mimes = array(
        'mp4'        => '',
        'webm'       => '',
        'ogg'        => '',
    );

    /*
     * The params must be defined by the child classes
     */
    public $params = array();

    public function __construct($shortcode) {
        $this->shortcode = $shortcode;
        $this->extract_the_tag();
        $this->get_toplevel();
        $this->get_noclips();
        $this->get_values($this->params, $this->toplevel);
        $this->get_values($this->mimes, $this->toplevel);
    }

    /**
     * Extract the tag from the shortcode
     */
    public function extract_the_tag() {
        preg_match( '/^\[([a-z]*)\]/' , $this->shortcode , $matches );
        $this->tag = $matches[1];
    }

    /**
     * Get toplevel code
     * Gets the relevant shortcode with no sub-tags
     */
    public function get_toplevel() {
        // Remove the top-level tag.
        $tag = $this->tag;
        $paramlist = str_replace("[$tag]", '', $this->shortcode);
        $paramlist = str_replace("[/$tag]", '', $paramlist);
        // Remove all internal tags and their contents.
        $paramlist = preg_replace("/\[(\w*)\].*?\[\/\\1\]/sm", '', $paramlist);
        $this->toplevel = $paramlist;
    }

    /**
     * Get noclips
     * Gets the shortcode with no clip sub-tags, but leaves any toplevel tracks intact
     */
    public function get_noclips() {
        // Remove the top-level tag.
        $tag = $this->tag;
        $paramlist = str_replace("[$tag]", '', $this->shortcode);
        $paramlist = str_replace("[/$tag]", '', $paramlist);
        // Remove any internal clips.
        $noclips = preg_replace("/\[clip\].*?\[\/clip\]/sm", '', $paramlist);
        $this->noclips = $noclips;
    }

    /**
     * Get the values for a given parameter
     * Values may be wrapped in single or double quotes or they may be bare
     */
    public function get_values(&$keys, $paramlist) {
        foreach ($keys as $key => $value) {
            preg_match( "/${key}=(.)/", $paramlist, $quotes);
            if (!array_key_exists(1, $quotes)) {
                continue;
            }
            switch ($quotes[1]) {
                case '"';
                    $needle = "${key}=\"([^\"]*)";
                    break;
                case "'";
                    $needle = "${key}='([^']*)";
                    break;
                default;
                    $needle = "${key}=([^ <]*)";
                    break;
            }
            preg_match("/$needle/", $paramlist, $matches);
            if (array_key_exists(1, $matches)) {
                if (($key == 'in') || ($key == 'out')) {
                    $matches[1] = $this->hms2sec($matches[1]);
                }
                $keys[$key] = $matches[1];
            }
        }
    }

    /**
     * Get the clips
     */
    public function get_clips() {
        $regex = '\[clip\].*?\[\/clip\]';
        preg_match_all("/$regex/sm", $this->shortcode, $clips, PREG_SET_ORDER);
        foreach ($clips as $key => $clip) {
            $this->clips[$key] = new filter_videojs_clip($clip[0], $this->mimes, $this->params );
        }
        return $this->clips;
    }

    /**
     * Get the tracks
     */
    public function get_tracks() {
        $regex = '\[track\].*?\[\/track\]';
        preg_match_all("/$regex/sm", $this->noclips, $tracks, PREG_SET_ORDER);
        foreach ($tracks as $key => $track) {
            $this->tracks[$key] = new filter_videojs_track($track[0]);
        }
        return $this->tracks;
    }

    /**
     * Convert hh:mm:ss to seconds
     */
    public function hms2sec($hms) {
        $sec = 0;
        $multiplier = 1;
        $units = explode(':', $hms);
        $units = array_reverse($units);
        foreach ($units as $unit) {
            if ($multiplier > 3600) {
                return $sec;
            }
            $sec += $unit*$multiplier;
            $multiplier = $multiplier*60;
        }
        return $sec;
    }

    /**
     * Convert seconds to hh:mm:ss
     */
    public function sec2hms($sec) {
        $h = intval($sec/3600);
        $sec = $sec % 3600;
        $m = str_pad(intval($sec/60), 2, "0", STR_PAD_LEFT);
        $s = str_pad($sec % 60, 2, "0", STR_PAD_LEFT);
        $hms = "$h:$m:$s";
        $hms = preg_replace( '/^0:?0?/', '', $hms );
        return $hms;
    }

    /**
     * Get HTML
     */
    public function get_html() {
        return $this->html;
    }

    /**
     * Build HTML
     */
    public function build_html() {
        $sourcetags = '';
        $tracktags = '';
        $params = $this->params;
        if ($params['poster'] == '') {
            // We need to leave the poster attribute out if it is null to avoid error in FF.
            unset($params['poster']);
        }
        foreach ($this->mimes as $mime => $source) {
            if ($source == '') {
                continue;
            }
            $sourceatts = array(
                'src'  => $source,
                'type' => "video/$mime"
            );
            $sourcetags .= html_writer::empty_tag('source', $sourceatts);
        }
        foreach ($this->tracks as $track) {
            $tracktags .= html_writer::empty_tag('track', $track->params);
        }
        $videotag = html_writer::tag('video', $sourcetags.$tracktags, $params);
        $videodiv = html_writer::tag('div', $videotag, null);
        $this->html = "$videodiv";
    }

} /* End of filter_videojs_base class */

/**
 * Video JS object class.
 *
 * @package    filter_videojs
 * @copyright  2014 onwards Kevin Wiliarty {@link http://kevinwiliarty.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_videojs_video extends filter_videojs_base {

    /*
     * The params that will be part of building the HTML
     */
    public $params = array(
        'id'         => '',
        'poster'     => '',
        'height'     => '',
        'width'      => '',
        'class'      => 'video-js vjs-default-skin',
        'controls'   => 'controls',
        'preload'    => 'auto',
        'data-setup' => '{ "playbackRates" : [0.7, 1, 1.5, 2.0] , "techOrder" : ["html5","flash"]}'
    );

    /**
     * Create an object for each shortcode
     */
    public function __construct($shortcode, $id) {
        parent::__construct($shortcode);
        $this->params['id'] = "videojs_$id";
        $this->clips = $this->get_clips();
        $this->tracks = $this->get_tracks();
        if (array_key_exists(0, $this->tracks)) {
            $this->transcript = new filter_videojs_transcript($this->tracks[0]);
        }
        $this->build_html();
        $this->pass_to_js();
    }

    /**
     * Build HTML
     */
    public function build_html() {
        parent::build_html();
        $this->html .= $this->build_noscript();
    }

    /**
     * Build noscript for clips
     */
    public function build_noscript() {
        $clipshtml = '';
        $beginning = get_string('beginning', 'filter_videojs');
        $end = get_string('end', 'filter_videojs');
        $clipstr = get_string('clipupper', 'filter_videojs');
        foreach ( $this->clips as $key => $clip ) {
            $clipnum = $key + 1;
            $in = ( $clip->clipparams['in'] != '' ) ? $this->sec2hms( $clip->clipparams['in'] ) : $beginning;
            $out = ( $clip->clipparams['out'] != '') ? $this->sec2hms( $clip->clipparams['out'] ) : $end;
            $from = get_string('fromtime', 'filter_videojs', $in);
            $to = get_string('totime', 'filter_videojs', $out);
            $clipshtml .= "<p>$clipstr $clipnum: $from $to</p>";
            $clipshtml .= $clip->get_html();
        }
        $noscript = html_writer::tag('noscript', $clipshtml, null);
        return $noscript;
    }

    /**
     * Pass along to JS
     */
    public function pass_to_js() {
        global $PAGE;
        global $CFG;
        $sources = array(
            'js_source'  => $CFG->filter_videojs_js_source,
            'css_source' => $CFG->filter_videojs_css_source,
            'swf_source' => $CFG->filter_videojs_swf_source,
        );
        $json = '';
        $json = json_encode(array('id' => $this->params['id'], 'clips' => $this->clips, 'sources' => $sources));
        $PAGE->requires->yui_module('moodle-filter_videojs-transcript', 'M.filter_videojs.transcript.init', array(array('clips' => $json, 'sources' => $sources)));
    }

} /* end of class filter_videojs_video */

/*
 * filter_videojs_clip
 *
 * Get all of the relevant information for each clip
 */
class filter_videojs_clip extends filter_videojs_base {

    public $clipparams = array(
        'in'         => '',
        'out'        => '',
        'label'      => '',
    );

    public function __construct($clip, $mimes, $params = array() ) {
        parent::__construct($clip);
        $this->params = $params;
        $this->get_values($this->clipparams, $this->toplevel);
        $this->tracks = $this->get_tracks();
        $this->clips = array();
        $this->clipparams['tracks'] = $this->tracks;
        $mimescount = array_count_values($this->mimes);
        if ((in_array('', $this->mimes)) && ($mimescount[''] == count($this->mimes))) {
            $this->mimes = $mimes;
        }
        $this->build_html();
        $this->clipparams['mimes'] = $this->mimes;
        $sources = $this->clipparams['mimes'];
        foreach ($sources as $type => $source) {
            if ($source == '') {
                continue;
            }
            $this->clipparams['srctypes'][] = array(
                'type' => "video/$type",
                'src'  => $source
            );
        }
    }
}

class filter_videojs_track extends filter_videojs_base {

    public $params = array(
        'src'        => '',
        'kind'       => 'captions',
        'label'      => 'English',
        'srclang'    => 'en'
    );

    public function __construct($track) {
        parent::__construct($track);
    }
}

class filter_videojs_transcript {

    private $src;

    public function __construct($src) {
        $this->src = $src;
        return $this->src;
    }
}
