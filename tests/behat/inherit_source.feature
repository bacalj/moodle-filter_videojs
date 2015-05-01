@filter @filter_videojs @filter_videojs_inherit_source
Feature: Clips can inherit their sources
    In order to let a clip inherit sources
    As a user
    I simply leave out any overriding source attributes

    @javascript
    Scenario: A clip can inherit its sources from the parent videojs element
        Given I set up a filter_videojs test course
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            [videojs] 
                mp4="../../filter/videojs/tests/fixtures/mobile-layout.mp4"
                webm="../../filter/videojs/tests/fixtures/mobile-layout.webm"
                [clip]
                    mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4" 
                    webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm" 
                    in=20 out=22 label="Activity and Resource Controls"
                [/clip]
                [clip]
                    in=5 out=7 label="Mobile Layout"
                [/clip]
            [/videojs]
            """
        And I click on "Save and display" "button"
        And I wait until the page is ready
        When I follow "Activity and Resource Controls"
        And I click on ".vjs-tech" "css_element"
        Then the "src" attribute of ".vjs-tech" "css_element" should contain "activity-and-resource-controls"
        When I follow "Mobile Layout"
        And I click on ".vjs-tech" "css_element"
        Then the "src" attribute of ".vjs-tech" "css_element" should contain "mobile-layout"
