import * as THREE from 'three';

export class SceneManager {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private stars!: THREE.Points;
  private dust!: THREE.Points;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.buildScene();
    this.animate();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
      this.targetX = (e.clientX - window.innerWidth / 2) * 0.0001;
      this.targetY = (e.clientY - window.innerHeight / 2) * 0.0001;
    });
  }

  private buildScene() {
    // ── Primary Stars ──
    const starGeo = new THREE.BufferGeometry();
    const starVerts: number[] = [];
    const starColors: number[] = [];
    
    for (let i = 0; i < 6000; i++) {
      const x = (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;
      starVerts.push(x, y, z);
      
      const r = 0.8 + Math.random() * 0.2;
      const g = 0.8 + Math.random() * 0.2;
      const b = 1.0;
      starColors.push(r, g, b);
    }
    
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.003,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      })
    );
    this.scene.add(this.stars);

    // ── Space Dust (Layer 2) ──
    const dustGeo = new THREE.BufferGeometry();
    const dustVerts: number[] = [];
    for (let i = 0; i < 2000; i++) {
      dustVerts.push(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      );
    }
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustVerts, 3));
    this.dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        size: 0.001,
        color: 0x9333ea, // Purple dust
        transparent: true,
        opacity: 0.3,
        sizeAttenuation: true
      })
    );
    this.scene.add(this.dust);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Smooth mouse follow
    this.mouseX += (this.targetX - this.mouseX) * 0.05;
    this.mouseY += (this.targetY - this.mouseY) * 0.05;

    this.stars.rotation.y += 0.0005;
    this.stars.rotation.x += 0.0002;
    
    this.dust.rotation.y -= 0.0003;
    this.dust.rotation.z += 0.0001;

    this.scene.rotation.x = this.mouseY;
    this.scene.rotation.y = this.mouseX;

    this.renderer.render(this.scene, this.camera);
  }
}
