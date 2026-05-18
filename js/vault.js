import { vaultItems, currentCounters, saveCustomPost, saveToCustomVault, getCustomVault, escapeHTML, saveCounters, getCustomPosts } from './state.js';
import { showToast } from './utils.js';

export function renderVault() {
    const grid = document.getElementById('vaultGrid');
    if (!grid) return;
    grid.innerHTML = vaultItems.map((item, i) => `
        <div class="vault-card animate-in delay-${i + 1}" style="--card-accent: ${item.accent}; --card-accent-bg: ${item.accentBg}; cursor: pointer; transition: transform 0.2s; position: relative;">
            <div class="vault-header" style="margin-bottom: 16px;">
                <div class="vault-icon" style="background: ${item.accentBg}; color: ${item.accent};">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="vault-title-group" style="flex: 1; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div class="vault-title">${item.title}</div>
                        <div class="vault-meta">${item.contents.length} عنصر</div>
                    </div>
                    <i data-lucide="chevron-left" style="color: var(--text-muted); width: 20px; height: 20px;"></i>
                </div>
            </div>
            <button class="btn-sm" style="width: 100%; justify-content: center; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius-xs); padding: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                معاينة المخزن
            </button>
        </div>
    `).join('');
    if(window.lucide) lucide.createIcons();

    grid.querySelectorAll('.vault-card').forEach(card => {
        card.onclick = () => window.location.href = 'store.html';
    });
}

export function renderStore() {
    const customVault = getCustomVault();
    let mergedVaults = JSON.parse(JSON.stringify(vaultItems));

    customVault.forEach(item => {
        let targetVaultIndex = 3;
        if(item.vaultTarget === 'videos') targetVaultIndex = 0;
        if(item.vaultTarget === 'graphics') targetVaultIndex = 1;
        if(item.vaultTarget === 'templates') targetVaultIndex = 2;
        if(item.vaultTarget === 'files') targetVaultIndex = 3;

        mergedVaults[targetVaultIndex].contents.unshift(item);
    });

    if (window.syncedLocalItems) {
        window.syncedLocalItems.forEach(item => {
            let targetVaultIndex = 3;
            if(item.vaultTarget === 'videos') targetVaultIndex = 0;
            if(item.vaultTarget === 'graphics') targetVaultIndex = 1;
            if(item.vaultTarget === 'templates') targetVaultIndex = 2;
            if(item.vaultTarget === 'files') targetVaultIndex = 3;

            const exists = mergedVaults[targetVaultIndex].contents.find(c => c.name === item.name);
            if (!exists) {
                mergedVaults[targetVaultIndex].contents.unshift(item);
            }
        });
    }

    const grid = document.getElementById('storeGrid');
    if (!grid) return;

    const customPosts = getCustomPosts();
    const postsList = Object.values(customPosts);

    grid.innerHTML = mergedVaults.map((item, i) => `
        <div class="vault-card animate-in delay-${i + 1}" style="--card-accent: ${item.accent}; --card-accent-bg: ${item.accentBg};">
            <div class="vault-header">
                <div class="vault-icon" style="background: ${item.accentBg}; color: ${item.accent};">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="vault-title-group">
                    <div class="vault-title">${item.title}</div>
                    <div class="vault-meta">${item.contents.length} عنصر</div>
                </div>
            </div>
            <div class="vault-items-grid">
                ${item.contents.map(c => {
                    const isTemplate = c.type === 'template';
                    const actionIcon = isTemplate ? 'copy' : 'download';

                    let linkedWith = null;
                    for (let post of postsList) {
                        if (post.textSerial === c.serial) {
                            linkedWith = post.mediaSerial;
                            break;
                        } else if (post.mediaSerial === c.serial) {
                            linkedWith = post.textSerial;
                            break;
                        }
                    }

                    const linkedText = linkedWith 
                        ? '<div class="item-schedule" style="color: var(--primary); font-weight: 700; display: flex; align-items: center; gap: 4px;"><i data-lucide="link" style="width: 12px; height: 12px;"></i> مرتبط بـ ' + escapeHTML(linkedWith) + '</div>' 
                        : '<div style="height: 16px;"></div>';

                    let previewContent = '';
                    if (c.localPath) {
                        if (c.icon === 'image') {
                            previewContent = `<img src="${c.localPath}" loading="lazy" alt="${escapeHTML(c.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
                        } else if (c.icon === 'video') {
                            previewContent = `<video src="${c.localPath}" muted loop onmouseover="this.play()" onmouseout="this.pause()" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; background: #000;"></video>`;
                        } else {
                            previewContent = `<i data-lucide="${c.icon}"></i>`;
                        }
                    } else if (c.type === 'media' && c.icon === 'image') {
                        previewContent = `<img src="https://picsum.photos/seed/${c.serial}/100/100" loading="lazy" alt="${escapeHTML(c.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
                    } else {
                        previewContent = `<i data-lucide="${c.icon}"></i>`;
                    }

                    return `
                    <div class="item-card">
                        <div class="item-preview" style="color: ${item.accent}">
                            ${previewContent}
                        </div>
                        <div class="item-details">
                            <div class="item-name" title="${escapeHTML(c.name)}">${escapeHTML(c.name)}</div>
                            <div class="item-meta-row">
                                <span>${escapeHTML(c.serial) || ''}</span>
                                <span>${escapeHTML(c.size) || ''}</span>
                            </div>
                            ${linkedText}
                        </div>
                        <div class="item-actions">
                            <button class="item-action-btn danger" data-action="delete" data-name="${escapeHTML(c.name)}" title="حذف">
                                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="item-action-btn" data-action="link" data-serial="${escapeHTML(c.serial)}" data-type="${c.type}" title="ربط بمخزن آخر">
                                <i data-lucide="link" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="item-action-btn" data-action="create" data-serial="${escapeHTML(c.serial)}" data-type="${c.type}" title="ترحيل لإنشاء منشور">
                                <i data-lucide="file-plus" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="item-action-btn" data-action="${isTemplate ? 'copy' : 'download'}" data-name="${escapeHTML(c.name)}" title="${isTemplate ? 'نسخ' : 'تنزيل'}">
                                <i data-lucide="${actionIcon}" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');

    if(window.lucide) lucide.createIcons();
    attachStoreListeners();
}

