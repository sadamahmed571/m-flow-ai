export function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const colors = { info: '#1e3a5f', success: '#2d6a4f', error: '#c0392b' };
    const icons = { info: 'info', success: 'check-circle', error: 'alert-circle' };
    toast.style.setProperty('--toast-color', colors[type]);
    toast.innerHTML = '<i data-lucide=\"' + icons[type] + '\" style=\"color: ' + colors[type] + '; width: 18px; height: 18px;\"></i><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
    if (window.lucide) lucide.createIcons();
}

export function createConfetti() {
    const colors = ['#1e3a5f', '#2d6a4f', '#E4405F', '#f59e0b', '#8B5CF6'];
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '50%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1000);
    }
}
