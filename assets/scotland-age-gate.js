(function () {
  const gate = document.getElementById('ScotlandAgeGate');
  if (!gate) return;

  const storageKey = 'scotland_age_verified';
  const cookieName = 'scotland_age_verified=1';

  const hasSessionCookie = () =>
    document.cookie.split(';').some((part) => part.trim() === cookieName);

  const isVerified = () => {
    if (document.documentElement.classList.contains('shopify-design-mode')) {
      return false;
    }

    try {
      if (!hasSessionCookie()) {
        sessionStorage.removeItem(storageKey);
        return false;
      }

      return true;
    } catch (error) {
      return hasSessionCookie();
    }
  };

  const setVerified = () => {
    document.cookie = `${cookieName}; path=/; SameSite=Lax`;

    try {
      sessionStorage.setItem(storageKey, '1');
    } catch (error) {
      /* ignore storage errors */
    }

    document.documentElement.classList.remove('age-gate-active');
    document.documentElement.classList.add('age-gate-verified');
  };

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    /* ignore storage errors */
  }

  if (isVerified()) {
    document.documentElement.classList.remove('age-gate-active');
    document.documentElement.classList.add('age-gate-verified');
    return;
  }

  document.documentElement.classList.add('age-gate-active');
  document.documentElement.classList.remove('age-gate-verified');

  const agreeButton = gate.querySelector('[data-age-gate-agree]');
  const disagreeButton = gate.querySelector('[data-age-gate-disagree]');

  agreeButton?.addEventListener('click', setVerified);

  disagreeButton?.addEventListener('click', () => {
    window.location.href = gate.dataset.disagreeUrl || 'https://www.google.com';
  });
})();
