@filter @filter_videojs @filter_videojs_multisource
Feature: Multiple clips can have multiple sources
    In order to add clips from different sources
    As a user
    I need to add source attributes to each clip

    @javascript
    Scenario: Individual clips can load different source videos
        Given I set up a filter_videojs test course
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            [videojs] 
                [clip]
                    mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4" 
                    webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm" 
                    in=20 out=22 label="Activity and Resource Controls"
                [/clip]
                [clip]
                    mp4="../../filter/videojs/tests/fixtures/mobile-layout.mp4"
                    webm="../../filter/videojs/tests/fixtures/mobile-layout.webm"
                    in=5 out=7 label="Mobile Layout"
                [/clip]
            [/videojs]
            """
        And I click on "Save and display" "button"
        And I wait until the page is ready
        When I follow "Mobile Layout"
        And I click on ".vjs-tech" "css_element"
        Then the "src" attribute of ".vjs-tech" "css_element" should contain "mobile-layout"
        When I follow "Activity and Resource Controls"
        And I click on ".vjs-tech" "css_element"
        Then the "src" attribute of ".vjs-tech" "css_element" should contain "activity-and-resource-controls"