function attachStoreListeners() {
    document.querySelectorAll('.item-action-btn').forEach(btn => {
        btn.onclick = (e) => {
            const action = btn.dataset.action;
            const name = btn.dataset.name;
            const serial = btn.dataset.serial;
            const type = btn.dataset.type;

            if (action === 'delete') {
                showToast('تم حذف العنصر', 'success');
            } else if (action === 'link') {
                showToast('سيتم توفير ميزة الربط المباشر قريباً', 'info');
            } else if (action === 'create') {
                openAddPostModal();
                if (type === 'template') {
                    selectVaultItem(serial, 'templates');
                } else if (type === 'media') {
                    const isVideo = serial.startsWith('vid-');
                    const videoRadio = document.querySelector('input[name="completeMediaType"][value="video"]');
                    const imageRadio = document.querySelector('input[name="completeMediaType"][value="image"]');
                    if (isVideo && videoRadio) videoRadio.checked = true;
                    else if (imageRadio) imageRadio.checked = true;
                    updateCompletePostMediaSerial();
                    selectVaultItem(serial, 'media');
                }
                showToast('تم ترحيل العنصر للمنشور بنجاح', 'success');
            } else if (action === 'copy') {
                copyVaultItem(name);
            } else if (action === 'download') {
                downloadVaultItem(name);
            }
        };
    });
}

export function openAddItemModal() {
    const modal = document.getElementById('addItemModal');
    if (modal) modal.style.display = 'flex';
    handleItemTypeChange();
}

export function closeAddItemModal() {
    const modal = document.getElementById('addItemModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('fileUpload').value = '';
    document.getElementById('fileNameDisplay').textContent = '';
    document.getElementById('templateTitle').value = '';
    document.getElementById('templateCaption').value = '';
    document.getElementById('itemSchedule').value = '';
}

export function handleItemTypeChange() {
    const typeEl = document.querySelector('input[name="itemType"]:checked');
    if (!typeEl) return;
    const type = typeEl.value;
    const mediaArea = document.getElementById('dynamicAreaMedia');
    const templateArea = document.getElementById('dynamicAreaTemplate');
    const fileInput = document.getElementById('fileUpload');

    if (type === 'media') {
        mediaArea.style.display = 'block';
        templateArea.style.display = 'none';
        
        const vaultEl = document.querySelector('input[name="vaultTarget"]:checked');
        if (vaultEl && vaultEl.value === 'templates') {
            const graphicsRadio = document.querySelector('input[name="vaultTarget"][value="graphics"]');
            if (graphicsRadio) graphicsRadio.checked = true;
        }

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            handleFileUpload(fileInput);
        } else {
            updateSerialByVault();
        }
    } else {
        mediaArea.style.display = 'none';
        templateArea.style.display = 'block';
        
        const templatesRadio = document.querySelector('input[name="vaultTarget"][value="templates"]');
        if (templatesRadio) templatesRadio.checked = true;
        
        updateSerialByVault();
    }
}

