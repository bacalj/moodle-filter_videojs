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
 * @package    filter_videojs
 * @copyright  2014 onwards Kevin Wiliarty {@link http://kevinwiliarty.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_videojs_base {

    protected $shortcode;
    protected $toplevel;
    protected $noclips;
    protected $transcript;
    protected $html;
    protected $clips = array();
    protected $tracks = array();
    protected $mimes = array(
        'mp4'        => '',
        'webm'       => '',
        'ogg'        => '',
    );
    public $params = array();

    /**
     * Get toplevel code
     * Gets the shortcode with no sub-tags
     */
    public function get_toplevel($kind) {
        $paramlist = str_replace("[$kind]", '', $this->shortcode);
        $paramlist = str_replace("[/$kind]", '', $paramlist);
        $paramlist = preg_replace("/\[(\w*)\].*?\[\/\\1\]/sm", '', $paramlist);
        return $paramlist;
    }

    /**
     * Get noclips
     * Gets the shortcode with no clip sub-tags, but leaves any toplevel tracks intact
     */
    public function get_noclips($kind) {
        $paramlist = str_replace("[$kind]", '', $this->shortcode);
        $paramlist = str_replace("[/$kind]", '', $paramlist);
        $noclips = preg_replace("/\[clip\].*?\[\/clip\]/sm", '', $paramlist);
        return $noclips;
    }

    /**
     * Parse the shortcode parameters
     */
    public function get_params() {
        $this->get_values($this->params, $this->toplevel);
        $this->get_values($this->mimes, $this->toplevel);
    }

    /**
     * Get the values for a given parameter
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
            $this->clips[$key] = new filter_videojs_clip($clip[0], $this->mimes);
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

}

/**
 * Video JS object class.
 *
 * @package    filter_videojs
 * @copyright  2014 onwards Kevin Wiliarty {@link http://kevinwiliarty.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_videojs_video extends filter_videojs_base {

    public $params = array(
        'id'         => '',
        'poster'     => '',
        'height'     => '',
        'width'      => '',
        'class'      => 'video-js vjs-default-skin',
        'controls'   => 'controls',
        'preload'    => 'auto',
        'data-setup' => '{ "playbackRates" : [0.7, 1, 1.5, 2.0] }'
    );

    /**
     * Create an object for each shortcode
     *
     */
    public function __construct($shortcode, $id) {
        $this->shortcode = $shortcode;
        $this->toplevel = $this->get_toplevel('videojs');
        $this->noclips = $this->get_noclips('videojs');
        $this->get_params();
        $this->params['id'] = "videojs_$id";
        $this->clips = $this->get_clips();
        $this->tracks = $this->get_tracks();
        $this->transcript = new filter_videojs_transcript($this->tracks[0]);
        $this->build_html();
        $this->pass_to_js();
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
        $videotag = html_writer::tag('video', $sourcetags.$tracktags, $this->params);
        $videodiv = html_writer::tag('div', $videotag, null);
        $this->html = "$videodiv";
    }

    /**
     * Pass along to JS
     */
    public function pass_to_js() {
        global $PAGE;
        $json = '';
        $json = json_encode(array('id' => $this->params['id'], 'clips' => $this->clips));
        // $test = json_encode(get_object_vars($this), JSON_UNESCAPED_SLASHES, JSON_FORCE_OBJECT);
        echo "<pre>";
        print_r($json);
         echo "</pre>";
        $PAGE->requires->yui_module('moodle-filter_videojs-transcript', 'M.filter_videojs.transcript.init', array('shortcode' => $json, 'other' => 'other'));
    }

}

class filter_videojs_clip extends filter_videojs_base {

    public $params = array(
        'in'         => '',
        'out'        => '',
        'label'      => '',
    );

    public function __construct($clip, $mimes) {
        $this->shortcode = $clip;
        $this->toplevel = $this->get_toplevel('clip');
        $this->noclips = $this->get_noclips('clip');
        $this->get_params();
        $this->tracks = $this->get_tracks();
        if (array_count_values($this->mimes)[''] == count($this->mimes)) {
            $this->mimes = $mimes;
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
        $this->shortcode = $track;
        $this->toplevel = $this->get_toplevel('track');
        $this->get_params();
    }
}

class filter_videojs_transcript {

    private $src;

    public function __construct($src) {
        $this->src = $src;
        return $this->src;
    }
}
