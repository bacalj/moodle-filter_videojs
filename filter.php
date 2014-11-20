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

        global $COURSE;

        // We'll use the context id to guarantee unique id's for the videos. 
        // This is necessary because...
        // Filtering happens at the mod level, and there may be several per page.
        // It is not sufficient to expect an array index to be unique.
        $contextid = $this->context->id;

        // Define the string to pluck out.
        $regex = '\[videojs\].*?\[\/videojs\]';

        // Find all the matches and store them in a $shortcodes array.
        // $shortcodes will be an array of arrays.
        // The first element of each child array is the raw content of a shortcode.
        preg_match_all("/$regex/sm", $text, $shortcodes, PREG_SET_ORDER);

        // Replace the shortcodes with HTML5 video markup.
        // The patterns are the original markup.
        $patterns = array();
        // The replacements are the HTML5 markup.
        $replacements = array();
        // Build two arrays, one with patterns, the other with replacements.
        foreach ($shortcodes as $key => $sc) {
            // Build the HTML5 markup using the $contextid and the $shortcodes array index for uniqueness.
            $vo = new filter_videojs_video($sc[0], $contextid . "_" . $key);
            $patterns[$key] = $sc[0];
            $replacements[$key] = "\n" . $vo->get_html() . "\n";
        }

        // Do the swap.
        // We have to worry about duplicate shortcode patterns, unfortunately.
        // The replacements must have unique id's even if the shortcodes are identical.
        foreach ( $patterns as $key => $pattern ) {
            $pos = strpos( $text, $pattern );
            $len = strlen( $pattern );
            $text = substr_replace( $text, $replacements[$key], $pos, $len );
        }
        return $text;
    }
}
