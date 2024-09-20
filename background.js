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
                disableExtension();
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
                    const tooltip = document.getElementById('tooltip');
                    if (tooltip) {
                        tooltip.remove();
                    }
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
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// AI Model Integration
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeLink') {
        const link = message.link;

        // Call your cloud-based AI model to analyze the link
        analyzeLinkWithAIModel(link).then((safetyStatus) => {
            sendResponse({ safetyStatus });
        }).catch((error) => {
            console.error('Error analyzing the link:', error);
            sendResponse({ safetyStatus: 'UNKNOWN' }); // In case of an error, return UNKNOWN
        });

        // Return true to indicate that sendResponse will be called asynchronously
        return true;
    }
});

// Function to analyze the link using your cloud-based AI model
async function analyzeLinkWithAIModel(link) {
    try {
        // Send HTTP request to your AI model's API endpoint
        const response = await fetch('https://your-ai-model-cloud-endpoint.com/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your_api_token', // If your API requires authentication
            },
            body: JSON.stringify({ url: link }),
        });

        // Parse the response from the AI model
        const data = await response.json();

        // Extract and return the safety status from the response
        return data.safetyStatus || 'UNKNOWN'; // Adjust this according to your API response structure
    } catch (error) {
        console.error('Error calling AI model:', error);
        return 'UNKNOWN'; // In case of an error, return UNKNOWN
    }
}
