chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
      disableDarkening: true,
      showProgressBar: true,
      showPlayButton: true,
      showTimeDisplay: true,
      showVolumeControl: true
    });
  });
  