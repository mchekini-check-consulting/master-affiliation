/* <astonfly-model src="models/x.glb"> — visualiseur 3D léger : rotation verrouillée sur l'axe
   vertical (le modèle tourne à plat), rotation continue lente, prise en main à la souris ou au doigt.
   Aucun zoom, aucune bascule verticale. three.js chargé via l'import map de la page. */
(function () {
  if (customElements.get('astonfly-model')) return;

  class AstonflyModel extends HTMLElement {
    async connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.style.display = 'block';
      this.style.position = 'absolute';
      this.style.inset = '0';
      this.style.width = '100%';
      this.style.height = '100%';
      this.style.touchAction = 'pan-y';
      this.style.cursor = 'grab';

      let THREE, GLTFLoader;
      try {
        THREE = await import('three');
        ({ GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js'));
      } catch (e) { return; }
      if (!this.isConnected) return;

      const w = () => Math.max(1, this.clientWidth);
      const h = () => Math.max(1, this.clientHeight);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w(), h());
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.cssText = 'display:block; width:100%; height:100%;';
      this.appendChild(renderer.domElement);
      this._renderer = renderer;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, w() / h(), 0.1, 400);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb4c6, 0.75));
      const key = new THREE.DirectionalLight(0xffffff, 1.9);
      key.position.set(4, 6, 5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdfeaf3, 0.75);
      fill.position.set(-5, 1.5, -4);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x8fa8bd, 0.55);
      rim.position.set(-2, -3, -5);
      scene.add(rim);

      const pivot = new THREE.Group();
      scene.add(pivot);

      const src = this.getAttribute('src');
      if (!src) return;

      new GLTFLoader().load(src, (gltf) => {
        if (!this.isConnected) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const span = Math.max(size.x, size.y, size.z) || 1;
        model.scale.setScalar(1 / span);
        model.position.copy(center).multiplyScalar(-1 / span);
        pivot.add(model);
        this._span = { x: size.x / span, y: size.y / span, z: size.z / span };

        const tilt = parseFloat(this.getAttribute('tilt') || '10') * Math.PI / 180;
        this._tilt = tilt;
        this._fill = parseFloat(this.getAttribute('fill') || '0.92');
        this._frame();
        this._ready = true;
      }, undefined, () => {});

      // rotation : uniquement autour de l'axe vertical
      let spin = parseFloat(this.getAttribute('speed') || '0.32');
      let dragging = false, lastX = 0, velocity = 0;
      const down = (x) => { dragging = true; lastX = x; velocity = 0; this.style.cursor = 'grabbing'; };
      const move = (x) => { if (!dragging) return; const dx = x - lastX; lastX = x; velocity = dx * 0.006; pivot.rotation.y += velocity; };
      const up = () => { dragging = false; this.style.cursor = 'grab'; };

      this.addEventListener('pointerdown', (e) => { down(e.clientX); this.setPointerCapture(e.pointerId); });
      this.addEventListener('pointermove', (e) => move(e.clientX));
      this.addEventListener('pointerup', up);
      this.addEventListener('pointercancel', up);
      this.addEventListener('pointerleave', up);

      const clock = new THREE.Clock();
      let visible = true;
      this._io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 });
      this._io.observe(this);

      const loop = () => {
        this._raf = requestAnimationFrame(loop);
        const dt = clock.getDelta();
        if (!visible) return;
        if (!dragging) {
          if (Math.abs(velocity) > 0.0004) { pivot.rotation.y += velocity; velocity *= 0.94; }
          else pivot.rotation.y += spin * dt;
        }
        pivot.rotation.x = 0;
        pivot.rotation.z = 0;
        renderer.render(scene, camera);
      };
      this._raf = requestAnimationFrame(loop);

      // cadrage : le modèle occupe la part demandée du cadre, en largeur comme en hauteur
      this._frame = () => {
        if (!this._span) return;
        const aspect = w() / h();
        const vFov = camera.fov * Math.PI / 180;
        // rayon horizontal balayé par la rotation : le modèle tourne sur lui-même
        const rH = Math.hypot(this._span.x, this._span.z) * 0.5;
        const rV = this._span.y * 0.5;
        const fill = Math.max(0.2, Math.min(1.6, this._fill));
        const dV = rV / Math.tan(vFov / 2) / fill;
        const dH = rH / (Math.tan(vFov / 2) * aspect) / fill;
        const dist = Math.max(dV, dH);
        camera.position.set(0, Math.sin(this._tilt) * dist, Math.cos(this._tilt) * dist);
        camera.lookAt(0, 0, 0);
      };

      this._ro = new ResizeObserver(() => {
        renderer.setSize(w(), h());
        camera.aspect = w() / h();
        camera.updateProjectionMatrix();
        this._frame();
      });
      this._ro.observe(this);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      if (this._renderer) { try { this._renderer.dispose(); } catch (e) {} }
      this._built = false;
    }
  }
  customElements.define('astonfly-model', AstonflyModel);
})();
