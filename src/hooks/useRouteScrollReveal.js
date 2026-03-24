import { useEffect } from 'react';
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const useRouteScrollReveal = (containerRef, routeKey) => {
    useEffect(() => {
        const container = containerRef.current;
        const pageRoot = container?.firstElementChild;
        if (!container || !pageRoot)
            return;
        const sections = Array.from(pageRoot.children).filter((node) => node instanceof HTMLElement && !node.hasAttribute('data-no-scroll-reveal'));
        if (!sections.length)
            return;
        sections.forEach((section, index) => {
            section.classList.add('scroll-section');
            section.style.setProperty('--scroll-index', String(index));
        });
        if (prefersReducedMotion()) {
            sections.forEach(section => section.classList.add('is-visible'));
            return () => {
                sections.forEach(section => {
                    section.classList.remove('scroll-section', 'is-visible');
                    section.style.removeProperty('--scroll-index');
                });
            };
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting)
                    return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -10% 0px',
        });
        const frame = window.requestAnimationFrame(() => {
            sections.forEach(section => observer.observe(section));
        });
        return () => {
            window.cancelAnimationFrame(frame);
            observer.disconnect();
            sections.forEach(section => {
                section.classList.remove('scroll-section', 'is-visible');
                section.style.removeProperty('--scroll-index');
            });
        };
    }, [containerRef, routeKey]);
};
