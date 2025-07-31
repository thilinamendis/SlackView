// Global variables to store data
let slackData = {
    // Root configuration files
    channels: [],
    users: {},
    canvases: [],
    fileConversations: [],
    huddleTranscripts: [],
    integrationLogs: [],
    lists: [],
    
    // Channel message data (loaded dynamically)
    channelMessages: {},
    
    // File references for dynamic loading
    allFiles: new Map(), // fileName -> File object
    
    // Current state
    currentChannel: null,
    workspaceName: 'Slack Workspace'
};

// DOM elements
let elements = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
        elements = {
            fileInput: document.getElementById('file-input'),
            sidebar: document.getElementById('sidebar'),
            channelList: document.getElementById('channel-list'),
            messageContainer: document.getElementById('message-container'),
            workspaceName: document.getElementById('workspace-name'),
            currentChannel: document.getElementById('current-channel'),
            channelInfo: document.getElementById('channel-info'),
            searchInput: document.getElementById('search-input'),
            searchBtn: document.getElementById('search-btn'),
            progressBar: document.getElementById('progress-bar'),
            progressFill: document.getElementById('progress-fill'),
            status: document.getElementById('status'),
            statsContent: document.getElementById('stats-content')
        };    // Validate DOM elements
    const missingElements = Object.entries(elements).filter(([name, element]) => !element);
    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements.map(([name]) => name));
        return;
    }
    
    console.log('✅ All DOM elements loaded successfully');
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    elements.fileInput.addEventListener('change', handleFileUpload);
    elements.searchBtn.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
        }
        
        if (e.key === 'Escape' && document.activeElement === elements.searchInput) {
            elements.searchInput.value = '';
            if (slackData.currentChannel) {
                showChannelMessages(slackData.currentChannel);
            }
        }
    });
}

// Handle file upload
async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    
    console.log(`📁 Starting to process ${files.length} files`);
    showStatus('Processing files...', 'info');
    showProgress(true);
    
    // Reset data
    resetSlackData();
    
    // Store all files for later access
    files.forEach(file => {
        const relativePath = file.webkitRelativePath || file.name;
        slackData.allFiles.set(relativePath, file);
    });
    
    try {
        // Step 1: Process root configuration files first
        await processRootFiles(files);
        
        // Step 2: Update UI with loaded data
        updateSidebar();
        
        // Step 3: Show first channel if available
        if (slackData.channels.length > 0) {
            const firstChannel = slackData.channels[0];
            await loadAndShowChannel(firstChannel.name);
        }
        
        showStatus(`✅ Successfully loaded workspace with ${slackData.channels.length} channels and ${Object.keys(slackData.users).length} users`, 'success');
        
    } catch (error) {
        console.error('❌ Error processing files:', error);
        showStatus(`❌ Error: ${error.message}`, 'danger');
    } finally {
        showProgress(false);
    }
}

// Reset slack data
function resetSlackData() {
    slackData = {
        channels: [],
        users: {},
        canvases: [],
        fileConversations: [],
        huddleTranscripts: [],
        integrationLogs: [],
        lists: [],
        channelMessages: {},
        allFiles: new Map(),
        currentChannel: null,
        workspaceName: 'Slack Workspace'
    };
}

// Process root configuration files
async function processRootFiles(files) {
    const rootFiles = files.filter(file => {
        const fileName = file.name.toLowerCase();
        return ['channels.json', 'users.json', 'canvases.json', 'file_conversations.json', 
                'huddle_transcripts.json', 'integration_logs.json', 'lists.json'].includes(fileName);
    });
    
    console.log(`📋 Processing ${rootFiles.length} root configuration files`);
    
    let processed = 0;
    
    for (const file of rootFiles) {
        try {
            const content = await readJSONFile(file);
            await processRootFile(file.name.toLowerCase(), content);
            processed++;
            
            const progress = (processed / rootFiles.length) * 100;
            updateProgress(progress);
            
        } catch (error) {
            console.error(`❌ Error processing ${file.name}:`, error);
        }
    }
    
    console.log(`✅ Processed ${processed} root files`);
}

