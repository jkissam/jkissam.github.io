# Unwritten Future

__Version 1.0-rc__  
_April 7, 2017_

Platform-agnostic HTML5 Boilerplate

Designed to be used as a base for any CMS or single-page app. I am planning to use this to build base themes for Wordpress and Drupal.

Built-in CSS includes:

* reset.css
* Bootstrap grid system (but no other bootstrap styling)
* .section-wrapper > .section > .section-inner structure for building parallax-style sites/themes
* Special "utility" section which can be placed anywhere in HTML (to render in any arbitrary place on mobile) but which can be placed in upper-right-hand corner by media query

Javascript/CSS functionality includes:

* Responsive menu with touch-friendly drop-downs
* Dismissable messages
* Modals, which are openable by linking to their ids or programamtically through Javascript
* Option to fix footer to the bottom of the page when content doesn't push it that far

Additional optional Javascript functionality:

* shorten links that are wider than their parents (i.e., when long URLs are used as the link text, which can break mobile layouts)
* open links to external URLs in a new window, optionally excluding by jQuery selectors
* make links to anchors in the same page scroll rather than jump (do this by adding a class)
* helper functions to set and get cookies
* populate inputs with the value of their labels
* prepare pop-ups
* add class "fixed" to a particular element when the page scrolls past a certain number of pixels
* equalize the height of a set of matched elements
* scroll the page to include a particular element
* vertically center an element relative to another element
* smartresize event

Javascript behavior can be configured through the `uwfOptions` object, and all text used by Javascript functions is in `uwfText` object for internationalization and localization