(() => {
    const links = Array.from(document.querySelectorAll('.sidebar-nav a'));
    const localLinks = links.filter(link => link.getAttribute('href').startsWith('#'));
    const sections = Array.from(document.querySelectorAll('#main-content > section[id], #main-content > header[id]'));
    let pending = false;

    function updateNavigation() {
        let activeSection = sections[0];
        const marker = Math.min(window.innerHeight * 0.3, 220);
        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= marker) activeSection = section;
        });
        localLinks.forEach(link => {
            const isActive = activeSection && link.hash === `#${activeSection.id}`;
            link.classList.toggle('is-active', Boolean(isActive));
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        pending = false;
    }

    window.addEventListener('scroll', () => {
        if (!pending) {
            pending = true;
            window.requestAnimationFrame(updateNavigation);
        }
    }, { passive: true });
    window.addEventListener('resize', updateNavigation);
    updateNavigation();

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    window.addEventListener('mousemove', event => {
        if (!finePointer.matches || reducedMotion.matches) return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!pointerFrame) {
            pointerFrame = window.requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--spotlight-x', `${pointerX}px`);
                document.documentElement.style.setProperty('--spotlight-y', `${pointerY}px`);
                pointerFrame = 0;
            });
        }
    }, { passive: true });
})();
