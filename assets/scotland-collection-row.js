if (!customElements.get('scotland-collection-row')) {
  class ScotlandCollectionRow extends HTMLElement {
    constructor() {
      super();
      this.mobileQuery = window.matchMedia('(max-width: 749px)');
      this.desktopQuery = window.matchMedia('(min-width: 750px)');
      this.autoplayTimer = null;
      this.currentIndex = 0;
      this.onVisibilityChange = this.handleVisibilityChange.bind(this);
      this.onBreakpointChange = this.handleBreakpointChange.bind(this);
    }

    connectedCallback() {
      this.slider = this.querySelector('[data-scr-slider]');
      this.mobileAutoplayEnabled = this.dataset.mobileAutoplay === 'true';
      this.desktopAutoplayEnabled = this.dataset.desktopAutoplay === 'true';
      this.mobileColumns = parseInt(this.dataset.mobileColumns, 10) || 2;
      this.desktopColumns = parseInt(this.dataset.desktopColumns, 10) || 5;

      this.mobileQuery.addEventListener('change', this.onBreakpointChange);
      this.desktopQuery.addEventListener('change', this.onBreakpointChange);
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      this.handleBreakpointChange();
    }

    disconnectedCallback() {
      this.stopAutoplay();
      this.mobileQuery.removeEventListener('change', this.onBreakpointChange);
      this.desktopQuery.removeEventListener('change', this.onBreakpointChange);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }

    isMobile() {
      return this.mobileQuery.matches;
    }

    isAutoplayActive() {
      if (document.hidden) return false;
      if (this.isMobile()) return this.mobileAutoplayEnabled;
      return this.desktopAutoplayEnabled;
    }

    getAutoplaySpeed() {
      const mobileSpeed = (parseInt(this.dataset.autoplaySpeed, 10) || 5) * 1000;
      const desktopSpeed = (parseInt(this.dataset.desktopAutoplaySpeed, 10) || 5) * 1000;
      return this.isMobile() ? mobileSpeed : desktopSpeed;
    }

    getVisibleColumns() {
      return this.isMobile() ? this.mobileColumns : this.desktopColumns;
    }

    getSlides() {
      if (!this.slider) return [];

      return Array.from(this.slider.querySelectorAll('.slider__slide')).filter(
        (slide) => slide.clientWidth > 0
      );
    }

    getMaxIndex() {
      const slides = this.getSlides();
      const visible = this.getVisibleColumns();
      return Math.max(0, slides.length - visible);
    }

    shouldRunAutoplay() {
      return this.isAutoplayActive() && this.getMaxIndex() > 0;
    }

    handleBreakpointChange() {
      this.currentIndex = this.getIndexFromScroll();

      if (this.shouldRunAutoplay()) {
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

    getIndexFromScroll() {
      const slides = this.getSlides();
      if (!this.slider || slides.length < 2) return 0;

      const slideOffset = slides[1].offsetLeft - slides[0].offsetLeft;
      if (slideOffset <= 0) return 0;

      return Math.min(this.getMaxIndex(), Math.round(this.slider.scrollLeft / slideOffset));
    }

    advanceSlider() {
      if (!this.slider) return;

      const slides = this.getSlides();
      if (slides.length < 2) return;

      const maxIndex = this.getMaxIndex();
      const slideOffset = slides[1].offsetLeft - slides[0].offsetLeft;

      if (this.currentIndex >= maxIndex) {
        this.currentIndex = 0;
        this.slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        this.currentIndex += 1;
        this.slider.scrollTo({ left: slideOffset * this.currentIndex, behavior: 'smooth' });
      }
    }

    startAutoplay() {
      this.stopAutoplay();

      if (!this.slider || !this.shouldRunAutoplay()) return;

      this.currentIndex = this.getIndexFromScroll();

      this.autoplayTimer = window.setInterval(() => {
        if (!this.shouldRunAutoplay()) return;
        this.advanceSlider();
      }, this.getAutoplaySpeed());

      this.bindInteractionHandlers();
    }

    bindInteractionHandlers() {
      if (!this.slider || this.slider.dataset.scrInteractionBound === 'true') return;
      this.slider.dataset.scrInteractionBound = 'true';

      this.pauseOnInteraction = () => this.stopAutoplay();
      this.resumeOnInteraction = () => {
        if (this.shouldRunAutoplay()) this.startAutoplay();
      };

      this.slider.addEventListener('touchstart', this.pauseOnInteraction, { passive: true });
      this.slider.addEventListener('mouseenter', this.pauseOnInteraction);
      this.slider.addEventListener('touchend', this.resumeOnInteraction, { passive: true });
      this.slider.addEventListener('mouseleave', this.resumeOnInteraction);
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
