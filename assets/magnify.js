const ZOOM_RATIO = 2;

function toggleLoadingSpinner(image) {
  const loadingSpinner = image.parentElement.parentElement.querySelector('.loading__spinner');
  if (loadingSpinner) loadingSpinner.classList.toggle('hidden');
}

function getZoomImageUrl(image) {
  return image.currentSrc || image.src;
}

function prepareOverlay(container, imageUrl) {
  container.setAttribute('class', 'image-magnify-full-size');
  container.setAttribute('aria-hidden', 'true');
  container.style.backgroundImage = `url('${imageUrl}')`;
  container.style.backgroundColor = 'rgb(var(--color-background))';
  container.style.backgroundRepeat = 'no-repeat';
}

function createOverlay(image, { isCancelled } = {}) {
  const imageUrl = getZoomImageUrl(image);
  const overlayImage = document.createElement('img');
  overlayImage.setAttribute('src', imageUrl);
  const overlay = document.createElement('div');
  prepareOverlay(overlay, imageUrl);

  image.style.opacity = '50%';
  toggleLoadingSpinner(image);

  overlayImage.onload = () => {
    if (isCancelled?.()) {
      image.style.opacity = '100%';
      toggleLoadingSpinner(image);
      return;
    }

    toggleLoadingSpinner(image);
    image.parentElement.insertBefore(overlay, image);
    image.style.opacity = '100%';
  };

  overlayImage.onerror = () => {
    image.style.opacity = '100%';
    toggleLoadingSpinner(image);
  };

  return overlay;
}

function moveWithHover(overlay, image, event, zoomRatio) {
  const container = image.getBoundingClientRect();
  if (!container.width || !container.height) return;

  const xPosition = event.clientX - container.left;
  const yPosition = event.clientY - container.top;
  const xPercent = `${(xPosition / container.width) * 100}%`;
  const yPercent = `${(yPosition / container.height) * 100}%`;

  overlay.style.backgroundPosition = `${xPercent} ${yPercent}`;
  overlay.style.backgroundSize = `${container.width * zoomRatio}px auto`;
}

function magnify(image, zoomRatio) {
  const overlay = createOverlay(image);
  overlay.onclick = () => {
    overlay.remove();
    image.style.opacity = '100%';
  };
  overlay.onmousemove = (event) => moveWithHover(overlay, image, event, zoomRatio);
  overlay.onmouseleave = () => {
    overlay.remove();
    image.style.opacity = '100%';
  };
  return overlay;
}

function enableZoomOnHover(zoomRatio = ZOOM_RATIO) {
  document.querySelectorAll('.image-magnify-hover').forEach((image) => {
    image.onclick = (event) => {
      const overlay = magnify(image, zoomRatio);
      moveWithHover(overlay, image, event, zoomRatio);
    };
  });
}

function enableZoomOnHoverMove(zoomRatio = ZOOM_RATIO) {
  document.querySelectorAll('.product__modal-opener--image').forEach((opener) => {
    const image = opener.querySelector('.image-magnify-hover_zoom');
    if (!image || opener.dataset.hoverZoomBound === 'true') return;

    opener.dataset.hoverZoomBound = 'true';
    let overlay = null;
    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
      if (overlay?.isConnected) {
        overlay.remove();
      }
      overlay = null;
      image.style.opacity = '100%';
    };

    opener.addEventListener('mouseenter', (event) => {
      cancelled = false;
      if (overlay?.isConnected) return;

      overlay = createOverlay(image, { isCancelled: () => cancelled });
      moveWithHover(overlay, image, event, zoomRatio);
    });

    opener.addEventListener('mousemove', (event) => {
      if (!overlay) return;
      moveWithHover(overlay, image, event, zoomRatio);
    });

    opener.addEventListener('mouseleave', cleanup);
  });
}

function initProductZoom() {
  if (document.querySelector('.image-magnify-hover')) {
    enableZoomOnHover(ZOOM_RATIO);
  }

  if (document.querySelector('.image-magnify-hover_zoom')) {
    enableZoomOnHoverMove(ZOOM_RATIO);
  }
}

window.enableZoomOnHover = enableZoomOnHover;
window.enableZoomOnHoverMove = enableZoomOnHoverMove;
window.initProductZoom = initProductZoom;

initProductZoom();
