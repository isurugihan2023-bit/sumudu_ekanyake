class ShinyText {
    constructor(element, options = {}) {
        this.element = element;
        this.disabled = options.disabled || false;
        this.speed = options.speed || 2;
        this.color = options.color || '#b5b5b5';
        this.shineColor = options.shineColor || '#ffffff';
        this.spread = options.spread || 120;
        this.yoyo = options.yoyo || false;
        this.pauseOnHover = options.pauseOnHover || false;
        this.direction = options.direction || 'left';
        this.delay = options.delay || 0;

        this.isPaused = false;
        this.progress = 0;
        this.elapsed = 0;
        this.lastTime = null;
        this.directionSign = this.direction === 'left' ? 1 : -1;
        this.animationId = null;

        this.init();
    }

    init() {
        this.element.style.backgroundImage = `linear-gradient(${this.spread}deg, ${this.color} 0%, ${this.color} 35%, ${this.shineColor} 50%, ${this.color} 65%, ${this.color} 100%)`;
        this.element.style.backgroundSize = '200% auto';
        this.element.style.webkitBackgroundClip = 'text';
        this.element.style.backgroundClip = 'text';
        this.element.style.webkitTextFillColor = 'transparent';
        this.element.style.display = 'inline-block';

        if (this.pauseOnHover) {
            this.element.addEventListener('mouseenter', () => this.isPaused = true);
            this.element.addEventListener('mouseleave', () => this.isPaused = false);
        }

        if (!this.disabled) {
            this.animationId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    animate(time) {
        if (this.disabled || this.isPaused) {
            this.lastTime = null;
        } else {
            if (this.lastTime === null) {
                this.lastTime = time;
            }

            const deltaTime = time - this.lastTime;
            this.lastTime = time;
            this.elapsed += deltaTime;

            const animationDuration = this.speed * 1000;
            const delayDuration = this.delay * 1000;

            if (this.yoyo) {
                const cycleDuration = animationDuration + delayDuration;
                const fullCycle = cycleDuration * 2;
                const cycleTime = this.elapsed % fullCycle;

                if (cycleTime < animationDuration) {
                    const p = (cycleTime / animationDuration) * 100;
                    this.progress = this.directionSign === 1 ? p : 100 - p;
                } else if (cycleTime < cycleDuration) {
                    this.progress = this.directionSign === 1 ? 100 : 0;
                } else if (cycleTime < cycleDuration + animationDuration) {
                    const reverseTime = cycleTime - cycleDuration;
                    const p = 100 - (reverseTime / animationDuration) * 100;
                    this.progress = this.directionSign === 1 ? p : 100 - p;
                } else {
                    this.progress = this.directionSign === 1 ? 0 : 100;
                }
            } else {
                const cycleDuration = animationDuration + delayDuration;
                const cycleTime = this.elapsed % cycleDuration;

                if (cycleTime < animationDuration) {
                    const p = (cycleTime / animationDuration) * 100;
                    this.progress = this.directionSign === 1 ? p : 100 - p;
                } else {
                    this.progress = this.directionSign === 1 ? 100 : 0;
                }
            }

            const bgPos = 150 - this.progress * 2;
            this.element.style.backgroundPosition = `${bgPos}% center`;
        }

        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.shiny-text').forEach(el => {
        new ShinyText(el, {
            speed: 2,
            color: '#b5b5b5',
            shineColor: '#ffffff',
            spread: 120,
            yoyo: false,
            pauseOnHover: false,
            direction: 'left',
            delay: 0
        });
    });
});
