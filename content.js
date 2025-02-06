let styleElement;

function createStyle(options) {
  const css = `
    /* Masquer complètement les boutons rewind/forward */
    .ftv-magneto--btn[name="btn-rewind"],
    .ftv-magneto--btn[name="btn-forward"],
    div[name="btn-rewind"],
    div[name="btn-forward"] {
      display: ${options.showButtons ? 'flex' : 'none'} !important;
    }
    
    /* Masquer aussi leurs conteneurs parents */
    div[role="button"][name="btn-rewind"],
    div[role="button"][name="btn-forward"],
    div[style*="position: relative"][style*="width: 36px"][style*="height: 36px"] {
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

    /* Contrôle du volume */
    [name="btn-volume"],
    [role="dialog"][aria-label*="volume"] {
      display: ${options.showVolumeControl ? 'flex' : 'none'} !important;
    }

    /* Boutons supplémentaires */
    [name="btn-eco"],
    [name="btn-settings"],
    [name="btn-tracks"],
    [name="btn-fullscreen"],
    [name="btn-rewind"],
    [name="btn-forward"] {
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