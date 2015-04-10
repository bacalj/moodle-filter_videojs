<?php

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
}
