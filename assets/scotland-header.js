(() => {
  const HEADER_SELECTOR = '.scotland-header';
  const MENU_SELECTOR = `${HEADER_SELECTOR} header-menu`;
  const DRAWER_SELECTOR = `${HEADER_SELECTOR} header-drawer`;
  const DESKTOP_MQ = window.matchMedia('(min-width: 990px)');

  function bindHoverMenus() {
    document.querySelectorAll(MENU_SELECTOR).forEach((menu) => {
      if (menu.dataset.scotlandHoverBound === 'true') return;
      menu.dataset.scotlandHoverBound = 'true';

      const details = menu.querySelector('details');
      if (!details) return;

      let closeTimer;

      const open = () => {
        if (!DESKTOP_MQ.matches) return;
        window.clearTimeout(closeTimer);
        details.setAttribute('open', '');
        details.querySelector('summary')?.setAttribute('aria-expanded', 'true');
      };

      const close = () => {
        if (!DESKTOP_MQ.matches) return;
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => {
          details.removeAttribute('open');
          details.querySelector('summary')?.setAttribute('aria-expanded', 'false');
        }, 180);
      };

      menu.addEventListener('mouseenter', open);
      menu.addEventListener('mouseleave', close);
      menu.addEventListener('focusin', open);
      menu.addEventListener('focusout', (event) => {
        if (!menu.contains(event.relatedTarget)) close();
      });

      details.querySelector('summary')?.addEventListener('click', () => {
        window.clearTimeout(closeTimer);
      });
    });
  }

  function bindDrawerMenuLinks() {
    document.querySelectorAll(DRAWER_SELECTOR).forEach((drawer) => {
      if (drawer.dataset.scotlandDrawerBound === 'true') return;
      drawer.dataset.scotlandDrawerBound = 'true';

      drawer.querySelectorAll('.scotland-drawer__menu-link').forEach((link) => {
        link.addEventListener('click', (event) => {
          event.stopPropagation();
        });
      });
    });
  }

  function init() {
    bindHoverMenus();
    bindDrawerMenuLinks();
  }

  init();
  document.addEventListener('shopify:section:load', init);
})();
