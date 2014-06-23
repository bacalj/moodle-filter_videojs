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

        // We'll use the context id to guarantee unique id's for the videos. 
        // Filtering happens at the mod level, and there may be several per page.
        $contextid = $this->context->id;

        // Define the string to pluck out.
        $regex = '\[videojs\].*?\[\/videojs\]';

        // Find all the matches and store them in a $shortcodes array.
        preg_match_all("/$regex/sm", $text, $shortcodes, PREG_SET_ORDER);

        // Replace the shortcodes with HTML5 video markup.
        $vos = array();
        $patterns = array();
        $replacements = array();
        foreach ($shortcodes as $key => $sc) {
            // Build the markup using the $contextid and the $shortcodes array index for uniqueness.
            $vo = new filter_videojs_video($sc[0], $contextid . "_" . $key);
            $patterns[$key] = $sc[0];
            $replacements[$key] = "\n" . $vo->get_html() . "\n";
            // This array may be unneccessary. Consider removing it.
            $vos[] = $vo;
        }
        global $COURSE;
        // Do the swap.
        $text = str_replace($patterns, $replacements, $text);
        return $text;
    }
}
