import { renderSocialRadar, renderPlatforms, toggleLinkInput, handlePlatformCheck } from './social.js';
import { renderCalendar, changeMonth, toggleView, openAddEventModal, closeEventModal, saveEvent, deleteEvent, selectDay, closeDayDetailsModal, renderEvents } from './calendar.js';
import { renderVault } from './vault.js';
import { showToast, createConfetti } from './utils.js';

function init() {
    renderSocialRadar();
    renderCalendar();
    renderPlatforms();
    renderVault();
    renderEvents();

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

document.addEventListener('DOMContentLoaded', init);
