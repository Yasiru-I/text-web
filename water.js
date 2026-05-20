import {
  simulationVertexShader,
  simulationFragmentShader,
  renderVertexShader,
  renderFragmentShader,
} from "./shaders.js";

document.addEventListener("DOMContentLoaded", () => {
  const scene = new THREE.Scene();
  const simScene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  const seaLayer = document.querySelector('.sea-layer');
  if(seaLayer) {
      seaLayer.appendChild(renderer.domElement);
  } else {
      document.body.appendChild(renderer.domElement); 
  }

  const mouse = new THREE.Vector2();
  let frame = 0;

  const width = window.innerWidth * window.devicePixelRatio;
  const height = window.innerHeight * window.devicePixelRatio;
  const options = {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
    depthBuffer: false,
  };

  let rtA = new THREE.WebGLRenderTarget(width, height, options);
  let rtB = new THREE.WebGLRenderTarget(width, height, options);

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: {
      textureA: { value: null },
      mouse: { value: mouse },
      resolution: { value: new THREE.Vector2(width, height) },
      time: { value: 0 },
      frame: { value: 0 },
    },
    vertexShader: simulationVertexShader,
    fragmentShader: simulationFragmentShader,
  });

  const renderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      textureA: { value: null },
      textureB: { value: null },
    },
    vertexShader: renderVertexShader,
    fragmentShader: renderFragmentShader,
    transparent: true,
  });

  const plane = new THREE.PlaneGeometry(2, 2);
  const simQuad = new THREE.Mesh(plane, simMaterial);
  const renderQuad = new THREE.Mesh(plane, renderMaterial);

  simScene.add(simQuad);
  scene.add(renderQuad);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const textTexture = new THREE.CanvasTexture(canvas);
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  textTexture.format = THREE.RGBAFormat;

  const bgImage = new Image();
  bgImage.src = 'images/sea-background.png'; 
  
  document.fonts.ready.then(() => {
      updateCanvas();
  });

  function updateCanvas() {
    const w = window.innerWidth * window.devicePixelRatio;
    const h = window.innerHeight * window.devicePixelRatio;
    canvas.width = w;
    canvas.height = h;

    if (bgImage.complete && bgImage.naturalWidth > 0) {
      const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
      const canvasRatio = w / h;
      let drawW = w, drawH = h, offsetX = 0, offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawH = w / imgRatio;
        offsetY = (h - drawH) / 2;
      } else {
        drawW = h * imgRatio;
        offsetX = (w - drawW) / 2;
      }
      ctx.drawImage(bgImage, offsetX, offsetY, drawW, drawH);
    } else {
      ctx.fillStyle = '#1a2b1a';
      ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#ffffff"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    textTexture.needsUpdate = true;
  }

  bgImage.onload = updateCanvas;

  // ==========================================
  // AUTO RANDOM WATER DROPS LOGIC
  // ==========================================
  let isUserInteracting = false;
  let idleTimeout;

  const simulateRandomDrop = () => {
      // User මවුස් එක හෙලවනවා නම් auto drops එන්නේ නෑ
      if (isUserInteracting) return;

      const rx = Math.random() * window.innerWidth;
      const ry = Math.random() * window.innerHeight;

      mouse.x = rx * window.devicePixelRatio;
      mouse.y = ry * window.devicePixelRatio;

      setTimeout(() => {
          if (!isUserInteracting) {
              mouse.set(0, 0);
          }
      }, 50);
  };

  // සෑම මිලි තත්පර 600කට වරක්ම බිංදුවක් වැටෙනවා 
  setInterval(simulateRandomDrop, 600);

  const handleUserInteraction = (e) => {
      isUserInteracting = true; // Auto drops නවත්තලා, මවුස් එකට effect එක දෙනවා
      
      let clientX = e.clientX;
      let clientY = e.clientY;

      // Touch screen එකක් නම් ඒකෙ ඛණ්ඩාංක ගන්නවා
      if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      }

      if (clientX !== undefined && clientY !== undefined) {
          mouse.x = clientX * window.devicePixelRatio;
          mouse.y = (window.innerHeight - clientY) * window.devicePixelRatio;
      }

      clearTimeout(idleTimeout); // පරණ timer එක clear කරනවා

      // තත්පර 1ක් (1000ms) මවුස් එක නොහොල්වා හිටියොත් ආයෙත් auto drops පටන් ගන්නවා
      idleTimeout = setTimeout(() => {
          isUserInteracting = false;
          mouse.set(0, 0);
      }, 1000); 
  };
  // ==========================================

  window.addEventListener("resize", () => {
    const newWidth = window.innerWidth * window.devicePixelRatio;
    const newHeight = window.innerHeight * window.devicePixelRatio;

    renderer.setSize(window.innerWidth, window.innerHeight);
    rtA.setSize(newWidth, newHeight);
    rtB.setSize(newWidth, newHeight);
    simMaterial.uniforms.resolution.value.set(newWidth, newHeight);
    
    updateCanvas(); 
  });

  // Event Listeners
  window.addEventListener("mousemove", handleUserInteraction);
  window.addEventListener("touchstart", handleUserInteraction, {passive: true});
  window.addEventListener("touchmove", handleUserInteraction, {passive: true});

  window.addEventListener("mouseleave", () => {
    mouse.set(0, 0);
    isUserInteracting = false; // බ්‍රවුසර් එකෙන් එළියට ගිය ගමන් auto drops පටන් ගන්නවා
  });

  const animate = () => {
    simMaterial.uniforms.frame.value = frame++;
    simMaterial.uniforms.time.value = performance.now() / 1000;

    simMaterial.uniforms.textureA.value = rtA.texture;
    renderer.setRenderTarget(rtB);
    renderer.render(simScene, camera);

    renderMaterial.uniforms.textureA.value = rtB.texture;
    renderMaterial.uniforms.textureB.value = textTexture; 
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    const temp = rtA;
    rtA = rtB;
    rtB = temp;

    requestAnimationFrame(animate);
  };

  animate();
});