import './style.css';
import { SceneManager } from './scene';
import Lenis from 'lenis';

class App {
  private scroller!: Lenis;
  private sceneManager!: SceneManager;

  constructor() {
    this.initLoader();
  }

  private initLoader() {
    const loader = document.getElementById('loader')!;
    setTimeout(() => {
      loader.classList.add('out');
      this.boot();
    }, 2000);
  }

  private boot() {
    this.initScroller();
    this.initScene();
    this.initNav();
    this.initScreenCarousel();
    this.initCVDropdown();
    // Force all .reveal elements to be visible in case CSS animation-timeline isn't supported
    this.ensureVisible();
  }

  private ensureVisible() {
    // Immediately show all content after loader (safety net for all browsers)
    document.querySelectorAll('.reveal').forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    document.querySelectorAll('.sk-card').forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
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
      this.sceneManager = new SceneManager(c);
    }
  }

  private initNav() {
    const nav = document.getElementById('main-nav')!;
    const links = document.querySelectorAll('.nav-links a');
    const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];

    // smooth nav click
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

    // nav background + scroll-spy
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

  private initCVDropdown() {
    const btn = document.getElementById('cv-toggle');
    const menu = document.getElementById('cv-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  }
}

new App();