// Process individual root file
async function processRootFile(fileName, content) {
    switch (fileName) {
        case 'channels.json':
            slackData.channels = Array.isArray(content) ? content : [];
            console.log(`📺 Loaded ${slackData.channels.length} channels`);
            break;
            
        case 'users.json':
            if (Array.isArray(content)) {
                content.forEach(user => {
                    slackData.users[user.id] = user;
                });
            }
            console.log(`👥 Loaded ${Object.keys(slackData.users).length} users`);
            break;
            
        case 'canvases.json':
            slackData.canvases = Array.isArray(content) ? content : [];
            console.log(`🎨 Loaded ${slackData.canvases.length} canvases`);
            break;
            
        case 'file_conversations.json':
            slackData.fileConversations = Array.isArray(content) ? content : [];
            console.log(`📁 Loaded ${slackData.fileConversations.length} file conversations`);
            break;
            
        case 'huddle_transcripts.json':
            slackData.huddleTranscripts = Array.isArray(content) ? content : [];
            console.log(`🎤 Loaded ${slackData.huddleTranscripts.length} huddle transcripts`);
            break;
            
        case 'integration_logs.json':
            slackData.integrationLogs = Array.isArray(content) ? content : [];
            console.log(`🔗 Loaded ${slackData.integrationLogs.length} integration logs`);
            break;
            
        case 'lists.json':
            slackData.lists = Array.isArray(content) ? content : [];
            console.log(`📝 Loaded ${slackData.lists.length} lists`);
            break;
    }
}

// Update sidebar with loaded data
function updateSidebar() {
    console.log('🔄 Updating sidebar');
    
    // Update channels only
    updateChannelList();
}

// Update channel list
function updateChannelList() {
    const channelContainer = elements.channelList;
    channelContainer.innerHTML = '';
    
    if (slackData.channels.length === 0) {
        channelContainer.innerHTML = '<div class="text-muted small">No channels found</div>';
        return;
    }
    
    slackData.channels.forEach(channel => {
        if (!channel.is_archived) {
            const channelElement = createChannelElement(channel);
            channelContainer.appendChild(channelElement);
        }
    });
    
    console.log(`✅ Updated channel list with ${slackData.channels.length} channels`);
}

// Create channel element
function createChannelElement(channel) {
    const div = document.createElement('div');
    div.className = 'channel-item cursor-pointer';
    div.style.cursor = 'pointer';
    div.innerHTML = `
        <span>${channel.name}</span>
    `;
    
    div.addEventListener('click', () => loadAndShowChannel(channel.name));
    
    return div;
}

// Load and show channel messages
async function loadAndShowChannel(channelName) {
    console.log(`📺 Loading channel: ${channelName}`);
    
    try {
        // Show loading state
        elements.currentChannel.textContent = `# ${channelName}`;
        elements.channelInfo.textContent = 'Loading messages...';
        elements.messageContainer.innerHTML = '<div class="text-center"><div class="spinner-border"></div><p class="mt-2">Loading messages...</p></div>';
        
        // Check if messages are already loaded
        if (!slackData.channelMessages[channelName]) {
            await loadChannelMessages(channelName);
        }
        
        // Display messages
        displayChannelMessages(channelName);
        
        // Update current channel
        slackData.currentChannel = channelName;
        
        // Update active state
        updateActiveChannel(channelName);
        
    } catch (error) {
        console.error(`❌ Error loading channel ${channelName}:`, error);
        elements.messageContainer.innerHTML = `<div class="alert alert-danger">Error loading channel: ${error.message}</div>`;
    }
}

