/**
 * CAROUSEL & TESTIMONIALS MANAGER
 * Advanced carousel functionality with video support, autoplay, and smooth transitions
 */

'use strict';

// ========================================
// TESTIMONIAL CAROUSEL MANAGER
// ========================================

const TestimonialCarousel = {
    container: null,
    slides: [],
    indicators: [],
    currentSlide: 0,
    isPlaying: false,
    autoplayInterval: null,
    autoplayDelay: 8000,
    touchStartX: 0,
    touchEndX: 0,
    isTransitioning: false,

    init() {
        this.container = document.getElementById('testimonialsCarousel');
        if (!this.container) return;

        this.setupSlides();
        this.setupIndicators();
        this.setupControls();
        this.setupTouchSupport();
        this.setupIntersectionObserver();
        this.startAutoplay();
    },

    setupSlides() {
        this.slides = Array.from(this.container.querySelectorAll('.testimonial-slide'));
        
        if (this.slides.length === 0) return;

        // Set initial states
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active');
            slide.style.display = 'none';
            slide.style.opacity = '0';
            slide.setAttribute('data-slide-index', index);
        });

        // Show first slide
        if (this.slides[0]) {
            this.slides[0].classList.add('active');
            this.slides[0].style.display = 'block';
            this.slides[0].style.opacity = '1';
        }
    },

    setupIndicators() {
        const indicatorsContainer = document.getElementById('testimonialIndicators');
        if (!indicatorsContainer) return;

        // Clear existing indicators
        indicatorsContainer.innerHTML = '';

        // Create indicators
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            
            indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        });
    },

    setupControls() {
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isInViewport()) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoplay();
                    break;
            }
        });
    },

    setupTouchSupport() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        // Mouse drag support for desktop
        let isDragging = false;
        let startX = 0;

        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            this.container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            this.container.style.cursor = 'grab';

            const endX = e.clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startAutoplay();
                    this.handleVideoPlayback(this.currentSlide, true);
                } else {
                    this.stopAutoplay();
                    this.handleVideoPlayback(this.currentSlide, false);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.container);
    },

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    },

    goToSlide(index, direction = 'auto') {
        if (this.isTransitioning || index === this.currentSlide || !this.slides[index]) return;

        this.isTransitioning = true;
        this.stopAutoplay();

        const currentSlideElement = this.slides[this.currentSlide];
        const nextSlideElement = this.slides[index];

        // Update indicators
        this.updateIndicators(index);

        // Handle video playback
        this.handleVideoPlayback(this.currentSlide, false);

        // Determine animation direction
        if (direction === 'auto') {
            direction = index > this.currentSlide ? 'next' : 'prev';
        }

        // Animate transition
        this.animateSlideTransition(currentSlideElement, nextSlideElement, direction)
            .then(() => {
                this.currentSlide = index;
                this.handleVideoPlayback(this.currentSlide, true);
                this.isTransitioning = false;
                this.startAutoplay();
            });
    },

    async animateSlideTransition(currentSlide, nextSlide, direction) {
        return new Promise((resolve) => {
            // Prepare next slide
            nextSlide.style.display = 'block';
            nextSlide.style.opacity = '0';
            
            // Set initial transform based on direction
            const translateX = direction === 'next' ? '100%' : '-100%';
            nextSlide.style.transform = `translateX(${translateX})`;

            // Force reflow
            nextSlide.offsetHeight;

            // Start transition
            requestAnimationFrame(() => {
                // Animate current slide out
                currentSlide.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                currentSlide.style.transform = `translateX(${direction === 'next' ? '-100%' : '100%'})`;
                currentSlide.style.opacity = '0';

                // Animate next slide in
                nextSlide.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                nextSlide.style.transform = 'translateX(0)';
                nextSlide.style.opacity = '1';

                // Clean up after transition
                setTimeout(() => {
                    // Hide current slide
                    currentSlide.classList.remove('active');
                    currentSlide.style.display = 'none';
                    currentSlide.style.transition = '';
                    currentSlide.style.transform = '';
                    currentSlide.style.opacity = '';

                    // Show next slide
                    nextSlide.classList.add('active');
                    nextSlide.style.transition = '';
                    nextSlide.style.transform = '';

                    resolve();
                }, 600);
            });
        });
    },

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex, 'next');
    },

    previousSlide() {
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex, 'prev');
    },

    updateIndicators(activeIndex) {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
            indicator.setAttribute('aria-pressed', index === activeIndex);
        });
    },

    handleVideoPlayback(slideIndex, play) {
        const slide = this.slides[slideIndex];
        if (!slide) return;

        const video = slide.querySelector('video');
        if (video) {
            if (play) {
                video.currentTime = 0;
                video.play().catch(console.warn);
            } else {
                video.pause();
            }
        }
    },

    startAutoplay() {
        if (this.isPlaying || this.slides.length <= 1) return;

        this.isPlaying = true;
        this.autoplayInterval = setInterval(() => {
            if (!this.isTransitioning && this.isInViewport()) {
                this.nextSlide();
            }
        }, this.autoplayDelay);
    },

    stopAutoplay() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    },

    toggleAutoplay() {
        if (this.isPlaying) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
    },

    isInViewport() {
        if (!this.container) return false;
        
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    },

    // Public API for external control
    play() {
        this.startAutoplay();
    },

    pause() {
        this.stopAutoplay();
    },

    getCurrentSlide() {
        return this.currentSlide;
    },

    getTotalSlides() {
        return this.slides.length;
    }
};