export function updateSerialByVault() {
    const vaultEl = document.querySelector('input[name="vaultTarget"]:checked');
    if (!vaultEl) return;
    
    const vault = vaultEl.value;
    const serialInput = document.getElementById('itemSerial');
    if (!serialInput) return;
    
    let prefix = 'img-';
    let count = currentCounters.img || 0;
    
    if (vault === 'videos') {
        prefix = 'vid-';
        count = currentCounters.vid || 0;
    } else if (vault === 'graphics') {
        prefix = 'img-';
        count = currentCounters.img || 0;
    } else if (vault === 'templates') {
        prefix = 'tex-';
        count = currentCounters.tex || 0;
    } else if (vault === 'files') {
        prefix = 'doc-';
        count = currentCounters.doc || 0;
    }
    
    serialInput.value = prefix + (count + 1);
}

export function handleFileUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        document.getElementById('fileNameDisplay').textContent = file.name;
        const type = file.type;
        const serialInput = document.getElementById('itemSerial');
        if (type.startsWith('video/')) {
            serialInput.value = 'vid-' + (currentCounters.vid + 1);
        } else {
            serialInput.value = 'img-' + (currentCounters.img + 1);
        }
    }
}

export function saveNewItem() {
    const typeEl = document.querySelector('input[name="itemType"]:checked');
    const type = typeEl ? typeEl.value : 'media';
    const schedule = document.getElementById('itemSchedule').value;
    const serial = document.getElementById('itemSerial').value;

    let newItem = {
        serial: serial,
        schedule: schedule,
        type: type
    };

    if (type === 'media') {
        const fileInput = document.getElementById('fileUpload');
        if (!fileInput.files[0]) {
            showToast('يرجى اختيار ملف', 'error');
            return;
        }
        const file = fileInput.files[0];
        const isVideo = file.type.startsWith('video/');
        newItem.name = file.name;
        newItem.size = Math.round(file.size / 1024) + ' KB';
        newItem.icon = isVideo ? 'video' : 'image';
        newItem.color = isVideo ? '#1e3a5f' : '#E4405F';
        newItem.bg = isVideo ? 'rgba(30,58,95,0.08)' : 'rgba(228,64,95,0.08)';
        newItem.vaultTarget = isVideo ? 'videos' : 'graphics';

        if (isVideo) currentCounters.vid++;
        else currentCounters.img++;
    } else {
        const title = document.getElementById('templateTitle').value.trim();
        const caption = document.getElementById('templateCaption').value.trim();
        if (!title) {
            showToast('يرجى إدخال عنوان القالب', 'error');
            return;
        }
        newItem.name = title;
        newItem.caption = caption;
        newItem.size = '1 KB';
        newItem.icon = 'file-text';
        newItem.color = '#2d6a4f';
        newItem.bg = 'rgba(45,106,79,0.08)';
        newItem.vaultTarget = 'templates';
        currentCounters.tex++;
    }

    saveToCustomVault(newItem);
    saveCounters();
    showToast('تم حفظ العنصر بنجاح!', 'success');
    closeAddItemModal();
    renderStore();
}

export function openAddPostModal() {
    const modal = document.getElementById('addPostModal');
    if (modal) modal.style.display = 'flex';
    document.getElementById('completePostTextSerial').textContent = 'tex-' + (currentCounters.tex + 1);
    updateCompletePostMediaSerial();
}

export function closeAddPostModal() {
    const modal = document.getElementById('addPostModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('completePostTitle').value = '';
    document.getElementById('completePostCaption').value = '';
    document.getElementById('completePostFileUpload').value = '';
    document.getElementById('completePostFileNameDisplay').textContent = '';
    document.getElementById('completePostSchedule').value = '';
}

export function handleCompletePostFileUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        document.getElementById('completePostFileNameDisplay').textContent = file.name;
        const type = file.type;
        
        const videoRadio = document.querySelector('input[name="completeMediaType"][value="video"]');
        const imageRadio = document.querySelector('input[name="completeMediaType"][value="image"]');
        
        if (type.startsWith('video/')) {
            if (videoRadio) videoRadio.checked = true;
        } else {
            if (imageRadio) imageRadio.checked = true;
        }
        updateCompletePostMediaSerial();
    }
}

