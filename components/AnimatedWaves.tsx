import React, { useRef, useEffect } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse_pos;
uniform float u_state_mix; // 0.0 for splash, 1.0 for chat

// 2D Simplex Noise
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }

vec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= taylorInvSqrt(a0*a0 + h*h);
    vec3 g = vec3(a0.x * x0.x + h.x * x0.y, a0.yz * x12.xz + h.yz * x12.yw);
    return 130.0 * dot(m, g);
}


void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // ---- Speed Control ----
    float u_speed = mix(1.0, 0.05, u_state_mix); // Slower in chat
    float time = u_time * u_speed * 0.5; // Overall speed scaling

    // ---- Color Palettes ----
    vec3 splash_base = vec3(240.0, 244.0, 255.0) / 255.0;   // #F0F4FF (Light Base)
    vec3 splash_primary = vec3(174.0, 203.0, 255.0) / 255.0; // #AECBFF (Soft Blue)
    vec3 splash_accent = vec3(220.0, 223.0, 255.0) / 255.0;  // #DCDFFF (Soft Lavender)

    vec3 chat_base = vec3(234.0, 241.0, 255.0) / 255.0; // #EAF1FF
    vec3 chat_wave = vec3(194.0, 217.0, 255.0) / 255.0; // #C2D9FF

    // ---- Mouse Interaction ----
    vec2 mouse = u_mouse_pos / u_resolution;
    mouse.y = 1.0 - mouse.y; // Invert Y
    float mouse_dist = distance(st, mouse);
    float ripple = 1.0 - smoothstep(0.0, 0.1, mouse_dist);
    ripple *= mix(0.1, 0.0, u_state_mix); // Reduce ripple effect on splash

    // ---- Noise Calculation & "Blur" ----
    vec2 noise_coord = (st - 0.5) * vec2(u_resolution.x/u_resolution.y, 1.0) * 2.0;
    
    // The "blur" is achieved by scaling the noise coordinates. A smaller scale makes features bigger and softer.
    float noise_scale = mix(0.7, 0.25, u_state_mix); // Larger features (more blur) in chat
    float n = snoise(noise_coord * noise_scale + time);
    
    // The "blur" amount also reduces the complexity of the noise pattern.
    float complexity = mix(0.15, 0.03, u_state_mix); // Less complexity in chat
    n += snoise(noise_coord * noise_scale * 2.1 + time) * complexity;
    n += snoise(noise_coord * noise_scale * 5.3 + time) * (complexity * 0.5);

    float n_mapped = (n + 1.0) * 0.5; // Map from [-1, 1] to [0, 1]
    n_mapped += ripple;
    
    // ---- Color Mixing ----
    vec3 splash_color = mix(splash_base, splash_primary, smoothstep(0.35, 0.65, n_mapped));
    splash_color = mix(splash_color, splash_accent, smoothstep(0.6, 0.85, n_mapped));
    
    vec3 chat_color = mix(chat_base, chat_wave, smoothstep(0.45, 0.7, n_mapped));
    
    vec3 final_color = mix(splash_color, chat_color, u_state_mix);
    
    // ---- Saturation ----
    float u_saturation = mix(1.0, 0.2, u_state_mix); // More desaturated in chat
    vec3 gray = vec3(dot(final_color, vec3(0.299, 0.587, 0.114)));
    final_color = mix(gray, final_color, u_saturation);

    gl_FragColor = vec4(final_color, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error('Shader compile error:', gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.error('Program link error:', gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

interface AnimatedWavesProps {
  state: 'splash' | 'chat';
}

export const AnimatedWaves: React.FC<AnimatedWavesProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const stateMixRef = useRef(state === 'chat' ? 1 : 0);
  const animationFrameIdRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const targetVal = state === 'chat' ? 1 : 0;
    const startVal = stateMixRef.current;
    let startTime: number | null = null;
    const duration = 1200; // Corresponds to the "Focus Pull" duration

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      // Ease-in-out for a smoother transition
      const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      stateMixRef.current = startVal + (targetVal - startVal) * easedProgress;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, powerPreference: 'high-performance' });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
    const timeUniform = gl.getUniformLocation(program, "u_time");
    const mouseUniform = gl.getUniformLocation(program, "u_mouse_pos");
    const stateMixUniform = gl.getUniformLocation(program, "u_state_mix");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
        const dpr = window.devicePixelRatio || 1;
        const { width, height } = canvas.getBoundingClientRect();
        const displayWidth  = Math.round(width * dpr);
        const displayHeight = Math.round(height * dpr);
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            return true;
        }
        return false;
    }

    let startTime = performance.now();
    function render(time: number) {
      if (!gl) return;
      resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      const dpr = window.devicePixelRatio || 1;
      gl.uniform2f(resolutionUniform, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeUniform, (time - startTime) * 0.001);
      gl.uniform2f(mouseUniform, mousePosRef.current.x * dpr, mousePosRef.current.y * dpr);
      gl.uniform1f(stateMixUniform, stateMixRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameIdRef.current = requestAnimationFrame(render);
    }
    
    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />;
};