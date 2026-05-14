import { showToast, createConfetti } from './utils.js';

export function getSavedIdeas() {
    return JSON.parse(localStorage.getItem('marketingIdeas') || '[]');
}

export function saveIdea(idea) {
    const ideas = getSavedIdeas();
    ideas.unshift(idea);
    localStorage.setItem('marketingIdeas', JSON.stringify(ideas));
    renderIdeas();
}

export function deleteIdea(index) {
    const ideas = getSavedIdeas();
    ideas.splice(index, 1);
    localStorage.setItem('marketingIdeas', JSON.stringify(ideas));
    renderIdeas();
}

export function generateIdea() {
    const topic = document.getElementById('ideaTopic').value.trim();
    if (!topic) {
        showToast('يرجى إدخال موضوع لتوليد فكرة', 'error');
        return;
    }

    showToast('جاري توليد فكرة إبداعية...', 'info');

    setTimeout(() => {
        const ideas = [
            `فكرة حول ${topic}: سلسلة "خلف الكواليس" توضح كيف نقوم بمعالجة هذا الأمر بذكاء.`,
            `فكرة حول ${topic}: إنفوجرافيك تفاعلي يقارن بين الطرق التقليدية وطريقة تطبيق 360.`,
            `فكرة حول ${topic}: قصة نجاح لأحد العملاء الذين استفادوا من هذه الميزة بشكل غير متوقع.`,
            `فكرة حول ${topic}: تحدي لمدة 7 أيام لمستخدمينا لتجربة هذه الميزة ومشاركة نتائجهم.`
        ];
        const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];

        saveIdea({
            text: randomIdea,
            date: new Date().toLocaleDateString('ar-SA'),
            topic: topic
        });

        document.getElementById('ideaTopic').value = '';
        showToast('تم توليد وحفظ فكرة جديدة!', 'success');
        createConfetti();
    }, 1200);
}

export function renderIdeas() {
    const container = document.getElementById('ideasGrid');
    if (!container) return;

    const ideas = getSavedIdeas();
    if (ideas.length === 0) {
        container.innerHTML = '<div class="no-ideas">لا توجد أفكار محفوظة بعد. ابدأ بتوليد واحدة!</div>';
        return;
    }

    container.innerHTML = ideas.map((idea, index) => `
        <div class="idea-card">
            <div class="idea-badge">${idea.topic}</div>
            <p class="idea-text">${idea.text}</p>
            <div class="idea-footer">
                <span class="idea-date">${idea.date}</span>
                <button class="btn-delete-idea" onclick="deleteIdea(${index})">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}
