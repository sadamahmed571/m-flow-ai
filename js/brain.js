import { showToast } from './utils.js';

export function getBrainConfig() {
    return JSON.parse(localStorage.getItem('assistantBrain') || '{"instructions": "", "document": "", "lastUpdated": null}');
}

export function saveBrainConfig() {
    const instructions = document.getElementById('brainInstructions').value.trim();
    const documentText = document.getElementById('brainDoc').value.trim();

    const config = {
        instructions,
        document: documentText,
        lastUpdated: new Date().toLocaleString('ar-SA')
    };

    localStorage.setItem('assistantBrain', JSON.stringify(config));
    showToast('تم تحديث عقل المساعد وتخزين المعلومات بنجاح', 'success');
    renderBrainStatus();
}

export function renderBrainStatus() {
    const statusContainer = document.getElementById('brainStatus');
    const instructionsInput = document.getElementById('brainInstructions');
    const docInput = document.getElementById('brainDoc');

    if (!statusContainer) return;

    const config = getBrainConfig();

    // Sync inputs if they exist and are empty (first load)
    if (instructionsInput && !instructionsInput.value) instructionsInput.value = config.instructions;
    if (docInput && !docInput.value) docInput.value = config.document;

    const hasData = config.instructions || config.document;

    statusContainer.innerHTML = `
        <div class="status-card ${hasData ? 'active' : ''}">
            <div class="status-header">
                <i data-lucide="${hasData ? 'check-circle' : 'circle'}"></i>
                <span>حالة الذاكرة: ${hasData ? 'مفعلة' : 'خاملة'}</span>
            </div>
            ${config.lastUpdated ? `<div class="status-meta">آخر تحديث: ${config.lastUpdated}</div>` : ''}
            <div class="status-info">
                ${config.document ? `<p><i data-lucide="file-text"></i> تم استيعاب وثيقة المشروع (${config.document.length} حرف)</p>` : '<p>لم يتم رفع وثيقة المشروع بعد</p>'}
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}
