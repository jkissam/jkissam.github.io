/**
 * Unwritten Future Javascript utilities
 * Jonathan Kissam (plus others as credited)
 * December 2015
 *
 * Table of contents:
 * 1. jQuery extensions
 *  1.1 jQuery.support.placeholder
 *  1.2 jQuery.smartresize
 *  1.3 :external selector
 *  1.4 :youtube selector
 *  1.5 :pdf, :doc, :xls and :ppt selectors
 * 2. uwfUtil object definition
 *  2.1 Default Base Functions
 *   2.1.1 init
 *   2.1.2 addMenuClass
 *   2.1.3 prepareNavigation
 *   2.1.4 prepareMessages
 *   2.1.5 prepareModals
 *   2.1.6 openModal
 *   2.1.7 closeModal
 *  2.2 Optional Functions (controlled by uwfOptions, which can be set in this file or set by CMS)
 *   2.2.1 fixFooter
 *   2.2.2 shortenLinks
 *   2.2.3 prepareExternalLinks
 *   2.2.4 prepareOnThisPage
 *   2.2.5 prepareSectionNavigation
 *  2.3 Helper Functions (available but not called by default)
 *   2.3.1 setCookie
 *   2.3.2 getCookie
 *   2.3.3 populateInputs
 *   2.3.4 preparePopUps
 *   2.3.5 fixOnScroll
 *   2.3.6 equalizeHeight
 *   2.3.7 scrollToInclude
 *   2.3.8 verticalCenter
 * 3. jQuery triggers
 *  3.1 jQuery(document).ready
 *  3.2 jQuery(window).load
 *  3.3 jQuery(document).ajaxComplete
 *  3.4 jQuery(window).smartResize
 * 4. uwfOptions and uwfText (configuration options & text for internationalization/localization)
 *  4.1 uwfOptions
 *  4.2 uwfText
 */

/**
 * 1. jQuery extensions
 */

jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();

(function(jQuery,sr){
 
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;
 
      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null; 
          };
 
          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);
 
          timeout = setTimeout(delayed, threshold || 100); 
      };
  }
	// smartresize 
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
 
})(jQuery,'smartresize');

// Creating custom :external selector
jQuery.expr[':'].external = function(obj){
    if ((obj.href == '#') || (obj.href == '') || (obj.href == null)) { return false; }
    if(obj.href.match(/^mailto\:/)) { return false; }
    if(obj.href.match(/^javascript\:/)) { return false; }
    if ( (obj.hostname == location.hostname)
	|| ('www.'+obj.hostname == location.hostname)
	|| (obj.hostname == 'www.'+location.hostname)
	) { return false; }
    return true;
};

// Creating custom :youtube selector - jQuery selector a:youtube will match any a element that links to a YouTube video
jQuery.expr[':'].youtube = function(obj){ return obj.hostname.match(/(www\.)?youtu(be\.com|\.be)/i); }

// Custom selectors for document links - jQuery selectors a:pdf, a:doc, etc., will match any a element that links to a PDF, Word, etc. document
jQuery.expr[':'].pdf = function(obj) { return obj.hostname.match(/.pdf$/i); }
jQuery.expr[':'].doc = function(obj) { return obj.hostname.match(/.docx?$/i); }
jQuery.expr[':'].xls = function(obj) { return obj.hostname.match(/.xlsx?$/i); }
jQuery.expr[':'].ppt = function(obj) { return obj.hostname.match(/.pptx?$/i); }

/**
 * 2. uwfUtil object definition
 */

