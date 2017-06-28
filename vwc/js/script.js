/**
 *  When creating a new site, app or theme, rename this file,
 *  change link in index.html, and put all
 *  site/app/theme-specific javascript here so it is not
 *  overridden by updates from unwritten_future
 *
 *  uwfOptions and uwfText can be updated/overridden at the top of this file
 */

/**
 *  jQuery(document).ready
 */
jQuery(document).ready(function($){
	jQuery(window).scroll(function(){
			var pos = jQuery(window).scrollTop();
			if (pos > 60) {
				jQuery('body').addClass('scrolled');
			} else {
				jQuery('body').removeClass('scrolled');
			}
	});
});

/**
 *  jQuery(window).load
 */
jQuery(window).load(function(){
	
});

/**
 *  jQuery(document).ajaxComplete
 */
jQuery(document).ajaxComplete(function() {
	
});

/**
 *  jQuery(window).smartresize()
 */
jQuery(window).smartresize(function(){
	
});