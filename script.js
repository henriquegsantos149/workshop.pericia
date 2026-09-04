// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initHeader();
  initMobileMenu();
  initCurriculumAccordion();
  initFaqAccordion();
  initScrollReveal();
  initEnrollmentForm();
  initEducationToggle();
  initLightbox();
  initPhoneValidation();
  initEnrollmentModal();
  initMobileStickyBar();
  initCookieBanner();
  initPromoCountdown();
});

// Sticky Header behavior
function initHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Run once on load in case page is refreshed while scrolled
  handleScroll();
}

// Mobile navigation menu toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('site-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('open');
    const icon = toggleBtn.querySelector('i');
    
    // Update icon between menu and x
    if (icon && typeof lucide !== 'undefined') {
      if (isOpen) {
        toggleBtn.innerHTML = '<i data-lucide="x"></i>';
      } else {
        toggleBtn.innerHTML = '<i data-lucide="menu"></i>';
      }
      lucide.createIcons();
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}

// Curriculum Accordion logic
function initCurriculumAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (items.length === 0) return;

  items.forEach(item => {
    const toggle = item.querySelector('.accordion-toggle');
    const content = item.querySelector('.accordion-content');

    if (!toggle || !content) return;

    toggle.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Collapse other items within the same track list
      const parentTrack = item.closest('.track-items-list') || item.parentElement;
      const siblingItems = parentTrack.querySelectorAll('.accordion-item');
      siblingItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherToggle = otherItem.querySelector('.accordion-toggle');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          if (otherContent) {
            otherContent.setAttribute('aria-hidden', 'true');
            otherContent.style.maxHeight = '0px';
          }
        }
      });

      if (isActive) {
        item.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        content.style.maxHeight = '0px';
      } else {
        item.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// FAQ Accordion logic
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach(item => {
    const toggle = item.querySelector('.faq-toggle');
    const content = item.querySelector('.faq-content');

    if (!toggle || !content) return;

    toggle.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Collapse all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherToggle = otherItem.querySelector('.faq-toggle');
          const otherContent = otherItem.querySelector('.faq-content');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          if (otherContent) {
            otherContent.setAttribute('aria-hidden', 'true');
            otherContent.style.maxHeight = '0px';
          }
        }
      });

      if (isActive) {
        item.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        content.style.maxHeight = '0px';
      } else {
        item.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// Scroll reveal animations using IntersectionObserver
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  const observerOptions = {
    root: null, // Viewport
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once animated, we don't need to observe it anymore
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(element => {
    observer.observe(element);
  });
}

// Enrollment form handling
function initEnrollmentForm() {
  const forms = document.querySelectorAll('#enrollment-form, #hero-registration-form, .registration-form');
  if (forms.length === 0) return;

  const CHECKOUT_URL = "https://pay.voompcreators.com.br/16458/offer/6W9NvQ";

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const phoneInput = form.querySelector('input[type="tel"]');
      let cleanPhone = '';

      // Phone validation & sanitization (strictly DDD + number, never +55)
      if (phoneInput) {
        const rawValue = phoneInput.value.trim();
        let digits = rawValue.replace(/\D/g, '');
        if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
          digits = digits.substring(2);
        }
        if (digits.length !== 11) {
          phoneInput.setCustomValidity('Por favor, insira o DDD e o número com 9 dígitos (ex: 11999999999).');
          phoneInput.reportValidity();
          return;
        }
        cleanPhone = digits;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Processando inscrição...';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Capture form data
      const formData = new FormData(form);
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const education = formData.get('education') || formData.get('occupation') || '';
      const education_area = formData.get('education_area') || '';

      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };

      const eventId = 'lead_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 9);

      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: 'Workshop Perícia Ambiental'
        }, {
          eventID: eventId
        });
      }

      const formPayload = {
        name,
        email,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        education,
        occupation: education,
        education_area,
        eventId,
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc')
      };

      // Capture all UTM parameters from the current URL (both standard and prefixed)
      const urlParams = new URLSearchParams(window.location.search);
      const finalCheckoutUrl = new URL(CHECKOUT_URL);
      
      urlParams.forEach((value, key) => {
        // Forward all URL params to the checkout URL
        finalCheckoutUrl.searchParams.append(key, value);

        const upperKey = key.toUpperCase();
        const lowerKey = key.toLowerCase();

        // Exact standard UTM matches
        if (lowerKey.startsWith('utm_')) {
          formPayload[lowerKey] = value;
        }
        
        // Match prefixed UTMs (e.g. PAP_VD_UTM_SOURCE, WK_UTM_SOURCE, etc.)
        if (upperKey.includes('UTM_SOURCE') && !formPayload.utm_source) {
          formPayload.utm_source = value;
        } else if (upperKey.includes('UTM_MEDIUM') && !formPayload.utm_medium) {
          formPayload.utm_medium = value;
        } else if (upperKey.includes('UTM_CAMPAIGN') && !formPayload.utm_campaign) {
          formPayload.utm_campaign = value;
        } else if (upperKey.includes('UTM_CONTENT') && !formPayload.utm_content) {
          formPayload.utm_content = value;
        } else if (upperKey.includes('UTM_TERM') && !formPayload.utm_term) {
          formPayload.utm_term = value;
        }
      });

      // Send to our secure Vercel API
      fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formPayload)
      })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to subscribe lead to ActiveCampaign');
        }
      })
      .catch(error => {
        console.error('Error calling subscribe API:', error);
      })
      .finally(() => {
        // Redireciona para o checkout com os parâmetros UTM
        submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Redirecionando...';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        window.location.href = finalCheckoutUrl.toString();
      });
    });
  });
}

