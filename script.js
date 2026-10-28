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
       Duas faixas infinitas de capas: a de cima corre para a esquerda e a
       de baixo para a direita. Cada faixa mistura material principal e bônus.
       ========================================================================== */
    const PRINCIPAL = { label: 'MATERIAL PRINCIPAL', tone: 'principal' };
    const BONUS_1 = { label: 'BÔNUS 01', tone: 'bonus-1' };
    const BONUS_2 = { label: 'BÔNUS 02', tone: 'bonus-2' };
    const BONUS_3 = { label: 'BÔNUS 03', tone: 'bonus-3' };
    const BONUS_4 = { label: 'BÔNUS 04', tone: 'bonus-4' };

    const coverRows = {
        'covers-track-top': [
            { ...PRINCIPAL, image: 'assets/images/produto-premium/manual.webp', title: 'Manual Introdutório' },
            { ...BONUS_1, image: 'assets/images/bonus-reais/bonus-1-frente-verso.webp', title: 'A frente promete, o verso explica' },
            { ...BONUS_2, image: 'assets/images/bonus-reais/bonus-2-capa.webp', title: 'Checklist de Tecidos que Respiram' },
            { ...PRINCIPAL, image: 'assets/images/produto-premium/volume-1.webp', title: 'Biblioteca de Dinâmicas · Vol. 1' },
            { ...PRINCIPAL, image: 'assets/images/capas/guia-axilas-frescas.webp', title: 'Axilas Frescas, Mamãe Tranquila' },
            { ...BONUS_1, image: 'assets/images/bonus-reais/bonus-1-60-segundos.webp', title: 'Seu rótulo em 60 segundos' },
            { ...PRINCIPAL, image: 'assets/images/produto-premium/volume-2.webp', title: 'Biblioteca de Dinâmicas · Vol. 2' },
            { ...BONUS_2, image: 'assets/images/capas/tecidos-calor-seco-umido.webp', title: 'Calor seco × calor úmido' },
            { ...BONUS_1, image: 'assets/images/bonus-reais/bonus-1-depilacao.webp', title: 'Depois da depilação' },
            { ...PRINCIPAL, image: 'assets/images/produto-premium/volume-3.webp', title: 'Biblioteca de Dinâmicas · Vol. 3' },
            { ...BONUS_1, image: 'assets/images/capas/rotulos-desodorante.webp', title: 'Desodorante ou antitranspirante?' },
            { ...BONUS_2, image: 'assets/images/bonus-reais/bonus-2-peca.webp', title: 'A peça inteira importa' },
            { ...PRINCIPAL, image: 'assets/images/produto-premium/caderno.webp', title: 'Caderno de Acompanhamento' }
        ],
        'covers-track-bottom': [
            { ...BONUS_4, image: 'assets/images/bonus-reais/bonus-4-capa.webp', title: 'Diário da Mamãe Cheirosa' },
            { ...BONUS_3, image: 'assets/images/bonus-reais/bonus-3-capa.webp', title: 'Ritual de Autocuidado de 5 Minutos' },
            { ...BONUS_4, image: 'assets/images/bonus-reais/bonus-4-metodo.webp', title: 'Seu método em 4 passos' },
            { ...BONUS_3, image: 'assets/images/bonus-reais/bonus-3-unidade-1.webp', title: 'Ritual de hoje: voltar para mim' },
            { ...PRINCIPAL, image: 'assets/images/capas/resumos-12-modulos.webp', title: 'Resumos dos 12 Módulos' },
            { ...BONUS_1, image: 'assets/images/bonus-reais/bonus-1-aluminio.webp', title: 'Alumínio sem alarmismo' },
            { ...BONUS_4, image: 'assets/images/bonus-reais/bonus-4-cuidado.webp', title: 'Cuidado primeiro' },
            { ...BONUS_3, image: 'assets/images/bonus-reais/bonus-3-baralho.webp', title: 'Baralho Digital · 30 rituais' },
            { ...BONUS_1, image: 'assets/images/capas/rotulos-lactacao.webp', title: 'Lactação e contato pele a pele' },
            { ...BONUS_2, image: 'assets/images/bonus-reais/bonus-2-modal.webp', title: 'Modal: o que saber' },
            { ...PRINCIPAL, image: 'assets/images/capas/trilhas-7-30-60-90.webp', title: 'Trilhas de 7, 30, 60 e 90 dias' },
            { ...BONUS_4, image: 'assets/images/bonus-reais/bonus-4-boas-vindas.webp', title: 'Bem-vinda ao seu diário' },
            { ...BONUS_1, image: 'assets/images/bonus-reais/bonus-1-fragrancia.webp', title: 'Fragrância e pele sensível' },
            { ...BONUS_3, image: 'assets/images/bonus-reais/bonus-3-caderno.webp', title: 'Caderno de Aplicação' },
            { ...BONUS_1, image: 'assets/images/capas/rotulos-cinco-filtros.webp', title: 'Os 5 filtros da escolha' },
            { ...BONUS_2, image: 'assets/images/capas/tecidos-compra-rapida.webp', title: 'Checklist de compra rápida' },
            { ...BONUS_4, image: 'assets/images/bonus-reais/bonus-4-ritmo.webp', title: 'Escolha o seu ritmo' }
        ]
    };

    // Na faixa vai a versão leve (assets/images/thumbs/); ao ampliar, a original
    const thumbOf = src => `assets/images/thumbs/${src.split('/').pop()}`;

    const buildCoverImage = (product, src = product.image) => {
        const image = document.createElement('img');
        image.src = src;
        image.alt = product.title;
        image.decoding = 'async';
        image.draggable = false;
        return image;
    };

    const buildCoverRow = ([trackId, products]) => {
        const track = document.getElementById(trackId);
        if (!track) return;

        const fragment = document.createDocumentFragment();

        // Dois grupos idênticos: quando o primeiro sai da tela o segundo já ocupa
        // o lugar dele, então a faixa nunca fica vazia
        for (let groupIndex = 0; groupIndex < 2; groupIndex += 1) {
            const group = document.createElement('div');
            group.className = 'marquee-group';
            group.setAttribute('aria-hidden', groupIndex === 1 ? 'true' : 'false');

            products.forEach(product => {
                const slide = document.createElement('button');
                slide.type = 'button';
                slide.className = `demo-slide product-cover-slide tone-${product.tone}`;
                slide.setAttribute('aria-label', `Ampliar capa: ${product.title}`);
                if (groupIndex === 1) slide.tabIndex = -1;

                slide.appendChild(buildCoverImage(product, thumbOf(product.image)));

                const caption = document.createElement('span');
                caption.className = 'product-cover-caption';
                caption.innerHTML = `<small>${product.label}</small><strong>${product.title}</strong>`;
                slide.appendChild(caption);

                slide.addEventListener('click', () => openLightbox(buildCoverImage(product)));
                group.appendChild(slide);
            });

            fragment.appendChild(group);
        }

        track.replaceChildren(fragment);
    };

    // As capas só começam a baixar quando a seção está chegando na tela,
    // para não disputar banda com o topo da página
    const coversSection = document.getElementById('demonstracoes');
    const buildCoverRows = () => Object.entries(coverRows).forEach(buildCoverRow);

    if (coversSection && 'IntersectionObserver' in window) {
        const coversObserver = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            coversObserver.disconnect();
            buildCoverRows();
        }, { rootMargin: '1200px 0px' });
        coversObserver.observe(coversSection);
    } else {
        buildCoverRows();
    }

    /* ==========================================================================
       DEPOIMENTOS — coloque apenas prints REAIS de clientes em
       assets/images/depoimentos/ com nomes em sequência:
       depoimento-01.png, depoimento-02.jpg, depoimento-03.webp...
       Os arquivos são encontrados automaticamente (a busca para no primeiro
       número que faltar). A seção fica oculta enquanto não houver prints.
       ========================================================================== */
    const testimonialsSection = document.getElementById('depoimentos');
    const testimonialsTrack = document.getElementById('testimonials-track');
    const testimonialExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const maxTestimonials = 40;

    const probeImage = src => new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });

    const findTestimonial = async number => {
        const name = `assets/images/depoimentos/depoimento-${String(number).padStart(2, '0')}`;
        for (const ext of testimonialExtensions) {
            if (await probeImage(`${name}.${ext}`)) return `${name}.${ext}`;
        }
        return null;
    };

    const loadTestimonials = async () => {
        const images = [];
        for (let number = 1; number <= maxTestimonials; number += 1) {
            const src = await findTestimonial(number);
            if (!src) break;
            images.push({ src, alt: `Depoimento de cliente ${number}` });
        }
        return images;
    };

    const renderTestimonials = testimonialImages => {
        if (!testimonialImages.length || !testimonialsTrack) return;

        // Repete os prints para preencher a faixa mesmo com poucos depoimentos
        const minCards = 8;
        const cards = [];
        while (cards.length < minCards) cards.push(...testimonialImages);

        const fragment = document.createDocumentFragment();

        for (let groupIndex = 0; groupIndex < 2; groupIndex += 1) {
            const group = document.createElement('div');
            group.className = 'testimonials-group';
            group.setAttribute('aria-hidden', groupIndex === 1 ? 'true' : 'false');

            cards.forEach(item => {
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
    };

    if (testimonialsTrack) loadTestimonials().then(renderTestimonials);

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
