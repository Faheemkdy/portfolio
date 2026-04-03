import './style.css';
import { SceneManager } from './scene';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class App {
  private scroller!: Lenis;

  constructor() {
    this.initLoader();
  }

  private initLoader() {
    const loader = document.getElementById('loader')!;
    setTimeout(() => {
      loader.classList.add('out');
      this.boot();
    }, 800);
  }

  private boot() {
    this.initScroller();
    this.initScene();
    this.initNav();
    this.initScreenCarousel();
    this.initHamburger();
    this.initTyped();
    this.initCarousels();
    this.initTilt();
    this.initGSAP(); // New Cinematic Animations
  }

  private initGSAP() {
    // Hero Text Animation — runs on page load, no scroll needed
    gsap.from('.hero-name .hn', {
      y: 80,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out',
      delay: 0.5
    });
    gsap.from('.hero-badge, .hero-role, .hero-btns', {
      opacity: 0,
      y: 30,
      duration: 0.9,
      stagger: 0.15,
      delay: 1.2,
      ease: 'power2.out'
    });

    // We removed GSAP ScrollTriggers in favor of restoring the requested AOS library.
    // Three.js animations are managed in SceneManager.
  }

  private initTyped() {
    const typedRole = document.getElementById('typed-role');
    if (typedRole && (window as any).Typed) {
      new (window as any).Typed('#typed-role', {
        strings: ['PHP Developer', 'System Technician'],
        typeSpeed: 60,
        backSpeed: 40,
        backDelay: 2000,
        loop: true,
      });
    }

    // Removed typedCert as it was replaced by the static certificate split layout
  }

  private initCarousels() {
    const containers = document.querySelectorAll('.carousel-container');
    containers.forEach(container => {
      const images = container.querySelectorAll('.pc-carousel img');
      const prevBtn = container.querySelector('.carousel-btn.prev');
      const nextBtn = container.querySelector('.carousel-btn.next');
      
      if (!images.length || !prevBtn || !nextBtn) return;
      
      let currentIndex = 0;
      let intervalId: number | null = null;
      let isInteracted = false;
      
      const showImage = (index: number) => {
        images.forEach(img => img.classList.remove('active'));
        images[index].classList.add('active');
        this.playTick(); // subtle click sound
      };
      
      const startAutoPlay = () => {
        if (intervalId) return;
        intervalId = window.setInterval(() => {
          if (!isInteracted) {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
          }
        }, 3000);
      };

      const stopAutoPlay = () => {
        if (intervalId) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      };

      startAutoPlay();
      
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering image pop
        isInteracted = true;
        stopAutoPlay();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
      });
      
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isInteracted = true;
        stopAutoPlay();
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
      });
    });
  }

  private typewriterAudioCtx: AudioContext | null = null;

  private playTick() {
    if (!this.typewriterAudioCtx) return;
    const ctx = this.typewriterAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + Math.random() * 100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  private initTilt() {
    // Project Click Pop Animation
    document.querySelectorAll('.pc-image').forEach(img => {
      img.addEventListener('click', () => {
        img.classList.add('popping');
        setTimeout(() => img.classList.remove('popping'), 400);
        this.playTick(); // Reuse tick for click feedback
      });
    });

    if ((window as any).VanillaTilt) {
      (window as any).VanillaTilt.init(document.querySelectorAll(".proj-card"), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
      });
    }
  }

  private initScroller() {
    this.scroller = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const raf = (time: number) => {
      this.scroller.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  private initScene() {
    const c = document.getElementById('canvas-container');
    if (c) {
      new SceneManager(c);
    }
  }

  private initNav() {
    const nav = document.getElementById('main-nav')!;
    const links = document.querySelectorAll('.nav-links a');
    const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          const target = document.querySelector(href) as HTMLElement;
          if (target) this.scroller.scrollTo(target, { offset: -80 });
        }
      });
    });

    const mobileLinks = document.querySelectorAll('.mobile-nav-overlay a[href^="#"]');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          const target = document.querySelector(href) as HTMLElement;
          if (target) {
            this.closeMobileMenu();
            setTimeout(() => this.scroller.scrollTo(target, { offset: -80 }), 300);
          }
        }
      });
    });

    this.scroller.on('scroll', ({ scroll }: { scroll: number }) => {
      nav.classList.toggle('bg', scroll > 60);

      sections.forEach((sec) => {
        const top = sec.offsetTop - 200;
        const bottom = top + sec.offsetHeight;
        if (scroll >= top && scroll < bottom) {
          const id = sec.id;
          links.forEach((l) => {
            l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
          });
        }
      });
    });
  }


  private initScreenCarousel() {
    const carousels = document.querySelectorAll('.screen-carousel');
    carousels.forEach((carousel) => {
      const tabs = carousel.querySelectorAll('.sc-tab');
      const imgs = carousel.querySelectorAll('.sc-img');
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const idx = Number(tab.getAttribute('data-idx'));
          tabs.forEach((t) => t.classList.remove('active'));
          imgs.forEach((i) => i.classList.remove('active'));
          tab.classList.add('active');
          imgs[idx]?.classList.add('active');
        });
      });
    });
  }

  private closeMobileMenu() {
    const overlay = document.getElementById('mobile-nav-overlay');
    const hamburger = document.getElementById('hamburger');
    overlay?.classList.remove('open');
    hamburger?.classList.remove('open');
    document.body.style.overflow = '';
  }

  private initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (!hamburger || !overlay) return;

    hamburger.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
}

new App();
