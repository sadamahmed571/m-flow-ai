import { vaultItems, currentCounters, saveCustomPost, saveToCustomVault, getCustomVault, escapeHTML, saveCounters } from './state.js';
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

        mergedVaults[targetVaultIndex].contents.unshift(item);
    });

    const grid = document.getElementById('storeGrid');
    if (!grid) return;
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

                    const previewContent = (c.type === 'media' && c.icon === 'image')
                        ? `<img src="https://picsum.photos/seed/${c.serial}/100/100" loading="lazy" alt="${escapeHTML(c.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`
                        : `<i data-lucide="${c.icon}"></i>`;

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
                            ${c.schedule ? '<div class="item-schedule"><i data-lucide="calendar" style="width: 12px; height: 12px;"></i> ' + escapeHTML(c.schedule) + '</div>' : '<div style="height: 16px;"></div>'}
                        </div>
                        <div class="item-actions">
                            <button class="item-action-btn danger" data-action="delete" data-name="${escapeHTML(c.name)}" title="حذف">
                                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="item-action-btn" data-action="reschedule" title="إعادة جدولة">
                                <i data-lucide="calendar-clock" style="width: 16px; height: 16px;"></i>
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
            if (action === 'delete') {
                showToast('تم حذف العنصر', 'success');
            } else if (action === 'reschedule') {
                showToast('جاري فتح التقويم...', 'info');
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
    const typeEl = document.querySelector('input[name=\"itemType\"]:checked');
    if (!typeEl) return;
    const type = typeEl.value;
    const mediaArea = document.getElementById('dynamicAreaMedia');
    const templateArea = document.getElementById('dynamicAreaTemplate');
    const serialInput = document.getElementById('itemSerial');
    const fileInput = document.getElementById('fileUpload');

    if (type === 'media') {
        mediaArea.style.display = 'block';
        templateArea.style.display = 'none';
        if (fileInput.files.length > 0) {
            handleFileUpload(fileInput);
        } else {
            serialInput.value = 'img-' + (currentCounters.img + 1);
        }
    } else {
        mediaArea.style.display = 'none';
        templateArea.style.display = 'block';
        serialInput.value = 'tex-' + (currentCounters.tex + 1);
    }
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
    document.getElementById('completePostMediaSerial').textContent = 'img-' + (currentCounters.img + 1);
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
        const mediaSerialSpan = document.getElementById('completePostMediaSerial');
        if (type.startsWith('video/')) {
            mediaSerialSpan.textContent = 'vid-' + (currentCounters.vid + 1);
        } else {
            mediaSerialSpan.textContent = 'img-' + (currentCounters.img + 1);
        }
    }
}

export function saveCompletePost() {
    const title = document.getElementById('completePostTitle').value.trim();
    const caption = document.getElementById('completePostCaption').value.trim();
    const schedule = document.getElementById('completePostSchedule').value;
    const mediaFile = document.getElementById('completePostFileUpload').files[0];

    if(!title) {
        showToast('الرجاء إدخال عنوان المنشور', 'error');
        return;
    }
    if(!schedule) {
        showToast('الرجاء اختيار تاريخ الجدولة', 'error');
        return;
    }

    const dateObj = new Date(schedule);
    const day = dateObj.getDate();

    const postData = {
        title: title,
        caption: caption,
        mediaSerial: document.getElementById('completePostMediaSerial').textContent,
        textSerial: document.getElementById('completePostTextSerial').textContent,
        day: day
    };

    saveCustomPost(day, postData);

    if(caption) {
        saveToCustomVault({
            vaultTarget: 'templates',
            name: title,
            size: '1 KB',
            icon: 'file-text',
            color: '#2d6a4f',
            bg: 'rgba(45,106,79,0.08)',
            serial: postData.textSerial,
            schedule: schedule,
            type: 'template'
        });
        currentCounters.tex++;
    }
    if(mediaFile) {
        const isVideo = mediaFile.type.startsWith('video/');
        saveToCustomVault({
            vaultTarget: isVideo ? 'videos' : 'graphics',
            name: mediaFile.name,
            size: Math.round(mediaFile.size / 1024) + ' KB',
            icon: isVideo ? 'video' : 'image',
            color: isVideo ? '#1e3a5f' : '#E4405F',
            bg: isVideo ? 'rgba(30,58,95,0.08)' : 'rgba(228,64,95,0.08)',
            serial: postData.mediaSerial,
            schedule: schedule,
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
