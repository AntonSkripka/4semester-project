export class PromoSlider {
  constructor(sliderElement, options = {}) {
    this.slider = sliderElement;
    if (!this.slider) return;

    this.track = this.slider.querySelector('.rnm-promo__slider--track');
    this.slides = this.track ? Array.from(this.track.querySelectorAll('.rnm-slider__slide')) : [];

    if (!this.track || this.slides.length === 0) {
      console.warn('Slider track or slides not found');
      return;
    }

    this.autoplayDelay = options.autoplayDelay || 5000;
    this.dragThreshold = options.dragThreshold || 50;

    this.currentIndex = 0;
    this.direction = 1;
    this.autoplayTimer = null;

    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;
    this.resizeTimeout = null;

    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.animation = this.animation.bind(this);

    this.init();
  }

  get isMobile() {
    return window.innerWidth < 768;
  }

  get isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1200;
  }

  init() {
    this.slider.style.cursor = 'grab';
    this.track.style.transition = 'transform 0.3s ease-out';

    this.updatePosition();
    this.startAutoplay();
    this.bindEvents();
  }

  getSlideMetrics() {
    const slide = this.slides[0];
    const slideWidth = slide.clientWidth;
    const computedTrackStyle = getComputedStyle(this.track);
    const computedSlideStyle = getComputedStyle(slide);

    const gap = parseFloat(computedTrackStyle.gap) || 
                parseFloat(computedSlideStyle.marginRight) || 0;

    return { slideWidth, gap, total: slideWidth + gap };
  }

  getMaxIndex() {
    if (this.isMobile) {
      return this.slides.length - 1;
    }

    if (this.isTablet) {
      const visibleSlides = 3;
      return Math.max(this.slides.length - visibleSlides, 0);
    }

    const { total } = this.getSlideMetrics();
    const visibleSlidesDesktop = Math.max(Math.floor(this.slider.clientWidth / total), 1);
    return Math.max(this.slides.length - visibleSlidesDesktop, 0);
  }

  getCalculatedOffset(index) {
    if (this.isMobile) {
      const { slideWidth, gap } = this.getSlideMetrics();
      const sliderWidth = this.slider.clientWidth;

      const leftEdgeOfCurrent = (slideWidth + gap) * index;
      const centerOffset = (sliderWidth - slideWidth) / 2;

      return -leftEdgeOfCurrent + centerOffset;
    } else if (this.isTablet) {
      const visibleSlides = 3;
      const slideWidth = this.slider.clientWidth / visibleSlides;
      return -index * slideWidth;
    } else {
      const { total } = this.getSlideMetrics();
      return -(total * index);
    }
  }

  updatePosition() {
    this.currentTranslate = this.getCalculatedOffset(this.currentIndex);
    this.prevTranslate = this.currentTranslate;
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  step() {
    const maxIndex = this.getMaxIndex();
    if (maxIndex <= 0) return;

    if (this.direction === 1) {
      if (this.currentIndex >= maxIndex) {
        this.direction = -1;
        this.currentIndex = Math.max(this.currentIndex - 1, 0);
      } else {
        this.currentIndex++;
      }
    } else {
      if (this.currentIndex <= 0) {
        this.direction = 1;
        this.currentIndex = Math.min(this.currentIndex + 1, maxIndex);
      } else {
        this.currentIndex--;
      }
    }

    this.updatePosition();
  }

  getPositionX(event) {
    return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  }

  animation() {
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    if (this.isDragging) requestAnimationFrame(this.animation);
  }

  dragStart(event) {
    if (event.type === 'mousedown') {
      if (event.button !== 0) return;
      event.preventDefault();
    }

    this.isDragging = true;
    this.startX = this.getPositionX(event);
    this.stopAutoplay();

    this.track.style.transition = 'none';
    this.slider.style.cursor = 'grabbing';

    this.animationID = requestAnimationFrame(this.animation);
  }

  dragMove(event) {
    if (!this.isDragging) return;

    if (event.type.includes('mouse') && event.buttons !== 1) {
      this.dragEnd();
      return;
    }

    const currentPosition = this.getPositionX(event);
    const movedPath = currentPosition - this.startX;
    this.currentTranslate = this.prevTranslate + movedPath;
  }

  dragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);

    this.track.style.transition = 'transform 0.3s ease-out';
    this.slider.style.cursor = 'grab';

    const movedBy = this.currentTranslate - this.prevTranslate;
    const maxIndex = this.getMaxIndex();

    if (movedBy < -this.dragThreshold && this.currentIndex < maxIndex) {
      this.currentIndex++;
    } else if (movedBy > this.dragThreshold && this.currentIndex > 0) {
      this.currentIndex--;
    }

    this.updatePosition();
    this.startAutoplay();
  }

  handleKeyDown(event) {
    const maxIndex = this.getMaxIndex();

    if (event.key === 'ArrowRight') {
      if (this.currentIndex < maxIndex) {
        this.currentIndex++;
        this.updatePosition();
        this.startAutoplay();
      }
    } else if (event.key === 'ArrowLeft') {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updatePosition();
        this.startAutoplay();
      }
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const maxIndex = this.getMaxIndex();
      if (this.currentIndex > maxIndex) this.currentIndex = maxIndex;
      this.updatePosition();
    }, 100);
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => this.step(), this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
  }

  bindEvents() {
    this.slider.addEventListener('dragstart', (e) => e.preventDefault());

    this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
    this.slider.addEventListener('mouseleave', () => {
      if (!this.isDragging) this.startAutoplay();
    });

    this.slider.addEventListener('mousedown', this.dragStart);
    window.addEventListener('mousemove', this.dragMove);
    window.addEventListener('mouseup', this.dragEnd);

    this.slider.addEventListener('touchstart', this.dragStart, { passive: true });
    window.addEventListener('touchmove', this.dragMove, { passive: true });
    window.addEventListener('touchend', this.dragEnd);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);
  }
  destroy() {
    this.stopAutoplay();
    window.removeEventListener('mousemove', this.dragMove);
    window.removeEventListener('mouseup', this.dragEnd);
    window.removeEventListener('touchmove', this.dragMove);
    window.removeEventListener('touchend', this.dragEnd);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
  }
}