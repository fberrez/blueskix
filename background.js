console.log('Background script loaded');

// Add this to test if the service worker is active
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === "crossPost") {
    const { text, platform } = request;
    
    // Store the text temporarily
    chrome.storage.local.set({ crossPostText: text }, () => {
      console.log('Text stored:', text);
      // Open the other platform in a new tab
      const url = platform === 'x' ? 
        'https://bsky.app' : 
        'https://x.com/compose/tweet';

      console.log('Opening URL:', url);
      
      chrome.tabs.create({ url }, (tab) => {
        // Wait for the new tab to load, then inject the text
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          console.log('Tab updated:', tabId, tab.id, info);
          if (tabId === tab.id && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            
            // Inject script to fill the text input
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: (savedText, targetPlatform) => {
                setTimeout(() => {
                  console.log('Injecting text:', savedText, targetPlatform);
                  if (targetPlatform === 'x') {
                    // For x
                    const tweetInput = document.querySelector('[data-testid="tweetTextarea_0"]');
                    console.log('Tweet input:', tweetInput);
                    if (tweetInput) {
                      tweetInput.focus();
                      document.execCommand('insertText', false, savedText);
                    }
                  } else {
                    // For Bluesky
                    document.querySelector('[aria-label="Compose new post"]').click()
                    setTimeout(() => {
                      const bskyInput = document.querySelector('[aria-label="Rich-Text Editor"]');
                      console.log('Bsky input:', bskyInput);
                      if (bskyInput) {
                        bskyInput.focus();
                        document.execCommand('insertText', false, savedText);
                      }
                    },1000);
                  }
                }, 1000); // Give the page a second to fully load
              },
              args: [text, platform === 'x' ? 'bluesky' : 'x']
            });
          }
        });
      });
    });
  }
}); 