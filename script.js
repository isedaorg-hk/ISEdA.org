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

    /* 2. 關於我們下拉選單：鍵盤、點擊與手機版支援 */
    const navDropdowns = siteNav ? siteNav.querySelectorAll('.nav-dropdown') : [];

    function setNavDropdownState(dropdown, isOpen) {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (!toggle) return;
        dropdown.classList.toggle('is-open', isOpen);
        if (isOpen) dropdown.classList.remove('is-keyboard-closed');
        toggle.setAttribute('aria-expanded', String(isOpen));
        if (typeof t === 'function') {
            const dropdownKey = dropdown.dataset.dropdownKey || 'about';
            toggle.setAttribute('aria-label', t(isOpen ? `nav.${dropdownKey}.toggle.close` : `nav.${dropdownKey}.toggle.open`));
        }
    }

    function closeNavDropdowns(except) {
        navDropdowns.forEach(function (dropdown) {
            if (dropdown === except) return;
            setNavDropdownState(dropdown, false);
        });
    }

    navDropdowns.forEach(function (dropdown) {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            const willOpen = !dropdown.classList.contains('is-open');
            closeNavDropdowns(dropdown);
            setNavDropdownState(dropdown, willOpen);
        });

        // On desktop, moving the mouse over the About Us item reveals its two links.
        // Touch layouts retain the explicit arrow control defined in the mobile CSS.
        dropdown.addEventListener('mouseenter', function () {
            if (window.matchMedia('(min-width: 769px)').matches) {
                closeNavDropdowns(dropdown);
                setNavDropdownState(dropdown, true);
            }
        });
        dropdown.addEventListener('mouseleave', function () {
            if (window.matchMedia('(min-width: 769px)').matches) {
                setNavDropdownState(dropdown, false);
            }
        });

        dropdown.addEventListener('focusout', function () {
            window.setTimeout(function () {
                if (!dropdown.contains(document.activeElement)) closeNavDropdowns();
            }, 0);
        });
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.nav-dropdown')) closeNavDropdowns();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const openDropdown = document.querySelector('.nav-dropdown.is-open');
            const openToggle = openDropdown ? openDropdown.querySelector('.nav-dropdown-toggle') : null;
            const openMainLink = openDropdown ? openDropdown.querySelector('.nav-dropdown-main') : null;
            closeNavDropdowns();
            if (openDropdown) openDropdown.classList.add('is-keyboard-closed');
            if (window.matchMedia('(min-width: 769px)').matches && openMainLink) {
                openMainLink.focus();
            } else if (openToggle) {
                openToggle.focus();
            }
        }
    });

    document.addEventListener('langchange', function () {
        navDropdowns.forEach(function (dropdown) {
            setNavDropdownState(dropdown, dropdown.classList.contains('is-open'));
        });
    });

    /* 3. 回到頂端按鈕 */
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
        const eventFilterEmpty = document.getElementById('eventFilterEmpty');

        filterTabs.addEventListener('click', function (e) {
            const tab = e.target.closest('.filter-tab');
            if (!tab) return;

            // 更新標籤狀態與讀屏器狀態
            filterTabs.querySelectorAll('.filter-tab').forEach(function (t) {
                const isActive = t === tab;
                t.classList.toggle('active', isActive);
                t.setAttribute('aria-pressed', String(isActive));
            });

            const filter = tab.getAttribute('data-filter');
            let visibleEvents = 0;

            // 支援一張活動卡片屬於多個分類（以空格分隔）
            eventCards.forEach(function (card) {
                const categories = (card.getAttribute('data-category') || '').split(/\s+/);
                const show = (filter === 'all' || categories.includes(filter));
                card.style.display = show ? '' : 'none';

                if (show) {
                    visibleEvents += 1;
                    // 顯示時重新觸發出現動畫
                    card.classList.add('visible');
                }
            });

            if (eventFilterEmpty) {
                eventFilterEmpty.hidden = visibleEvents > 0;
            }
        });
    }

});
