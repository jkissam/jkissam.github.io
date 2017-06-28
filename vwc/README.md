# Unwritten Future

Platform-agnostic HTML5 Boilerplate

Designed to be used as a base for any CMS or single-page app. I am planning to use this to build base themes for Wordpress and Drupal.

Built-in CSS includes:

* reset.css
* Bootstrap grid system (but no other bootstrap styling)
* .section-wrapper > .section > .section-inner structure for building parallax-style sites/themes
* Special "utility" section which can be placed anywhere in HTML (to render in any arbitrary place on mobile) but which is placed in upper-right-hand corner on tablets & desktop by media query

Javascript/CSS functionality includes:

* Responsive menu with touch-friendly drop-downs
* Dismissable messages
* Modals, which are openable by linking to their ids or programatically through Javascript
* Option to fix footer to the bottom of the page when content doesn't push it that far

Additional optional Javascript functionality:

* create on-the-fly "on this page" navigation based on `h2` elements (or any other selector, as set in `uwfOptions.onThisPageHeading`) in `#content` section
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

## Usage notes:

1. In order to be able to apply updates from the basic HTML framework, do not modify screen.scss or any of its component files, or uwfutil.js
2. For css, create child.scss (and component files as necessary) in the sass folder to generate child.css, and uncomment line 19 in index.html
3. For javascript, rename script-template.js to script.js and uncomment line 168 in index.html
4. For google analytics, replace "UA-XXXXX-X" with your site's ID on line 178 of index.html, and then uncomment lines 171-180

## Version Log

### Version 1.0-rc7
_June 27, 2017_

* cleaned up a few duplicatations in `_elements.scss`
* made `a.button` elements display as `inline-block`
* improvements to `uwfUtil.shortenLinks`
* added `uwfOptions.shortenLinksSelector` option, which defaults to `a` but can be modified to limit link-shortening
* added `print.css` which only prints header and main content, prints text as black, and increases text side on the content

### Version 1.0-rc6
_June 15, 2017_

* simplified sass component files
* improved display of checkboxes, radio buttons & selects on webkit browsers on Macs
* changed navigation so that display of "mobile" vs. "full" menu is controlled by `uwfOptions.mobileBreakPoint` instead of hard-wired css selectors
* added line-height to `input[type="submit"]` elements so they are the same height as `button` and `a.button` elements
* moved modal-dismiss buttons into modal divs and added "[ESC]" text to them on non-touch devices

### Version 1.0-rc5
_June 15, 2017_

* updated to latest version of `hammerjs`
* fixed bug where prepareNavigation will throw an error if `#navigation .main-menu ul` doesn't exist
* added usage notes and script-example.js for local script

### Version 1.0-rc4

* added `width: 100%` to `button-mobile-block` class to make it, um, actually work

### Version 1.0-rc3
_May 25, 2017_

Added a new `prepareOnThisPage` function to `uwfUtil`, which will create "sections" of `#content` based on the header structure (defaulting to Header 2). This allows content editors to create "sections" of content simply by using the appropriate header element in the HTML, CMS or WYSIWYG. The function creates a menu with links which scroll to the appropriate section of the page, and "Back to top" links at the bottom of each "section."

`prepareOnThisPage` is called automatically by `uwfUtil.init` and configured by properties of the `uwfOptions` variable:
* `onThisPageHeading` : header (or other) elements which will be treated as the beginning of a new section inside `#content` (defaults to `h2`)
* `onThisPageNav` : jQuery selector for container to place on-this-page navigation inside (defaults to `#on-this-page`)
* `onThisPageMinimumSections` : minimum number of sections that must exist on the page before "on this page" navigation is implemented (defaults to 2)
* the "Back to top" text is set (and can be configured by modifying) `uwfText.backToTop`
* also note that `prepareOnThisPage` will _only_ work if `uwfOptions.sectionNavigationSelector` is set, as it relies on `uwfUtil.prepareSectionNavigation`

This version also contains a few minor fixes:
* fixed bugs in `uwfUtil.scrollToInclude()` function
* fixed bug where some of the javascript for modals used `widget` class instead of `modal`
* finished removing javascript for "reveals"
* changed `p:last-of-type` selector to `p:last-child` to remove bottom margin on last paragraph in a container, so that bottom margin is only removed if there are no other elements after it
* added `text-align: center` to `button-block` class
* added `button-mobile-block` class for buttons that should display as block buttons on mobile, but can display as regular buttons on larger devices
* made `.button-block` buttons inside `p.read-more` display as block buttons on mobile (continue to float right on larger devices)

### Version 1.0-rc2
_April 11, 2017_

Fixed & added a few things:
* added `{ margin-bottom: 0; }` to `p:last-of-type` so last paragraph within any given container will have no bottom margin, so it doesn't get added to the container's padding
* added `p.read-more` class (aligns text to the right)
* adde `button-block` class for buttons (submit inputs, buttons and links with "button" class), to create buttons which will display as a block
* added `-webkit-overflow-scrolling: touch;` to mobile menu, and changed transition from linear to ease, for improved experience on webkit touch devices

### Version 1.0-rc1
_April 7, 2017_

