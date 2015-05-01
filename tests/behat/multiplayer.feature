@filter @filter_videojs @filter_videojs_multiplayer
Feature: Multiple players on one page will not collide
    In order to build multiple players on a single page
    As a user
    I need to add markup for two videojs elements

    @javascript
    Scenario: Add two players with different sources
        Given I set up a filter_videojs test course
        And I click on "VideoJS Page" "link" in the "VideoJS Page" activity
        And I navigate to "Edit settings" node in "Page module administration"
        And I set the field "Page content" to:
            """
            <div id="first-video">
            <h3>Activity and resource controls</h3>

            [videojs] 
                mp4="../../filter/videojs/tests/fixtures/activity-and-resource-controls.mp4" 
                webm="../../filter/videojs/tests/fixtures/activity-and-resource-controls.webm" 
            [/videojs]

            </div>

            <div id="second-video">
            <h3>Mobile layout</h3> 
            
            [videojs]
                mp4="../../filter/videojs/tests/fixtures/mobile-layout.mp4"
                webm="../../filter/videojs/tests/fixtures/mobile-layout.webm"
            [/videojs]
            </div>
            """
        And I click on "Save and display" "button"
        And I wait until the page is ready
        When I click on "#first-video .vjs-tech" "css_element"
        Then the "src" attribute of "#first-video .vjs-tech" "css_element" should contain "activity-and-resource-controls"
        And the "class" attribute of "#first-video .video-js" "css_element" should contain "vjs-playing"
        When I click on "#first-video .vjs-tech" "css_element"
        Then the "class" attribute of "#first-video .video-js" "css_element" should not contain "vjs-playing"
        When I click on "#second-video .vjs-tech" "css_element"
        Then the "src" attribute of "#second-video .vjs-tech" "css_element" should contain "mobile-layout"
        And the "class" attribute of "#second-video .video-js" "css_element" should contain "vjs-playing"
        When I click on "#second-video .vjs-tech" "css_element"
        Then the "class" attribute of "#second-video .video-js" "css_element" should not contain "vjs-playing"
