// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Charger les options sauvegardées
    chrome.storage.sync.get({
      disableDarkening: true,
      showProgressBar: true,
      showPlayButton: true,
      showTimeDisplay: true,
      showVolumeControl: true,
      showButtons: true
    }, function(items) {
      Object.keys(items).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
          checkbox.checked = items[key];
        }
      });
    });
  
    // Gérer les changements
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const options = {
          [this.id]: this.checked
        };
  
        // Sauvegarder l'option
        chrome.storage.sync.set(options);
  
        // Envoyer au content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'UPDATE_STYLE',
            options: options
          });
        });
      });
    });
  });
