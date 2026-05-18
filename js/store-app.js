import { renderStore, openAddItemModal, closeAddItemModal, handleItemTypeChange, handleFileUpload, saveNewItem, openAddPostModal, closeAddPostModal, handleCompletePostFileUpload, saveCompletePost, updateSerialByVault, switchMainTab, updateCompletePostMediaSerial, toggleVaultDropdown, selectVaultItem, loadStoreFromFolders } from './vault.js';

async function init() {
    renderStore(); // عرض البيانات المخزنة فوراً
    
    // محاولة جلب الملفات المضافة محلياً (مثلاً عبر GitHub أو Live Server)
    const localItems = await loadStoreFromFolders();
    if (localItems && localItems.length > 0) {
        window.syncedLocalItems = localItems;
        renderStore(); // إعادة العرض لدمج الملفات المستوردة
    }
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
window.updateSerialByVault = updateSerialByVault;
window.switchMainTab = switchMainTab;
window.updateCompletePostMediaSerial = updateCompletePostMediaSerial;
window.toggleVaultDropdown = toggleVaultDropdown;
window.selectVaultItem = selectVaultItem;

document.addEventListener('DOMContentLoaded', init);
