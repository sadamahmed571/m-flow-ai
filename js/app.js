import { renderSocialRadar, renderPlatforms, toggleLinkInput, handlePlatformCheck, toggleAddPlatformForm, updatePlatformPreview, addNewPlatform } from './social.js';
import { renderCalendar, changeMonth, toggleView, openAddEventModal, closeEventModal, saveEvent, deleteEvent, selectDay, closeDayDetailsModal, renderEvents } from './calendar.js';
import { renderVault } from './vault.js';
import { showToast, createConfetti } from './utils.js';
import { renderIdeas, generateIdea, deleteIdea } from './ideas.js';
import { renderBrainStatus, saveBrainConfig } from './brain.js';

function init() {
    renderSocialRadar();
    renderCalendar();
    renderPlatforms();
    renderVault();
    renderEvents();
    renderIdeas();
    renderBrainStatus();

    const captionArea = document.getElementById('postCaption');
    if (captionArea) {
        captionArea.style.height = '';
        captionArea.style.height = captionArea.scrollHeight + 'px';
        captionArea.oninput = function() {
            this.style.height = '';
            this.style.height = this.scrollHeight + 'px';
        };
    }
}

window.changeMonth = changeMonth;
window.toggleView = toggleView;
window.openAddEventModal = openAddEventModal;
window.closeEventModal = closeEventModal;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.selectDay = selectDay;
window.closeDayDetailsModal = closeDayDetailsModal;
window.toggleLinkInput = toggleLinkInput;
window.handlePlatformCheck = handlePlatformCheck;
window.toggleAddPlatformForm = toggleAddPlatformForm;
window.updatePlatformPreview = updatePlatformPreview;
window.addNewPlatform = addNewPlatform;
window.copyCaption = () => {
    const caption = document.getElementById('postCaption');
    caption.select();
    document.execCommand('copy');
    showToast('تم نسخ نص المنشور إلى الحافظة', 'success');
};
window.downloadMedia = () => {
    showToast('جاري تنزيل الوسائط...', 'info');
    setTimeout(() => showToast('تم التنزيل بنجاح', 'success'), 1000);
};

window.generateIdea = generateIdea;
window.deleteIdea = deleteIdea;
window.saveBrainConfig = saveBrainConfig;

window.enhanceCaption = () => {
    const caption = document.getElementById('postCaption');
    if (!caption.value.trim()) {
        showToast('يرجى إدخال نص أولاً لتحسينه', 'error');
        return;
    }
    showToast('جاري تحسين النص باستخدام الذكاء الاصطناعي...', 'info');

    // Simulate AI improvement
    setTimeout(() => {
        const originalText = caption.value;
        caption.value = "✨ نسخة محسنة بالذكاء الاصطناعي ✨\n\n" + originalText + "\n\n🚀 تم تحسين المحتوى لجذب تفاعل أكبر!";
        caption.style.height = '';
        caption.style.height = caption.scrollHeight + 'px';
        showToast('تم تحسين النص بنجاح!', 'success');
        createConfetti();
    }, 1500);
};

document.addEventListener('DOMContentLoaded', init);
