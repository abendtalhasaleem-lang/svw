(() => {
  class ProductReviewsSlider extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('.product-reviews-slider__slide'));
      if (this.slides.length <= 1) return;

      this.intervalMs = (parseInt(this.dataset.speed, 10) || 5) * 1000;
      this.autoplay = this.dataset.autoplay === 'true';
      this.currentIndex = 0;
      this.timer = null;

      this.showSlide(0);

      if (this.autoplay) {
        this.startAutoplay();
        this.addEventListener('mouseenter', () => this.stopAutoplay());
        this.addEventListener('mouseleave', () => this.startAutoplay());
        this.addEventListener('focusin', () => this.stopAutoplay());
        this.addEventListener('focusout', () => this.startAutoplay());
      }
    }

    disconnectedCallback() {
      this.stopAutoplay();
    }

    showSlide(index) {
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      this.currentIndex = index;
    }

    nextSlide() {
      const nextIndex = (this.currentIndex + 1) % this.slides.length;
      this.showSlide(nextIndex);
    }

    startAutoplay() {
      if (!this.autoplay || this.slides.length <= 1) return;
      this.stopAutoplay();
      this.timer = window.setInterval(() => this.nextSlide(), this.intervalMs);
    }

    stopAutoplay() {
      if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
      }
    }
  }

  if (!customElements.get('product-reviews-slider')) {
    customElements.define('product-reviews-slider', ProductReviewsSlider);
  }
})();
