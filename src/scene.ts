import * as THREE from 'three';

export class SceneManager {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private globe!: THREE.Mesh;
  private atmosphere!: THREE.Mesh;
  private stars!: THREE.Points;
  private ring!: THREE.Mesh;
  private mouseX: number = 0;
  private mouseY: number = 0;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 2.8;

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
      this.mouseX = (e.clientX - window.innerWidth / 2) / 120;
      this.mouseY = (e.clientY - window.innerHeight / 2) / 120;
    });
  }

  private buildScene() {
    // ── Stars ──
    const starGeo = new THREE.BufferGeometry();
    const verts: number[] = [];
    for (let i = 0; i < 5000; i++) {
      verts.push(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 22,
        -Math.random() * 12
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.014, transparent: true, opacity: 0.45 })
    );
    this.scene.add(this.stars);

    // ── Core globe (dark, not solid black) ──
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x080815,
      roughness: 0.85,
      metalness: 0.2,
    });
    this.globe = new THREE.Mesh(globeGeo, globeMat);
    this.scene.add(this.globe);

    // ── Atmosphere glow (mint green, like tiwis.fr) ──
    const atmGeo = new THREE.SphereGeometry(1.22, 64, 64);
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        glowColor: { value: new THREE.Color(0x5bffc0) }, // mint green
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          gl_FragColor = vec4(glowColor, intensity * 0.9);
        }
      `,
    });
    this.atmosphere = new THREE.Mesh(atmGeo, atmMat);
    this.scene.add(this.atmosphere);

    // ── Outer purple glow ring ──
    const ringGeo = new THREE.SphereGeometry(1.45, 64, 64);
    const ringMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        glowColor: { value: new THREE.Color(0xc47bff) }, // soft purple
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 6.0);
          gl_FragColor = vec4(glowColor, intensity * 0.5);
        }
      `,
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.ring);

    // ── Lights ──
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    const l1 = new THREE.PointLight(0x5bffc0, 2.5); // mint
    l1.position.set(2, 2, 2);
    this.scene.add(l1);

    const l2 = new THREE.PointLight(0xc47bff, 1.5); // purple
    l2.position.set(-2, -1, 2);
    this.scene.add(l2);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.globe.rotation.y += 0.0018;
    this.globe.rotation.z += 0.0008;
    this.stars.rotation.z += 0.00018;

    this.scene.rotation.y += (this.mouseX * 0.08 - this.scene.rotation.y) * 0.04;
    this.scene.rotation.x += (this.mouseY * 0.08 - this.scene.rotation.x) * 0.04;

    this.renderer.render(this.scene, this.camera);
  }
}
