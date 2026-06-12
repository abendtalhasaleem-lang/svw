if (!customElements.get('scotland-logo-marquee')) {
  class ScotlandLogoMarquee extends HTMLElement {
    constructor() {
      super();
      this.resizeObserver = null;
      this.mediaQuery = window.matchMedia('(max-width: 749px)');
    }

    connectedCallback() {
      this.viewport = this.querySelector('[data-marquee-viewport]');
      this.track = this.querySelector('[data-marquee-track]');
      if (!this.viewport || !this.track) return;

      this.onResize = this.setItemWidths.bind(this);
      this.mediaQuery.addEventListener('change', this.onResize);
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.viewport);

      this.setItemWidths();
    }

    disconnectedCallback() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.mediaQuery.removeEventListener('change', this.onResize);
    }

    setItemWidths() {
      const visibleDesktop = parseInt(this.dataset.visibleDesktop, 10) || 8;
      const visibleMobile = parseInt(this.dataset.visibleMobile, 10) || 3;
      const visible = this.mediaQuery.matches ? visibleMobile : visibleDesktop;
      const gap = parseFloat(getComputedStyle(this.viewport).getPropertyValue('--scotland-logo-marquee-gap')) || 16;
      const viewportWidth = this.viewport.clientWidth;

      if (viewportWidth <= 0) return;

      const itemWidth = (viewportWidth - gap * (visible - 1)) / visible;
      this.style.setProperty('--scotland-logo-marquee-item-width', `${itemWidth}px`);
    }
  }

  customElements.define('scotland-logo-marquee', ScotlandLogoMarquee);
}
