function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

function createImageElement(url) {
    const container = document.createElement('div');
    container.className = 'image-container';
    
    const img = document.createElement('img');
    img.className = 'json-image';
    img.src = url;
    
    img.onerror = () => {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'image-error';
        errorMsg.textContent = 'Failed to load image';
        container.appendChild(errorMsg);
    };
    
    container.appendChild(img);
    return container;
}

function createTreeNode(key, value) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    
    const nodeContent = document.createElement('span');
    nodeContent.className = 'node-content';
    
    if (key !== null) {
        const keySpan = document.createElement('span');
        keySpan.className = 'node-key';
        keySpan.textContent = `"${key}": `;
        nodeContent.appendChild(keySpan);
    }
    
    if (value === null) {
        const valueSpan = document.createElement('span');
        valueSpan.className = 'node-value null';
        valueSpan.textContent = 'null';
        nodeContent.appendChild(valueSpan);
        nodeDiv.appendChild(nodeContent);
    } else if (typeof value === 'object') {
        const isArray = Array.isArray(value);
        const bracketSpan = document.createElement('span');
        bracketSpan.className = 'bracket';
        bracketSpan.textContent = isArray ? '[' : '{';
        nodeContent.appendChild(bracketSpan);
        
        if (Object.keys(value).length > 0) {
            const collapseSpan = document.createElement('span');
            collapseSpan.className = 'collapsible';
            nodeDiv.appendChild(collapseSpan);
            
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'tree-node';
            
            Object.entries(value).forEach(([childKey, childValue], index) => {
                const child = createTreeNode(isArray ? null : childKey, childValue);
                if (index < Object.keys(value).length - 1) {
                    child.appendChild(document.createTextNode(','));
                }
                childrenDiv.appendChild(child);
            });
            
            nodeDiv.appendChild(nodeContent);
            nodeDiv.appendChild(childrenDiv);
            
            collapseSpan.addEventListener('click', () => {
                collapseSpan.classList.toggle('collapsed');
                childrenDiv.style.display = childrenDiv.style.display === 'none' ? 'block' : 'none';
            });
        } else {
            nodeDiv.appendChild(nodeContent);
        }
        
        const closingBracketSpan = document.createElement('span');
        closingBracketSpan.className = 'bracket';
        closingBracketSpan.textContent = isArray ? ']' : '}';
        nodeDiv.appendChild(closingBracketSpan);
    } else if (typeof value === 'string' && isValidUrl(value)) {
        const valueSpan = document.createElement('a');
        valueSpan.className = 'node-value url';
        valueSpan.href = value;
        valueSpan.target = '_blank';
        valueSpan.rel = 'noopener noreferrer';
        valueSpan.textContent = `"${value}"`;
        nodeContent.appendChild(valueSpan);
        nodeDiv.appendChild(nodeContent);
        
        if (isImageUrl(value)) {
            const imageContainer = createImageElement(value);
            nodeDiv.appendChild(imageContainer);
        }
    } else {
        const valueSpan = document.createElement('span');
        valueSpan.className = `node-value ${typeof value}`;
        valueSpan.textContent = typeof value === 'string' ? `"${value}"` : value;
        nodeContent.appendChild(valueSpan);
        nodeDiv.appendChild(nodeContent);
    }
    
    return nodeDiv;
}

function setLoading(isLoading) {
    const fetchButton = document.getElementById('fetchButton');
    const apiInput = document.getElementById('apiUrl');
    
    if (isLoading) {
        fetchButton.textContent = 'Fetching...';
        fetchButton.classList.add('loading');
        apiInput.classList.add('loading');
        fetchButton.disabled = true;
        apiInput.disabled = true;
    } else {
        fetchButton.textContent = 'Fetch JSON';
        fetchButton.classList.remove('loading');
        apiInput.classList.remove('loading');
        fetchButton.disabled = false;
        apiInput.disabled = false;
    }
}

function showError(message, isHtml = false) {
    const outputDiv = document.getElementById('output');
    if (isHtml) {
        outputDiv.innerHTML = `<div class="error-message">${message}</div>`;
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        outputDiv.innerHTML = '';
        outputDiv.appendChild(errorDiv);
    }
}

function displayJson(jsonData) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';
    
    const treeView = document.createElement('div');
    treeView.className = 'tree-view';
    treeView.appendChild(createTreeNode(null, jsonData));
    outputDiv.appendChild(treeView);
}

document.getElementById('fetchButton').addEventListener('click', async function() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const useCorsProxy = document.getElementById('useCorsProxy').checked;
    
    if (!apiUrl) {
        showError('Please enter a URL');
        return;
    }

    if (!isValidUrl(apiUrl)) {
        showError('Please enter a valid URL');
        return;
    }

    setLoading(true);
    try {
        const headers = new Headers();
        if (apiKey) {
            headers.append('Authorization', `Bearer ${apiKey}`);
        }
        headers.append('Accept', 'application/json');

        let fetchUrl = apiUrl;
        if (useCorsProxy) {
            // Using cors-anywhere demo server
            fetchUrl = `https://cors-anywhere.herokuapp.com/${apiUrl}`;
            // Note: For production use, set up your own proxy server
        }

        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        });

        if (!response.ok) {
            if (response.status === 403) {
                const message = useCorsProxy 
                    ? 'Access forbidden. You might need to visit <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" rel="noopener noreferrer">https://cors-anywhere.herokuapp.com/corsdemo</a> to temporarily unlock the demo proxy.'
                    : 'Access forbidden. Please check your API key if required.';
                throw new Error(message);
            } else if (response.status === 401) {
                throw new Error('Unauthorized. The API key might be invalid or missing.');
            } else if (response.status === 404) {
                throw new Error('The requested resource was not found.');
            } else {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('The response is not in JSON format. Content-Type: ' + contentType);
        }

        const jsonData = await response.json();
        displayJson(jsonData);
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            const suggestion = useCorsProxy 
                ? 'The CORS proxy service might be down or require activation. Please visit <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" rel="noopener noreferrer">https://cors-anywhere.herokuapp.com/corsdemo</a> to enable the demo server.'
                : 'Try enabling the CORS proxy option above or use a different API endpoint that supports CORS.';
            showError(`Failed to fetch: The request was blocked. ${suggestion}`, true);
        } else {
            showError(error.message.includes('<a') ? error.message : `Failed to fetch JSON: ${error.message}`, error.message.includes('<a'));
        }
    } finally {
        setLoading(false);
    }
});

document.getElementById('parseButton').addEventListener('click', function() {
    const jsonInput = document.getElementById('jsonInput').value;
    
    try {
        const jsonObject = JSON.parse(jsonInput);
        displayJson(jsonObject);
    } catch (error) {
        showError(`Invalid JSON: ${error.message}`);
    }
});
