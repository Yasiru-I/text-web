/*
========================================================

STICKER BURST MONTAGE SYSTEM
Production-ready reusable module
Vanilla JavaScript
Zero dependencies

========================================================
*/

export default class StickerMontage {

  constructor(options = {}) {

    /*
    ========================================================
    CONFIG
    ========================================================
    */

    this.container = document.querySelector(options.container);

    this.manifest = options.manifest || './stickers/stickers.json';

    this.duration = options.duration || 140;
    this.interval = options.interval || 70;

    this.randomPosition = options.randomPosition ?? true;

    this.spread = options.spread || 250;

    this.startScale = options.startScale || 0;
    this.overshootScale = options.overshootScale || 1.15;
    this.endScale = options.endScale || 1;

    this.loop = options.loop ?? true;

    this.autoplay = options.autoplay ?? true;

    /*
    ========================================================
    INTERNALS
    ========================================================
    */

    this.stickers = [];
    this.currentIndex = 0;
    this.isRunning = false;
    this.timer = null;

    /*
    ========================================================
    INIT
    ========================================================
    */

    this.init();
  }

  /*
  ==========================================================
  INIT
  ==========================================================
  */

  async init() {

    if (!this.container) {
      console.error('StickerMontage: container not found.');
      return;
    }

    try {

      await this.loadManifest();

      await this.preloadImages();

      if (this.autoplay) {
        this.start();
      }

    } catch (error) {

      console.error(
        'StickerMontage initialization failed:',
        error
      );

    }
  }

  /*
  ==========================================================
  LOAD IMAGE MANIFEST
  ==========================================================
  */

  async loadManifest() {

    const response = await fetch(this.manifest);

    if (!response.ok) {
      throw new Error(
        `Failed to load manifest: ${this.manifest}`
      );
    }

    const files = await response.json();

    /*
      Normalize into objects
    */

    this.stickers = files.map(file => ({
      src: `./stickers/${file}`
    }));

    if (!this.stickers.length) {
      throw new Error('No sticker images found.');
    }
  }

  /*
  ==========================================================
  PRELOAD IMAGES
  ==========================================================
  */

  preloadImages() {

    const promises = this.stickers.map(sticker => {

      return new Promise((resolve, reject) => {

        const img = new Image();

        img.src = sticker.src;

        img.onload = () => {
          sticker.image = img;
          resolve();
        };

        img.onerror = reject;
      });

    });

    return Promise.all(promises);
  }

  /*
  ==========================================================
  START
  ==========================================================
  */

  start() {

    if (this.isRunning) return;

    this.isRunning = true;

    this.loopSequence();
  }

  /*
  ==========================================================
  STOP
  ==========================================================
  */

  stop() {

    this.isRunning = false;

    clearTimeout(this.timer);
  }

  /*
  ==========================================================
  MAIN LOOP
  ==========================================================
  */

  loopSequence() {

    if (!this.isRunning) return;

    this.showSticker();

    this.timer = setTimeout(() => {

      this.currentIndex++;

      /*
        LOOP
      */

      if (this.currentIndex >= this.stickers.length) {

        if (this.loop) {

          this.shuffle(this.stickers);

          this.currentIndex = 0;

        } else {

          this.stop();
          return;
        }
      }

      this.loopSequence();

    }, this.interval);
  }

  /*
  ==========================================================
  SHOW STICKER
  ==========================================================
  */

  showSticker() {

    const stickerData = this.stickers[this.currentIndex];

    if (!stickerData) return;

    const img = stickerData.image.cloneNode();

    img.classList.add('sticker');

    /*
    ========================================================
    RANDOM POSITION
    ========================================================
    */

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (this.randomPosition) {

      x += this.random(-this.spread, this.spread);
      y += this.random(-this.spread, this.spread);
    }

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    /*
    ========================================================
    RANDOM SIZE
    ========================================================
    */

    const size = this.random(120, 240);

    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    /*
    ========================================================
    RANDOM ROTATION VARIABLE
    ========================================================
    */

    const rotation = this.random(-14, 14);

    img.style.setProperty('--rotation', `${rotation}deg`);

    /*
    ========================================================
    APPLY ANIMATION
    ========================================================
    */

    img.style.animation = `
      stickerBurst
      ${this.duration}ms
      cubic-bezier(0.22, 1, 0.36, 1)
      forwards
    `;

    /*
    ========================================================
    APPEND
    ========================================================
    */

    this.container.appendChild(img);

    /*
    ========================================================
    CLEANUP
    ========================================================
    */

    img.addEventListener('animationend', () => {
      img.remove();
    });
  }

  /*
  ==========================================================
  UTILS
  ==========================================================
  */

  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }
}