export function saveCompletePost() {
    const title = document.getElementById('completePostTitle').value.trim();
    const caption = document.getElementById('completePostCaption').value.trim();
    const noteEl = document.getElementById('completePostNote');
    const note = noteEl ? noteEl.value.trim() : '';
    const mediaFile = document.getElementById('completePostFileUpload').files[0];

    if(!title) {
        showToast('الرجاء إدخال عنوان المنشور', 'error');
        return;
    }

    const day = new Date().getDate();

    const mediaSerial = document.getElementById('completePostMediaSerial').textContent;
    const textSerial = document.getElementById('completePostTextSerial').textContent;

    const postData = {
        title: title,
        caption: caption,
        note: note,
        mediaSerial: mediaSerial,
        textSerial: textSerial,
        day: day
    };

    saveCustomPost(day, postData);

    const isNewText = textSerial.startsWith('tex-' + (currentCounters.tex + 1));
    const isNewMedia = !!mediaFile;

    if(isNewText && caption) {
        saveToCustomVault({
            vaultTarget: 'templates',
            name: title,
            size: '1 KB',
            icon: 'file-text',
            color: '#2d6a4f',
            bg: 'rgba(45,106,79,0.08)',
            serial: postData.textSerial,
            schedule: '',
            type: 'template'
        });
        currentCounters.tex++;
    }
    if(isNewMedia && mediaFile) {
        const isVideo = mediaFile.type.startsWith('video/');
        saveToCustomVault({
            vaultTarget: isVideo ? 'videos' : 'graphics',
            name: mediaFile.name,
            size: Math.round(mediaFile.size / 1024) + ' KB',
            icon: isVideo ? 'video' : 'image',
            color: isVideo ? '#1e3a5f' : '#E4405F',
            bg: isVideo ? 'rgba(30,58,95,0.08)' : 'rgba(228,64,95,0.08)',
            serial: postData.mediaSerial,
            schedule: '',
            type: 'media'
        });
        if (isVideo) currentCounters.vid++;
        else currentCounters.img++;
    }

    saveCounters();
    showToast('تم حفظ المنشور بنجاح! تمت إضافته للتقويم والمخازن', 'success');
    closeAddPostModal();
    renderStore();
}

export function copyVaultItem(name) {
    if (!name) return;
    navigator.clipboard.writeText(name).then(() => {
        showToast('تم نسخ اسم الملف', 'success');
    });
}

export function downloadVaultItem(name) {
    showToast('جاري التحميل...', 'info');
    setTimeout(() => showToast('تم التنزيل بنجاح', 'success'), 1000);
}

export function switchMainTab() {
    const tabEl = document.querySelector('input[name="mainTab"]:checked');
    if (!tabEl) return;
    const tab = tabEl.value;
    const storeGrid = document.getElementById('storeGrid');
    const postsGrid = document.getElementById('postsGrid');
    
    if (tab === 'items') {
        storeGrid.style.display = 'grid';
        postsGrid.style.display = 'none';
    } else {
        storeGrid.style.display = 'none';
        postsGrid.style.display = 'grid';
        renderPostsGrid();
    }
}

