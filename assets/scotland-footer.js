(() => {
  const DIAL_CODES = {
    GB: '44',
    US: '1',
    CA: '1',
    AU: '61',
    IE: '353',
    NZ: '64',
  };

  function formatPhone(raw, countryCode) {
    const trimmed = (raw || '').trim();
    if (!trimmed) return '';

    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';

    if (trimmed.startsWith('+')) {
      return `+${digits}`;
    }

    const dialCode = DIAL_CODES[countryCode] || DIAL_CODES.GB;
    const localDigits = digits.replace(/^0+/, '');

    if (localDigits.startsWith(dialCode)) {
      return `+${localDigits}`;
    }

    return `+${dialCode}${localDigits}`;
  }

  function prepareFooterNewsletterForm(form) {
    const phoneInput = form.querySelector('[data-scotland-footer-phone-input]');
    const noteInput = form.querySelector('[data-scotland-footer-note]');
    const tagsInput = form.querySelector('[data-scotland-footer-tags]');

    if (!phoneInput || !noteInput || !tagsInput) return;

    const countryCode = (form.dataset.defaultPhoneCountry || 'GB').toUpperCase();
    const enableMarketingConsent = form.dataset.enablePhoneMarketing !== 'false';
    const rawPhone = (phoneInput.value || '').trim();
    const formattedPhone = formatPhone(rawPhone, countryCode) || rawPhone;

    if (!rawPhone) {
      noteInput.value = '';
      tagsInput.value = 'newsletter';
      return;
    }

    noteInput.value = formattedPhone;

    if (enableMarketingConsent) {
      tagsInput.value = 'newsletter,sms-subscriber,whatsapp-subscriber';
    } else {
      tagsInput.value = 'newsletter';
    }
  }

  function initFooterNewsletter(form) {
    form.addEventListener('submit', () => {
      prepareFooterNewsletterForm(form);
    });
  }

  function init() {
    document.querySelectorAll('[data-scotland-footer-newsletter]').forEach(initFooterNewsletter);
  }

  window.scotlandFooterPrepareNewsletter = prepareFooterNewsletterForm;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
