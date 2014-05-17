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
 * Video JS object class.
 *
 * @package    filter_videojs
 * @copyright  2014 onwards Kevin Wiliarty {@link http://kevinwiliarty.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_videojs_object {

    protected $shortcode;
    protected $params = array(
        'webm'       => '',
        'mp4'        => '',
        'ogg'        => '',
        'poster'     => '',
        'captions'   => '',
        'height'     => '',
        'width'      => '',
        'preload'    => 'auto',
        'data-setup' => '{}'
    );
    protected $html;

    /**
     * Create an object for each shortcode
     *
     */
    public function __construct($shortcode,$id) {
        $this->shortcode = $shortcode;
        $this->get_params($this->shortcode, $id);
        $this->build_html($this->params);
    }

    /**
     * Parse the shortcode parameters
     */
    public function get_params($shortcode, $id) {
        $shortcode = str_replace("[videojs ", '', $shortcode);
        $shortcode = str_replace("]", '', $shortcode);
        foreach ($this->params as $key => $value) {
            $needle = "${key}=[\"']?([^ \"']*)[\"']?";
            preg_match("/$needle/", $shortcode, $matches);
            if (array_key_exists(1, $matches)) {
                $this->params[$key] = $matches[1];
            }
            $this->params['id'] = "filter_videojs_$id";
        }
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
    public function build_html($params) {
        $sourcetags = '';
        $sources = array('mp4', 'webm', 'ogg');
        foreach ($sources as $source) {
            if ($params[$source] == '') {
                continue;
            }
            $sourceatts = array(
                'src'  => $params[$source],
                'type' => "video/$source"
            );
            $sourcetags .= html_writer::empty_tag('source', $sourceatts);
        }
        $atts = array(
            'id'         => $this->params['id'],
            'class'      => 'video-js vjs-default-skin',
            'controls'   => 'controls',
            'poster'     => $this->params['poster'],
            'width'      => $this->params['width'],
            'height'     => $this->params['height'],
            'preload'    => $this->params['preload'],
            'data-setup' => $this->params['data-setup']
        );
        $videotag = html_writer::tag('video', $sourcetags, $atts);
        $videodiv = html_writer::tag('div', $videotag, null);
        $this->html = "$videodiv";
    }
}
