if (!customElements.get('scotland-collection-row')) {
  class ScotlandCollectionRow extends HTMLElement {
    constructor() {
      super();
      this.mediaQuery = window.matchMedia('(max-width: 749px)');
      this.autoplayTimer = null;
      this.onVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    connectedCallback() {
      this.slider = this.querySelector('[data-scr-slider]');
      this.autoplayEnabled = this.dataset.mobileAutoplay === 'true';
      this.autoplaySpeed = (parseInt(this.dataset.autoplaySpeed, 10) || 5) * 1000;

      this.mediaQuery.addEventListener('change', this.handleBreakpointChange.bind(this));
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      this.handleBreakpointChange();
    }

    disconnectedCallback() {
      this.stopAutoplay();
      this.mediaQuery.removeEventListener('change', this.handleBreakpointChange.bind(this));
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }

    handleBreakpointChange() {
      if (this.mediaQuery.matches && this.autoplayEnabled) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    }

    handleVisibilityChange() {
      if (document.hidden) {
        this.stopAutoplay();
      } else {
        this.handleBreakpointChange();
      }
    }

    advanceSlider() {
      if (!this.slider) return;

      const slides = Array.from(this.slider.querySelectorAll('.slider__slide')).filter(
        (slide) => slide.clientWidth > 0
      );

      if (slides.length < 2) return;

      const slideOffset = slides[1].offsetLeft - slides[0].offsetLeft;
      const atEnd =
        Math.ceil(this.slider.scrollLeft + this.slider.clientWidth) >= this.slider.scrollWidth - 1;

      if (atEnd) {
        this.slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        this.slider.scrollBy({ left: slideOffset, behavior: 'smooth' });
      }
    }

    startAutoplay() {
      this.stopAutoplay();

      if (!this.slider) return;

      this.autoplayTimer = window.setInterval(() => {
        if (!this.mediaQuery.matches || document.hidden) return;
        this.advanceSlider();
      }, this.autoplaySpeed);

      this.slider.addEventListener('touchstart', this.pauseAutoplayOnInteraction.bind(this), { passive: true });
      this.slider.addEventListener('mouseenter', this.pauseAutoplayOnInteraction.bind(this));
      this.slider.addEventListener('touchend', this.resumeAutoplayOnInteraction.bind(this), { passive: true });
      this.slider.addEventListener('mouseleave', this.resumeAutoplayOnInteraction.bind(this));
    }

    pauseAutoplayOnInteraction() {
      this.stopAutoplay();
    }

    resumeAutoplayOnInteraction() {
      if (this.mediaQuery.matches && this.autoplayEnabled) {
        this.startAutoplay();
      }
    }

    stopAutoplay() {
      if (this.autoplayTimer) {
        window.clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }
  }

  customElements.define('scotland-collection-row', ScotlandCollectionRow);
}
