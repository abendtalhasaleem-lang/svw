(() => {
  const MOBILE_MQ = window.matchMedia('(max-width: 989px)');
  const SECTION_SELECTOR = '.shopify-section:has(.scotland-icon-bar[data-pin-above-header="true"])';

  function getHeaderGroup() {
    return document.querySelector('.shopify-section-group-header-group');
  }

  function pinIconBar(sectionWrapper) {
    const headerGroup = getHeaderGroup();
    if (!headerGroup || !sectionWrapper) return;

    if (!sectionWrapper._scotlandIconBarAnchor) {
      const anchor = document.createComment('scotland-icon-bar-anchor');
      sectionWrapper.parentNode.insertBefore(anchor, sectionWrapper);
      sectionWrapper._scotlandIconBarAnchor = anchor;
    }

    if (MOBILE_MQ.matches) {
      if (sectionWrapper.parentNode !== headerGroup) {
        headerGroup.insertBefore(sectionWrapper, headerGroup.firstChild);
      }
      return;
    }

    if (sectionWrapper._scotlandIconBarAnchor.parentNode) {
      sectionWrapper._scotlandIconBarAnchor.parentNode.insertBefore(
        sectionWrapper,
        sectionWrapper._scotlandIconBarAnchor.nextSibling
      );
    }
  }

  function initPinSections() {
    document.querySelectorAll(SECTION_SELECTOR).forEach((sectionWrapper) => {
      pinIconBar(sectionWrapper);
    });
  }

  initPinSections();
  MOBILE_MQ.addEventListener('change', initPinSections);
  document.addEventListener('shopify:section:load', initPinSections);
})();
