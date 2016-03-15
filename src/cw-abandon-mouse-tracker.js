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
        debug         : true
    };

    $.CWAbandonMouseTracker = function (custom) {
        // Merge default and user settings
        var settings = $.extend({}, defaults, custom);

        var prop = {
            mousePosY       : null,
            mouseOutHandler : null,
            scrollTime      : null,
            windowTop       : null
        };

        function init() {
            if (typeof $.cookie === 'object' && $.cookie(this.settings.cookieName).length > 0) {
                debug('Cookie set skipping');
                return;
            }

            prop.mousePosY = null;

            prop.mouseOutHandler = mouseOut.bind(this);
            this.mouseMoveHandler = mouseMove.bind(this);
            this.scrollHandler = scroll.bind(this);
            initEvents();
        }

        function initEvents() {
            $(document).bind('mouseout', prop.mouseOutHandler);
            $(document).bind('mousemove', this.mouseMoveHandler);
            if(settings.mobileScroll) {
                $(document).bind('scroll', this.scrollHandler);
            }
        }

        function stopEvents() {
            $(document).unbind('mouseout', prop.mouseOutHandler);
            $(document).unbind('mousemove', this.mouseMoveHandler);
            if(settings.mobileScroll) {
                $(document).unbind('scroll', this.scrollHandler);
            }
        }

        function scroll(e) {
            if(typeof window.matchMedia !== 'function' ||  !window.matchMedia('(max-width: 767px)').matches) {
                debug('matchMedia found');
                prop.scrollTime = null;
                prop.windowTop = null;
                return;
            }

            if(prop.scrollTime && prop.windowTop) {
                var delayInMs = e.timeStamp - prop.scrollTime;
                var offset = getWindowTopPosition() - prop.windowTop;
                var speedInpxPerMs = offset / delayInMs;
                if(speedInpxPerMs < settings.pxPerMs && getWindowTopPosition() < settings.topPosition) {
                    settings.callback();
                    stopEvents();
                }
            }
            prop.scrollTime = e.timeStamp;
            prop.windowTop = getWindowTopPosition();
        }

        function mouseOut(e) {
            e = e ? e : window.event;
            var from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName === "HTML") {
                // If last known mouse position was top 10% of screen
                if(prop.mousePosY < getWindowHeight() / 10) {
                    settings.callback();
                    stopEvents();
                } else {
                    prop.mousePosY = 0;
                }
            }
        }

        function getWindowTopPosition() {
            var doc = document.documentElement;
            debug(doc);
            return (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        }

        function getWindowHeight() {
            var height = window.innerHeight || (window.document.documentElement.clientHeight  || window.document.body.clientHeight);
            debug(height);
            return height;
        }

        function mouseMove(e) {
            debug(e.clientY);
            if(e.clientY < settings.triggerYPos && prop.mousePosY > e.clientY) {
                settings.callback();
                stopEvents();
            }
            prop.mousePosY = e.clientY;
        }

        function debug(message) {
            if (settings.debug && typeof console !== 'undefined' && typeof console.debug !== 'undefined') {
                console.debug(message);
            }
        }

        init();
    };

}));
