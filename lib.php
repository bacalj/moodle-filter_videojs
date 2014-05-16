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
        'src'      => '', 
        'captions' => '', 
        'height'   => '', 
        'width'    => ''
    );

    /**
     * Create an object for each shortcode
     *
     */
    public function __construct($shortcode) {
        $this->shortcode = $shortcode;
        $this->get_params($shortcode);
    }

    public function get_params($shortcode) {
        foreach ($this->params as $key => $value) {
            $needle = "$key";
            preg_match("/$needle/", $shortcode, $matches);
            $this->params[$key] = $matches;
        }
    }
}
