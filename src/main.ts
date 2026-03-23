import './style.css';
import { SceneManager } from './scene';
import Lenis from 'lenis';

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
    this.initPagination();
    this.initTyped();
    this.initTilt();
    if (typeof (window as any).AOS !== 'undefined') {
      (window as any).AOS.refresh();
    }
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

    const typedCert = document.getElementById('typed-cert');
    if (typedCert && (window as any).Typed) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            new (window as any).Typed('#typed-cert', {
              strings: ['Successfully completed foundational training in ethical hacking principles and security concepts. This certification demonstrates my commitment to understanding web security and building robust, protected backend solutions.'],
              typeSpeed: 35,
              showCursor: true,
              cursorChar: '_',
              preStringTyped: () => {
                this.startTypewriterSound(typedCert);
              },
              onComplete: (self: any) => {
                self.cursor.style.display = 'none';
                this.stopTypewriterSound();
              }
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(typedCert);
    }
  }

  private typewriterAudioCtx: AudioContext | null = null;
  private typewriterObserver: MutationObserver | null = null;

  private startTypewriterSound(el: HTMLElement) {
    if (!this.typewriterAudioCtx) {
      this.typewriterAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    this.typewriterObserver = new MutationObserver(() => {
      this.playTick();
    });
    
    this.typewriterObserver.observe(el, { childList: true, characterData: true, subtree: true });
  }

  private stopTypewriterSound() {
    this.typewriterObserver?.disconnect();
  }

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

  private initPagination() {
    const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
    if (sections.length === 0) return;

    const nav = document.createElement('nav');
    nav.className = 'page-dots';
    nav.setAttribute('aria-label', 'Page navigation');

    sections.forEach((sec, i) => {
      const dot = document.createElement('button');
      dot.className = 'pd-dot';
      dot.setAttribute('aria-label', `Go to ${sec.id}`);
      dot.setAttribute('data-section', sec.id);

      // Tooltip label from heading or section id
      const rawLabel = sec.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim()
        || sec.id.charAt(0).toUpperCase() + sec.id.slice(1);
      dot.setAttribute('data-label', rawLabel.substring(0, 24));

      dot.addEventListener('click', () => {
        this.scroller.scrollTo(sec, { offset: -80 });
      });

      if (i === 0) dot.classList.add('active');
      nav.appendChild(dot);
    });

    document.body.appendChild(nav);

    this.scroller.on('scroll', ({ scroll }: { scroll: number }) => {
      const dots = nav.querySelectorAll('.pd-dot');
      sections.forEach((sec, i) => {
        const top = sec.offsetTop - window.innerHeight / 2;
        const bottom = top + sec.offsetHeight;
        if (scroll >= top && scroll < bottom) {
          dots.forEach((d) => d.classList.remove('active'));
          dots[i]?.classList.add('active');
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
