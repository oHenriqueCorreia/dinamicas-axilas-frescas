document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       LINKS DE CHECKOUT — troque pelos links reais da plataforma de pagamento
       ========================================================================== */
    const checkoutUrls = {
        planoCompleto: '#',
        planoBasico: '#',
        planoCompletoPromocional: '#'
    };

    const safeStorage = {
        get: (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set: (key, value) => { try { localStorage.setItem(key, value); } catch (e) { /* sem armazenamento */ } }
    };

    /* ==========================================================================
       REVEAL AO ROLAR
       ========================================================================== */
    const revealItems = document.querySelectorAll('.reveal');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateCount = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        if (prefersReducedMotion) {
            el.textContent = target;
            return;
        }
        const duration = 1800;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const showItem = (item) => {
        item.classList.add('is-visible');
        item.querySelectorAll('.count-up').forEach(animateCount);
        // Depois da entrada escalonada, o card passa a responder rápido ao mouse
        if (item.classList.contains('tilt-card')) {
            window.setTimeout(() => item.classList.add('is-settled'), 1400);
        }
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                showItem(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealItems.forEach(item => observer.observe(item));
    } else {
        revealItems.forEach(showItem);
    }

    /* ==========================================================================
       DESEMPENHO: pausa as animações contínuas das seções fora da tela
       ========================================================================== */
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
            });
        }, { rootMargin: '200px 0px' });

        document.querySelectorAll('main > section, .main-footer').forEach(section => sectionObserver.observe(section));
    }

    /* ==========================================================================
       "180" DO TOPO CONTANDO AO ABRIR A PÁGINA
       ========================================================================== */
    document.querySelectorAll('.hero-180-num').forEach(animateCount);

    /* ==========================================================================
       CARDS COM INCLINAÇÃO 3D E BRILHO QUE SEGUE O MOUSE (só em telas com mouse)
       ========================================================================== */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                card.style.setProperty('--mx', `${x * 100}%`);
                card.style.setProperty('--my', `${y * 100}%`);
                card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
                card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--ry', '0deg');
                card.style.setProperty('--rx', '0deg');
            });
        });
    }

    /* ==========================================================================
       CARROSSEL "POR DENTRO"
       Enquanto não houver prints reais, as páginas são desenhadas em CSS.
       Para usar imagens, preencha "image" em cada item
       (ex.: image: 'assets/images/internas/dinamica-01.jpg').
       ========================================================================== */
    const previewPages = [
        { tag: 'DINÂMICA 01', icon: '🚿', title: 'Banho em 3 tempos para o calor da gestação', bg: '#FDE4EC' },
        { tag: 'DINÂMICA 14', icon: '🍋', title: 'Alimentos que pioram o odor (e as trocas)', bg: '#FFF1DE' },
        { tag: 'DINÂMICA 27', icon: '👚', title: 'Como lavar blusas sem deixar cheiro preso', bg: '#EFE4FA' },
        { tag: 'DINÂMICA 42', icon: '🤱', title: 'Frescor durante a amamentação noturna', bg: '#E0F4EC' },
        { tag: 'DINÂMICA 66', icon: '🧴', title: 'Rotina de 2 minutos para sair de casa', bg: '#FDE4EC' },
        { tag: 'DINÂMICA 89', icon: '💧', title: 'Hidratação e suor: o que muda no 3º trimestre', bg: '#E3EEFB' },
        { tag: 'DINÂMICA 120', icon: '🌙', title: 'Puerpério: suor noturno sem desconforto', bg: '#EFE4FA' },
        { tag: 'DINÂMICA 175', icon: '🌸', title: 'Kit de bolsa da mamãe cheirosa', bg: '#FFF1DE' }
    ];

    const buildPageMock = (page) => {
        const mock = document.createElement('div');
        mock.className = 'page-mock';
        mock.style.background = page.bg;
        mock.innerHTML = `
            <span class="page-mock-tag"></span>
            <span class="page-mock-icon" aria-hidden="true"></span>
            <span class="page-mock-title"></span>
            <span class="page-mock-lines" aria-hidden="true"><i></i><i></i><i></i></span>`;
        mock.querySelector('.page-mock-tag').textContent = page.tag;
        mock.querySelector('.page-mock-icon').textContent = page.icon;
        mock.querySelector('.page-mock-title').textContent = page.title;
        return mock;
    };

    const buildPageContent = (page) => {
        if (!page.image) return buildPageMock(page);
        const image = document.createElement('img');
        image.src = page.image;
        image.alt = page.title;
        image.decoding = 'async';
        image.draggable = false;
        return image;
    };

    document.querySelectorAll('.marquee-track').forEach((track, rowIndex) => {
        const ordered = rowIndex % 2 === 0 ? previewPages : [...previewPages].reverse();
        const fragment = document.createDocumentFragment();

        for (let groupIndex = 0; groupIndex < 2; groupIndex += 1) {
            const group = document.createElement('div');
            group.className = 'marquee-group';
            group.setAttribute('aria-hidden', groupIndex === 1 ? 'true' : 'false');

            ordered.forEach(page => {
                const slide = document.createElement('button');
                slide.type = 'button';
                slide.className = 'demo-slide';
                slide.setAttribute('aria-label', `Ampliar: ${page.title}`);
                if (groupIndex === 1) slide.tabIndex = -1;
                slide.appendChild(buildPageContent(page));
                slide.addEventListener('click', () => openLightbox(buildPageContent(page)));
                group.appendChild(slide);
            });

            fragment.appendChild(group);
        }

        track.replaceChildren(fragment);
    });

    /* ==========================================================================
       DEPOIMENTOS — adicione aqui apenas prints REAIS de clientes.
       A seção fica oculta enquanto a lista estiver vazia.
       Ex.: { src: 'assets/images/depoimentos/depoimento-01.png', alt: 'Depoimento de cliente 1' }
       ========================================================================== */
    const testimonialImages = [];
    const testimonialsSection = document.getElementById('depoimentos');
    const testimonialsTrack = document.getElementById('testimonials-track');

    if (testimonialImages.length && testimonialsTrack) {
        const fragment = document.createDocumentFragment();

        for (let groupIndex = 0; groupIndex < 2; groupIndex += 1) {
            const group = document.createElement('div');
            group.className = 'testimonials-group';
            group.setAttribute('aria-hidden', groupIndex === 1 ? 'true' : 'false');

            testimonialImages.forEach(item => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'testimonial-card';
                if (groupIndex === 1) card.tabIndex = -1;

                const image = document.createElement('img');
                image.src = item.src;
                image.alt = item.alt;
                image.loading = 'lazy';
                card.appendChild(image);
                card.addEventListener('click', () => openLightbox(image.cloneNode()));
                group.appendChild(card);
            });

            fragment.appendChild(group);
        }

        testimonialsTrack.replaceChildren(fragment);
        testimonialsSection.hidden = false;
    }

    /* ==========================================================================
       NOTIFICAÇÕES
       Usa as compras de purchases.js; sem compras, mostra lembretes da oferta.
       ========================================================================== */
    const offerNotices = [
        { icon: '⚡', title: 'Acesso liberado na hora', message: 'Receba o material no seu e-mail.', meta: 'ACESSO IMEDIATO' },
        { icon: '7', title: 'Você tem 7 dias de garantia', message: 'Conheça o conteúdo com tranquilidade.', meta: 'COMPRA SEGURA' },
        { icon: '🎁', title: 'Plano Completo com 4 presentes', message: 'Guias, checklist, ritual e diário.', meta: 'MAIS ESCOLHIDO' },
        { icon: '📱', title: 'Leia onde estiver', message: 'No celular, até com o bebê no colo.', meta: 'ACESSO VITALÍCIO' }
    ];
    const configuredPurchases = Array.isArray(window.RECENT_PURCHASES)
        ? window.RECENT_PURCHASES.filter(item => item && item.name && item.product)
        : [];
    const notificationQueue = configuredPurchases.length ? [...configuredPurchases] : [...offerNotices];

    const toast = document.getElementById('purchase-toast');
    const toastIcon = document.getElementById('purchase-toast-icon');
    const toastTitle = document.getElementById('purchase-toast-title');
    const toastMessage = document.getElementById('purchase-toast-message');
    const toastMeta = document.getElementById('purchase-toast-meta');
    const toastClose = document.getElementById('purchase-toast-close');
    const formatBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    let notificationCursor = 0;
    let toastHideTimer;
    let toastStartTimer;
    let toastInterval;
    let notificationsDismissed = false;

    const showNotification = (notice) => {
        if (!toast || notificationsDismissed || !notice) return;

        const isPurchase = Boolean(notice.name && notice.product);
        toastIcon.textContent = isPurchase ? '💗' : (notice.icon || '•');
        toastTitle.textContent = isPurchase ? `${notice.name} garantiu o ${notice.product}` : notice.title;
        toastMessage.textContent = isPurchase ? notice.location : notice.message;
        toastMeta.textContent = isPurchase
            ? [typeof notice.price === 'number' ? formatBRL.format(notice.price) : String(notice.price || ''),
                notice.time || 'Compra recente'].filter(Boolean).join(' • ')
            : notice.meta;

        toast.classList.add('is-visible');
        window.clearTimeout(toastHideTimer);
        toastHideTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 5600);
    };

    const showNextNotification = () => {
        showNotification(notificationQueue[notificationCursor % notificationQueue.length]);
        notificationCursor += 1;
    };

    if (toast && notificationQueue.length) {
        toastStartTimer = window.setTimeout(showNextNotification, 4000);
        toastInterval = window.setInterval(showNextNotification, 12000);
    }

    if (toastClose) {
        toastClose.addEventListener('click', () => {
            notificationsDismissed = true;
            toast.classList.remove('is-visible');
            window.clearTimeout(toastHideTimer);
            window.clearTimeout(toastStartTimer);
            window.clearInterval(toastInterval);
        });
    }

    window.addPurchaseNotification = (purchase) => {
        if (!purchase || !purchase.name || !purchase.product) return;
        notificationsDismissed = false;
        notificationQueue.push(purchase);
        showNotification(purchase);
    };

    window.addEventListener('purchase:confirmed', (event) => window.addPurchaseNotification(event.detail));

    /* ==========================================================================
       FAQ
       ========================================================================== */
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const currentItem = question.parentElement;
            const isActive = currentItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
            if (!isActive) currentItem.classList.add('active');
        });
    });

    /* ==========================================================================
       MODAIS (UPSELL & LIGHTBOX)
       ========================================================================== */
    const upsellModal = document.getElementById('upsell-modal');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxStage = document.getElementById('lightbox-stage');

    const openModal = (modal) => {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    };

    function openLightbox(content) {
        lightboxStage.replaceChildren(content);
        openModal(lightboxModal);
    }

    document.getElementById('btn-comprar-basico').addEventListener('click', () => openModal(upsellModal));
    document.getElementById('btn-comprar-completo').addEventListener('click', () => {
        window.location.assign(checkoutUrls.planoCompleto);
    });
    document.getElementById('btn-close-upsell').addEventListener('click', () => closeModal(upsellModal));
    document.getElementById('btn-upsell-decline').addEventListener('click', () => {
        closeModal(upsellModal);
        window.location.assign(checkoutUrls.planoBasico);
    });
    document.getElementById('btn-upsell-accept').addEventListener('click', () => {
        closeModal(upsellModal);
        window.location.assign(checkoutUrls.planoCompletoPromocional);
    });
    document.getElementById('btn-close-lightbox').addEventListener('click', () => closeModal(lightboxModal));

    [upsellModal, lightboxModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        [upsellModal, lightboxModal].forEach(modal => {
            if (modal.classList.contains('open')) closeModal(modal);
        });
    });

    /* ==========================================================================
       CRONÔMETRO (EVERGREEN & PERSISTENTE)
       ========================================================================== */
    const timerTargets = {
        hours: ['hours', 'scarcity-hours'].map(id => document.getElementById(id)).filter(Boolean),
        minutes: ['minutes', 'scarcity-minutes'].map(id => document.getElementById(id)).filter(Boolean),
        seconds: ['seconds', 'scarcity-seconds'].map(id => document.getElementById(id)).filter(Boolean)
    };
    const timerDurationMs = ((76 * 60) + 2) * 1000; // 1h 16m 02s
    const storageKey = 'mae_cheirosa_countdown_deadline';
    let deadline = parseInt(safeStorage.get(storageKey), 10);

    const resetDeadline = () => {
        deadline = Date.now() + timerDurationMs;
        safeStorage.set(storageKey, String(deadline));
    };

    if (isNaN(deadline)) resetDeadline();

    const updateTimer = () => {
        let remaining = deadline - Date.now();
        if (remaining <= 0) {
            resetDeadline();
            remaining = timerDurationMs;
        }

        const totalSeconds = Math.floor(remaining / 1000);
        const values = {
            hours: Math.floor(totalSeconds / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: totalSeconds % 60
        };

        Object.keys(values).forEach(unit => {
            const padded = String(values[unit]).padStart(2, '0');
            timerTargets[unit].forEach(el => { el.textContent = padded; });
        });
    };

    updateTimer();
    setInterval(updateTimer, 1000);
});