export function renderPostsGrid() {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;
    
    const customPosts = getCustomPosts();
    const postsArray = Object.values(customPosts);
    
    if (postsArray.length === 0) {
        postsGrid.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px; grid-column: 1 / -1;"><i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i><p>لا توجد منشورات متكاملة محفوظة بعد.</p></div>';
        if(window.lucide) lucide.createIcons();
        return;
    }
    
    postsGrid.innerHTML = postsArray.map((post, i) => {
        const isVideo = post.mediaSerial && post.mediaSerial.startsWith('vid-');
        const mediaIcon = isVideo ? 'video' : 'image';
        return `
        <div class="post-card animate-in delay-${(i % 5) + 1}" style="display: flex; flex-direction: column; padding: 0;">
            <div class="post-card-header" style="padding: 15px; border-bottom: 1px dashed var(--border-light); margin-bottom: 0;">
                <div class="post-card-title">${escapeHTML(post.title)}</div>
            </div>
            
            <div class="post-section" style="padding: 15px; border-bottom: 1px dashed var(--border-light);">
                <div class="post-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 4px;"><i data-lucide="file-text" style="width:14px; height:14px;"></i> نص المنشور</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="modal-badge">${escapeHTML(post.textSerial)}</span>
                        <button class="post-action-btn" data-action="copy" data-text="${escapeHTML(post.caption)}" title="نسخ النص" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: var(--radius-xs);"><i data-lucide="copy" style="width:14px; height:14px;"></i></button>
                    </div>
                </div>
                <div class="post-card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">${escapeHTML(post.caption).replace(/\\n/g, '<br>')}</div>
            </div>

            <div class="post-section" style="padding: 15px; border-bottom: 1px dashed var(--border-light);">
                <div class="post-section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 4px;"><i data-lucide="${mediaIcon}" style="width:14px; height:14px;"></i> الوسائط المرفقة</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="modal-badge">${escapeHTML(post.mediaSerial)}</span>
                        <button class="post-action-btn" data-action="download" data-serial="${escapeHTML(post.mediaSerial)}" title="تنزيل الملف" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: var(--radius-xs);"><i data-lucide="download" style="width:14px; height:14px;"></i></button>
                    </div>
                </div>
                <div class="post-media-preview">
                    <div style="background: var(--bg); padding: 15px; text-align: center; border-radius: var(--radius-xs);">
                        <i data-lucide="${mediaIcon}" style="width: 24px; height: 24px; color: var(--text-muted);"></i>
                    </div>
                </div>
            </div>

            <div class="post-section" style="padding: 15px; background: rgba(0,0,0,0.01);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${post.note ? '8px' : '0'};">
                    <div class="post-card-date" style="font-size: 11px; margin-bottom: 0;">
                        <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                        تاريخ الإضافة: يوم ${post.day}
                    </div>
                    ${post.note ? `<div style="font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;"><i data-lucide="info" style="width:12px; height:12px;"></i> يوجد ملاحظات</div>` : ''}
                </div>
                ${post.note ? `<div style="background: var(--bg); padding: 10px; border-radius: var(--radius-xs); font-size: 12px; color: var(--text-primary); border: 1px solid var(--border-light);">${escapeHTML(post.note)}</div>` : ''}
            </div>
        </div>
        `;
    }).join('');
    
    if(window.lucide) lucide.createIcons();
    attachPostCardListeners();
}

function attachPostCardListeners() {
    document.querySelectorAll('.post-action-btn').forEach(btn => {
        btn.onclick = (e) => {
            const action = btn.dataset.action;
            if (action === 'copy') {
                navigator.clipboard.writeText(btn.dataset.text);
                showToast('تم نسخ نص المنشور بنجاح', 'success');
            } else if (action === 'download') {
                showToast('جاري تنزيل الملف: ' + btn.dataset.serial, 'info');
            }
        };
    });
}

export function updateCompletePostMediaSerial() {
    const typeEl = document.querySelector('input[name="completeMediaType"]:checked');
    if (!typeEl) return;
    const type = typeEl.value;
    const serialSpan = document.getElementById('completePostMediaSerial');
    if (!serialSpan) return;
    if (type === 'video') {
        serialSpan.textContent = 'vid-' + (currentCounters.vid + 1);
    } else {
        serialSpan.textContent = 'img-' + (currentCounters.img + 1);
    }
}

export function toggleVaultDropdown(type, buttonElement) {
    const dropdown = document.getElementById('dropdown-' + type);
    if (!dropdown) return;
    
    document.querySelectorAll('.vault-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });
    
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.style.display = 'block';
    dropdown.innerHTML = '';
    
    let allItems = [];
    vaultItems.forEach(v => {
        if(v.contents) allItems.push(...v.contents);
    });
    allItems.push(...getCustomVault());
    
    const customPosts = getCustomPosts();
    const usedSerials = new Set();
    Object.values(customPosts).forEach(post => {
        if (post.textSerial) usedSerials.add(post.textSerial);
        if (post.mediaSerial) usedSerials.add(post.mediaSerial);
    });
    
    let filteredItems = [];
    if (type === 'templates') {
        filteredItems = allItems.filter(item => item.type === 'template' && item.serial && !usedSerials.has(item.serial));
    } else if (type === 'media') {
        const mediaTypeEl = document.querySelector('input[name="completeMediaType"]:checked');
        const mediaType = mediaTypeEl ? mediaTypeEl.value : 'image';
        const expectedPrefix = mediaType === 'video' ? 'vid-' : 'img-';
        filteredItems = allItems.filter(item => item.type === 'media' && item.serial && item.serial.startsWith(expectedPrefix) && !usedSerials.has(item.serial));
    }
    
    if (filteredItems.length === 0) {
        dropdown.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 12px;">لا توجد عناصر متاحة غير مرتبطة.</div>';
        return;
    }
    
    dropdown.innerHTML = filteredItems.map(item => `
        <div class="vault-dropdown-item" onclick="selectVaultItem('${item.serial}', '${type}')">
            <div style="display:flex; align-items:center; gap:8px;">
                <i data-lucide="${item.icon}" style="color:${item.color}; width: 14px; height: 14px;"></i>
                <div style="font-size:12px; font-weight:700;">${escapeHTML(item.name)}</div>
            </div>
            <div class="modal-badge" style="font-size: 10px;">${escapeHTML(item.serial)}</div>
        </div>
    `).join('');
    
    if(window.lucide) lucide.createIcons();
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.vault-dropdown') && !event.target.closest('.dropdown-toggle')) {
        document.querySelectorAll('.vault-dropdown').forEach(d => d.style.display = 'none');
    }
});