// Load channel messages from files
async function loadChannelMessages(channelName) {
    console.log(`📂 Loading messages for channel: ${channelName}`);
    
    // Find all daily JSON files for this channel
    const channelFiles = Array.from(slackData.allFiles.entries())
        .filter(([path, file]) => {
            const pathParts = path.split('/');
            return pathParts.length >= 2 && 
                   pathParts[pathParts.length - 2] === channelName &&
                   file.name.match(/^\d{4}-\d{2}-\d{2}\.json$/);
        })
        .map(([path, file]) => file);
    
    console.log(`📅 Found ${channelFiles.length} daily files for channel ${channelName}`);
    
    const allMessages = [];
    
    // Load all daily files
    for (const file of channelFiles) {
        try {
            const dailyMessages = await readJSONFile(file);
            if (Array.isArray(dailyMessages)) {
                allMessages.push(...dailyMessages);
            }
        } catch (error) {
            console.error(`❌ Error loading ${file.name}:`, error);
        }
    }
    
    // Sort messages by timestamp
    allMessages.sort((a, b) => parseFloat(a.ts || 0) - parseFloat(b.ts || 0));
    
    // Store messages
    slackData.channelMessages[channelName] = allMessages;
    
    console.log(`✅ Loaded ${allMessages.length} messages for channel ${channelName}`);
}

// Display channel messages
function displayChannelMessages(channelName) {
    const messages = slackData.channelMessages[channelName] || [];
    
    elements.currentChannel.textContent = `# ${channelName}`;
    elements.channelInfo.textContent = `${messages.length} messages`;
    
    if (messages.length === 0) {
        elements.messageContainer.innerHTML = '<div class="text-center text-muted"><p>No messages in this channel</p></div>';
        return;
    }
    
    // Create message elements
    const messageHTML = messages.map(message => createMessageHTML(message)).join('');
    elements.messageContainer.innerHTML = messageHTML;
    
    // Scroll to bottom
    elements.messageContainer.scrollTop = elements.messageContainer.scrollHeight;
    
    console.log(`✅ Displayed ${messages.length} messages for ${channelName}`);
}

// Create message HTML
function createMessageHTML(message) {
    const user = slackData.users[message.user] || {};
    const userName = user.real_name || user.name || message.username || 'Unknown User';
    const userAvatar = user.profile?.image_72 || '';
    
    const timestamp = new Date(parseFloat(message.ts) * 1000);
    const formattedTime = timestamp.toLocaleString();
    
    const messageText = formatMessageText(message.text || '');
    
    return `
        <div class="message-item mb-3 p-3 border-bottom">
            <div class="d-flex">
                <div class="flex-shrink-0">
                    ${userAvatar ? 
                        `<img src="${userAvatar}" alt="${userName}" class="rounded-circle" width="40" height="40">` :
                        `<div class="user-avatar-bg rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <span class="text-white fw-bold">${userName.charAt(0).toUpperCase()}</span>
                        </div>`
                    }
                </div>
                <div class="flex-grow-1 ms-3">
                    <div class="d-flex align-items-baseline mb-1">
                        <h6 class="mb-0 me-2">${userName}</h6>
                        <small class="text-muted">${formattedTime}</small>
                    </div>
                    <div class="message-content">${messageText}</div>
                    ${message.attachments ? createAttachmentsHTML(message.attachments) : ''}
                </div>
            </div>
        </div>
    `;
}

