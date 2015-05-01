@filter @filter_videojs @filter_videojs_clip_inout
Feature: Clips can have in and out times
    In order to create a clip with custom in and out times
    As a user
    I need to use a clip tag with in and out times

    @javascript
    Scenario: Use a clip to set an in and out time on the video
        Given I set up a filter_videojs test course
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
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

