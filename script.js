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
  initCountdownBanner();
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

  const CHECKOUT_URL = "https://pay.voompcreators.com.br/16552/offer/yurdnS";

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const phoneInput = form.querySelector('input[type="tel"]');

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
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Processando inscrição...';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: 'Workshop Perícia Ambiental'
        });
      }

      const data = new FormData(form);
      const payload = {
        name: data.get('name') || '', email: data.get('email') || '',
        phone: (phoneInput?.value || '').replace(/\D/g, '').replace(/^55(?=\d{11}$)/, ''),
        education: data.get('education') || data.get('occupation') || '',
        education_area: data.get('education_area') || ''
      };
      const params = new URLSearchParams(window.location.search);
      const checkout = new URL(CHECKOUT_URL);
      params.forEach((value, key) => checkout.searchParams.append(key, value));
      for (const field of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
        const match = [...params].find(([key]) => key.toLowerCase() === field)
          || [...params].find(([key]) => key.toLowerCase().endsWith('_' + field));
        if (match) payload[field] = match[1];
      }
      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), signal: AbortSignal.timeout(15000)
        });
        if (!response.ok) console.error('Não foi possível registrar a inscrição.');
      } catch {
        console.error('Não foi possível registrar a inscrição.');
      } finally {
        window.location.href = checkout.toString();
      }
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

// Countdown Timer Banner (Ends at 23:59:59 today)
function initCountdownBanner() {
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  function updateCountdown() {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let diff = endOfDay.getTime() - now.getTime();

    if (diff <= 0) {
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}