uwfUtil = {

	/**
	 * 2.1 default Unwritten Future theme functions
	 */

	// 2.1.1 init
	init : function() {

		// instantiate FastClick (https://github.com/ftlabs/fastclick)
		FastClick.attach(document.body);

		// set up navigation, messages, and modals
		uwfUtil.addMenuClass();
		uwfUtil.prepareNavigation();
		uwfUtil.prepareMessages();
		uwfUtil.prepareModals();

		// validate any forms
		if (jQuery('form').validate && uwfOptions.validateForms) {
			jQuery('form').each(function(){
				jQuery(this).validate();
			});
		}

		// fix footer
		if (uwfOptions.fixFooter) {
			uwfUtil.fixFooter();
		}

		// shorten links
		if (uwfOptions.shortenLinks) {
			uwfUtil.shortenLinks( uwfOptions.shortenLinksSelector );
		}

		// external links
		if (uwfOptions.externalLinks) {
			uwfUtil.prepareExternalLinks(uwfOptions.externalLinksExceptions);
		}
		
		// on-this-page navigation
		if (uwfOptions.onThisPageHeading && uwfOptions.onThisPageNav && uwfOptions.sectionNavigationSelector) {
			uwfUtil.prepareOnThisPage( uwfOptions.onThisPageHeading, uwfOptions.onThisPageNav, uwfOptions.onThisPageMinimumSections );
		}

		// section navigation
		if (uwfOptions.sectionNavigationSelector) {
			uwfUtil.prepareSectionNavigation(uwfOptions.sectionNavigationSelector, uwfOptions.sectionNavigationPadding);
		}
	},
	
	// 2.1.2 add menu class based on mobile break point
	addMenuClass : function() {
		jQuery('body').removeClass('menu-mobile menu-full');
		if (jQuery(window).width() < uwfOptions.mobileBreakPoint) {
			jQuery('body').addClass('menu-mobile');
		} else {
			jQuery('body').addClass('menu-full');
		}
	},

	// 2.1.3 javascript for mobile and drop-down navigation
	prepareNavigation : function(container) {
		jQuery('#navigation .main-menu > ul').append('<li class="dismiss menu-dismiss" title="'+uwfText.dismissMenu+'"></li>');
		jQuery('#navigation .main-menu ul li ul').before('<span class="menu-toggle closed" title="'+uwfText.openSubmenu+'"></span>');
		jQuery('#navigation .menu-toggle').click(function(){
			if (jQuery(this).hasClass('closed')) {
				jQuery(this).removeClass('closed').addClass('open').attr('title',uwfText.closeSubmenu);
				jQuery(this).siblings('ul').addClass('open');
			} else {
				jQuery(this).removeClass('open').addClass('closed').attr('title',uwfText.openSubmenu);
				jQuery(this).siblings('ul').removeClass('open');
			}
		});
		jQuery('#navigation li.has-children > .nolink').click(function(){
			jQuery(this).siblings('.menu-toggle').click();
		});
		jQuery('.navigation-header').click(function(){
			jQuery(this).siblings('.main-menu').children('ul').toggleClass('open');
		});
		jQuery('.menu-dismiss').click(function(){ jQuery(this).parent('.main-menu ul').toggleClass('open'); });

		if (jQuery('#navigation .main-menu > ul').length) {
			var menuHammer = new Hammer(jQuery('#navigation .main-menu > ul')[0]);
			menuHammer.on('panleft', function(event){
				if (jQuery(window).width() < uwfOptions.mobileBreakPoint) { jQuery('#navigation .main-menu > ul').removeClass('open'); }
			});
		}

		jQuery('#site-wrapper').click(function(event){
			var $target = jQuery(event.target);
			if ( !$target.hasClass('navigation-header') && !$target.closest('.navigation-header').length && !$target.hasClass('main-menu') && !$target.closest('.main-menu').length && (jQuery(window).width() < uwfOptions.mobileBreakPoint) ) {
				jQuery('#navigation .main-menu > ul').removeClass('open');
			}
		});

		jQuery(document).keyup(function(event){
			if ( (event.keyCode == 27) && (jQuery(window).width() < uwfOptions.mobileBreakPoint) ) { jQuery('#navigation .main-menu > ul').removeClass('open'); }
		});
	},

	// 2.1.4 make messages dismissable
	prepareMessages : function() {
		jQuery('.messages').each(function(){
			if (jQuery(this).children('.dismiss').length < 1) {
				jQuery(this).prepend('<div class="dismiss" title="'+uwfText.dismissMessage+'"></div>');
				jQuery(this).children('.dismiss').click(function(event){jQuery(this).parent().slideUp();});
			}
		});
	},

	/**
	 * 2.1.5 prepares modals
	 *
	 * any a element which links to the id of a widget in the modal region will automatically open that widget as a modal
	 * or any (clickable) element can be given the class "modal-trigger" and attribute "data-target"
	 * which targets a widget in the modal region
	 * if the element has the attribute "data-modal-options" it will be parsed as a comma-separated list,
	 * and each element will be added to the options object with a "true" flag
	 * i.e., data-modal-options="list,of,options" will result in options = { list:true, of:true, options:true }
	 *
	 * the following functions can also be called programmatically:
	 * - uwfUtil.openModal(selector, options)
	 * selector must be either a jQuery object or selector referring to a widget in the modal regions
	 * options should be a javascript object
	 * currently the only meaningful option is { focusInput : true }, which auto-focuses on the first text input in the widget
	 */
	prepareModals : function() {
		
		jQuery('.modal').each(function(){
			jQuery(this).prepend('<div class="dismiss modal-dismiss primary"><span class="key">[ESC]</span></div>')
		});
		jQuery('.modal-dismiss').attr('title',uwfText.dismissModal)

		jQuery('.modal-dismiss').click(function(event){
			uwfUtil.closeModal();
			event.preventDefault();
		});

		jQuery('#modals-wrapper').click(function(event){
			var $target = jQuery(event.target);
			if ( !$target.hasClass('widget') && !$target.closest('.modal').length ) {
				uwfUtil.closeModal();
			}
		});

		jQuery(document).keyup(function(event){ if (event.keyCode == 27) { uwfUtil.closeModal(); } });

		jQuery('a, .modal-trigger').click(function(event){

			if (jQuery(this).hasClass('external')) { return; }

			var $target;
			var href = jQuery(this).attr('data-target');
			if (!href) { href = jQuery(this).attr('href'); }
			if (!href) { return true; }

			var options = {};
			if (jQuery(this).attr('data-modal-options')) {
				var optionsList = jQuery(this).attr('data-modal-options');
				var optionsListArray = optionsList.split(',');
				for (var i=0; i<optionsListArray.length; i++) {
					options[optionsListArray[i]] = true;
				}
			}

			if (href.substr(0,1) == '#') {
				$target = jQuery(href);
			}

			if ($target.length != 1) { return; }
			if (!$target.hasClass('modal')) { return true; }
			if ($target.closest('#modals').length) {
				event.preventDefault();
				uwfUtil.openModal($target, options);
				return;
			}
			return true;
		});
	},

	// 2.1.6 open modal
	openModal : function(sel, options) {
		if (sel instanceof jQuery) { $el = sel; } else { $el = jQuery(sel); }

		// only open this if it is a widget in the #modals region, and is not already open
		if (!$el.closest('#modals').length || !$el.hasClass('modal')) { return; }
		if ($el.hasClass('open')) { return; }

		jQuery('#modals .modal').hide();
		jQuery('#modals-wrapper').css('display','block');
		$el.css('display','block').addClass('open');
		setTimeout(function(){jQuery('body').addClass('modal-open');}, 0)

		if (options && options.focusInput && ($el.find('input').length > 0) && jQuery('html').hasClass('no-touch')) {
			$el.find('input:first').focus();
		}
	},

	// 2.1.7 close modal
	closeModal : function() {
		jQuery('body').removeClass('modal-open');
		window.setTimeout(function(){ jQuery('#modals .modal').hide().removeClass('open'); jQuery('#modals-wrapper').hide(); }, 1000);
	},

	/**
	 * 2.2 optional functions
	 * theme options determine whether these are called
	 * they could also be called programmatically by child themes or modules
	 */

	// 2.2.1 fixes footer to bottom of the window if the page content is not long enough
	fixFooter : function() {
		var $footer = jQuery('#footer-wrapper');
		var heightOfPage = jQuery(window).height();
		var bottomOfFooter = $footer.offset().top + $footer.outerHeight();
		if ($footer.hasClass('fixed')) {
			if ((jQuery('#site-wrapper').outerHeight() + $footer.outerHeight()) > heightOfPage) { $footer.removeClass('fixed'); }
		} else {
			if (bottomOfFooter < heightOfPage) { $footer.addClass('fixed'); }
		}
	},

	// 2.2.2 find links whose text are URLs which force them to be wider than their parent containers
	// and replaces their inner text with shortened versions of the URL, or "(link)"
	shortenLinks : function( selector ) {
		if (!selector || !selector.length) { selector = 'a'; }
		jQuery( selector ).each(function(){
			
			// don't shorten links inside of buttons
			if (jQuery(this).hasClass('button')) { return; }
			
			if (jQuery(this).width() > jQuery(this).parent().width()) {

				href = jQuery(this).attr('href');
				linktext = jQuery(this).text().trim();
				regex = /(https?:\/\/)?([a-zA-Z0-9\-\.]+)(\/\S*)?/;
				isUrl = regex.exec(linktext);
				if (isUrl !== null && isUrl.length) {
					url = regex.exec(href);
					if ((url !== null) && (url.length > 3) && url[2]) {
						jQuery(this).text(url[2]);
						if (jQuery(this).width() > jQuery(this).parent().width()) {
							jQuery(this).text('(link)');
						}
					} else {
						jQuery(this).text('(link)');
					}
				}

			}
		});
	},

	// 2.2.3 open external links in new windows - exceptions can be a jQuery selector or array of such
	prepareExternalLinks : function(exceptions) {
		var sel;
		if (exceptions instanceof Array) {
			sel = exceptions.join()
		} else {
			sel = exceptions;
		}
		jQuery('a:external').addClass('external');
		jQuery(sel).removeClass('external');
		jQuery('a.external').each(function(){
			var href = jQuery(this).attr('href');
			var title = jQuery(this).attr('title') ? jQuery(this).attr('title') : '';
			title += (title.length > 0) ? ' ' : '';
			title += '('+uwfText.opensNewWindow+')';
			jQuery(this).attr('title',title);
			jQuery(this).click(function(event){
				window.open(href,'','');
				event.preventDefault();
			});
		});
	},
	
	// 2.2.4 create a navigation structure for the page
	prepareOnThisPage : function( header, nav, minimumSections ) {
		if ( jQuery(nav).length < 1 ) { return; }
		if ( jQuery('#content '+header).length < minimumSections ) { jQuery(nav).hide(); return; }
		jQuery(nav).append('<ul class="on-this-page-links"/>');
		var sectionId = '';
		var sectionText = '';
		var sectionNavigationClass = uwfOptions.sectionNavigationSelector.substr(1);
		var sectionNavigationTopLink = '<a class="'+sectionNavigationClass+' section-navigation-top" href="#top">'+uwfText.backToTop+'</a>';
		if (!jQuery('#top').length) {
			jQuery('#site-wrapper').prepend('<div id="top"/>');
		}
		jQuery('#content '+header).each(function(index){
			if (jQuery(this).attr('id') && jQuery(this).attr('id').length) {
				sectionId = jQuery(this).attr('id');
			} else {
				sectionId = jQuery(this).text().toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s/g,'-');
				jQuery(this).attr('id',sectionId);
			}
			sectionText = jQuery(this).text();
			jQuery(nav + ' ul.on-this-page-links').append('<li><a href="#'+sectionId+'" class="'+sectionNavigationClass+'">'+sectionText+'</a></li>');
			if (index) { jQuery(this).before(sectionNavigationTopLink); }
		});
		jQuery('#content').append(sectionNavigationTopLink);
	},

	// 2.2.5 when elements that match a particular jQuery selector
	// and target another element on the page with either href or data-target
	// are clicked, do an animated scroll to that target, leaving at least (padding) pixels at the top
	// clickable element can use data-callback to specify a function that should be called upon scroll completion
	// and data-focus-input="true" to auto-focus the input (on non-touch devices)
	prepareSectionNavigation : function(sel, padding) {
		if (isNaN(padding)) { padding = 20; }
		var $ = jQuery;
		$(sel).click(function(event){
			var target = $(this).attr('href');
			if (!target) { target = $(this).attr('data-target'); }
			if (!target || (target.substr(0,1) != '#')) { return true; }
			var callback = $(this).attr('data-callback');
			var focusInput = $(this).attr('data-focus-input');
			newTop = $(target).offset().top;
			newTop -= padding;
			$('html, body').stop().animate({
				scrollTop: newTop
			}, 500, function() {
				if (focusInput && $(target+' input').length && $('html').hasClass('no-touch')) {
					$(target+' input:first').focus();
				}
				if (typeof callback === 'string') {
					var callbackFn = new Function(callback);
					callbackFn();
				}
			});
			event.preventDefault();
		});
	},

	/**
	 * 2.3 helper functions
	 *
	 * these functions are available to be used by child themes or modules,
	 * but are not called by default
	 */

	// 2.3.1 set cookie
	setCookie : function(c_name,value,exdays) {
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
	},

	// 2.3.2 get cookie
	getCookie : function (c_name) {
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++) {
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if (x==c_name) {
				return unescape(y);
			}
		}
	},

	// 2.3.3 populate inputs with the value of their labels
	// use selector to target inputs
	populateInputs : function(selector) {
		jQuery(selector).each(function() {
			var populate_text = jQuery('label[for="' + jQuery(this).attr('id') + '"]:first').text();
			if (populate_text) {
				if (jQuery.support.placeholder) {
					jQuery(this).attr('placeholder',populate_text);
				} else {
					jQuery(this).val(populate_text).data('populate_text', populate_text);
					jQuery(this).addClass('populated');				
					jQuery(this).focus(function() {
						if (jQuery(this).val() == jQuery(this).data('populate_text')) {
							jQuery(this).val('');
							jQuery(this).removeClass('populated');
						}
					});
					jQuery(this).blur(function() {
						if (jQuery(this).val() == '') {
							jQuery(this).val(jQuery(this).data('populate_text'));
							jQuery(this).addClass('populated');
						}
					});
				}
			}
		});
	},

	// 2.3.4 open pop-up windows on particular links, by selector
	preparePopUps : function(sel,w,h) {
		jQuery(sel).click(function(event){
			var left = (screen.width - w)/2;
			var top = (screen.height - h)/2;
			top = (top < 50) ? 50 : top;
			var attr = 'height='+h+',width='+w+',left='+left+',top='+top+',location=0,menubar=0,status=0';
			window.open(jQuery(this).attr('href'),'popup',attr);
			event.preventDefault();
		});
	},

	// 2.3.5 adds class "fixed" to a particular element when the page scrolls past maxScroll pixels
	// also adds class to the body based on the id of the element
	fixOnScroll : function(sel, maxScroll) {
		var scrollElementId = jQuery(sel).attr('id') ? jQuery(sel).attr('id') : '';
		jQuery(window).scroll(function(){
			var pos = jQuery(window).scrollTop();
			if (pos > maxScroll) {
				jQuery(sel).addClass('fixed');
				if (scrollElementId) { jQuery('body').addClass(scrollElementId+'-fixed'); }
			} else {
				jQuery(sel).removeClass('fixed');
				if (scrollElementId) { jQuery('body').removeClass(scrollElementId+'-fixed'); }
			}
		});
	},

	// 2.3.6 sets vertical height of all matched elements to the same height (the maximum)
	// provided the window is at least minWidth (defaults to not doing this on anything narrower than an iPad)
	equalizeHeight : function(sel, minWidth) {
		if (!minWidth) { minWidth = 768; }
		var h = 0;
		jQuery(sel).css('height','auto').removeClass('fixed-height');
		if (jQuery(window).width() < minWidth) { return; }
		jQuery(sel).each(function(){
			var thisH = jQuery(this).outerHeight();
			// console.log('#'+jQuery(this).attr('id')+' height: '+thisH);
			if (thisH > h) { h = thisH; }
		});
		jQuery(sel).css('height',h+'px').addClass('fixed-height');
	},

	// 2.3.7 scroll the page to include a particular element, with at least (padding) pixels at the top
	// element may be jQuery object or jQuery selector, padding should be a number, optional callback function
	scrollToInclude : function(sel, padding, callback) {
		if (sel instanceof jQuery) { $el = sel; } else { $el = jQuery(sel); }
		if (isNaN(padding)) { padding = 20; }
		if (!$el.length || ($el.css('display') == 'none')) { return; }
		var newTop = $el.offset().top - padding;
		if (newTop > jQuery(window).scrollTop()) {
			jQuery('html, body').stop().animate({
				scrollTop : newTop
			}, 500, function(){
				if (typeof callback === 'string') {
					var callbackFn = new Function(callback);
					callbackFn();
				}
			});
		}
	},

	// vertically center the element relative to another element
	// both may be jQuery objects or jQuery selectors
	verticalCenter : function(sel, relativeTo) {
		if (sel instanceof jQuery) { $el = sel; } else { $el = jQuery(sel); }
		if (relativeTo == null) { relativeTo = window; }
		if (relativeTo instanceof jQuery) { $relativeTo = relativeTo; } else { $relativeTo = jQuery(relativeTo); }
		var newTop = ( $relativeTo.height() - $el.outerHeight() ) / 2;
		if (newTop >= 0) { $el.css('top',newTop+'px'); }
	},

}