export function selectVaultItem(serial, type) {
    let allItems = [];
    vaultItems.forEach(v => {
        if(v.contents) allItems.push(...v.contents);
    });
    allItems.push(...getCustomVault());
    
    const item = allItems.find(i => i.serial === serial);
    if (!item) return;
    
    if (type === 'templates') {
        document.getElementById('completePostTextSerial').textContent = serial;
        document.getElementById('completePostCaption').value = item.caption || item.name;
        document.getElementById('completePostTitle').value = item.name;
    } else if (type === 'media') {
        document.getElementById('completePostMediaSerial').textContent = serial;
        document.getElementById('completePostFileNameDisplay').textContent = "تم الاختيار من المخزن: " + item.name;
        document.getElementById('completePostFileUpload').value = '';
    }
    
    const dropdown = document.getElementById('dropdown-' + type);
    if (dropdown) dropdown.style.display = 'none';
}

function generateSerialFromName(prefix, str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return prefix + Math.abs(hash).toString().substring(0, 5);
}

export async function loadStoreFromFolders() {
    const folders = [
        { path: 'store/img/', apiPath: 'store/img', type: 'media', icon: 'image', color: '#E4405F', bg: 'rgba(228,64,95,0.08)', vaultTarget: 'graphics', prefix: 'img-' },
        { path: 'store/vid/', apiPath: 'store/vid', type: 'media', icon: 'video', color: '#1e3a5f', bg: 'rgba(30,58,95,0.08)', vaultTarget: 'videos', prefix: 'vid-' },
        { path: 'store/fil/', apiPath: 'store/fil', type: 'file', icon: 'file', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', vaultTarget: 'files', prefix: 'fil-' }
    ];

    let isGithub = window.location.hostname.endsWith('github.io');
    let githubApiBase = null;
    if (isGithub) {
        const username = window.location.hostname.split('.')[0];
        const repo = window.location.pathname.split('/')[1];
        githubApiBase = `https://api.github.com/repos/${username}/${repo}/contents/`;
    }

    const fetchedItems = [];

    for (let folder of folders) {
        try {
            let fileNames = [];
            
            if (isGithub && githubApiBase) {
                const res = await fetch(githubApiBase + folder.apiPath);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        fileNames = data.filter(item => item.type === 'file').map(item => item.name);
                    }
                }
            } else {
                const res = await fetch(folder.path);
                if (res.ok) {
                    const text = await res.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const links = Array.from(doc.querySelectorAll('a'));
                    fileNames = links
                        .map(a => a.getAttribute('href'))
                        .filter(href => href && !href.startsWith('?') && href !== '../' && href !== '/' && !href.endsWith('/'))
                        .map(href => href.split('/').pop())
                        .filter(name => name && name !== '');
                }
            }

            fileNames.forEach(name => {
                fetchedItems.push({
                    name: name,
                    size: 'محلي',
                    icon: folder.icon,
                    color: folder.color,
                    bg: folder.bg,
                    serial: generateSerialFromName(folder.prefix, name),
                    type: folder.type,
                    vaultTarget: folder.vaultTarget,
                    isLocalSync: true,
                    localPath: folder.path + name
                });
            });

        } catch (e) {
            console.error('Failed to sync folder:', folder.path, e);
        }
    }

    return fetchedItems;
}
