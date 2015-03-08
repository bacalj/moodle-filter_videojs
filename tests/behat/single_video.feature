@filter @filter_videojs
Feature: Simple HTML5 video embed
    In order to embed an HTML5 video
    As a user
    I need to use a videojs shortcode with an mp4 and webm (or ogv) file

    Background:
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

    @javascript
    Scenario: Embed a single HTML5 video on a Page resource
        Given I click on "VideoJS Page" "link" in the "VideoJS Page" activity
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
        When I click on ".vjs-tech" "css_element"
        Then the "class" attribute of ".video-js" "css_element" should contain "vjs-paused"
        When I click on ".vjs-playback-rate-value" "css_element"
        Then I should see "1.5x" in the ".vjs-playback-rate-value" "css_element"
        And I should see "Hello!"

    @javascript
    Scenario: Set a custom width and height for the video
        Given I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            [videojs] 
                width=320
                height=180
                mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4" 
                webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm" 
            [/videojs]
            """
        When I click on "Save and display" "button"
        And I wait until the page is ready
        Then ".video-js" "css_element" should exist
        And the "style" attribute of ".video-js" "css_element" should contain "width: 320px"
        And the "style" attribute of ".video-js" "css_element" should contain "height: 180px"

    @javascript
    Scenario: Use a clip to set an in and out time on the video
        Given I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            [videojs] 
                mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4" 
                webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm" 
                [clip]
                    in=20 out=23 label="From 20 to 23 seconds"
                [/clip]
            [/videojs]
            """
        When I click on "Save and display" "button"
        And I wait until the page is ready
        Then ".video-js" "css_element" should exist
        And I should see "From 20 to 23 seconds"
        When I click on "From 20 to 23 seconds" "link"
        Then the "class" attribute of ".video-js" "css_element" should contain "vjs-playing"
        When I wait "5" seconds
        Then the "class" attribute of ".video-js" "css_element" should not contain "vjs-playing"
        But the "class" attribute of ".video-js" "css_element" should contain "vjs-paused"
        And I should see "0:23" in the ".vjs-current-time-display" "css_element" 
        When I click on ".vjs-play-control" "css_element"
        And I wait "2" seconds
        Then the "class" attribute of ".video-js" "css_element" should not contain "vjs-playing"
        But the "class" attribute of ".video-js" "css_element" should contain "vjs-paused"
        And I should see "0:23" in the ".vjs-current-time-display" "css_element" 

    @javascript
    Scenario: Add a track element in order to display captions
        Given I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            [videojs]
                mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4"
                webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm"
                [track]src="../../filter/videojs/tests/fixtures/activity-and-resource-controls.vtt"[/track]
                [clip]
                    out=2 label="Short clip"
                [/clip]
            [/videojs]
            """
        When I click on "Save and display" "button"
        And I wait until the page is ready
        And I click on "Short clip" "link"
        Then ".vjs-captions-button" "css_element" should exist
        When I click on ".vjs-captions-button" "css_element"
        Then I should see "captions"
        When I click on "//*[contains(.,'captions')][2]" "xpath_element"
        Then ".vjs-text-track" "css_element" should exist
        And I should see "Let's take a minute"
