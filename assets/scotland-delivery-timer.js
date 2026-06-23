(() => {
  'use strict';

  function parseOperatingDays(raw) {
    if (!raw) return [1, 2, 3, 4, 5];
    return raw
      .split(',')
      .map((value) => parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));
  }

  function isOperatingDay(date, operatingDays) {
    return operatingDays.includes(date.getDay());
  }

  function cloneDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function isAfterCutoff(now, cutoffHour, cutoffMinute) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours > cutoffHour || (hours === cutoffHour && minutes >= cutoffMinute);
  }

  function getNextOperatingDay(date, operatingDays, stepForward) {
    const result = cloneDate(date);
    if (stepForward) {
      result.setDate(result.getDate() + 1);
    }
    while (!isOperatingDay(result, operatingDays)) {
      result.setDate(result.getDate() + 1);
    }
    return result;
  }

  function addOperatingDays(startDate, daysToAdd, operatingDays) {
    const result = cloneDate(startDate);
    let added = 0;

    while (added < daysToAdd) {
      result.setDate(result.getDate() + 1);
      if (isOperatingDay(result, operatingDays)) {
        added += 1;
      }
    }

    return result;
  }

  function getNextCutoffDateTime(now, cutoffHour, cutoffMinute, operatingDays) {
    const todayCutoff = new Date(now);
    todayCutoff.setHours(cutoffHour, cutoffMinute, 0, 0);

    if (isOperatingDay(now, operatingDays) && now < todayCutoff) {
      return todayCutoff;
    }

    let next = cloneDate(now);
    next.setDate(next.getDate() + 1);
    while (!isOperatingDay(next, operatingDays)) {
      next.setDate(next.getDate() + 1);
    }
    next.setHours(cutoffHour, cutoffMinute, 0, 0);
    return next;
  }

  function getDispatchDate(now, cutoffHour, cutoffMinute, operatingDays) {
    const afterCutoff = isAfterCutoff(now, cutoffHour, cutoffMinute);
    const todayIsOperating = isOperatingDay(now, operatingDays);

    if (todayIsOperating && !afterCutoff) {
      return cloneDate(now);
    }

    return getNextOperatingDay(now, operatingDays, true);
  }

  function formatCountdown(diffMs) {
    if (diffMs <= 0) {
      return '0h 0m 0s';
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  function formatDeliveryDate(deliveryDate, now, showDateInParentheses) {
    const tomorrow = cloneDate(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = deliveryDate.toDateString() === tomorrow.toDateString();
    const monthDay = deliveryDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

    if (isTomorrow) {
      if (showDateInParentheses) {
        return {
          label: 'Tomorrow',
          suffix: `(${monthDay})`,
        };
      }
      return { label: 'Tomorrow', suffix: '' };
    }

    const weekday = deliveryDate.toLocaleDateString('en-GB', { weekday: 'long' });
    if (showDateInParentheses) {
      return {
        label: weekday,
        suffix: `(${monthDay})`,
      };
    }

    return { label: weekday, suffix: '' };
  }

  function initBlock(block) {
    if (block.dataset.initialized === 'true') return;
    block.dataset.initialized = 'true';

    const timerEl = block.querySelector('[data-delivery-countdown]');
    const dateLabelEl = block.querySelector('[data-delivery-date-label]');
    const dateSuffixEl = block.querySelector('[data-delivery-date-suffix]');

    if (!timerEl || !dateLabelEl) return;

    const cutoffTime = block.dataset.cutoffTime || '17:00';
    const deliveryDays = parseInt(block.dataset.deliveryDays, 10) || 1;
    const operatingDays = parseOperatingDays(block.dataset.operatingDays);
    const showDateInParentheses = block.dataset.showDateParentheses !== 'false';
    const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map((part) => parseInt(part, 10) || 0);

    function updateDisplay() {
      const now = new Date();
      const nextCutoff = getNextCutoffDateTime(now, cutoffHour, cutoffMinute, operatingDays);

      timerEl.textContent = formatCountdown(nextCutoff - now);

      const dispatchDate = getDispatchDate(now, cutoffHour, cutoffMinute, operatingDays);
      const deliveryDate = addOperatingDays(dispatchDate, deliveryDays, operatingDays);
      const formatted = formatDeliveryDate(deliveryDate, now, showDateInParentheses);

      dateLabelEl.textContent = formatted.label;
      if (dateSuffixEl) {
        dateSuffixEl.textContent = formatted.suffix;
        dateSuffixEl.hidden = !formatted.suffix;
      }
    }

    updateDisplay();
    block._deliveryTimerInterval = window.setInterval(updateDisplay, 1000);
  }

  function initDeliveryBlocks(root) {
    (root || document).querySelectorAll('.scotland-delivery-timer[data-initialized="false"]').forEach(initBlock);
  }

  function resetAndInit(root) {
    (root || document).querySelectorAll('.scotland-delivery-timer').forEach((block) => {
      if (block._deliveryTimerInterval) {
        window.clearInterval(block._deliveryTimerInterval);
        block._deliveryTimerInterval = null;
      }
      block.dataset.initialized = 'false';
    });
    initDeliveryBlocks(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDeliveryBlocks());
  } else {
    initDeliveryBlocks();
  }

  document.addEventListener('shopify:section:load', (event) => {
    resetAndInit(event.target);
  });

  document.addEventListener('shopify:block:select', () => {
    window.setTimeout(() => resetAndInit(), 100);
  });
})();
