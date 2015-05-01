@filter @filter_videojs @filter_videojs_dimensions
Feature: Video dimensions
    In order to set custom dimensions for a video
    As a user
    I need to use width and height attributes in my markup

    @javascript
    Scenario: Set a custom width and height for the video
        Given I set up a filter_videojs test course
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            [videojs] 
                width="320"
                height="180"
                mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4" 
                webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm" 
            [/videojs]
            """
        When I click on "Save and display" "button"
        And I wait until the page is ready
        Then ".video-js" "css_element" should exist
        And the "style" attribute of ".video-js" "css_element" should contain "width: 320px"
        And the "style" attribute of ".video-js" "css_element" should contain "height: 180px"

