chrome.storage.sync.get('isEnabled', ({ isEnabled }) => {
    if (isEnabled) {
        document.addEventListener('mouseover', handleMouseOver);
    }
});

let currentTooltip = null; // Store reference to the current tooltip

function handleMouseOver(event) {
    // Prevent interaction with links if the cursor is over the tooltip
    if (event.target.closest('.tooltip')) {
        return;
    }

    const target = event.target.closest('a[href]');
    if (target) {
        const link = target.href;
        const truncatedLink = link.length > 50 ? link.substring(0, 50) + "..." : link;

        // Remove the existing tooltip if it's already displayed
        if (currentTooltip) {
            currentTooltip.remove();
        }

        // Send a message to background.js to analyze the link with the AI model
        chrome.runtime.sendMessage({ action: 'analyzeLink', link }, (response) => {
            const safetyStatus = response.safetyStatus || 'UNKNOWN'; // Default to UNKNOWN if no response

            // Create the tooltip container
            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip'); // Add a class for reference
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#333';
            tooltip.style.color = '#fff';
            tooltip.style.borderRadius = '8px';
            tooltip.style.padding = '12px 16px';
            tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            tooltip.style.zIndex = 1000;
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
            tooltip.style.fontFamily = 'Arial, sans-serif';
            tooltip.style.transition = 'opacity 0.3s ease-in-out';
            tooltip.style.opacity = 0;
            tooltip.style.pointerEvents = 'auto'; // Tooltip remains clickable
            tooltip.style.maxWidth = '300px';
            tooltip.style.fontSize = '14px';

            // Tooltip content with modern design and "Show full URL" functionality
            tooltip.innerHTML = `
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px; color: ${getSafetyColor(safetyStatus)};">
                    ${safetyStatus}
                </div>
                <div style="margin-bottom: 8px;">Risk: This link appears ${safetyStatus.toLowerCase()}</div>
                <div id="shortLink" style="word-break: break-all; margin-bottom: 12px;">
                    Actual URL: <span style="color: #BBDEFB;">${truncatedLink}</span>
                    <a href="#" id="showFullLink" style="color: #00C853; text-decoration: underline; cursor: pointer;">Show full URL</a>
                </div>
                <div id="fullLink" style="display: none; word-break: break-all; margin-bottom: 12px;">
                    Actual URL: <span style="color: #BBDEFB;">${link}</span>
                </div>
                <button style="
                    background-color: #1565C0;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-right: 10px;
                " id="openInVMButton">Open this link in VM</button>
                <button style="
                    background-color: #FF3D00;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                " id="cancelButton">Cancel</button>
            `;

            // Animate the tooltip
            setTimeout(() => {
                tooltip.style.opacity = 1;
            }, 50);

            document.body.appendChild(tooltip);
            currentTooltip = tooltip; // Store the current tooltip

            // Add event listener for "Show full URL"
            const showFullLink = tooltip.querySelector('#showFullLink');
            const fullLinkDiv = tooltip.querySelector('#fullLink');
            const shortLinkDiv = tooltip.querySelector('#shortLink');

            showFullLink.addEventListener('click', (e) => {
                e.preventDefault();
                shortLinkDiv.style.display = 'none';
                fullLinkDiv.style.display = 'block';
            });

            // Handle opening the link in a new tab
            const openInVMButton = tooltip.querySelector('#openInVMButton');
            openInVMButton.addEventListener('click', () => {
                window.open(link, '_blank'); // Open the link in a new tab
            });

            // Handle cancel button
            const cancelButton = tooltip.querySelector('#cancelButton');
            cancelButton.addEventListener('click', () => {
                if (currentTooltip) {
                    currentTooltip.remove();
                    currentTooltip = null;
                }
            });
        });
    }
}

// Helper function to set color based on safety status
function getSafetyColor(status) {
    switch (status) {
        case 'SAFE':
            return '#00C853'; // Green for safe
        case 'DANGEROUS':
            return '#FF3D00'; // Red for dangerous
        default:
            return '#FFC107'; // Yellow for unknown
    }
}