/**
 * 3.1 jQuery(document).ready
 */
jQuery(document).ready(function($){
	uwfUtil.init();
});

/**
 * 3.2 jQuery(window).load
 */
jQuery(window).load(function(){
	if (uwfOptions.fixFooter) { uwfUtil.fixFooter(); }
	if (uwfOptions.shortenLinks) { uwfUtil.shortenLinks( uwfOptions.shortenLinksSelector ); }
});

/**
 * 3.3 jQuery(document).ajaxComplete
 */
jQuery(document).ajaxComplete(function() {
	uwfUtil.prepareMessages();
	if (uwfOptions.fixFooter) { uwfUtil.fixFooter(); }
	if (uwfOptions.shortenLinks) { uwfUtil.shortenLinks( uwfOptions.shortenLinksSelector ); }
});

/**
 * 3.4 jQuery(window).smartresize()
 */
jQuery(window).smartresize(function(){
	uwfUtil.addMenuClass();
	if (uwfOptions.fixFooter) { uwfUtil.fixFooter(); }
	if (uwfOptions.shortenLinks) { uwfUtil.shortenLinks( uwfOptions.shortenLinksSelector ); }
});

/**
 * 4. uwfOptions and uwfText
 *
 * these can be set programatically before calling uwfutil.js
 */

/**
 * 4.1 uwfOptions : configuring javascript behavior
 */
if (typeof uwfOptions == 'undefined') {
	uwfOptions = {
		validateForms : true,
		fixFooter : false,
		shortenLinks : true,
		shortenLinksSelector : 'a',
		externalLinks : true,
		externalLinksExceptions : '',
		sectionNavigationSelector : '.section-navigation',
		sectionNavigationPadding : 20,
		mobileBreakPoint : 768,
		onThisPageHeading : 'h2',
		onThisPageNav : '#on-this-page',
		onThisPageMinimumSections : 2
	}
}

/**
 * 4.1 uwfText : text displayed by Javascript (for internationalization & localization)
 */
if (typeof uwfText == 'undefined') {
	uwfText = {
		dismissMenu : 'Dismiss menu',
		openSubmenu : 'Open submenu',
		closeSubmenu : 'Close submenu',
		dismissMessage : 'Dismiss message',
		dismissModal : 'Dismiss modal',
		opensNewWindow : 'Opens in a new window',
		backToTop : 'Back to top',
	}
}
