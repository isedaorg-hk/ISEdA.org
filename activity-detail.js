/* ============================================================
   ISEdA — 通用活動詳情頁渲染器
   日後內容管理頁只需建立 data/activities/*.json 資料檔，
   本模板會以 ?event=<slug> 載入並安全呈現活動資訊。
   ============================================================ */
(function () {
    'use strict';

    const fallbackSlug = 'community-inclusion-day-demo';
    const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const brands = {
        'zh-Hant': 'ISEdA 國際特殊教育協會',
        'zh-Hans': 'ISEdA 国际特殊教育协会',
        en: 'ISEdA International Special Education Association'
    };
    let activity = null;

    function activeLanguage() {
        const lang = document.documentElement.lang;
        return ['zh-Hant', 'zh-Hans', 'en'].includes(lang) ? lang : 'zh-Hant';
    }

    function text(value) {
        return typeof value === 'string' ? value : '';
    }

    function translationFor(lang) {
        if (!activity || !activity.translations) return null;
        return activity.translations[lang] || activity.translations['zh-Hant'] || activity.translations.en || null;
    }

    function createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content !== undefined) element.textContent = text(content);
        return element;
    }

    function fillKeyValueList(target, records, className) {
        target.replaceChildren();
        (Array.isArray(records) ? records : []).forEach(function (record) {
            const wrapper = createElement('div', className);
            const label = createElement('dt', '', record.label);
            const value = createElement('dd', '', record.value);
            wrapper.append(label, value);
            target.appendChild(wrapper);
        });
    }

    function renderCover(lang) {
        const cover = document.getElementById('activityCover');
        const placeholder = document.getElementById('activityCoverPlaceholder');
        if (!cover || !placeholder) return;

        const hasCover = activity.cover && /^https?:\/\//i.test(text(activity.cover.src));
        cover.classList.toggle('has-activity-cover', hasCover);
        cover.setAttribute('aria-label', text(activity.cover && activity.cover.alt && activity.cover.alt[lang]) || placeholder.textContent.trim());
        if (!hasCover) return;

        cover.replaceChildren();
        const image = document.createElement('img');
        image.src = activity.cover.src;
        image.alt = text(activity.cover.alt && activity.cover.alt[lang]);
        image.width = 1200;
        image.height = 760;
        image.decoding = 'async';
        cover.appendChild(image);
    }

    function renderDescription(translation) {
        const target = document.getElementById('activityDescription');
        target.replaceChildren();
        (Array.isArray(translation.description) ? translation.description : []).forEach(function (paragraph) {
            target.appendChild(createElement('p', '', paragraph));
        });
    }

    function renderHighlights(translation) {
        const target = document.getElementById('activityHighlights');
        target.replaceChildren();
        (Array.isArray(translation.highlights) ? translation.highlights : []).forEach(function (highlight) {
            target.appendChild(createElement('li', '', highlight));
        });
    }

    function renderSchedule(translation) {
        const target = document.getElementById('activitySchedule');
        target.replaceChildren();
        (Array.isArray(translation.schedule) ? translation.schedule : []).forEach(function (item) {
            const listItem = createElement('li', 'activity-schedule-item');
            const time = createElement('p', 'activity-schedule-time', item.time);
            const copy = createElement('div', 'activity-schedule-copy');
            copy.append(
                createElement('h4', '', item.title),
                createElement('p', '', item.description)
            );
            listItem.append(time, copy);
            target.appendChild(listItem);
        });
    }

    function renderSupports(translation) {
        const section = document.getElementById('activitySupportSection');
        const target = document.getElementById('activitySupports');
        const supports = Array.isArray(translation.supports) ? translation.supports : [];
        if (!section || !target) return;
        section.hidden = supports.length === 0;
        target.replaceChildren();
        supports.forEach(function (support) {
            const card = createElement('article', 'activity-support-card');
            card.append(
                createElement('h4', '', support.title),
                createElement('p', '', support.description)
            );
            target.appendChild(card);
        });
    }

    function renderGallery(lang) {
        const section = document.getElementById('activityGallerySection');
        const target = document.getElementById('activityGallery');
        const gallery = Array.isArray(activity.gallery) ? activity.gallery : [];
        if (!section || !target) return;
        section.hidden = gallery.length === 0;
        target.replaceChildren();
        gallery.forEach(function (item) {
            if (!/^https?:\/\//i.test(text(item.src))) return;
            const figure = createElement('figure', 'activity-gallery-item');
            const image = document.createElement('img');
            image.src = item.src;
            image.alt = text(item.alt && item.alt[lang]);
            image.loading = 'lazy';
            image.decoding = 'async';
            figure.appendChild(image);
            if (item.caption && text(item.caption[lang])) {
                figure.appendChild(createElement('figcaption', '', item.caption[lang]));
            }
            target.appendChild(figure);
        });
        section.hidden = target.childElementCount === 0;
    }

    function renderRegistration(translation) {
        const panel = document.getElementById('activityRegistration');
        const textElement = document.getElementById('activityRegistrationText');
        const link = document.getElementById('activityRegistrationLink');
        const note = document.getElementById('activityRegistrationNote');
        const registration = translation.registration || {};
        const url = text(registration.url);
        if (!panel || !textElement || !link || !note) return;

        panel.hidden = !text(registration.text) && !url;
        textElement.textContent = text(registration.text);
        note.textContent = text(registration.note);
        if (/^https?:\/\//i.test(url)) {
            link.hidden = false;
            link.href = url;
            link.textContent = text(registration.label);
        } else {
            link.hidden = true;
            link.removeAttribute('href');
            link.textContent = '';
        }
    }

    function setDynamicMetadata(translation) {
        const title = text(translation.title);
        const summary = text(translation.summary);
        document.title = title ? title + '｜' + brands[activeLanguage()] : brands[activeLanguage()];
        const description = document.querySelector('meta[name="description"]');
        if (description && summary) description.setAttribute('content', summary);
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && activity.slug) canonical.setAttribute('href', 'https://iseda.org.hk/activity-detail.html?event=' + encodeURIComponent(activity.slug));
    }

    function render() {
        const lang = activeLanguage();
        const translation = translationFor(lang);
        if (!translation) return;

        document.getElementById('activityKicker').textContent = text(translation.kicker);
        document.getElementById('activityStatus').textContent = text(translation.status);
        document.getElementById('activity-title').textContent = text(translation.title);
        document.getElementById('breadcrumbEvent').textContent = text(translation.title);
        document.getElementById('activitySummary').textContent = text(translation.summary);
        fillKeyValueList(document.getElementById('activityHeroFacts'), translation.heroFacts, 'activity-hero-fact');
        fillKeyValueList(document.getElementById('activityInfoList'), translation.info, 'activity-info-row');
        renderCover(lang);
        renderDescription(translation);
        renderHighlights(translation);
        renderSchedule(translation);
        renderSupports(translation);
        renderGallery(lang);
        renderRegistration(translation);
        setDynamicMetadata(translation);
    }

    function showLoadError() {
        const main = document.getElementById('main-content');
        if (!main) return;
        main.replaceChildren();
        const section = createElement('section', 'section activity-template-error');
        const container = createElement('div', 'container');
        container.append(
            createElement('h2', '', '活動資料暫時未能載入'),
            createElement('p', '', '請返回活動專區，或稍後再試。'),
            Object.assign(createElement('a', 'btn-outline', '返回活動專區'), { href: 'events.html' })
        );
        section.appendChild(container);
        main.appendChild(section);
    }

    function loadActivity() {
        const requested = new URLSearchParams(window.location.search).get('event') || fallbackSlug;
        const slug = validSlug.test(requested) ? requested : fallbackSlug;
        fetch('data/activities/' + slug + '.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) throw new Error('Activity data not found');
                return response.json();
            })
            .then(function (data) {
                activity = data;
                render();
                document.addEventListener('langchange', render);
            })
            .catch(showLoadError);
    }

    document.addEventListener('DOMContentLoaded', loadActivity);
}());
