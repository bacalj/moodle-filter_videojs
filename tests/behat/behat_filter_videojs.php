<?php

require_once (__DIR__ . '/../../../../lib/behat/behat_base.php');

use Behat\Behat\Context\Step\Given as Given;
use Behat\Behat\Context\Step\When as When;
use Behat\Gherkin\Node\TableNode as TableNode;

class behat_filter_videojs extends behat_base {

    /**
     * Sets the contents of a field with multi-line input.
     *
     * @Given /^I set the field "(?P<field_string>(?:[^"]|\\")*)" to:$/
     */
    public function i_set_the_field_to_pystring($fieldlocator, Behat\Gherkin\Node\PyStringNode $value) {
        $field = behat_field_manager::get_form_field_from_label($fieldlocator, $this);
        $string = str_replace("\n", '\\n', $value->__toString());
        $field->set_value($string);
    }

    /**
     * Sets up a filter_videojs test course and page
     *
     * @Given /^I set up a filter_videojs test course$/
     */
    public function i_set_up_a_filter_videojs_test_course() {
        $coursetable = new TableNode(<<<TABLE
            | fullname | shortname |
            | VideoJS  | videojs   |
TABLE
        );
        $usertable = new TableNode(<<<TABLE
            | username |
            | tester   |
TABLE
        );
        $enrolmenttable = new TableNode(<<<TABLE
            | user   | course  | role           |
            | tester | videojs | editingteacher |
TABLE
        );
        $activitytable = new TableNode(<<<TABLE
            | activity | course  | idnumber    | name         | intro       |
            | page     | videojs | videojspage | VideoJS Page | for testing |
TABLE
        );
        $steps = array(
            new Given('the following "courses" exist:', $coursetable),
            new Given('the following "users" exist:', $usertable),
            new Given('the following "course enrolments" exist:', $enrolmenttable),
            new Given('the following "activities" exist:', $activitytable),
            new Given('I log in as "admin"'),
            new Given('I expand "Site administration" node'),
            new Given('I navigate to "Manage filters" node in "Site administration>Plugins>Filters"'),
            new Given('I click on "On" "option" in the "Video.js" "table_row"'),
            new Given('I log out'),
            new Given('I log in as "tester"'),
            new Given('I follow "VideoJS"'),
        );

        return $steps;
    }
}
