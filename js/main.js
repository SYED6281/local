/**
 * MARWA EDUCATION CONSULTANT - MAIN JAVASCRIPT
 * Premium Education Consultancy Website
 * Advanced functionality with modern ES6+ features
 */

'use strict';

// ========================================
// GLOBAL CONFIGURATION & CONSTANTS
// ========================================

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://api.marwaeducation.com',
    API_TIMEOUT: 10000,
    
    // Animation Configuration
    SCROLL_OFFSET: 100,
    ANIMATION_DURATION: 300,
    PARALLAX_SPEED: 0.5,
    
    // Performance Configuration
    DEBOUNCE_DELAY: 250,
    THROTTLE_DELAY: 16,
    
    // Feature Flags
    FEATURES: {
        ANALYTICS: true,
        LIVE_CHAT: true,
        PUSH_NOTIFICATIONS: false,
        SERVICE_WORKER: true
    }
};

const SELECTORS = {
    // Navigation
    header: '#header',
    navToggle: '#navToggle',
    navMenu: '#navMenu',
    navLinks: '.nav-link',
    
    // Sections
    hero: '#home',
    services: '#services',
    countries: '#countries',
    testimonials: '#testimonials',
    contact: '#contact',
    
    // Interactive Elements
    backToTop: '#backToTop',
    contactForm: '#contactForm',
    preloader: '#preloader',
    
    // Modals
    modalOverlay: '#modalOverlay',
    modals: '.modal'
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

const Utils = {
    /**
     * Debounce function to limit function calls
     */
    debounce(func, delay = CONFIG.DEBOUNCE_DELAY) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function to limit function calls
     */
    throttle(func, delay = CONFIG.THROTTLE_DELAY) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold &&
            rect.left <= windowWidth * (1 - threshold) &&
            rect.right >= windowWidth * threshold
        );
    },

    /**
     * Smooth scroll to element
     */
    smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(Math.abs(distance) / 2, 1000);
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const easeInOutCubic = progress < 0.5 
                ? 4 * progress * progress * progress 
                : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;

            window.scrollTo(0, startPosition + distance * easeInOutCubic);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Format phone number
     */
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{5})$/);
        if (match) {
            return `+${match[1]} ${match[2]} ${match[3]}`;
        }
        return phone;
    },

    /**
     * Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Get device type
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 576) return 'mobile';
        if (width < 992) return 'tablet';
        return 'desktop';
    },

    /**
     * Format date
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
    }
};

// ========================================
// PERFORMANCE MONITORING
// ========================================

const Performance = {
    metrics: {
        loadTime: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0
    },

    init() {
        this.measureLoadTime();
        this.measurePaintTimings();
        this.measureLCP();
    },

    measureLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`Page load time: ${this.metrics.loadTime.toFixed(2)}ms`);
        });
    },

    measurePaintTimings() {
        if ('PerformancePaintTiming' in window) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    this.metrics.firstPaint = entry.startTime;
                }
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
            });
        }
    },

    measureLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.largestContentfulPaint = entry.startTime;
                });
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
};

// ========================================
// PRELOADER MANAGEMENT
// ========================================

const PreloaderManager = {
    element: null,
    minimumShowTime: 1000,
    startTime: Date.now(),

    init() {
        this.element = document.querySelector(SELECTORS.preloader);
        if (!this.element) return;

        this.preloadCriticalResources();
        window.addEventListener('load', () => this.hide());
    },

    async preloadCriticalResources() {
        const criticalImages = [
            'marwa-logo.png',
            'hero-video.mp4'
        ];

        const preloadPromises = criticalImages.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });
        });

        try {
            await Promise.all(preloadPromises);
        } catch (error) {
            console.warn('Some critical resources failed to preload:', error);
        }
    },

    hide() {
        if (!this.element) return;

        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minimumShowTime - elapsedTime);

        setTimeout(() => {
            this.element.classList.add('hidden');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            }, 500);
        }, remainingTime);
    }
};

// ========================================
// NAVIGATION MANAGEMENT
// ========================================

const NavigationManager = {
    header: null,
    navToggle: null,
    navMenu: null,
    lastScrollY: 0,
    isScrolling: false,

    init() {
        this.header = document.querySelector(SELECTORS.header);
        this.navToggle = document.querySelector(SELECTORS.navToggle);
        this.navMenu = document.querySelector(SELECTORS.navMenu);

        if (!this.header) return;

        this.bindEvents();
        this.setupActiveSection();
        this.setupSmoothScrolling();
    },

    bindEvents() {
        // Scroll handling
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll()));
        
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu on link click
        document.querySelectorAll(SELECTORS.navLinks).forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 991) {
                this.closeMobileMenu();
            }
        }));
    },

    handleScroll() {
        const scrollY = window.pageYOffset;
        
        // Header scroll effect
        if (scrollY > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Hide/show header on scroll
        if (scrollY > this.lastScrollY && scrollY > 200) {
            this.header.style.transform = 'translateY(-100%)';
        } else {
            this.header.style.transform = 'translateY(0)';
        }

        this.lastScrollY = scrollY;
        this.updateActiveSection();
    },

    toggleMobileMenu() {
        if (!this.navMenu || !this.navToggle) return;

        const isActive = this.navMenu.classList.contains('active');
        
        if (isActive) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    },

    openMobileMenu() {
        this.navMenu.classList.add('active');
        this.navToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        document.body.style.overflow = '';
    },

    setupActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        this.sections = Array.from(sections).map(section => ({
            id: section.id,
            element: section,
            top: section.offsetTop,
            height: section.offsetHeight
        }));
    },

    updateActiveSection() {
        const scrollY = window.pageYOffset + 100;
        
        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            if (scrollY >= section.top) {
                this.setActiveNavLink(section.id);
                break;
            }
        }
    },

    setActiveNavLink(sectionId) {
        document.querySelectorAll(SELECTORS.navLinks).forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = anchor.getAttribute('href');
                if (target && target !== '#') {
                    Utils.smoothScrollTo(target, 80);
                }
            });
        });
    }
};

// ========================================
// HERO SECTION MANAGEMENT
// ========================================

const HeroManager = {
    hero: null,
    particles: null,
    stats: [],

    init() {
        this.hero = document.querySelector(SELECTORS.hero);
        if (!this.hero) return;

        this.initParticles();
        this.initStats();
        this.initVideo();
    },

    initParticles() {
        this.particles = document.querySelector('#particles');
        if (!this.particles) return;

        this.createParticles();
        this.animateParticles();
    },

    createParticles() {
        const particleCount = Utils.getDeviceType() === 'mobile' ? 30 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 10 + 10}s infinite linear;
            `;
            this.particles.appendChild(particle);
        }
    },

    animateParticles() {
        if (!document.querySelector('.particle-style')) {
            const style = document.createElement('style');
            style.className = 'particle-style';
            style.textContent = `
                @keyframes particleFloat {
                    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    initStats() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));
    },

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    },

    initVideo() {
        const video = this.hero.querySelector('.hero-video');
        if (!video) return;

        video.addEventListener('loadeddata', () => {
            video.play().catch(console.warn);
        });

        // Pause video when not visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(console.warn);
                } else {
                    video.pause();
                }
            });
        });

        observer.observe(video);
    }
};

// ========================================
// SCROLL EFFECTS MANAGER
// ========================================

const ScrollEffectsManager = {
    backToTop: null,
    parallaxElements: [],

    init() {
        this.backToTop = document.querySelector(SELECTORS.backToTop);
        this.initBackToTop();
        this.initParallax();
        this.bindScrollEvents();
    },

    initBackToTop() {
        if (!this.backToTop) return;

        this.backToTop.addEventListener('click', () => {
            Utils.smoothScrollTo('body', 0);
        });
    },

    initParallax() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]');
    },

    bindScrollEvents() {
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateBackToTop();
            this.updateParallax();
        }));
    },

    updateBackToTop() {
        if (!this.backToTop) return;

        const scrollY = window.pageYOffset;
        if (scrollY > 300) {
            this.backToTop.classList.add('active');
        } else {
            this.backToTop.classList.remove('active');
        }
    },

    updateParallax() {
        const scrollY = window.pageYOffset;
        
        this.parallaxElements.forEach(element => {
            if (Utils.isInViewport(element)) {
                const speed = parseFloat(element.getAttribute('data-parallax')) || CONFIG.PARALLAX_SPEED;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
};

// ========================================
// FORM MANAGEMENT
// ========================================

const FormManager = {
    forms: [],

    init() {
        this.forms = document.querySelectorAll('form');
        this.forms.forEach(form => this.initForm(form));
    },

    initForm(form) {
        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', Utils.debounce(() => this.validateField(input), 500));
        });

        // Handle form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        let isValid = true;
        let message = '';

        // Required validation
        if (required && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Type-specific validation
        if (value && type === 'email' && !Utils.isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }

        if (value && type === 'tel' && value.length < 10) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }

        this.showFieldValidation(field, isValid, message);
        return isValid;
    },

    showFieldValidation(field, isValid, message) {
        const fieldContainer = field.closest('.form-group');
        if (!fieldContainer) return;

        // Remove existing validation
        const existingError = fieldContainer.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('field-valid', 'field-invalid');

        if (!isValid) {
            field.classList.add('field-invalid');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            fieldContainer.appendChild(errorElement);
        } else if (field.value.trim()) {
            field.classList.add('field-valid');
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('[type="submit"]');
        
        // Validate all fields
        const isFormValid = this.validateForm(form);
        if (!isFormValid) {
            this.showToast('Please correct the errors in the form', 'error');
            return;
        }

        // Show loading state
        this.setSubmitLoading(submitBtn, true);

        try {
            const formData = new FormData(form);
            const result = await this.submitForm(formData);
            
            if (result.success) {
                this.showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                this.clearFormValidation(form);
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            this.setSubmitLoading(submitBtn, false);
        }
    },

    validateForm(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    },

    clearFormValidation(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.classList.remove('field-valid', 'field-invalid');
            const errorElement = field.closest('.form-group')?.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        });
    },

    setSubmitLoading(button, loading) {
        if (!button) return;

        button.disabled = loading;
        button.classList.toggle('loading', loading);
        
        const text = button.querySelector('.btn-text');
        const loader = button.querySelector('.btn-loading');
        
        if (text && loader) {
            text.style.opacity = loading ? '0' : '1';
            loader.style.opacity = loading ? '1' : '0';
        }
    },

    async submitForm(formData) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Form submitted successfully' });
            }, 2000);
        });
    },

    showToast(message, type = 'info') {
        ToastManager.show(message, type);
    }
};

// ========================================
// TOAST NOTIFICATION MANAGER
// ========================================

const ToastManager = {
    container: null,

    init() {
        this.container = document.querySelector('#toastContainer');
        if (!this.container) {
            this.createContainer();
        }
    },

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);

        // Trigger show animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        // Manual close
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.remove(toast));
        }

        return toast;
    },

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type] || icons.info}"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        return toast;
    },

    remove(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
};

// ========================================
// MODAL MANAGER
// ========================================

const ModalManager = {
    overlay: null,
    activeModal: null,

    init() {
        this.overlay = document.querySelector(SELECTORS.modalOverlay);
        this.bindEvents();
    },

    bindEvents() {
        // Close modal on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeActive());
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActive();
            }
        });

        // Close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.closeActive();
            }
        });
    },

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        this.activeModal = modal;
        
        // Show overlay
        if (this.overlay) {
            this.overlay.classList.add('active');
        }

        // Show modal
        modal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        this.manageFocus(modal);
    },

    closeActive() {
        if (!this.activeModal) return;

        this.activeModal.classList.remove('active');
        
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }

        document.body.style.overflow = '';
        this.activeModal = null;
    },

    manageFocus(modal) {
        // Focus first focusable element
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        // Trap focus within modal
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }
};

// ========================================
// ANALYTICS MANAGER
// ========================================

const AnalyticsManager = {
    events: [],
    sessionData: {},

    init() {
        if (!CONFIG.FEATURES.ANALYTICS) return;

        this.sessionData = {
            sessionId: Utils.generateId(),
            startTime: Date.now(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            deviceType: Utils.getDeviceType()
        };

        this.bindEvents();
        this.trackPageView();
    },

    bindEvents() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (target) {
                this.track('click', {
                    element: target.tagName,
                    text: target.textContent?.trim().substring(0, 50),
                    href: target.href,
                    class: target.className
                });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.track('form_submit', {
                formId: e.target.id,
                formClass: e.target.className
            });
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollPercent = Math.round(
                (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    this.track('scroll_depth', { percent: maxScroll });
                }
            }
        }));

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.sessionData.startTime;
            this.track('time_on_page', { duration: timeOnPage });
        });
    },

    track(eventName, data = {}) {
        const event = {
            name: eventName,
            timestamp: Date.now(),
            sessionId: this.sessionData.sessionId,
            url: window.location.href,
            ...data
        };

        this.events.push(event);
        console.log('Analytics Event:', event);

        // Send to analytics service (implement as needed)
        // this.sendToAnalytics(event);
    },

    trackPageView() {
        this.track('page_view', {
            title: document.title,
            referrer: document.referrer
        });
    }
};

// ========================================
// GLOBAL FUNCTIONS
// ========================================

// Make functions available globally for HTML onclick handlers
window.openConsultationModal = function() {
    ModalManager.open('consultationModal');
};

window.closeModal = function(modalId) {
    ModalManager.closeActive();
};

window.openServiceModal = function(serviceId) {
    console.log('Opening service modal for:', serviceId);
    // Implement service-specific modal logic
};

window.openCountryModal = function(countryId) {
    console.log('Opening country modal for:', countryId);
    // Implement country-specific modal logic
};

// ========================================
// INITIALIZATION
// ========================================

class MarwaWebsite {
    constructor() {
        this.isInitialized = false;
        this.modules = [
            Performance,
            PreloaderManager,
            NavigationManager,
            HeroManager,
            ScrollEffectsManager,
            FormManager,
            ToastManager,
            ModalManager,
            AnalyticsManager
        ];
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize core modules
            this.modules.forEach(module => {
                if (module.init) {
                    module.init();
                }
            });

            // Initialize AOS (Animate On Scroll)
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: true,
                    offset: 100
                });
            }

            // Register service worker
            if (CONFIG.FEATURES.SERVICE_WORKER && 'serviceWorker' in navigator) {
                await this.registerServiceWorker();
            }

            this.isInitialized = true;
            console.log('Marwa Education Website initialized successfully');

        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }
}

// ========================================
// DOM READY & INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const website = new MarwaWebsite();
    website.init();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        NavigationManager,
        FormManager,
        ToastManager,
        ModalManager
    };
}