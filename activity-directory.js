/* ============================================================
   ISEdA — 官方活動目錄渲染器
   日後內容管理頁只需更新 data/activities/index.json，
   此頁便會自動列出可點入的活動卡片。
   ============================================================ */
(function () {
    'use strict';

    function activeLanguage() {
        const lang = document.documentElement.lang;
        return ['zh-Hant', 'zh-Hans', 'en'].includes(lang) ? lang : 'zh-Hant';
    }

    function text(value) {
        return typeof value === 'string' ? value : '';
    }

    function isSafeImageSource(value) {
        const source = text(value);
        return /^https:\/\//i.test(source) || /^assets\/activities\/[a-z0-9][a-z0-9/_-]*\.(?:png|jpe?g|webp|avif)$/i.test(source);
    }

    function isValidSlug(value) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text(value));
    }

    function createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content !== undefined) element.textContent = text(content);
        return element;
    }

    function directoryLabel(key) {
        const dictionaries = {
            'zh-Hant': { details: '查看活動詳情', location: '活動地點' },
            'zh-Hans': { details: '查看活动详情', location: '活动地点' },
            en: { details: 'View activity details', location: 'Venue' }
        };
        return dictionaries[activeLanguage()][key];
    }

    function render(activities) {
        const grid = document.getElementById('activityDirectoryGrid');
        const empty = document.getElementById('activityDirectoryEmpty');
        if (!grid || !empty) return;

        const lang = activeLanguage();
        grid.replaceChildren();
        (Array.isArray(activities) ? activities : []).forEach(function (activity) {
            const translation = activity.translations && (activity.translations[lang] || activity.translations['zh-Hant'] || activity.translations.en);
            if (!translation || !isValidSlug(activity.slug)) return;

            const card = createElement('article', 'activity-directory-card');
            card.setAttribute('role', 'listitem');
            const media = createElement('div', 'activity-directory-card-media');
            if (isSafeImageSource(activity.cover)) {
                const image = document.createElement('img');
                image.src = activity.cover;
                image.alt = text(translation.imageAlt);
                image.loading = 'lazy';
                image.decoding = 'async';
                media.appendChild(image);
            }

            const content = createElement('div', 'activity-directory-card-content');
            const status = createElement('p', 'activity-directory-status', translation.status);
            const title = createElement('h3', '', translation.title);
            const summary = createElement('p', 'activity-directory-card-summary', translation.summary);
            const meta = createElement('dl', 'activity-directory-card-meta');
            const date = createElement('div', 'activity-directory-card-meta-item');
            date.append(createElement('dt', '', translation.date));
            const venue = createElement('div', 'activity-directory-card-meta-item');
            venue.append(
                createElement('dt', 'activity-directory-meta-label', directoryLabel('location')),
                createElement('dd', '', translation.location)
            );
            meta.append(date, venue);

            const link = createElement('a', 'activity-directory-card-link', directoryLabel('details'));
            link.href = 'activity-detail.html?event=' + encodeURIComponent(activity.slug);
            link.setAttribute('aria-label', directoryLabel('details') + '：' + text(translation.title));
            content.append(status, title, summary, meta, link);
            card.append(media, content);
            grid.appendChild(card);
        });
        empty.hidden = grid.childElementCount > 0;
    }

    function loadDirectory() {
        fetch('data/activities/index.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) throw new Error('Activity directory not found');
                return response.json();
            })
            .then(function (data) {
                const activities = data && data.activities ? data.activities : [];
                render(activities);
                document.addEventListener('langchange', function () { render(activities); });
            })
            .catch(function () {
                render([]);
            });
    }

    document.addEventListener('DOMContentLoaded', loadDirectory);
}());
