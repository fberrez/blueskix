function addCrossPostCheckbox() {
  // For X
  if (window.location.hostname === 'x.com') {
    const tweetButton = document.querySelector('[data-testid="tweetButton"]');
    if (tweetButton && !document.querySelector('#cross-post-bsky')) {
      const checkboxDiv = document.createElement('div');
      checkboxDiv.innerHTML = `
        <label style="display: flex; align-items: center; margin: 10px 0;">
          <input type="checkbox" id="cross-post-bsky" style="margin-right: 5px;">
          Post to Bluesky
        </label>
      `;
      tweetButton.parentElement.insertBefore(checkboxDiv, tweetButton);

      // Add click listener to tweet button
      tweetButton.addEventListener('click', () => {
        const checkbox = document.querySelector('#cross-post-bsky');
        if (checkbox && checkbox.checked) {
          const tweetText = document.querySelector('[data-testid="tweetTextarea_0"]')?.textContent;
          console.log('Sending tweet text:', tweetText);
          chrome.runtime.sendMessage({
            action: "crossPost",
            text: tweetText,
            platform: 'x'
          });
        }
      });
    }
  }

  // For Bluesky
  if (window.location.hostname === 'bsky.app') {
    const postButton = document.querySelector('[data-testid="composerPublishBtn"]');
    if (postButton && !document.querySelector('#cross-post-x')) {
      const checkboxDiv = document.createElement('div');
      checkboxDiv.innerHTML = `
        <label style="display: flex; align-items: center; margin: 10px 0;">
          <input type="checkbox" id="cross-post-x" style="margin-right: 5px;">
          Post to X
        </label>
      `;
      postButton.parentElement.insertBefore(checkboxDiv, postButton);

      // Add click listener to post button
      postButton.addEventListener('click', () => {
        const checkbox = document.querySelector('#cross-post-x');
        console.log(checkbox.checked);
        if (checkbox && checkbox.checked) {
          const postText = document.querySelector('[aria-label="Rich-Text Editor"]')?.textContent;
          console.log(postText);
          console.log('Sending bsky text:', postText);
          chrome.runtime.sendMessage({
            action: "crossPost",
            text: postText,
            platform: 'bluesky'
          });
        }
      });
    }
  }
}

// Run on page load and monitor for DOM changes
console.log('content.js loaded');
try {
  addCrossPostCheckbox();
  const observer = new MutationObserver(addCrossPostCheckbox);
  observer.observe(document.body, { childList: true, subtree: true });
} catch (error) {
  console.error('Error in content.js:', error);
}
