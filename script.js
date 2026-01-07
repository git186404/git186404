/**
 * git186404 - Optimized JavaScript
 * Performance-focused, modular code with enhanced interactions
 */

'use strict';

// ==============================
// Configuration
// ==============================
const CONFIG = {
  aurora: {
    waveCount: 3,
    baseSpeed: 0.008,
    colors: {
      primary: '#00d4aa',
      secondary: '#7c3aed'
    }
  },
  counter: {
    duration: 2000,
    threshold: 0.5
  },
  scroll: {
    animationThreshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  },
  nav: {
    scrollThreshold: 50
  }
};

// ==============================
// Aurora Background Effect
// ==============================
class AuroraEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.time = 0;
    this.rafId = null;
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.start();
    window.addEventListener('resize', this.debounce(() => this.resize(), 250));
    
    // Pause animation when page is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  draw() {
    const { ctx, canvas, time } = this;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Base gradient
    const baseGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    baseGradient.addColorStop(0, 'rgba(0, 212, 170, 0.02)');
    baseGradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.02)');
    baseGradient.addColorStop(1, 'rgba(0, 212, 170, 0.02)');
    
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Aurora waves
    for (let i = 0; i < CONFIG.aurora.waveCount; i++) {
      const gradient = ctx.createLinearGradient(
        0,
        canvas.height / 2 - 100 + i * 50,
        canvas.width,
        canvas.height / 2 + 100 + i * 50
      );
      
      const hue1 = 170 + i * 20;
      const hue2 = 260 + i * 20;
      
      gradient.addColorStop(0, `hsla(${hue1}, 70%, 40%, 0)`);
      gradient.addColorStop(0.5, `hsla(${(hue1 + hue2) / 2}, 70%, 50%, 0.04)`);
      gradient.addColorStop(1, `hsla(${hue2}, 70%, 40%, 0)`);
      
      ctx.beginPath();
      
      for (let x = 0; x <= canvas.width; x += 15) {
        const y =
          canvas.height / 2 +
          Math.sin(x * 0.002 + time + i) * 50 +
          Math.sin(x * 0.005 + time * 0.5 + i) * 30;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    this.time += CONFIG.aurora.baseSpeed;
  }
  
  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.animate();
  }
  
  stop() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
  
  animate() {
    if (!this.isActive) return;
    this.draw();
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// ==============================
// Counter Animation
// ==============================
class CounterAnimation {
  constructor(element, target, duration = CONFIG.counter.duration) {
    this.element = element;
    this.target = target;
    this.duration = duration;
    this.startTime = null;
    this.isAnimating = false;
  }
  
  easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }
  
  formatNumber(value) {
    if (this.target >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return Math.floor(value);
  }
  
  animate(timestamp) {
    if (!this.startTime) this.startTime = timestamp;
    const elapsed = timestamp - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const easedProgress = this.easeOutExpo(progress);
    const current = this.target * easedProgress;
    
    this.element.textContent = this.formatNumber(current);
    
    if (progress < 1) {
      requestAnimationFrame((t) => this.animate(t));
    } else {
      this.isAnimating = false;
    }
  }
  
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.startTime = null;
    requestAnimationFrame((t) => this.animate(t));
  }
}

// ==============================
// Intersection Observer Manager
// ==============================
class ObserverManager {
  constructor() {
    this.countersInitialized = false;
  }
  
  initCounters() {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.countersInitialized) {
            const numbers = entry.target.querySelectorAll('.stat-number');
            numbers.forEach((number) => {
              const target = parseInt(number.dataset.target);
              const counter = new CounterAnimation(number, target);
              counter.start();
            });
            this.countersInitialized = true;
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: CONFIG.counter.threshold }
    );
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
      counterObserver.observe(heroStats);
    }
  }
  
  initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      {
        threshold: CONFIG.scroll.animationThreshold,
        rootMargin: CONFIG.scroll.rootMargin
      }
    );
    
    document
      .querySelectorAll('.expertise-card, .project-card, .achievement-card, .trophy')
      .forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
      });
  }
  
  initAll() {
    this.initCounters();
    this.initScrollAnimations();
  }
}

