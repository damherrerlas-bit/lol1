import * as THREE from 'three';

export class MarsScene {
  constructor(container, isClean = false) {
    this.container = container;
    this.isClean = isClean;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mars = null;
    this.stars = null;
    this.animationId = null;
    this.textureLoaded = false;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);

    this.createStarfield();
    this.createMars();

    window.addEventListener('resize', () => this.onWindowResize());

    this.animate();
  }

  createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });

    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  }

  createMars() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
      (texture) => {
        this.textureLoaded = true;

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.9,
          metalness: 0.1
        });

        if (this.isClean) {
          material.color.setRGB(1.1, 1.05, 1.0);
          material.emissive = new THREE.Color(0x221100);
          material.emissiveIntensity = 0.05;
        }

        this.mars = new THREE.Mesh(geometry, material);
        this.scene.add(this.mars);
      },
      undefined,
      (error) => {
        console.warn('Failed to load Mars texture, using fallback', error);
        this.createFallbackMars(geometry);
      }
    );

    if (!this.textureLoaded) {
      setTimeout(() => {
        if (!this.textureLoaded) {
          this.createFallbackMars(geometry);
        }
      }, 3000);
    }
  }

  createFallbackMars(geometry) {
    if (this.mars) return;

    const material = new THREE.MeshStandardMaterial({
      color: this.isClean ? 0xd4a574 : 0xcd5c5c,
      roughness: 0.9,
      metalness: 0.1
    });

    if (this.isClean) {
      material.emissive = new THREE.Color(0x221100);
      material.emissiveIntensity = 0.05;
    }

    this.mars = new THREE.Mesh(geometry, material);
    this.scene.add(this.mars);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.mars) {
      this.mars.rotation.y += 0.001;
    }

    if (this.stars) {
      this.stars.rotation.y += 0.0001;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container.clientWidth) return;

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener('resize', () => this.onWindowResize());

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  }
}
