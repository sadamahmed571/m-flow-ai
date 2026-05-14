import { renderStore, openAddItemModal, closeAddItemModal, handleItemTypeChange, handleFileUpload, saveNewItem, openAddPostModal, closeAddPostModal, handleCompletePostFileUpload, saveCompletePost } from './vault.js';

function init() {
    renderStore();
}

window.openAddItemModal = openAddItemModal;
window.closeAddItemModal = closeAddItemModal;
window.handleItemTypeChange = handleItemTypeChange;
window.handleFileUpload = handleFileUpload;
window.saveNewItem = saveNewItem;
window.openAddPostModal = openAddPostModal;
window.closeAddPostModal = closeAddPostModal;
window.handleCompletePostFileUpload = handleCompletePostFileUpload;
window.saveCompletePost = saveCompletePost;

document.addEventListener('DOMContentLoaded', init);
