/*
 * cw-abandon-mouse-tracker
 *
 *
 * Copyright (c) 2016 Clive Walkden
 * Licensed under the MIT license.
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    // Default plugin settings
    var defaults = {
        callback      : function() {},
        triggerYPos   : 12,
        mobileScroll  : true,
        pxPerMs       : -7,
        topPosition   : 500,
        cookieName    : 'sozo_abandonmousetracker',
        debug         : false
    };

    var prop = {
        mousePosY       : null,
        mouseOutHandler : null,
        mouseMoveHandler: null,
        scroll          : null,
        scrollTime      : null,
        windowTop       : null
    };

    var settings = {};

    var methods = {
        init: function(options) {
            // Merge default and user settings
            settings = $.extend({}, defaults, options);

            if (methods.cookieCheck()) {
                return;
            }

            prop.mousePosY = null;

            prop.mouseOutHandler = methods.mouseOut.bind(this);
            prop.mouseMoveHandler = methods.mouseMove.bind(this);
            prop.scrollHandler = methods.scroll.bind(this);
            methods.initEvents();
        },
        cookieCheck : function() {
            if ($.cookie(settings.cookieName) !== 'undefined' && $.cookie(settings.cookieName) === 'true') {
                methods.debug('Cookie set, not running plugin');
                return true;
            } else if ($.cookie(settings.cookieName) === 'false') {
                methods.debug('Cookie set to false');
            } else {
                methods.debug('Cookie not created');
                methods.cookieCreate();
            }
        },
        cookieSet : function() {
            methods.debug('Cookie set');
            $.cookie(settings.cookieName, 'true');
        },
        cookieCreate : function() {
            methods.debug('Cookie created');
            $.cookie(settings.cookieName, 'false');
        },
        initEvents : function() {
            methods.debug('initEvents called');
            $(document).bind('mouseout', prop.mouseOutHandler);
            $(document).bind('mousemove', prop.mouseMoveHandler);
            if(settings.mobileScroll) {
                $(document).bind('scroll', prop.scrollHandler);
            }
        },
        stopEvents : function() {
            methods.debug('stopEvents called');
            $(document).unbind('mouseout', prop.mouseOutHandler);
            $(document).unbind('mousemove', prop.mouseMoveHandler);
            if(settings.mobileScroll) {
                $(document).unbind('scroll', prop.scrollHandler);
            }
        },
        scroll : function(e) {
            methods.debug('scroll detected');
            if(typeof window.matchMedia !== 'function' ||  !window.matchMedia('(max-width: 767px)').matches) {
                methods.debug('matchMedia found');
                prop.scrollTime = null;
                prop.windowTop = null;
                return;
            }

            if(prop.scrollTime && prop.windowTop) {
                var delayInMs = e.timeStamp - prop.scrollTime;
                var offset = methods.getWindowTopPosition() - prop.windowTop;
                var speedInpxPerMs = offset / delayInMs;
                if(speedInpxPerMs < settings.pxPerMs && methods.getWindowTopPosition() < settings.topPosition) {
                    settings.callback();
                    methods.stopEvents();
                }
            }
            prop.scrollTime = e.timeStamp;
            prop.windowTop = methods.getWindowTopPosition();
        },
        mouseOut : function(e) {
            e = e ? e : window.event;
            var from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName === "HTML") {
                // If last known mouse position was top 10% of screen
                if(prop.mousePosY < methods.getWindowHeight() / 10) {
                    settings.callback();
                    methods.stopEvents();
                } else {
                    prop.mousePosY = 0;
                }
            }
        },
        getWindowTopPosition : function() {
            var doc = document.documentElement;
            methods.debug(doc);
            return (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        },
        getWindowHeight : function() {
            var height = window.innerHeight || (window.document.documentElement.clientHeight  || window.document.body.clientHeight);
            methods.debug(height);
            return height;
        },
        mouseMove : function(e) {
            methods.debug(e.clientY);
            if(e.clientY < settings.triggerYPos && prop.mousePosY > e.clientY) {
                settings.callback();
                methods.stopEvents();
            }
            prop.mousePosY = e.clientY;
        },
        debug : function(message) {
            if (settings.debug && typeof console !== 'undefined' && typeof console.debug !== 'undefined') {
                console.debug(message);
            }
        }
    };

    $.CWAbandonMouseTracker = function (custom) {
        if (methods[custom]) {
            return methods[custom].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof custom === 'object' || ! custom) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  custom + ' does not exist on jQuery.CWAbandonMouseTracker' );
        }
    };

}));
