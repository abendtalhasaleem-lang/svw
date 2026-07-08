(() => {
  'use strict';

  class ScotlandProductTabs extends HTMLElement {
    connectedCallback() {
      this.buttons = Array.from(this.querySelectorAll('[data-tab-button]'));
      this.panels = Array.from(this.querySelectorAll('[data-tab-panel]'));

      if (!this.buttons.length || !this.panels.length) return;

      this.buttons.forEach((button) => {
        button.addEventListener('click', () => this.activate(button.dataset.tabButton));
      });

      const defaultTab = this.dataset.defaultTab;
      if (defaultTab && this.buttons.some((button) => button.dataset.tabButton === defaultTab)) {
        this.activate(defaultTab);
      }
    }

    activate(tabId) {
      this.buttons.forEach((button) => {
        const isActive = button.dataset.tabButton === tabId;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        button.tabIndex = isActive ? 0 : -1;
      });

      this.panels.forEach((panel) => {
        const isActive = panel.dataset.tabPanel === tabId;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    }
  }

  if (!customElements.get('scotland-product-tabs')) {
    customElements.define('scotland-product-tabs', ScotlandProductTabs);
  }
})();
