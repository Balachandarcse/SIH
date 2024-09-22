
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ enabled: false });
});

chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get('enabled', (data) => {
        const newStatus = !data.enabled;
        chrome.storage.sync.set({ enabled: newStatus }, () => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: toggleHoverDetection,
                args: [newStatus]
            });

            if (!newStatus) {
                disableExtension(); // Disable and remove all elements if extension is turned off
            }
        });
    });
});

function disableExtension() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // Remove all listeners and clear any extension-related UI elements
                    document.removeEventListener('mouseover', handleMouseOver);
                    document.removeEventListener('mouseout', handleMouseOut);

                    // Remove any existing tooltips and radio buttons
                    const tooltips = document.querySelectorAll('.tooltip');
                    const radioButtons = document.querySelectorAll('input[type="radio"]');
                    tooltips.forEach(tooltip => tooltip.remove());
                    radioButtons.forEach(radio => radio.remove());
                }
            });
        });
    });
}

function toggleHoverDetection(isEnabled) {
    if (isEnabled) {
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
    } else {
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);

        // Clean up any remaining tooltips and radio buttons
        const tooltips = document.querySelectorAll('.tooltip');
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        tooltips.forEach(tooltip => tooltip.remove());
        radioButtons.forEach(radio => radio.remove());
    }
}