// Add simple animation styles for loader and success
const customStyle = document.createElement('style');
customStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes scaleUp {
    0% { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`;
document.head.appendChild(customStyle);

// Toggle education area field based on degree select
function initEducationToggle() {
  const setupToggle = (selectId, groupId, inputId) => {
    const selectEl = document.getElementById(selectId);
    const groupEl = document.getElementById(groupId);
    const inputEl = document.getElementById(inputId);

    if (!selectEl || !groupEl) return;

    selectEl.addEventListener('change', () => {
      if (selectEl.value === 'sim') {
        groupEl.classList.remove('hidden');
        if (inputEl) inputEl.setAttribute('required', 'required');
      } else {
        groupEl.classList.add('hidden');
        if (inputEl) {
          inputEl.removeAttribute('required');
          inputEl.value = ''; // Clean field
        }
      }
    });
  };

  setupToggle('hero-user-education', 'hero-education-area-group', 'hero-user-education-area');
  setupToggle('user-education', 'education-area-group', 'user-education-area');
}

// Lightbox for Vibecoding screenshot
// Lightbox for enlarging images (Vibecoding screenshot, Certificate mockup, etc.)
function initLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const triggers = document.querySelectorAll('.lightbox-trigger, .vibecoding-visual .vibe-card');

  if (!lightbox || !lightboxImg || triggers.length === 0) return;

  const openLightbox = (imgSrc) => {
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex';
    // Force reflow
    lightbox.offsetHeight;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scroll
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore page scroll
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightbox.style.display = 'none';
      }
    }, 300); // Match transition speed
  };

  triggers.forEach(trigger => {
    trigger.style.cursor = 'pointer';
    trigger.addEventListener('click', () => {
      const img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
      if (img) {
        openLightbox(img.src);
      }
    });
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// Brazilian phone input mask and formatting (XX) XXXXX-XXXX
function initPhoneValidation() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  
  phoneInputs.forEach(phoneInput => {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      
      // If pasted with country code 55 (12 or 13 digits), remove it
      if (value.startsWith('55') && (value.length === 12 || value.length === 13)) {
        value = value.substring(2);
      }
      
      // Limit to 11 digits (DDD + 9 digits)
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      
      // Apply mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
      let formatted = value;
      if (value.length > 0) {
        formatted = '(' + value;
      }
      if (value.length > 2) {
        formatted = '(' + value.substring(0, 2) + ') ' + value.substring(2);
      }
      if (value.length > 7) {
        formatted = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7);
      }
      
      e.target.value = formatted;
      phoneInput.setCustomValidity('');
    });
  });
}

// Enrollment Modal logic
function initEnrollmentModal() {
  const modal = document.getElementById('enrollment-modal');
  const openButtons = document.querySelectorAll('.open-modal-btn, .hero-mockup-container');
  const closeButton = modal ? modal.querySelector('.modal-close') : null;
  const overlay = modal ? modal.querySelector('.modal-overlay') : null;

  if (!modal) return;

  const openModal = () => {
    modal.style.display = 'flex';
    // Force reflow
    modal.offsetHeight;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scroll
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore page scroll
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modal.style.display = 'none';
      }
    }, 300); // Match transition duration
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Mobile Sticky CTA Bar scroll behavior
function initMobileStickyBar() {
  const stickyBar = document.getElementById('mobile-sticky-bar');
  if (!stickyBar) return;

  const checkScroll = () => {
    // Show sticky bar once user scrolls past 350px
    if (window.scrollY > 350) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
}

// Cookie Banner Logic
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');
  if (!banner || !acceptBtn) return;

  if (!localStorage.getItem('lgpd_cookie_consent')) {
    setTimeout(() => {
      banner.classList.add('show');
    }, 1000);
  }

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('lgpd_cookie_consent', 'true');
    banner.classList.remove('show');
  });
}

// Promo Schedule & Countdown Logic (Workshop + Bônus do Dia)
function initPromoCountdown() {
  const PROMO_SCHEDULE = {
    // 6 = Sábado, 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta (Quinta e Sexta sem bônus)
    6: { // Sábado
      item: "Acesso à gravação",
      badge: "Bônus Exclusivo de Sábado",
      desc: "Inscreva-se hoje no Workshop de Geoprocessamento e Perícia Ambiental e garanta acesso completo à gravação do evento para rever quantas vezes desejar.",
      icon: "video"
    },
    0: { // Domingo
      item: "Modelo de laudo e honorários",
      badge: "Bônus Exclusivo de Domingo",
      desc: "Inscreva-se hoje no Workshop de Geoprocessamento e Perícia Ambiental e receba nossos modelos oficiais e editáveis de laudo pericial e proposta de honorários.",
      icon: "file-text"
    },
    1: { // Segunda-feira
      item: "Planilha de precificação",
      badge: "Bônus Exclusivo de Segunda-feira",
      desc: "Inscreva-se hoje no Workshop de Geoprocessamento e Perícia Ambiental e ganhe a planilha completa e automatizada de precificação de perícias e consultorias.",
      icon: "calculator"
    },
    2: { // Terça-feira
      item: "Modelos de portfólio",
      badge: "Bônus Exclusivo de Terça-feira",
      desc: "Inscreva-se hoje no Workshop de Geoprocessamento e Perícia Ambiental e tenha acesso a modelos profissionais de portfólio para se destacar no mercado.",
      icon: "briefcase"
    },
    3: { // Quarta-feira
      item: "Fluxograma de Perícia Ambiental",
      badge: "Bônus Exclusivo de Quarta-feira",
      desc: "Inscreva-se hoje no Workshop de Geoprocessamento e Perícia Ambiental e receba o fluxograma detalhado com todas as etapas do processo pericial ambiental.",
      icon: "git-branch"
    }
  };

  const stickyBanner = document.getElementById('sticky-banner');
  const stickyItemName = document.getElementById('sticky-item-name');
  const pricingBonusLine = document.getElementById('pricing-bonus-line');
  const pricingBonusName = document.getElementById('pricing-bonus-name');
  const featureBonusItem = document.getElementById('feature-bonus-item');
  const featureBonusText = document.getElementById('feature-bonus-text');

  let iconsRefreshed = false;

  function updatePromo() {
    const dateNow = new Date();
    const now = dateNow.getTime();

    // Suporte a override via URL (?day=0 a ?day=6)
    const urlParams = new URLSearchParams(window.location.search);
    let dayOfWeek = dateNow.getDay();
    if (urlParams.has('day')) {
      dayOfWeek = parseInt(urlParams.get('day'), 10);
    }

    // Bônus ativo de sábado até quarta. Quinta e sexta não têm nada.
    const promoData = PROMO_SCHEDULE[dayOfWeek];
    const isPromoActive = Boolean(promoData);

    if (isPromoActive) {
      // Ativa e exibe o sticky banner
      if (stickyBanner) stickyBanner.style.display = 'block';
      document.body.classList.add('has-promo-sticky');

      // Atualiza textos do banner
      if (stickyItemName) stickyItemName.textContent = promoData.item;

      // Exibe linha do bônus logo abaixo de "Do QGIS ao Laudo Pericial Profissional"
      if (pricingBonusLine) {
        pricingBonusLine.style.display = 'inline-flex';
        if (pricingBonusName) pricingBonusName.textContent = promoData.item;
      }

      // Adiciona o bônus na lista de benefícios inclusos
      if (featureBonusItem) {
        featureBonusItem.style.display = 'flex';
        if (featureBonusText) {
          featureBonusText.innerHTML = '<strong>Bônus Incluso:</strong> ' + promoData.item;
        }
      }

      if (!iconsRefreshed && typeof lucide !== 'undefined') {
        lucide.createIcons();
        iconsRefreshed = true;
      }

      // Alvo: fim do dia atual (23:59:59.999)
      const endOfDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 23, 59, 59, 999);
      const target = endOfDay.getTime();
      const diff = target - now;

      if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        const setEl = (className, val) => {
          document.querySelectorAll('.' + className).forEach(el => {
            el.textContent = String(val).padStart(2, '0');
          });
        };

        setEl('cd-hours', h);
        setEl('cd-minutes', m);
        setEl('cd-seconds', s);
      } else {
        ['cd-hours', 'cd-minutes', 'cd-seconds'].forEach(cls => {
          document.querySelectorAll('.' + cls).forEach(el => el.textContent = '00');
        });
      }
    } else {
      // Quinta e sexta: sem promoção temporária
      if (stickyBanner) stickyBanner.style.display = 'none';
      document.body.classList.remove('has-promo-sticky');

      // Oculta bônus do card de preços
      if (pricingBonusLine) pricingBonusLine.style.display = 'none';
      if (featureBonusItem) featureBonusItem.style.display = 'none';
    }
  }

  updatePromo();
  setInterval(updatePromo, 1000);
}
