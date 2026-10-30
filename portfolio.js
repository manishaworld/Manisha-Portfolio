/**
 * Application UI Enhancements
 * Handles scroll-spy navigation and spotlight cursor effects.
 */
(() => {
    'use strict';

    // ========================================================================
    // 1. Scroll-Spy Navigation (IntersectionObserver Pattern)
    // ========================================================================
    const initScrollSpy = () => {
        // Use the native CSS engine to filter hash links instead of JS .filter()
        const links = Array.from(document.querySelectorAll('.sidebar-nav a[href^="#"]'));
        if (!links.length) return;

        // Cache a Map of ID -> Anchor Element for O(1) lookups during scroll
        const linkMap = new Map();
        links.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            if (targetId) linkMap.set(targetId, link);
        });

        const sections = document.querySelectorAll('#main-content > section[id], #main-content > header[id]');
        if (!sections.length) return;

        // IntersectionObserver eliminates the need for expensive scroll events 
        // and getBoundingClientRect() layout thrashing.
        const observerOptions = {
            root: null,
            // Triggers when a section intersects the top 20% to 25% of the viewport
            rootMargin: '-20% 0px -75% 0px', 
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.id;

                    // Batch DOM updates: clear old states, set new state
                    links.forEach(link => {
                        link.classList.remove('is-active');
                        link.removeAttribute('aria-current');
                    });

                    const activeLink = linkMap.get(activeId);
                    if (activeLink) {
                        activeLink.classList.add('is-active');
                        activeLink.setAttribute('aria-current', 'location');
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
    };

    // ========================================================================
    // 2. Spotlight Cursor Tracking
    // ========================================================================
    const initSpotlight = () => {
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        let pointerFrame = null;

        const handleMouseMove = (event) => {
            // Early exit respects accessibility and skips tracking on touch devices
            if (!finePointer.matches || reducedMotion.matches) return;

            // Debounce via requestAnimationFrame to lock updates to screen refresh rate
            if (!pointerFrame) {
                const { clientX, clientY } = event;
                
                pointerFrame = window.requestAnimationFrame(() => {
                    document.documentElement.style.setProperty('--spotlight-x', `${clientX}px`);
                    document.documentElement.style.setProperty('--spotlight-y', `${clientY}px`);
                    pointerFrame = null; // Release the lock
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
    };

    // ========================================================================
    // Initialization
    // ========================================================================
    const bootstrap = () => {
        initScrollSpy();
        initSpotlight();
    };

    // Safely initialize regardless of where the <script> tag is placed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
