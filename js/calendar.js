import { calendarEvents, dailyPosts, getCustomEvents, saveCustomEvent, deleteCustomEvent, getCustomPosts, escapeHTML } from './state.js';
import { showToast, createConfetti } from './utils.js';

let currentMonth = new Date(2026, 4, 1);
let selectedDay = 14;

export function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const monthYearEl = document.getElementById('monthYear');
    if (!monthYearEl) return;
    monthYearEl.textContent = monthNames[month] + ' ' + year;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = document.getElementById('daysGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const customEvents = getCustomEvents();

    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const cell = document.createElement('div');
        cell.className = 'day-cell other-month';
        cell.textContent = day;
        grid.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.textContent = day;

        if (year === 2026 && month === 4 && day === 14) cell.classList.add('today');
        if (day === selectedDay) cell.classList.add('active');

        const hasCustomEvent = customEvents.some(e => e.day === day);
        if (hasCustomEvent) cell.classList.add('has-event');

        const event = calendarEvents[day];
        if (event) {
            const dots = document.createElement('div');
            dots.className = 'day-dots';
            const dot = document.createElement('div');
            dot.className = 'dot ' + (event.type === 'ad' ? 'blue' : 'green');
            dots.appendChild(dot);
            cell.appendChild(dots);
        }

        cell.onclick = () => selectDay(day);
        grid.appendChild(cell);
    }

    const remaining = (7 - ((firstDay + daysInMonth) % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell other-month';
        cell.textContent = day;
        grid.appendChild(cell);
    }
}

export function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

export function toggleView(mode) {
    const calView = document.getElementById('calendarViewContainer');
    const lstView = document.getElementById('listViewContainer');
    if (!calView || !lstView) return;

    if (mode === 'calendar') {
        calView.style.display = 'block';
        lstView.style.display = 'none';
    } else {
        calView.style.display = 'none';
        lstView.style.display = 'block';
        renderListView();
    }
}