// ========================================
// COUNTRIES FILTER MANAGER
// ========================================

const CountriesFilter = {
    filterButtons: [],
    countryCards: [],
    activeFilter: 'all',

    init() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.countryCards = document.querySelectorAll('.country-card');

        if (this.filterButtons.length === 0) return;

        this.bindEvents();
        this.setupInitialState();
    },

    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter');
                this.setActiveFilter(filter);
            });
        });
    },

    setupInitialState() {
        // Set first button as active
        if (this.filterButtons[0]) {
            this.filterButtons[0].classList.add('active');
        }
    },

    setActiveFilter(filter) {
        if (this.activeFilter === filter) return;

        this.activeFilter = filter;
        this.updateFilterButtons(filter);
        this.filterCountries(filter);
    },

    updateFilterButtons(activeFilter) {
        this.filterButtons.forEach(button => {
            const isActive = button.getAttribute('data-filter') === activeFilter;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    },

    filterCountries(filter) {
        this.countryCards.forEach((card, index) => {
            const shouldShow = filter === 'all' || card.classList.contains(filter);
            
            if (shouldShow) {
                this.showCard(card, index);
            } else {
                this.hideCard(card);
            }
        });
    },

    showCard(card, index) {
        card.style.display = 'block';
        
        // Animate in with delay for stagger effect
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    },

    hideCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.display = 'none';
        }, 300);
    }
};

// ========================================
// VIDEO MODAL MANAGER
// ========================================

const VideoModal = {
    modal: null,
    video: null,
    overlay: null,

    init() {
        this.createModal();
        this.bindEvents();
    },

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="video-modal-overlay" id="videoModalOverlay">
                <div class="video-modal" id="videoModal">
                    <button class="video-modal-close" aria-label="Close video">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="video-modal-content">
                        <video id="modalVideo" controls preload="none">
                            <source src="" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        this.overlay = document.getElementById('videoModalOverlay');
        this.modal = document.getElementById('videoModal');
        this.video = document.getElementById('modalVideo');
    },

    bindEvents() {
        // Play overlay clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-overlay')) {
                e.preventDefault();
                const videoElement = e.target.closest('.testimonial-video').querySelector('video');
                if (videoElement) {
                    this.openVideo(videoElement.src);
                }
            }
        });

        // Close modal events
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.closeVideo();
                }
            });
        }

        const closeBtn = document.querySelector('.video-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeVideo());
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.closeVideo();
            }
        });
    },

    openVideo(src) {
        if (!this.video || !src) return;

        this.video.src = src;
        this.overlay.classList.add('active');
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Auto play when modal opens
        setTimeout(() => {
            this.video.play().catch(console.warn);
        }, 300);
    },

    closeVideo() {
        if (!this.isOpen()) return;

        this.video.pause();
        this.video.src = '';
        this.overlay.classList.remove('active');
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    },

    isOpen() {
        return this.overlay && this.overlay.classList.contains('active');
    }
};

// ========================================
// GLOBAL CAROUSEL FUNCTIONS
// ========================================

// Make functions available globally for HTML onclick handlers
window.changeTestimonial = function(direction) {
    if (direction > 0) {
        TestimonialCarousel.nextSlide();
    } else {
        TestimonialCarousel.previousSlide();
    }
};

window.goToTestimonial = function(index) {
    TestimonialCarousel.goToSlide(index);
};

// ========================================
// INITIALIZATION
// ========================================

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TestimonialCarousel.init();
    CountriesFilter.init();
    VideoModal.init();
});

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TestimonialCarousel,
        CountriesFilter,
        VideoModal
    };
}

// ========================================
// CSS STYLES FOR VIDEO MODAL
// ========================================

// Add required CSS if not already present
if (!document.querySelector('#carousel-styles')) {
    const style = document.createElement('style');
    style.id = 'carousel-styles';
    style.textContent = `
        .video-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .video-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .video-modal {
            position: relative;
            width: 90%;
            max-width: 800px;
            max-height: 90%;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        }

        .video-modal.active {
            transform: scale(1);
        }

        .video-modal-close {
            position: absolute;
            top: -50px;
            right: 0;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10001;
        }

        .video-modal-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }

        .video-modal-content {
            position: relative;
            width: 100%;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
        }

        .video-modal-content video {
            width: 100%;
            height: auto;
            display: block;
        }

        @media (max-width: 768px) {
            .video-modal {
                width: 95%;
            }

            .video-modal-close {
                top: -40px;
                width: 35px;
                height: 35px;
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}