class LightRaysEffect {
    constructor(container, options = {}) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'position: absolute; top:0; left:0; width: 100%; height: 100%; pointer-events: none; z-index: 0;';
        this.container.appendChild(this.canvas);

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.warn('WebGL not supported');
            return;
        }

        this.options = {
            raysColor: options.raysColor || [1, 1, 1],
            raysSpeed: options.raysSpeed || 1,
            lightSpread: options.lightSpread || 1,
            rayLength: options.rayLength || 2,
            pulsating: options.pulsating || 0,
            fadeDistance: options.fadeDistance || 1.0,
            saturation: options.saturation || 1.0,
            mouseInfluence: options.mouseInfluence || 0.1,
            noiseAmount: options.noiseAmount || 0.0,
            distortion: options.distortion || 0.0,
            rayPos: options.rayPos || [0.5, -0.2], // top-center origin
            rayDir: options.rayDir || [0, 1], // pointing down
        };

        this.mousePos = { x: 0.5, y: 0.5 };
        this.smoothMouse = { x: 0.5, y: 0.5 };
        this.startTime = performance.now();

        this.initWebGL();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left) / rect.width;
            this.mousePos.y = (e.clientY - rect.top) / rect.height;
        });

        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    initWebGL() {
        const gl = this.gl;

        const vsSource = `
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = position * 0.5 + 0.5;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision highp float;

            uniform float iTime;
            uniform vec2  iResolution;

            uniform vec2  rayPos;
            uniform vec2  rayDir;
            uniform vec3  raysColor;
            uniform float raysSpeed;
            uniform float lightSpread;
            uniform float rayLength;
            uniform float pulsating;
            uniform float fadeDistance;
            uniform float saturation;
            uniform vec2  mousePos;
            uniform float mouseInfluence;
            uniform float noiseAmount;
            uniform float distortion;

            varying vec2 vUv;

            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
                vec2 sourceToCoord = coord - raySource;
                vec2 dirNorm = normalize(sourceToCoord);
                float cosAngle = dot(dirNorm, rayRefDirection);

                float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
                
                float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

                float distance = length(sourceToCoord);
                float maxDistance = iResolution.x * rayLength;
                float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
                
                float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
                float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

                float baseStrength = clamp(
                    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
                    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
                    0.0, 1.0
                );

                return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
            }

            void main() {
                vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
                
                // Adjust inputs to pixel space for raysOrigin calculations
                vec2 pos = rayPos * iResolution.xy; 
                vec2 dir = rayDir;
                
                vec2 finalRayDir = dir;
                if (mouseInfluence > 0.0) {
                    vec2 mouseScreenPos = mousePos * iResolution.xy;
                    vec2 mouseDirection = normalize(mouseScreenPos - pos);
                    finalRayDir = normalize(mix(dir, mouseDirection, mouseInfluence));
                }

                vec4 rays1 = vec4(1.0) * rayStrength(pos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
                vec4 rays2 = vec4(1.0) * rayStrength(pos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

                vec4 fragColor = rays1 * 0.5 + rays2 * 0.4;

                if (noiseAmount > 0.0) {
                    float n = noise(coord * 0.01 + iTime * 0.1);
                    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
                }

                float brightness = 1.0 - (coord.y / iResolution.y);
                fragColor.x *= 0.1 + brightness * 0.8;
                fragColor.y *= 0.3 + brightness * 0.6;
                fragColor.z *= 0.5 + brightness * 0.5;

                if (saturation != 1.0) {
                    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
                    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
                }

                fragColor.rgb *= raysColor;
                gl_FragColor = fragColor;
            }
        `;

        const compileShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader validation failed:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        this.program = gl.createProgram();
        gl.attachShader(this.program, compileShader(gl.VERTEX_SHADER, vsSource));
        gl.attachShader(this.program, compileShader(gl.FRAGMENT_SHADER, fsSource));
        gl.linkProgram(this.program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Fullscreen quad
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,   1.0, -1.0,   -1.0,  1.0,
            -1.0,  1.0,   1.0, -1.0,    1.0,  1.0
        ]), gl.STATIC_DRAW);

        this.positionLocation = gl.getAttribLocation(this.program, "position");

        this.uniforms = {
            iTime: gl.getUniformLocation(this.program, "iTime"),
            iResolution: gl.getUniformLocation(this.program, "iResolution"),
            rayPos: gl.getUniformLocation(this.program, "rayPos"),
            rayDir: gl.getUniformLocation(this.program, "rayDir"),
            raysColor: gl.getUniformLocation(this.program, "raysColor"),
            raysSpeed: gl.getUniformLocation(this.program, "raysSpeed"),
            lightSpread: gl.getUniformLocation(this.program, "lightSpread"),
            rayLength: gl.getUniformLocation(this.program, "rayLength"),
            pulsating: gl.getUniformLocation(this.program, "pulsating"),
            fadeDistance: gl.getUniformLocation(this.program, "fadeDistance"),
            saturation: gl.getUniformLocation(this.program, "saturation"),
            mousePos: gl.getUniformLocation(this.program, "mousePos"),
            mouseInfluence: gl.getUniformLocation(this.program, "mouseInfluence"),
            noiseAmount: gl.getUniformLocation(this.program, "noiseAmount"),
            distortion: gl.getUniformLocation(this.program, "distortion")
        };
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        const gl = this.gl;
        const time = (performance.now() - this.startTime) * 0.001;

        // Smooth mouse
        const smoothing = 0.92;
        this.smoothMouse.x = this.smoothMouse.x * smoothing + this.mousePos.x * (1 - smoothing);
        this.smoothMouse.y = this.smoothMouse.y * smoothing + this.mousePos.y * (1 - smoothing);

        gl.useProgram(this.program);

        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Enable alpha blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending
        
        gl.uniform1f(this.uniforms.iTime, time);
        gl.uniform2f(this.uniforms.iResolution, this.canvas.width, this.canvas.height);
        
        gl.uniform2f(this.uniforms.rayPos, this.options.rayPos[0], this.options.rayPos[1]);
        gl.uniform2f(this.uniforms.rayDir, this.options.rayDir[0], this.options.rayDir[1]);
        gl.uniform3f(this.uniforms.raysColor, this.options.raysColor[0], this.options.raysColor[1], this.options.raysColor[2]);
        
        gl.uniform1f(this.uniforms.raysSpeed, this.options.raysSpeed);
        gl.uniform1f(this.uniforms.lightSpread, this.options.lightSpread);
        gl.uniform1f(this.uniforms.rayLength, this.options.rayLength);
        gl.uniform1f(this.uniforms.pulsating, this.options.pulsating);
        gl.uniform1f(this.uniforms.fadeDistance, this.options.fadeDistance);
        gl.uniform1f(this.uniforms.saturation, this.options.saturation);
        
        gl.uniform2f(this.uniforms.mousePos, this.smoothMouse.x, this.smoothMouse.y);
        gl.uniform1f(this.uniforms.mouseInfluence, this.options.mouseInfluence);
        gl.uniform1f(this.uniforms.noiseAmount, this.options.noiseAmount);
        gl.uniform1f(this.uniforms.distortion, this.options.distortion);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(this.render);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        new LightRaysEffect(heroSection, {
            raysColor: [1, 1, 1], // White rays matching the elegant theme
            raysSpeed: 0.8,
            lightSpread: 1.5,
            rayLength: 2.5,
            mouseInfluence: 0.15,
            rayPos: [0.5, -0.2], // top-center origin mapping to WebGL UV space
            rayDir: [0, 1] // pointing downwards
        });
    }
});