export function renderListView() {
    const wrapper = document.getElementById('postsListWrapper');
    if (!wrapper) return;

    const customPosts = getCustomPosts();
    const mergedPosts = { ...dailyPosts, ...customPosts };

    const sortedDays = Object.keys(mergedPosts).map(Number).sort((a,b) => a - b);

    if (sortedDays.length === 0) {
        wrapper.innerHTML = '<div style=\"text-align: center; color: var(--text-secondary); padding: 5px;\">لا توجد منشورات مجدولة</div>';
        return;
    }

    wrapper.innerHTML = sortedDays.map((day, index) => {
        const post = mergedPosts[day];
        const postNum = '#P-' + (index + 1).toString().padStart(3, '0');
        const mediaNum = post.mediaSerial || '#M-26' + day.toString().padStart(2, '0');
        const textNum = post.textSerial || '#T-26' + day.toString().padStart(2, '0');

        return `
            <div class="list-post-card">
                <div class="list-post-date">
                    <span>${day}</span>
                    <span>مايو</span>
                </div>
                <div class="list-post-content">
                    <div class="list-post-header">
                        <div class="list-post-title">${escapeHTML(post.title)}</div>
                        <div class="list-post-id">${escapeHTML(postNum)}</div>
                    </div>
                    <div class="list-post-caption">
                        ${escapeHTML(post.caption)}
                    </div>
                    <div class="list-post-meta">
                        <span><i data-lucide="image" style="width: 14px; height: 14px;"></i> معرف الوسائط: ${escapeHTML(mediaNum)}</span>
                        <span><i data-lucide="file-text" style="width: 14px; height: 14px;"></i> قالب: ${escapeHTML(textNum)}</span>
                        <span><i data-lucide="clock" style="width: 14px; height: 14px;"></i> مجدول</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}

export function selectDay(day) {
    selectedDay = day;
    renderCalendar();
    const event = calendarEvents[day];
    const post = dailyPosts[day] || getCustomPosts()[day];
    const customEvt = getCustomEvents().find(e => e.day === day);

    showDayDetailsModal(day, post, event, customEvt);
}

export function showDayDetailsModal(day, post, event, customEvt) {
    const modalDayNumber = document.getElementById('modalDayNumber');
    if (!modalDayNumber) return;
    modalDayNumber.textContent = day;

    const eventContent = document.getElementById('modalEventContent');
    const postContent = document.getElementById('modalPostContent');

    let eventHtml = '';
    if (event) {
        let color = event.type === 'ad' ? '#E4405F' : 'var(--primary)';
        let icon = event.type === 'ad' ? 'megaphone' : 'star';
        eventHtml = `<div style="background: ${color}15; border-right: 4px solid ${color}; padding: 16px; border-radius: var(--radius-xs);">
            <div style="color: ${color}; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 16px;">
            <i data-lucide="${icon}" style="width: 20px; height: 20px;"></i>مناسبة خاصة</div>
            <div style="color: var(--text); font-size: 15px; font-weight: 600;">${escapeHTML(event.title)}</div></div>`;
    } else if (customEvt) {
        let color = customEvt.color;
        let icon = customEvt.type === 'holiday' ? 'moon' : customEvt.type === 'global' ? 'globe' : 'home';
        eventHtml = `<div style="background: ${color}15; border-right: 4px solid ${color}; padding: 16px; border-radius: var(--radius-xs);">
            <div style="color: ${color}; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 16px;">
            <i data-lucide="${icon}" style="width: 20px; height: 20px;"></i>مناسبة مميزة</div>
            <div style="color: var(--text); font-size: 15px; font-weight: 600;">${escapeHTML(customEvt.title)}</div></div>`;
    }

    if (eventHtml) {
        eventContent.innerHTML = eventHtml;
        eventContent.style.display = 'block';
    } else {
        eventContent.style.display = 'none';
    }

    if (post) {
        postContent.innerHTML = `<div style="font-weight: 800; color: var(--text); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 16px;">
            <i data-lucide="file-text" style="width: 20px; height: 20px; color: var(--text-secondary);"></i>محتوى المنشور</div>
            <div style="color: var(--primary); font-weight: 700; margin-bottom: 12px; font-size: 15px; background: rgba(30,58,95,0.05); padding: 10px; border-radius: 6px;">${escapeHTML(post.title)}</div>
            <div style="color: var(--text-secondary); font-size: 14px; line-height: 1.8; white-space: pre-wrap; padding: 0 4px;">${escapeHTML(post.caption)}</div>`;
    } else {
        postContent.innerHTML = '<div style=\"text-align: center; color: var(--text-secondary); padding: 24px 0;\">' +
            '<i data-lucide=\"calendar-x\" style=\"width: 40px; height: 40px; margin-bottom: 12px; opacity: 0.3; display: block; margin-left: auto; margin-right: auto;\"></i>' +
            '<div style=\"font-weight: 600; font-size: 15px;\">لا يوجد منشور مجدول لهذا اليوم</div></div>';
    }

    document.getElementById('dayDetailsModal').style.display = 'flex';
    if (window.lucide) lucide.createIcons();
}

export function closeDayDetailsModal() {
    document.getElementById('dayDetailsModal').style.display = 'none';
}

export function renderEvents() {
    const list = document.getElementById('eventsList');
    if (!list) return;
    const typeIcons = {
        holiday: 'moon',
        global: 'globe',
        local: 'home'
    };
    const typeLabels = {
        holiday: 'عيد / مناسبة دينية',
        global: 'مناسبة عالمية',
        local: 'مناسبة محلية'
    };

    const customEvents = getCustomEvents();

    list.innerHTML = customEvents.map((evt, idx) => `
        <div class="event-item" style="--event-color: ${evt.color};">
            <div class="event-date">
                <span>${evt.day}</span>
                مايو
            </div>
            <div class="event-info">
                <div class="event-title">${escapeHTML(evt.title)}</div>
                <div class="event-type">
                    <i data-lucide="${typeIcons[evt.type]}" style="width: 12px; height: 12px;"></i>
                    ${typeLabels[evt.type]}
                </div>
            </div>
            <button class="btn-delete-event" data-index="${idx}">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();

    list.querySelectorAll('.btn-delete-event').forEach(btn => {
        btn.onclick = () => deleteEvent(parseInt(btn.dataset.index));
    });
}

export function openAddEventModal() {
    document.getElementById('eventModal').style.display = 'flex';
}

export function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('eventName').value = '';
    document.getElementById('eventDay').value = '';
}

export function saveEvent() {
    const name = document.getElementById('eventName').value.trim();
    const dayInput = document.getElementById('eventDay').value;
    const day = parseInt(dayInput);
    const type = document.getElementById('eventType').value;

    if (!name) {
        showToast('يرجى إدخال اسم المناسبة', 'error');
        return;
    }
    if (!dayInput || isNaN(day) || day < 1 || day > 31) {
        showToast('يرجى إدخال يوم صحيح (1-31)', 'error');
        return;
    }

    const colors = { holiday: '#2d6a4f', global: '#1e3a5f', local: '#E4405F' };
    saveCustomEvent({ day, title: name, type, color: colors[type] });

    renderEvents();
    renderCalendar();
    closeEventModal();
    showToast('تمت إضافة المناسبة بنجاح', 'success');
    createConfetti();
}

export function deleteEvent(idx) {
    deleteCustomEvent(idx);
    renderEvents();
    renderCalendar();
    showToast('تم حذف المناسبة', 'info');
}
