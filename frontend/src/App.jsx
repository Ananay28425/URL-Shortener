const API_BASE_URL = 'http://localhost:8000/api/v1';

// Event listeners
document.getElementById('shortenForm').addEventListener('submit', handleShortenURL);

// Load URLs on page load
document.addEventListener('DOMContentLoaded', loadAllUrls);

async function handleShortenURL(e) {
    e.preventDefault();
    
    const urlInput = document.getElementById('urlInput');
    const aliasInput = document.getElementById('aliasInput');
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    
    try {
        const requestBody = {
            url: urlInput.value
        };
        
        if (aliasInput.value.trim()) {
            requestBody.custom_alias = aliasInput.value.trim();
        }
        
        const response = await fetch(`${API_BASE_URL}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to shorten URL');
        }
        
        const data = await response.json();
        
        // Display result
        document.getElementById('shortUrlOutput').value = data.short_url;
        document.getElementById('originalUrlOutput').textContent = data.original_url;
        document.getElementById('createdAtOutput').textContent = new Date(data.created_at).toLocaleString();
        document.getElementById('resultSection').style.display = 'block';
        
        successMsg.textContent = `✓ URL shortened successfully!`;
        successMsg.style.display = 'block';
        
        // Clear form
        urlInput.value = '';
        aliasInput.value = '';
        
        // Reload URLs list
        setTimeout(loadAllUrls, 500);
        
    } catch (error) {
        console.error('Error:', error);
        errorMsg.textContent = `✗ ${error.message}`;
        errorMsg.style.display = 'block';
    }
}

async function loadAllUrls() {
    const urlsList = document.getElementById('urlsList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/shorten`);
        
        if (!response.ok) {
            throw new Error('Failed to load URLs');
        }
        
        const urls = await response.json();
        
        if (!urls || urls.length === 0) {
            urlsList.innerHTML = '<div class="empty-state"><p>No shortened URLs yet. Create one to get started!</p></div>';
            return;
        }
        
        urlsList.innerHTML = urls.map(url => `
            <div class="url-item">
                <div class="url-item-info">
                    <div class="url-item-short">
                        <a href="${url.short_url}" target="_blank">${url.short_url}</a>
                    </div>
                    <div class="url-item-original">
                        ${url.original_url}
                    </div>
                    <div class="url-item-stats">
                        Created: ${new Date(url.created_at).toLocaleDateString()} | 
                        Clicks: ${url.click_count || 0}
                    </div>
                </div>
                <div class="url-actions">
                    <button class="btn-view-analytics" onclick="viewAnalytics('${url.short_code}')">Analytics</button>
                    <button class="btn-delete" onclick="deleteURL('${url.short_code}')">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading URLs:', error);
        urlsList.innerHTML = '<div class="empty-state"><p>Error loading URLs. Please try again.</p></div>';
    }
}

async function viewAnalytics(shortCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/${shortCode}`);
        
        if (!response.ok) {
            throw new Error('Failed to load analytics');
        }
        
        const analytics = await response.json();
        
        // Create analytics display
        const analyticsText = `
Analytics for ${shortCode}:
- Total Clicks: ${analytics.total_clicks}
- Last Clicked: ${analytics.last_clicked_at ? new Date(analytics.last_clicked_at).toLocaleString() : 'Never'}
- Top Referrers: ${JSON.stringify(analytics.top_referrers)}
- Browsers: ${JSON.stringify(analytics.browser_breakdown)}
- Devices: ${JSON.stringify(analytics.device_breakdown)}
`;
        
        alert(analyticsText);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load analytics. ' + error.message);
    }
}

async function deleteURL(shortCode) {
    if (!confirm(`Are you sure you want to delete the short URL: ${shortCode}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/shorten/${shortCode}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete URL');
        }
        
        alert(`URL ${shortCode} deleted successfully`);
        loadAllUrls();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete URL. ' + error.message);
    }
}

function copyToClipboard() {
    const shortUrlOutput = document.getElementById('shortUrlOutput');
    shortUrlOutput.select();
    document.execCommand('copy');
    alert('URL copied to clipboard!');
}
