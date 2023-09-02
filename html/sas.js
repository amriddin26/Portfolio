/*********
 * made by Matthias Hurrle (@atzedent)
 */

/** @type {HTMLCanvasElement} */
const canvas = window.canvas
const gl = canvas.getContext('webgl2')
const dpr = window.devicePixelRatio

const vertexSource = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec2 position;

void main(void) {
    gl_Position = vec4(position, 0., 1.);
}
`
const fragmentSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

const vec3 tint = vec3(1,2,3);

#define T time
#define S smoothstep
#define cs(a) vec2(a.x*a.x-a.y*a.y, a.x*a.y*2.)
#define hue(a) (.24+.4*cos(6.3*(a)+vec3(0,58,27)))

mat2 rot(float a) {
  float s = sin(a),
  c = cos(a);

  return mat2(c, -s, s, c);
}

float circle(vec2 p, float s) {
  return length(p)-s;
}

vec3 black(vec2 uv) {
  return vec3(0);
}

vec3 cubes(vec2 uv, float t) {
  float tt = t;
  vec3 col = vec3(0),
  ro = vec3(0),
  rd = normalize(vec3(uv, 1));

  t = sin(tt*.25)*3.141592;
  mat2 m = rot(t),
  m2 = rot(-t*.25);

  ro.xy *= m2;
  ro.xz *= m;
  ro.yz *= m;
  rd.xy *= m2;
  rd.xz *= m;
  rd.yz *= m;

  vec3 p = ro;

  float dither = mix(.75, 1.,fract(sin(dot(uv, uv)-tt)*345678.));

  for (float i = .0; i < 30.; i++) {
    vec3 q = p*dither;
    q.z += tt*10.;
    q = mod(q, 8.)-4.;
    q = abs(q)-vec3(1);
    float d = max(max(q.x, q.y), q.z);

    if (d < 1e-2) d = 1e-1;

    p += rd*d;

    col += pow(5e-4/d, .75)*tint;
  }

  return col;
}

vec3 mandel(vec2 uv, float t) {
  t = (t == 1.) ? 1. : -pow(2., -10. * t) + 1.;
  t = (t == .0) ? .0 : pow(2., 10. * (t - 1.));
  vec2 z = vec2(0);
  float n = 40., d = .0;
  uv *= mix(1.,1e-7, t);
  uv = mix(uv, uv+vec2(-.126, -.085), t);


  for (float i = .0; i < n; i++) {
    z = cs(z)+uv*3.-vec2(.5, 0);

    if (dot(z, z) > 4.) {
      d = i/n;
      break;
    }
  }

  return vec3(0) + clamp(d*10.,.0, 1.)*tint*d;
}

vec3 julia(vec2 uv, float rx, float ry) {
  float t = sin(-T)*.025 + ((rx > ry)?1.5707:.0);
  uv *= rot(t);

  float d = 1., k = sin(T)*.0125;

  for (int i = 0; i < 40; i++) {
    uv = cs(uv)+vec2(.25*k,.7+k);
    d = min(d, length(uv)-.1);
  }

  return 1.-clamp(d*10.,.0, 1.)*tint*d;
}

vec3 flowers(vec2 uv, float t) {
  t = t*.25+sin(t*.5)*.2;

  uv *= rot(t);
  uv *= 1.+(8.*(sin(t)*.5+.5));
  vec3 c = hue(log(length(uv)*3.)-t*4.);
  uv = vec2(length(uv)-T, atan(uv.y, uv.x)/6.2832*36.); //*.993;
  uv = mod(uv, 2.)-1.;

  vec3 col = vec3(0);

  col += step(
    max(
      circle(uv, .65),
      -max(
        circle(uv, .55),
        -circle(uv, .125)
      )
    ),
    .1
  );
  col *= c;

  return col;
}

vec3 tunnel(vec2 uv, float t) {
  float tt = t;
  vec2 p = uv;

  t = t*.25-cos(t*.5)*1.5;
  p *= rot(t);

  vec3 col = vec3(0);

  p = normalize(p)*log(length(p)*.8);
  p = vec2(atan(p.y, p.x), length(p)*.5+T*.5);

  vec3 z = vec3(p*.5, 0);
  float
  c = sin(t*.2)*.5+.5,
  d = .0,
  k = .5,
  f = mix(.95, 1.,fract(sin(dot(z, z)+tt)*345678.));

  for (int i = 0; i < 3; i++) {
    z.z += d*(.85-c*.35)*f;

    vec3 a = z/k;
    d += mix(
      abs(.7*dot(sin(a*2.), cos((a*2.).yzx))*.5),
      abs(f*k*dot(sin(a), cos(a.yzx))),
      c
    );
    k *= .25;
  }

  d = 1.-clamp(d*1.2,.0, 1.)*1.2;

  col += d*S(2.,.0, dot(uv, uv)*1.2)*tint*.5;
  return max(col, .0);
}

vec3 mount(vec2 uv, float t) {
  uv *= max(5e-4, 8.-t*.2);
  vec3 col = vec3(0),
  ro = vec3(0, 1.8, -1000),
  rd = normalize(vec3(uv, 1));

  vec3 p = ro;

  for (float i = .0; i < 30.; i++) {
    p.z += i;
    p.y += sin(.5+p.x*2.)*.2;
    p.y += sin(.5+p.z*4.)*.1;
    float d = p.y*.25;

    if (d < 1e-2) d = 1e-1;

    p += rd*d;

    col += 5e-4/d;
  }

  col = pow(col*tint, vec3(.6));
  col *= tint;

  return col;
}

float tween(float a) {
  a = a*a*a;
  a = a*a*a;
  a = a*a*a;

  return a;
}

#define W tween

void main(void) {
  float rx = resolution.x,
  ry = resolution.y;
  vec2 uv = (
    gl_FragCoord.xy-.5*resolution
  ) / min(resolution.x, resolution.y);

  float anim = T*.125,
  prog = mod(anim, 18.),
  scene = floor(prog);

  vec3 col = vec3(0);

  if (scene == .0) col = mix(mandel(uv, prog), cubes(uv, 8.*(prog)), W(S(.0, 1.5, prog)));
  if (scene >= 1. && scene < 4.) {
    col = mix(cubes(uv, 8.*(prog)), black(uv), W(S(1.,4.,prog)));
  }
  if (scene == 4.) col = mix(black(uv), julia(uv, rx, ry), (S(4.,4.5, prog)));
  if (scene == 5.) col = mix(julia(uv, rx, ry), mount(uv, 8.*(prog-3.5)), W(S(5.,6.,prog)));
  if (scene >= 6. && scene < 9.) {
    col = mix(mount(uv, 8.*(prog-3.5)), tunnel(uv, prog+5.), W(S(6.,9.,prog)));
  }
  if (scene >= 9. && scene < 14.) {
    col = mix(tunnel(uv, prog+5.), black(uv), W(S(9.,13.8, prog)));
    col = mix(col, flowers(uv, prog), (S(13.8, 14.,prog)));
  }
  if (scene >= 14.) {
    col = mix(flowers(uv, prog), black(uv), W(S(14.,16.,prog)));
    col = mix(col, mandel(uv,.0), (S(16.,18.,prog)));
  }

	fragColor = vec4(col,1);
}
`
let time;
let buffer;
let program;
let resolution;
let vertices = []

function resize() {
    const {
        innerWidth: width,
        innerHeight: height
    } = window

    canvas.width = width * dpr
    canvas.height = height * dpr

    gl.viewport(0, 0, width * dpr, height * dpr)
}

function compile(shader, source) {
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
    }
}

function setup() {
    const vs = gl.createShader(gl.VERTEX_SHADER)
    const fs = gl.createShader(gl.FRAGMENT_SHADER)

    program = gl.createProgram()

    compile(vs, vertexSource)
    compile(fs, fragmentSource)

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program))
    }

    vertices = [-1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,
        1.0,
        1.0, -1.0,
        1.0,
        1.0
    ]

    buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, "position")

    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    time = gl.getUniformLocation(program, "time")
    resolution = gl.getUniformLocation(program, 'resolution')
}

function draw(now) {
    gl.clearColor(0, 0, 0, 1.)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.uniform1f(time, now * .001)
    gl.uniform2f(
        resolution,
        canvas.width,
        canvas.height
    )
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length * .5)
}

function loop(now) {
    draw(now)
    requestAnimationFrame(loop)
}

function init() {
    setup()
    resize()
    loop(0)
}

document.body.onload = init
window.onresize = resize