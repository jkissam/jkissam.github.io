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
 *   2.1.2 prepareNavigation
 *   2.1.3 prepareMessages
 *   2.1.4 prepareModals
 *   2.1.5 openModal
 *   2.1.6 closeModal
 *  2.2 Optional Functions (controlled by uwfOptions, which can be set in this file or set by CMS)
 *   2.2.1 fixFooter
 *   2.2.2 shortenLinks
 *   2.2.3 prepareExternalLinks
 *   2.2.4 prepareSectionNavigation
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

		// set up navigation, messages, and modals/reveals
		// uwfUtil.prepareNavigation();
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
			uwfUtil.shortenLinks();
		}

		// external links
		if (uwfOptions.externalLinks) {
			uwfUtil.prepareExternalLinks(uwfOptions.externalLinksExceptions);
		}

		// section navigation
		if (uwfOptions.sectionNavigationSelector) {
			uwfUtil.prepareSectionNavigation(uwfOptions.sectionNavigationSelector, uwfOptions.sectionNavigationPadding);
		}
	},

	// 2.1.2 javascript for mobile and drop-down navigation
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
			if (jQuery(window).width() < uwfOptions.mobileBreakPoint) { uwfUtil.closeReveal(); }
		});
		jQuery('.menu-dismiss').click(function(){ jQuery(this).parent('.main-menu ul').toggleClass('open'); });

		var menuHammer = new Hammer(jQuery('#navigation .main-menu > ul')[0]);
		menuHammer.on('panleft', function(event){
			if (jQuery(window).width() < uwfOptions.mobileBreakPoint) { jQuery('#navigation .main-menu > ul').removeClass('open'); }
		});

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

	// 2.1.3 make messages dismissable
	prepareMessages : function() {
		jQuery('.messages').each(function(){
			if (jQuery(this).children('.dismiss').length < 1) {
				jQuery(this).prepend('<div class="dismiss" title="'+uwfText.dismissMessage+'"></div>');
				jQuery(this).children('.dismiss').click(function(event){jQuery(this).parent().slideUp();});
			}
		});
	},

	/**
	 * 2.1.4 prepares modals and reveals
	 *
	 * any a element which links to the id of a widget in the modal region will automatically open that widget as a modal
	 * any a element which links to the id of a widget in a reveal region will automatically open that widget as a reveal
	 * or any (clickable) element can be given the class "modal-trigger" or "reveal-trigger" and attribute "data-target"
	 * which targets a widget in the modal region, or a reveal region
	 * if the element has the attribute "data-modal-options" or "data-reveal-options" it will be parsed as a comma-separated list,
	 * and each element will be added to the options object with a "true" flag
	 * i.e., data-modal-options="list,of,options" will result in options = { list:true, of:true, options:true }
	 *
	 * the following functions can also be called programmatically:
	 * - uwfUtil.openModal(selector, options)
	 * - uwfUtil.openReveal(selector, options)
	 * selector must be either a jQuery object or selector referring to a widget in the modal or reveal regions
	 * options should be a javascript object
	 * currently the only meaningful option is { focusInput : true }, which auto-focuses on the first text input in the widget
	 */
	prepareModals : function() {
		
		jQuery('.modal-dismiss').attr('title',uwfText.dismissModal)

		jQuery('.modal-dismiss').click(function(event){
			uwfUtil.closeModal();
			event.preventDefault();
		});

		jQuery('#modals-wrapper').click(function(event){
			var $target = jQuery(event.target);
			if ( !$target.hasClass('widget') && !$target.closest('.widget').length ) {
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

	// 2.1.5 open modal
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

	// 2.1.6 close modal
	closeModal : function() {
		jQuery('body').removeClass('modal-open');
		window.setTimeout(function(){ jQuery('#modals .modal').hide().removeClass('open'); jQuery('#modals-wrapper').hide(); }, 1000);
	},

	// 2.1.7 open reveal
	openReveal : function(sel, options) {
		if (sel instanceof jQuery) { $el = sel; } else { $el = jQuery(sel); }

		// only open this if it is a widget in a reveal region, and is not already open
		if (!$el.closest('.reveal').length || !$el.hasClass('widget')) { return; }
		if ($el.hasClass('open')) { return; }

		revealClassToAdd = ($el.closest('.reveal').attr('id') == 'reveal-left-wrapper') ? 'reveal-left' : 'reveal-right';

		if (jQuery('body').hasClass('reveal-left') || jQuery('body').hasClass('reveal-right')) {
			jQuery('body').removeClass('reveal-left reveal-right');
			setTimeout(function(){
				jQuery('.reveal .widget').hide();
				$el.show().addClass('open');
				jQuery('body').addClass(revealClassToAdd);
			}, 150);
		} else {
			$el.show().addClass('open');
			jQuery('body').addClass(revealClassToAdd);
		}

		if (options && options.focusInput && ($el.find('input').length > 0) && jQuery('html').hasClass('no-touch')) {
			$el.find('input:first').focus();
		}
	},

	// 2.1.8 close reveal
	closeReveal : function() {
		jQuery('body').removeClass('reveal-left reveal-right');
		setTimeout(function(){
			jQuery('.reveal .widget').hide().removeClass('open');
		}, 150);
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

	// 2.2.2 finds links which contain URLs longer than their parent containers
	// and replaces their inner text with shortened versions of the URL, or "(link)"
	shortenLinks : function() {
		jQuery('a').each(function(){
			if (jQuery(this).width() > jQuery(this).parent().width()) {

				href = jQuery(this).attr('href');
				linktext = jQuery(this).text();
				regex = /(https?:\/\/)?([a-zA-Z0-9\-\.]+)\/\S*/;
				isUrl = regex.exec(linktext);
				if (isUrl !== null && isUrl.length) {
					url = regex.exec(href);
					if ((url !== null) && (url.length > 3) && url[2]) {
						jQuery(this).text('('+url[2]+')');
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

	// 2.2.4 when elements that match a particular jQuery selector
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
		var newTop = $el.offset().top + $el.outerHeight + padding;
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
	
	existsOpenContentSection : false,
	
	openContentSection : function(target) {
		if (!target || !jQuery(target).length || !jQuery(target).hasClass('content-section')) { return; }
		
		jQuery(target).addClass('open');
		jQuery('body').addClass('content-section-open');
				
		// if there are any sections linked to by a content-section-prev link,
		// open them "under" this section
		jQuery(target).find('a.content-section-prev').each(function(){
			uwfUtil.openContentSection(jQuery(this).attr('href'));
		});
	},
	
	closeContentSection : function(target) {
		if (!target || !jQuery(target).length || !jQuery(target).hasClass('content-section')) { return; }
		jQuery(target).removeClass('open');
		if (!uwfUtil.existsOpenContentSection) { jQuery('.content-section').removeClass('open'); }
		if (!jQuery('.content-section.open').length) {
			jQuery('body').removeClass('content-section-open');
			uwfUtil.existsOpenContentSection = false;
			window.location.hash = '';
		} else {
			var currentId = jQuery('.content-section.open').eq(jQuery('.content-section.open').length - 1).attr('id');
			window.location.hash = currentId;
		}
	},
	
	closeAllContentSections : function() {
		jQuery('.content-section').removeClass('open');
		jQuery('body').removeClass('content-section-open');
		uwfUtil.existsOpenContentSection = false;
		window.location.hash = '';
	}

}

/**
 * 3.1 jQuery(document).ready
 */
jQuery(document).ready(function($){
	uwfUtil.init();
	uwfUtil.populateInputs('.populate');
	
	// replace SVGs with PNGs for browsers that don't support them
	if (!$('html').hasClass('svg')) {
		$('.nav-link img').each(function(){
			$(this).attr('src',$(this).attr('src').replace('.svg','.png'));
		});
	}
	
	// load feature images on larger devices
	if ($(window).width() > 767) {
		$('.feature-image').each(function(){
			var sectionId = $(this).closest('.content-section').attr('id');
			if (sectionId && sectionId.length) {
				$(this).append('<img src="images/feature-'+sectionId+'.jpg" />');
				if ($(this).attr('data-link')) {
					$(this).wrapInner('<a href="'+$(this).attr('data-link')+'"></a>');
				}
			}
		});
	}
	
	// page back through right pans on touch devices
	jQuery('.content-section').wrapInner('<div class="content-section-inner"/>').each(function(){
		var sectionHammer = new Hammer(this);
		var target = '#' + jQuery(this).attr('id');
		sectionHammer.on('swiperight', function(event){
			uwfUtil.closeContentSection( target );
		});
	});
	jQuery('.content-section-inner').prepend('<span class="dismiss"/>').append('<div class="border"></div>');;
	
	// clicking the dismiss button or the wrapper closes *all* content sections
	jQuery('.content-section .dismiss').click(function(event){
		uwfUtil.closeAllContentSections();
		event.preventDefault();
	});
	
	jQuery('.content-section-wrapper').click(function(event){
		uwfUtil.closeAllContentSections();
		event.preventDefault();
	});
	
	jQuery('a').click(function(event) {
		var target = jQuery(this).attr('href');
		if (target.indexOf('#') !== 0) { return; }
		// if (!jQuery(target).length || !jQuery(target).hasClass('content-section')) { return true; }
		if (jQuery(this).closest('.content-section').length) {
			uwfUtil.existsOpenContentSection = true;
		}
		if (jQuery(this).hasClass('content-section-prev')) {
			target = jQuery(this).closest('.content-section').attr('id');
			uwfUtil.closeContentSection('#'+target);
			event.preventDefault();
		} else {
			uwfUtil.openContentSection(target);
			window.location.hash = target;
			event.preventDefault();
		}
	});
	
	jQuery('#Field4').focus(function(){
		jQuery(this).css('height','auto');
	});
	jQuery('#Field4').blur(function(){
		if ( (jQuery(this).val().length < 35) && (jQuery(window).width() < 768) ) {
			jQuery(this).css('height','39px');
		}
	});

	/*
	jQuery('.nav-link a').click(function(event) {
		var target = jQuery(this).attr('href');
		// console.log(target);
		if (jQuery(target).length && jQuery(target).hasClass('content-section')) {
			jQuery(target).addClass('open');
			jQuery('body').addClass('content-section-open');
			event.preventDefault();
		}
	});
	
	jQuery('.content-section-nav a').click(function(event){
		event.preventDefault();
		var next = jQuery(this).hasClass('content-section-next');
		if (jQuery('.content-section.open').length) {
			var $next = jQuery(this).attr('href') ? jQuery(jQuery(this).attr('href')) : (next ? jQuery('.content-section.open').next('.content-section') : jQuery('.content-section.open').prev('.content-section'));
			if ($next.length) {
				$self = jQuery('.content-section.open');
				$next.addClass('open');
				window.setTimeout(function(){ $self.removeClass('open'); }, 300)
			} else {
				jQuery('.content-section').removeClass('open');
				jQuery('body').removeClass('content-section-open');
			}
		} else {
			jQuery('.content-section').eq(0).addClass('open');
			jQuery('body').addClass('content-section-open');
		}
	});
	*/
	
});

/**
 * 3.2 jQuery(window).load
 */
jQuery(window).load(function(){
	if (uwfOptions.fixFooter) { uwfUtil.fixFooter(); }
	if (uwfOptions.shortenLinks) { uwfUtil.shortenLinks(); }
		
	if (jQuery(window.location.hash).length && jQuery(window.location.hash).hasClass('content-section')) {
		jQuery('#spinner').show();
		window.setTimeout(function(){
			jQuery('#spinner').hide();
			uwfUtil.openContentSection(window.location.hash);
		}, 2000);
	}
});

/**
 * 3.3 jQuery(document).ajaxComplete
 */
jQuery(document).ajaxComplete(function() {
	uwfUtil.prepareMessages();
	if (uwfOptions.fixFooter) { uwfUtil.fixFooter(); }
	if (uwfOptions.shortenLinks) { uwfUtil.shortenLinks(); }
});

/**
 * 3.4 jQuery(window).smartresize()
 */
jQuery(window).smartresize(function(){
	if (uwfOptions.fixFooter) { uwfUtil.fixFooter(); }
	if (uwfOptions.shortenLinks) { uwfUtil.shortenLinks(); }});

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
		fixFooter : true,
		shortenLinks : true,
		externalLinks : true,
		externalLinksExceptions : '',
		sectionNavigationSelector : '.section-navigation',
		sectionNavigationPadding : 20,
		mobileBreakPoint : 768
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
	}
}
