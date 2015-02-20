@filter @filter_videojs
Feature: Simple HTML5 video embed
    In order to embed an HTML5 video
    As a user
    I need to use a videojs shortcode with an mp4 and webm (or ogv) file

    @javascript
    Scenario: Embed a simple HTML5 video on a Page resource
        Given the following "courses" exist:
            | fullname | shortname |
            | VideoJS  | videojs   |
        And the following "users" exist:
            | username |
            | tester   |
        And the following "course enrolments" exist:
            | user   | course  | role           |
            | tester | videojs | editingteacher |
        And the following "activities" exist:
            | activity | course  | idnumber    | name         | intro       |
            | page     | videojs | videojspage | VideoJS Page | for testing |
        And I log in as "admin"
        And I expand "Site administration" node
        And I navigate to "Manage filters" node in "Site administration>Plugins>Filters"
        And I click on "On" "option" in the "Video.js" table row 
        And I log out
        And I log in as "tester"
        And I follow "VideoJS"
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            Hello! 
            [videojs] 
                mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4" 
                webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm" 
            [/videojs]
            """
        When I click on "Save and display" "button"
        And I wait until the page is ready
        Then ".video-js" "css_element" should exist
        And the "class" attribute of ".video-js" "css_element" should not contain "vjs-playing"
        And the "style" attribute of ".video-js" "css_element" should contain "width: 640px"
        And the "style" attribute of ".video-js" "css_element" should contain "height: 360px"
        And ".vjs-tech" "css_element" should exist
        And the "data-setup" attribute of ".vjs-tech" "css_element" should contain "playbackRates"
        And ".vjs-big-play-button" "css_element" should exist
        When I click on ".vjs-big-play-button" "css_element"
        Then the "class" attribute of ".video-js" "css_element" should contain "vjs-playing"
        And ".vjs-control-bar" "css_element" should exist
        And ".vjs-play-control" "css_element" should exist
        And ".vjs-load-progress" "css_element" should exist
        And ".vjs-current-time-display" "css_element" should exist
        And ".vjs-playback-rate-value" "css_element" should exist
        And ".vjs-mute-control" "css_element" should exist
        And ".vjs-volume-bar" "css_element" should exist
        And ".vjs-fullscreen-control" "css_element" should exist
        When I wait "3" seconds
        And I click on ".vjs-tech" "css_element"
        Then the "class" attribute of ".video-js" "css_element" should contain "vjs-paused"
        And I should see "1x" in the ".vjs-playback-rate-value" "css_element"
        When I click on ".vjs-playback-rate-value" "css_element"
        Then I should see "1.5x" in the ".vjs-playback-rate-value" "css_element"
        And I should see "Hello!"
