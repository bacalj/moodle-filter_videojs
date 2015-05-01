@filter @filter_videojs @filter_videojs_captions
Feature: Captions
    In order to add captions to a video
    As a user
    I need to create a track element

    @javascript
    Scenario: Add a track element in order to display captions
        Given I set up a filter_videojs test course
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            [videojs]
                mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4"
                webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm"
                [track]src="/filter/videojs/tests/fixtures/activity-and-resource-controls.vtt"[/track]
                [clip]
                    label="Short clip"
                    out=2
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
        Then ".filter-videojs-active-caption" "css_element" should exist
        And I should see "Let's take a minute"