// ==============================
// Navigation & Scroll
// ==============================
class Navigation {
  constructor() {
    this.nav = document.querySelector('.glass-nav');
    this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    this.navLinks = document.querySelector('.nav-links');
    this.lastScroll = 0;
    
    this.init();
  }
  
  init() {
    this.initScrollEffect();
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initActiveLink();
  }
  
  initScrollEffect() {
    window.addEventListener('scroll', this.throttle(() => {
      const currentScroll = window.pageYOffset;
      
      // Background opacity based on scroll
      const opacity = Math.min((currentScroll / CONFIG.nav.scrollThreshold) * 0.15 + 0.8, 0.98);
      this.nav.style.background = `rgba(10, 10, 15, ${opacity})`;
      
      // Hide/show nav on scroll direction
      if (currentScroll > this.lastScroll && currentScroll > 100) {
        this.nav.style.transform = 'translateY(-100%)';
      } else {
        this.nav.style.transform = 'translateY(0)';
      }
      
      this.lastScroll = currentScroll;
    }, 100));
  }
  
  initMobileMenu() {
    if (!this.mobileMenuBtn || !this.navLinks) return;
    
    this.mobileMenuBtn.addEventListener('click', () => {
      this.mobileMenuBtn.classList.toggle('active');
      this.navLinks.classList.toggle('active');
      document.body.style.overflow = this.navLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking a link
    this.navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        this.mobileMenuBtn.classList.remove('active');
        this.navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
  
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
  
  initActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    window.addEventListener('scroll', this.throttle(() => {
      const scrollY = window.pageYOffset;
      
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, 100));
  }
  
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// ==============================
// Typing Cursor Effect
// ==============================
class TypingCursor {
  constructor() {
    this.cursors = document.querySelectorAll('.logo-cursor');
    this.init();
  }
  
  init() {
    if (this.cursors.length === 0) return;
    
    setInterval(() => {
      this.cursors.forEach((cursor) => {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
      });
    }, 500);
  }
}

// ==============================
// Page Load Animation
// ==============================
class PageLoader {
  constructor() {
    this.init();
  }
  
  init() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });
  }
}

// ==============================
// Magnetic Buttons Effect
// ==============================
class MagneticButtons {
  constructor() {
    this.buttons = document.querySelectorAll('.btn');
    this.init();
  }
  
  init() {
    this.buttons.forEach((button) => {
      button.addEventListener('mousemove', (e) => this.handleMouseMove(e, button));
      button.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, button));
    });
  }
  
  handleMouseMove(e, button) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  }
  
  handleMouseLeave(e, button) {
    button.style.transform = 'translate(0, 0)';
  }
}

// ==============================
// Text Gradient Animation
// ==============================
class GradientText {
  constructor() {
    this.init();
  }
  
  init() {
    const gradientTexts = document.querySelectorAll('.hero-name');
    
    gradientTexts.forEach((text) => {
      text.style.background = 'linear-gradient(90deg, #00d4aa, #7c3aed, #00d4aa)';
      text.style.backgroundSize = '200% auto';
      text.style.animation = 'gradientShift 4s ease infinite';
    });
    
    // Add keyframes if not exists
    if (!document.getElementById('gradient-keyframes')) {
      const style = document.createElement('style');
      style.id = 'gradient-keyframes';
      style.textContent = `
        @keyframes gradientShift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// ==============================
// Initialize Everything
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  // Core features
  const aurora = new AuroraEffect('aurora');
  const navigation = new Navigation();
  const observer = new ObserverManager();
  const cursor = new TypingCursor();
  const pageLoader = new PageLoader();
  
  // Enhanced features
  const magneticButtons = new MagneticButtons();
  const gradientText = new GradientText();
  
  // Initialize observers
  observer.initAll();
  
  // Log initialization
  console.log('✨ git186404 portfolio initialized');
});

// Performance: Optimize for low-end devices
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--animation-duration', '0s');
}