// Format message text
function formatMessageText(text) {
    if (!text) return '';
    
    // Replace user mentions
    text = text.replace(/<@([A-Z0-9]+)>/g, (match, userId) => {
        const user = slackData.users[userId];
        const userName = user ? (user.real_name || user.name) : 'Unknown User';
        return `<span class="badge user-mention-badge">@${userName}</span>`;
    });
    
    // Replace channel mentions
    text = text.replace(/<#([A-Z0-9]+)\|([^>]+)>/g, (match, channelId, channelName) => {
        return `<span class="badge bg-success">#${channelName}</span>`;
    });
    
    // Replace URLs
    text = text.replace(/<(https?:[^|>]+)(\|([^>]+))?>/g, (match, url, _, linkText) => {
        const displayText = linkText || url;
        return `<a href="${url}" target="_blank" class="text-decoration-none">${displayText}</a>`;
    });
    
    // Handle code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-light p-2 rounded"><code>$1</code></pre>');
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-light px-1 rounded">$1</code>');
    
    // Handle bold text
    text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Handle strikethrough
    text = text.replace(/~([^~]+)~/g, '<del>$1</del>');
    
    return text;
}

// Create attachments HTML
function createAttachmentsHTML(attachments) {
    if (!attachments || !attachments.length) return '';
    
    return attachments.map(att => {
        return `
            <div class="attachment mt-2 p-2 bg-light rounded">
                ${att.title ? `<h6 class="mb-1">${att.title}</h6>` : ''}
                ${att.text ? `<p class="mb-1">${formatMessageText(att.text)}</p>` : ''}
                ${att.image_url ? `<img src="${att.image_url}" alt="Attachment" class="img-fluid rounded mt-1" style="max-width: 300px;">` : ''}
                ${att.from_url ? `<small><a href="${att.from_url}" target="_blank" class="text-muted">${att.from_url}</a></small>` : ''}
            </div>
        `;
    }).join('');
}

// Update active channel
function updateActiveChannel(channelName) {
    // Remove active class from all channels
    document.querySelectorAll('.channel-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current channel
    document.querySelectorAll('.channel-item').forEach(item => {
        const span = item.querySelector('span');
        if (span && span.textContent === channelName) {
            item.classList.add('active');
        }
    });
}

// Perform search
function performSearch() {
    const query = elements.searchInput.value.trim().toLowerCase();
    if (!query || !slackData.currentChannel) return;
    
    const messages = slackData.channelMessages[slackData.currentChannel] || [];
    const searchResults = messages.filter(message => {
        const text = (message.text || '').toLowerCase();
        const user = slackData.users[message.user] || {};
        const userName = (user.real_name || user.name || '').toLowerCase();
        return text.includes(query) || userName.includes(query);
    });
    
    if (searchResults.length === 0) {
        showStatus('No matches found', 'warning');
        return;
    }
    
    showStatus(`Found ${searchResults.length} matches`, 'success');
    
    // Display search results
    const messageHTML = searchResults.map(message => createMessageHTML(message)).join('');
    elements.messageContainer.innerHTML = messageHTML;
    
    // Highlight search results
    elements.messageContainer.querySelectorAll('.message-item').forEach(item => {
        item.classList.add('border', 'border-warning');
    });
}

// Utility functions
function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = JSON.parse(event.target.result);
                resolve(content);
            } catch (error) {
                reject(new Error(`Invalid JSON in ${file.name}: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsText(file);
    });
}

function showStatus(message, type = 'info') {
    const alertClass = `alert-${type}`;
    elements.status.innerHTML = `<div class="alert ${alertClass} alert-dismissible fade show mb-2" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    
    // Auto-dismiss after 5 seconds for success/info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            const alert = elements.status.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

function showProgress(show) {
    elements.progressBar.style.display = show ? 'block' : 'none';
    if (!show) {
        elements.progressFill.style.width = '0%';
        elements.progressFill.classList.remove('progress-bar-animated');
    } else {
        elements.progressFill.classList.add('progress-bar-animated');
    }
}

function updateProgress(percentage) {
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressFill.setAttribute('aria-valuenow', percentage);
    
    // Add visual feedback
    if (percentage >= 100) {
        elements.progressFill.classList.remove('progress-bar-animated');
        elements.progressFill.classList.add('bg-success');
        setTimeout(() => {
            showProgress(false);
            elements.progressFill.classList.remove('bg-success');
        }, 1000);
    }
}

