document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const tocToggle = document.querySelector('.toc-toggle');
    const toc = document.getElementById('toc');

    if (tocToggle && toc) {
        tocToggle.addEventListener('click', () => {
            const isOpen = toc.classList.toggle('open');
            tocToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const tocLinks = toc ? toc.querySelectorAll('a[href^="#"]') : [];
    const sections = Array.from(tocLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    const updateActiveLink = () => {
        let currentId = null;
        const offset = 120;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= offset && rect.bottom > offset) {
                currentId = section.id;
            }
        });

        tocLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
});
