if (!customElements.get('hero-slideshow')) {
  class HeroSlideshow extends HTMLElement {
    constructor() {
      super();
      this.currentIndex = 0;
      this.autoplayTimer = null;
      this.isPaused = false;
    }

    connectedCallback() {
      this.track = this.querySelector('[data-hero-slideshow-track]');
      this.slides = Array.from(this.querySelectorAll('[data-hero-slideshow-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-hero-slideshow-dot]'));
      this.prevButton = this.querySelector('[data-hero-slideshow-prev]');
      this.nextButton = this.querySelector('[data-hero-slideshow-next]');

      if (!this.track || this.slides.length === 0) return;

      this.autoplayEnabled = this.dataset.autoplay === 'true';
      this.autoplaySpeed = (parseInt(this.dataset.speed, 10) || 5) * 1000;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      this.bindEvents();
      this.goToSlide(0, false);

      if (this.autoplayEnabled && this.slides.length > 1 && !this.reducedMotion.matches) {
        this.startAutoplay();
      }
    }

    disconnectedCallback() {
      this.stopAutoplay();
    }

    bindEvents() {
      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => {
          this.goToSlide(this.currentIndex - 1);
          this.handleManualInteraction();
        });
      }

      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => {
          this.goToSlide(this.currentIndex + 1);
          this.handleManualInteraction();
        });
      }

      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          this.goToSlide(index);
          this.handleManualInteraction();
        });
      });

      this.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.addEventListener('mouseleave', () => this.resumeAutoplay());
      this.addEventListener('focusin', () => this.pauseAutoplay());
      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) {
          this.resumeAutoplay();
        }
      });

      this.reducedMotion.addEventListener('change', () => {
        if (this.reducedMotion.matches) {
          this.stopAutoplay();
        } else if (this.autoplayEnabled && !this.isPaused) {
          this.startAutoplay();
        }
      });

      let touchStartX = 0;
      this.track.addEventListener(
        'touchstart',
        (event) => {
          touchStartX = event.changedTouches[0].screenX;
        },
        { passive: true }
      );

      this.track.addEventListener(
        'touchend',
        (event) => {
          const touchEndX = event.changedTouches[0].screenX;
          const delta = touchStartX - touchEndX;

          if (Math.abs(delta) < 40) return;

          if (delta > 0) {
            this.goToSlide(this.currentIndex + 1);
          } else {
            this.goToSlide(this.currentIndex - 1);
          }

          this.handleManualInteraction();
        },
        { passive: true }
      );
    }

    normalizeIndex(index) {
      const total = this.slides.length;
      if (total === 0) return 0;
      return ((index % total) + total) % total;
    }

    goToSlide(index, animate = true) {
      if (this.slides.length === 0) return;

      const nextIndex = this.normalizeIndex(index);
      this.currentIndex = nextIndex;

      this.slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === nextIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        slide.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      this.dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === nextIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });

      if (!animate) {
        this.track.setAttribute('aria-live', 'off');
      } else {
        this.track.setAttribute('aria-live', 'polite');
      }
    }

    handleManualInteraction() {
      this.isPaused = true;
      this.stopAutoplay();

      window.setTimeout(() => {
        this.isPaused = false;
        this.resumeAutoplay();
      }, this.autoplaySpeed);
    }

    startAutoplay() {
      if (!this.autoplayEnabled || this.slides.length < 2) return;

      this.stopAutoplay();
      this.autoplayTimer = window.setInterval(() => {
        this.goToSlide(this.currentIndex + 1);
      }, this.autoplaySpeed);
    }

    stopAutoplay() {
      if (this.autoplayTimer) {
        window.clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    pauseAutoplay() {
      this.stopAutoplay();
    }

    resumeAutoplay() {
      if (this.autoplayEnabled && !this.isPaused && this.slides.length > 1 && !this.reducedMotion.matches) {
        this.startAutoplay();
      }
    }
  }

  customElements.define('hero-slideshow', HeroSlideshow);
}
