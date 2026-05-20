export default class StickerMontage {

  constructor(options = {}) {

    this.container = document.querySelector(options.container);

    /*
    ========================================
    SIMPLE ARRAY OF IMAGES
    ========================================
    */

    this.images = [
      './stickers/sticker-01.jpg',
      './stickers/sticker-02.jpg',
      './stickers/sticker-03.jpg',
    ];

    this.duration = options.duration || 500;
    this.interval = options.interval || 180;

    this.current = 0;

    this.start();
  }

  start() {

    setInterval(() => {

      this.showSticker();

    }, this.interval);
  }

 showSticker() {

  const img = document.createElement('img');

  img.src = this.images[this.current];

  img.classList.add('sticker');

  /*
  ========================================
  CENTER POSITION
  ========================================
  */

  img.style.left = `50%`;
  img.style.top = `50%`;

  /*
  ========================================
  SIZE
  ========================================
  */

  const size = 260;

  img.style.width = `${size}px`;

  /*
  ========================================
  NO ROTATION
  ========================================
  */

  img.style.transform = `
    translate(-50%, -50%)
    scale(0)
  `;

  /*
  ========================================
  APPEND
  ========================================
  */

  this.container.appendChild(img);

  /*
  ========================================
  FORCE REPAINT
  ========================================
  */

  img.offsetWidth;

  /*
  ========================================
  ANIMATE IN
  ========================================
  */

  img.style.transition = `
    transform 0.14s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.14s ease
  `;

  img.style.opacity = 1;

  img.style.transform = `
    translate(-50%, -50%)
    scale(1.12)
  `;

  /*
  ========================================
  POP OUT
  ========================================
  */

  setTimeout(() => {

    img.style.opacity = 0;

    img.style.transform = `
      translate(-50%, -50%)
      scale(0)
    `;

  }, this.duration * 0.45);

  /*
  ========================================
  REMOVE
  ========================================
  */

  setTimeout(() => {

    img.remove();

  }, this.duration);

  /*
  ========================================
  NEXT IMAGE
  ========================================
  */

  this.current++;

  if (this.current >= this.images.length) {
    this.current = 0;
  }
}
}