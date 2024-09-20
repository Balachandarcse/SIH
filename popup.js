document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggle-switch');
    const statusText = document.querySelector('.status');

    // Restore the previous state of the extension
    chrome.storage.sync.get('isEnabled', ({ isEnabled }) => {
        toggleSwitch.checked = isEnabled;
        statusText.textContent = isEnabled ? 'Extension is on' : 'Extension is off';
    });

    // Listen for the toggle switch change
    toggleSwitch.addEventListener('change', function () {
        const isEnabled = toggleSwitch.checked;
        statusText.textContent = isEnabled ? 'Extension is on' : 'Extension is off';

        // Store the state in Chrome storage
        chrome.storage.sync.set({ isEnabled });

        // Send a message to content.js to enable/disable the hover detection
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: toggleHoverDetection,
                args: [isEnabled]
            });
        });
    });
});

// Function to enable/disable hover detection
function toggleHoverDetection(isEnabled) {
    if (isEnabled) {
        document.addEventListener('mouseover', handleMouseOver);
    } else {
        document.removeEventListener('mouseover', handleMouseOver);
    }
}

function handleMouseOver(event) {
    const target = event.target.closest('a[href]');
    if (target) {
        const link = target.href;
        // Here you can add your AI link safety check logic
        // For now, we'll just log the link to the console
        console.log('Hovered link:', link);
    }
}
