/* ============================================================
   ISEdA 國際特殊教育協會 — 全站互動腳本
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* 1. 手機版漢堡選單 */
    const hamburger = document.getElementById('hamburger');
    const siteNav = document.getElementById('site-nav');

    if (hamburger && siteNav) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('open');
            siteNav.classList.toggle('open');
        });

        // 點選選單連結後自動關閉（手機板）
        siteNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('open');
                siteNav.classList.remove('open');
            });
        });
    }

    /* 2. 回到頂端按鈕 */
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* 3. 捲動出現動畫 */
    const revealItems = document.querySelectorAll('.reveal');

    if (revealItems.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach(function (item) {
            observer.observe(item);
        });
    } else {
        // 不支援 IntersectionObserver 時，直接全部顯示
        revealItems.forEach(function (item) {
            item.classList.add('visible');
        });
    }

    /* 4. 會員註冊表單（示範功能，不真正送出） */
    const memberForm = document.getElementById('member-form');
    const memberSuccess = document.getElementById('member-success');

    if (memberForm && memberSuccess) {
        memberForm.addEventListener('submit', function (e) {
            e.preventDefault();
            memberSuccess.classList.add('show');
            memberForm.reset();
            memberSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function () {
                memberSuccess.classList.remove('show');
            }, 6000);
        });
    }

    /* 5. 合作提案表單（示範功能，不真正送出） */
    const partnerForm = document.getElementById('partner-form');
    const partnerSuccess = document.getElementById('partner-success');

    if (partnerForm && partnerSuccess) {
        partnerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            partnerSuccess.classList.add('show');
            partnerForm.reset();
            partnerSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function () {
                partnerSuccess.classList.remove('show');
            }, 6000);
        });
    }

    /* 6. 活動分類篩選 */
    const filterTabs = document.getElementById('filterTabs');
    const eventGrid = document.getElementById('eventGrid');

    if (filterTabs && eventGrid) {
        const eventCards = eventGrid.querySelectorAll('.event-card');

        filterTabs.addEventListener('click', function (e) {
            const tab = e.target.closest('.filter-tab');
            if (!tab) return;

            // 更新標籤狀態
            filterTabs.querySelectorAll('.filter-tab').forEach(function (t) {
                t.classList.remove('active');
            });
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            // 篩選活動卡片
            eventCards.forEach(function (card) {
                const category = card.getAttribute('data-category');
                const show = (filter === 'all' || category === filter);
                card.style.display = show ? '' : 'none';

                // 顯示時重新觸發出現動畫
                if (show) {
                    card.classList.add('visible');
                }
            });
        });
    }

});
