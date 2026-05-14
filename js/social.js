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

    container.innerHTML = summaryHTML + cardsHTML;
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
