let styleElement;

function createStyle(options) {
  const css = `
    /* Contrôle du volume - indépendant */
    [name="btn-volume"],
    div[role="dialog"][aria-label*="volume"],
    [name="slider-volume"] {
      display: ${options.showVolumeControl ? 'flex' : 'none'} !important;
    }
    
    /* Masquer les conteneurs des boutons forward/rewind */
    div[style*="position: relative"][style*="width: 36px"][style*="height: 36px"]:has([name="btn-forward"]),
    div[style*="position: relative"][style*="width: 36px"][style*="height: 36px"]:has([name="btn-rewind"]) {
      display: ${options.showButtons ? 'flex' : 'none'} !important;
    }

    /* Masquer les boutons (sauf volume) */
    .ftv-magneto--btn:not([name="btn-volume"]) {
      display: ${options.showButtons ? 'flex' : 'none'} !important;
    }

    /* Obscurcissement */
    .ftv-magneto-main {
      background: ${options.disableDarkening ? 'transparent' : 'rgba(0,0,0,0.6)'} !important;
      background-image: none !important;
    }

    /* Barre de progression */
    #ftv-magneto--ui-timeline {
      display: ${options.showProgressBar ? 'flex' : 'none'} !important;
    }

    /* Bouton lecture/pause */
    [name="btn-play"] {
      display: ${options.showPlayButton ? 'flex' : 'none'} !important;
    }

    /* Affichage du temps */
    .ftv-magneto-time {
      display: ${options.showTimeDisplay ? 'flex' : 'none'} !important;
    }

    /* Autres boutons spécifiques (sauf volume) */
    [name="btn-eco"],
    [name="btn-settings"],
    [name="btn-tracks"],
    [name="btn-fullscreen"] {
      display: ${options.showButtons ? 'flex' : 'none'} !important;
    }
  `;

  if (!styleElement) {
    styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = css;
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_STYLE') {
    chrome.storage.sync.get(null, (items) => {
      // Fusionner les nouvelles options avec les existantes
      const updatedOptions = { ...items, ...message.options };
      createStyle(updatedOptions);
    });
  }
});

// Initialisation
chrome.storage.sync.get({
  disableDarkening: true,
  showProgressBar: true,
  showPlayButton: true,
  showTimeDisplay: true,
  showVolumeControl: true,
  showButtons: true
}, createStyle);

// Observer pour réappliquer le style si nécessaire
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      if ([...mutation.addedNodes].some(node => 
        node.classList?.contains('ftv-magneto-main') ||
        node.querySelector?.('.ftv-magneto-main')
      )) {
        chrome.storage.sync.get(null, createStyle);
        break;
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});