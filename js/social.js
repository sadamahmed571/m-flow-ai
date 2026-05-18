import { svgs, platformsData, overallStats } from './state.js';
import { showToast, createConfetti } from './utils.js';

export function renderSocialRadar() {
    const container = document.getElementById('socialRadar');
    if (!container) return;

    const summaryHTML = `
        <div class="social-summary animate-in delay-1">
            <div class="summary-main">
                <div class="summary-icon">
                    <i data-lucide="pie-chart"></i>
                </div>
                <div>
                    <div class="summary-title">الأداء الكلي للحملة</div>
                    <div class="summary-sub">نظرة شاملة على أداء جميع المنصات</div>
                </div>
            </div>
            <div class="summary-stats">
                <div class="stat-box">
                    <div class="stat-value">${overallStats.progress}%</div>
                    <div class="stat-label">معدل التنفيذ</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                    <div class="stat-value">${overallStats.totalPublished}</div>
                    <div class="stat-label">منشور منفذ</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                    <div class="stat-value warning">${overallStats.totalUnpublished}</div>
                    <div class="stat-label">غير منفذ</div>
                </div>
            </div>
        </div>
    `;

    const cardsHTML = platformsData.map((p, i) => `
        <div class="social-card animate-in delay-${i + 2}" style="--card-color: ${p.color}; --card-color-light: ${p.colorLight}; --card-bg: ${p.bg};">
            <div class="social-header">
                <div class="social-icon">
                    ${svgs[p.id] || ''}
                </div>
                <div class="social-percent" id="percent-${p.id}">${p.progress}%</div>
            </div>
            <div class="social-name">${p.name}</div>
            <div class="progress-track">
                <div class="progress-fill" id="progress-${p.id}" style="width: 0%"></div>
            </div>
            <div class="social-stats-row">
                <span class="label">منشورات منفذة</span>
                <span class="value">${p.published} / ${p.total}</span>
            </div>
            <div class="social-stats-row">
                <span class="label">غير منفذة</span>
                <span class="value unpublished">${p.unpublished}</span>
            </div>
            <div class="social-link-row">
                <input type="text" class="link-input ${p.link ? '' : 'visible'}" id="link-input-${p.id}" placeholder="أدخل رابط صفحة المنصة...">
                <a href="${p.link}" target="_blank" class="saved-link ${p.link ? 'visible' : ''}" id="saved-link-${p.id}">${p.link}</a>
                <button class="btn-add-link" data-platform="${p.id}">
                    <i data-lucide="${p.link ? 'edit' : 'link'}"></i>
                    ${p.link ? 'تعديل' : 'إضافة رابط'}
                </button>
            </div>
        </div>
    `).join('');

    const addPlatformHTML = `
        <div class="social-card add-platform-card animate-in delay-5" style="border: 2px dashed var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; min-height: 220px; background: var(--surface);" onclick="toggleAddPlatformForm()">
            <div id="addPlatformBtn" style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                    <i data-lucide="plus" style="width: 24px; height: 24px;"></i>
                </div>
                <h4 style="color: var(--text-secondary); font-weight: 700; font-size: 16px;">إضافة منصة جديدة</h4>
            </div>
            
            <div id="addPlatformForm" style="display: none; width: 100%; text-align: right; cursor: default;" onclick="event.stopPropagation()">
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">اسم المنصة</label>
                    <input type="text" class="form-input" id="newPlatformName" list="platformSuggestions" placeholder="مثال: Snapchat, Pinterest..." style="padding: 8px; font-size: 13px;">
                    <datalist id="platformSuggestions">
                        <option value="Snapchat">
                        <option value="Pinterest">
                        <option value="LinkedIn">
                        <option value="Telegram">
                        <option value="Reddit">
                        <option value="Discord">
                        <option value="Threads">
                    </datalist>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">رابط الحساب</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="url" class="form-input" id="newPlatformUrl" placeholder="https://..." oninput="updatePlatformPreview(this.value)" style="direction: ltr; text-align: left; padding: 8px; font-size: 13px;">
                        <img id="newPlatformIconPreview" src="" style="width: 30px; height: 30px; border-radius: 4px; display: none; object-fit: contain; background: white; padding: 2px; border: 1px solid var(--border);">
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 15px;">
                    <button class="btn-primary" onclick="addNewPlatform(event)" style="flex: 1; padding: 8px; background: var(--primary); color: white; border: none; border-radius: var(--radius-xs); font-weight: 700; font-size: 13px; cursor: pointer;">إضافة</button>
                    <button onclick="toggleAddPlatformForm(event, false)" style="flex: 1; padding: 8px; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius-xs); font-weight: 700; font-size: 13px; cursor: pointer;">إلغاء</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = summaryHTML + cardsHTML + addPlatformHTML;
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        platformsData.forEach(p => {
            const bar = document.getElementById('progress-' + p.id);
            if (bar) bar.style.width = p.progress + '%';
        });
    }, 100);

    container.querySelectorAll('.btn-add-link').forEach(btn => {
        btn.onclick = () => toggleLinkInput(btn.dataset.platform);
    });
}

export function toggleLinkInput(pid) {
    const platform = platformsData.find(p => p.id === pid);
    const input = document.getElementById('link-input-' + pid);
    const saved = document.getElementById('saved-link-' + pid);
    const btn = input.nextElementSibling.nextElementSibling;

    if (input.classList.contains('visible')) {
        const val = input.value.trim();
        if (val) {
            platform.link = val;
            input.classList.remove('visible');
            saved.href = val;
            saved.textContent = val;
            saved.classList.add('visible');
            btn.innerHTML = '<i data-lucide=\"edit\"></i> تعديل';
            showToast('تم حفظ رابط ' + platform.name, 'success');
        } else {
            showToast('يرجى إدخال رابط صحيح', 'error');
        }
    } else {
        input.value = platform.link;
        input.classList.add('visible');
        saved.classList.remove('visible');
        btn.innerHTML = '<i data-lucide=\"save\"></i> حفظ';
    }
    if (window.lucide) lucide.createIcons();
}

export function toggleAddPlatformForm(event = null, show = true) {
    if (event) event.stopPropagation();
    const btn = document.getElementById('addPlatformBtn');
    const form = document.getElementById('addPlatformForm');
    const card = btn.closest('.add-platform-card');
    
    if (show && form.style.display === 'none') {
        btn.style.display = 'none';
        form.style.display = 'block';
        card.style.border = '1px solid var(--border)';
        card.style.cursor = 'default';
    } else if (!show) {
        btn.style.display = 'flex';
        form.style.display = 'none';
        card.style.border = '2px dashed var(--border)';
        card.style.cursor = 'pointer';
        document.getElementById('newPlatformName').value = '';
        document.getElementById('newPlatformUrl').value = '';
        document.getElementById('newPlatformIconPreview').style.display = 'none';
    }
}

export function updatePlatformPreview(url) {
    const preview = document.getElementById('newPlatformIconPreview');
    if (!url || !url.startsWith('http')) {
        preview.style.display = 'none';
        return;
    }
    try {
        const domain = new URL(url).hostname;
        preview.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        preview.style.display = 'block';
    } catch (e) {
        preview.style.display = 'none';
    }
}

export function addNewPlatform(event) {
    event.stopPropagation();
    const name = document.getElementById('newPlatformName').value.trim();
    const url = document.getElementById('newPlatformUrl').value.trim();
    
    if (!name || !url) {
        showToast('يرجى إدخال اسم المنصة ورابط الحساب', 'error');
        return;
    }
    
    let id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if(!id) id = 'plat_' + Math.floor(Math.random()*1000);

    if (platformsData.find(p => p.id === id)) {
        showToast('هذه المنصة موجودة مسبقاً', 'error');
        return;
    }
    
    let domain = '';
    try {
        domain = new URL(url).hostname;
    } catch(e) {}
    
    const imgIcon = domain ? `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" style="width: 32px; height: 32px; object-fit: contain;">` : '<i data-lucide="globe"></i>';
    svgs[id] = imgIcon;
    
    const newPlatform = {
        id: id,
        name: name,
        icon: '',
        color: '#1e3a5f',
        colorLight: '#2c5282',
        bg: 'rgba(30,58,95,0.08)',
        progress: 0,
        total: 10,
        published: 0,
        unpublished: 10,
        link: url
    };
    
    platformsData.push(newPlatform);
    showToast('تمت إضافة المنصة بنجاح!', 'success');
    renderSocialRadar();
    renderPlatforms();
}

