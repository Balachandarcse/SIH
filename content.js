chrome.storage.sync.get('isEnabled', ({ isEnabled }) => {
    if (isEnabled) {
        document.addEventListener('mouseover', handleMouseOver);
    }
});

let currentTooltip = null;
let currentRadioButton = null;
let lastHoveredLink = null;

function handleMouseOver(event) {
    const target = event.target.closest('a[href]');
    
    if (target && target !== lastHoveredLink) {
        lastHoveredLink = target;
        const link = target.href;
        const truncatedLink = link.length > 50 ? link.substring(0, 50) + "..." : link;

        if (currentTooltip) currentTooltip.remove();
        if (currentRadioButton) currentRadioButton.remove();

        const rect = target.getBoundingClientRect();

        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.style.position = 'absolute';
        radioButton.style.width = '22px';
        radioButton.style.height = '22px';
        radioButton.style.left = `${rect.left + window.scrollX - 30}px`;
        radioButton.style.top = `${rect.top + window.scrollY}px`;
        radioButton.style.zIndex = 1000;

        document.body.appendChild(radioButton);
        currentRadioButton = radioButton;

        radioButton.addEventListener('click', () => {
            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = '#2d2d2d';
            tooltip.style.color = '#f5f5f5';
            tooltip.style.borderRadius = '10px';
            tooltip.style.padding = '16px';
            tooltip.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
            tooltip.style.zIndex = 1001;
            tooltip.style.left = `${rect.right + window.scrollX + 10}px`;
            tooltip.style.top = `${rect.top + window.scrollY}px`;
            tooltip.style.fontFamily = 'Arial, sans-serif';
            tooltip.style.transition = 'opacity 0.3s ease-in-out';
            tooltip.style.opacity = 0;
            tooltip.style.pointerEvents = 'auto';
            tooltip.style.maxWidth = '320px';
            tooltip.style.fontSize = '14px';
            tooltip.style.display = 'flex';
            tooltip.style.flexDirection = 'column';
            tooltip.style.gap = '8px';
            tooltip.style.wordWrap = 'break-word';  // Prevent URL overflow
            tooltip.style.overflowWrap = 'break-word';  // Break long words properly

            tooltip.innerHTML = `
                <div style="font-weight: bold; font-size: 18px; margin-bottom: 4px; color: #00C853;">SAFE</div>
                <div style="color: #B0BEC5;">Risk: This link appears safe</div>
                <div style="color: #90A4AE;">Actual URL: <span id="displayed-url">${truncatedLink}</span> 
                    <a id="show-full-url" style="color: #64B5F6; text-decoration: underline; cursor: pointer;">Show full URL</a>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <button id="vmButton" style="
                        background-color: #1E88E5;
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        flex: 1;
                        margin-right: 10px;
                    ">Open in VM</button>
                    <button id="closeTooltipButton" style="
                        background-color: #FF5252;
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        flex: 1;
                    ">Cancel</button>
                </div>
            `;

            // Prevent links from being detected when hovering over the popup
            tooltip.addEventListener('mouseover', (e) => e.stopPropagation());

            // Add cancel button functionality
            tooltip.querySelector('#closeTooltipButton').addEventListener('click', () => {
                if (currentTooltip) {
                    currentTooltip.remove();
                    currentTooltip = null;
                }
            });

            // Add VM button functionality
            tooltip.querySelector('#vmButton').addEventListener('click', () => {
                alert('Open this link in VM functionality here.');
            });

            // Show full URL on click
            tooltip.querySelector('#show-full-url').addEventListener('click', () => {
                tooltip.querySelector('#displayed-url').textContent = link;
                tooltip.querySelector('#show-full-url').style.display = 'none'; // Hide the "Show full URL" link
            });

            if (currentTooltip) {
                currentTooltip.remove();
            }
            
            document.body.appendChild(tooltip);
            currentTooltip = tooltip;

            setTimeout(() => {
                tooltip.style.opacity = 1;
            }, 50);
        });
    }
}

document.addEventListener('mouseout', (event) => {
    const target = event.target.closest('a[href]');
    if (target && event.relatedTarget && !event.relatedTarget.closest('a[href]')) {
        if (currentRadioButton && target !== lastHoveredLink) {
            // Keep the tooltip until a new link is hovered or cancel is clicked
        }
    }
});
