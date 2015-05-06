@filter @filter_videojs @filter_videojs_strip_tags
Feature: Strip video tags from videojs markup
    In order to get an HTML free markup
    As a user
    I can leave the cleanup to the plugin

    @javascript
    Scenario: Clean up a single HTML5 video on a Page resource
        Given I set up a filter_videojs test course
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            Hello!
            [videojs]
                <span class="messy">mp4="<a href="http://demo.com">../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4</a>"</span>
                <span class="messy">webm="<a href="http://demo.com">../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm</a>"</span>
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

