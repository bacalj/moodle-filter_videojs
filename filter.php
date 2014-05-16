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
require_once(dirname(__FILE__) . '/lib.php');

/**
 * Video JS filter class.
 *
 * @package    filter_videojs
 * @copyright  2014 onwards Kevin Wiliarty {@link http://kevinwiliarty.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_videojs extends moodle_text_filter {

    /**
     * Build a Video JS player
     *
     * @return string The filtered content
     */
    public function filter($text, array $options = array()) {
        $regex = '\[videojs (.*?)\]';
        preg_match_all("/$regex/", $text, $shortcodes, PREG_SET_ORDER);
        foreach ($shortcodes as $sc) {
            $scobjects[] = new filter_videojs_shortcode($sc[1]);
        }
        echo "<pre>";
        print_r($scobjects);
        echo "</pre>";
        return $text;
    }
}
