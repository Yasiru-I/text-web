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

  // ==============================================================
  // අලුත් කොටස: Canvas එකක් හදලා ඒකට Image එකයි අකුරුයි දෙකම අඳිනවා
  // ==============================================================
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const textTexture = new THREE.CanvasTexture(canvas);
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  textTexture.format = THREE.RGBAFormat;

  const bgImage = new Image();
  bgImage.src = 'images/sea-background.png'; // ඔයාගේ මුහුදේ පින්තූරය මෙතන දෙන්න
  // ෆොන්ට් එක ලෝඩ් වෙලා ඉවර වුණාම විතරක් කැන්වස් එක අප්ඩේට් කරන්න කියනවා
  document.fonts.ready.then(() => {
      updateCanvas();
  });
function updateCanvas() {
    const w = window.innerWidth * window.devicePixelRatio;
    const h = window.innerHeight * window.devicePixelRatio;
    canvas.width = w;
    canvas.height = h;

    // 1. පින්තූරය අඳින්න
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

    // 2. අකුරු පැහැදිලිව පේන්න අඳුරු Overlay එකක්
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, w, h);

    // 3. ඔයාගේ අකුරු පේළි දෙක ලියනවා
    ctx.fillStyle = "#ffffff"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    
    // // පළමු පේළිය ("Experience the Magic of")
    // const fontSize1 = Math.round(50 * window.devicePixelRatio); 
    // ctx.font = `400 ${fontSize1}px Cormorant, serif`; 
    // ctx.fillText("Experience the Magic of", w / 2, h / 2 - (40 * window.devicePixelRatio)); 
   
   

    textTexture.needsUpdate = true;
  }

  bgImage.onload = updateCanvas;

  window.addEventListener("resize", () => {
    const newWidth = window.innerWidth * window.devicePixelRatio;
    const newHeight = window.innerHeight * window.devicePixelRatio;

    renderer.setSize(window.innerWidth, window.innerHeight);
    rtA.setSize(newWidth, newHeight);
    rtB.setSize(newWidth, newHeight);
    simMaterial.uniforms.resolution.value.set(newWidth, newHeight);
    
    updateCanvas(); // Resize වෙද්දි අකුරු ටික ආයේ අඳිනවා
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX * window.devicePixelRatio;
    mouse.y = (window.innerHeight - e.clientY) * window.devicePixelRatio;
  });

  window.addEventListener("mouseleave", () => {
    mouse.set(0, 0);
  });

  const animate = () => {
    simMaterial.uniforms.frame.value = frame++;
    simMaterial.uniforms.time.value = performance.now() / 1000;

    simMaterial.uniforms.textureA.value = rtA.texture;
    renderer.setRenderTarget(rtB);
    renderer.render(simScene, camera);

    renderMaterial.uniforms.textureA.value = rtB.texture;
    renderMaterial.uniforms.textureB.value = textTexture; // අලුත් texture එක දානවා
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    const temp = rtA;
    rtA = rtB;
    rtB = temp;

    requestAnimationFrame(animate);
  };

  animate();
});