export function updatePlatformProgress(platformId, increment = 5) {
    const platform = platformsData.find(p => p.id === platformId);
    if (!platform) return;
    const newProgress = Math.min(100, platform.progress + increment);
    platform.progress = newProgress;
    platform.published = Math.round((newProgress / 100) * platform.total);
    platform.unpublished = platform.total - platform.published;

    const bar = document.getElementById('progress-' + platformId);
    const percent = document.getElementById('percent-' + platformId);
    if (bar) bar.style.width = newProgress + '%';
    if (percent) percent.textContent = newProgress + '%';

    renderSocialRadar();
    createConfetti();
}

export function renderPlatforms() {
    const grid = document.getElementById('platformsGrid');
    if (!grid) return;
    const allPlatforms = ['facebook', 'x', 'instagram', 'whatsapp', 'tiktok', 'youtube'];

    grid.innerHTML = allPlatforms.map(pid => {
        const p = platformsData.find(x => x.id === pid);
        return `
            <div class="platform-check">
                <input type="checkbox" id="chk-${pid}" data-platform="${pid}">
                <label for="chk-${pid}">
                    <div class="platform-icon" style="background: ${p.bg}; color: ${p.color};">
                        ${svgs[pid] || ''}
                    </div>
                    <span>${p.name}</span>
                    <i data-lucide="check-circle" class="check-icon"></i>
                </label>
            </div>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();

    grid.querySelectorAll('input[type=\"checkbox\"]').forEach(input => {
        input.onchange = (e) => handlePlatformCheck(input.dataset.platform, e.target.checked);
    });
}

export function handlePlatformCheck(platformId, checked) {
    if (checked) {
        updatePlatformProgress(platformId, 5);
        showToast('تم تحديث تقدم ' + platformsData.find(p => p.id === platformId).name, 'success');
    }
}
