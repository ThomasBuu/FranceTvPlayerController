let styleElement;

function createStyle(options) {
  const css = `
    /* Contrôle du volume - indépendant */
    [name="btn-volume"],
    div[role="dialog"][aria-label*="volume"],
    [name="slider-volume"] {
      display: ${options.showVolumeControl ? 'flex' : 'none'} !important;
    }

    /* Bouton play/pause - indépendant */
    [name="btn-play"] {
      display: ${options.showPlayButton ? 'flex' : 'none'} !important;
    }
    
    /* Masquer les conteneurs des boutons forward/rewind */
    div[style*="position: relative"][style*="width: 36px"][style*="height: 36px"]:has([name="btn-forward"]),
    div[style*="position: relative"][style*="width: 36px"][style*="height: 36px"]:has([name="btn-rewind"]) {
      display: ${options.showButtons ? 'flex' : 'none'} !important;
    }

    /* Masquer les boutons (sauf volume, play/pause et boutons de pause publicitaire) */
    .ftv-magneto--btn:not([name="btn-volume"]):not([name="btn-play"]):not([name="btn-close-adpause"]):not([name="btn-fullscreen-adpause"]):not(.ftv-magneto--labeled-button),
    div[role="button"][name^="btn-"]:not([name="btn-volume"]):not([name="btn-play"]):not([name="btn-close-adpause"]):not([name="btn-fullscreen-adpause"]) {
      display: ${options.showButtons ? 'flex' : 'none'} !important;
    }

    /* Toujours afficher les boutons de pause publicitaire */
    [name="btn-close-adpause"],
    [name="btn-fullscreen-adpause"],
    .pauseroll-retake,
    .ftv-magneto--labeled-button {
      display: flex !important;
    }

    /* Obscurcissement */
    .ftv-magneto-main {
      background: ${options.disableDarkening ? 'transparent' : 'rgba(0,0,0,0.6)'} !important;
      background-image: none !important;
    }

    /* Container de la barre de progression */
    #ftv-magneto--ui-timeline {
      display: ${options.showProgressBar || options.showTimeDisplay ? 'flex' : 'none'} !important;
    }

    /* Barre de progression (le slider lui-même) */
    #ftv-magneto--ui-timeline [role="slider"] {
      display: ${options.showProgressBar ? 'block' : 'none'} !important;
    }

    /* Conteneur du slider (pour cacher la barre grise) */
    #ftv-magneto--ui-timeline > div[style*="flex-grow"] {
      display: ${options.showProgressBar ? 'block' : 'none'} !important;
      margin-left: ${options.showTimeDisplay ? '17px' : '0'} !important;
      margin-right: ${options.showTimeDisplay ? '17px' : '0'} !important;
    }

    /* Affichage du temps */
    .ftv-magneto-time {
      display: ${options.showTimeDisplay ? 'flex' : 'none'} !important;
    }

    /* Autres boutons spécifiques */
    [name="btn-eco"],
    [name="btn-settings"],
    [name="btn-tracks"],
    [name="btn-fullscreen"]:not([name="btn-fullscreen-adpause"]) {
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