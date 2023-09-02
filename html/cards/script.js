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

#define S smoothstep
#define T .112358+time

#define TAU 6.2831853

vec3 palette(float k) {
  vec3
  a = vec3(.5),
  b = a,
  c = a+a,
  d = vec3(.3,.2,.2);

  return a+b*cos(TAU*(c*k+d));
}

void main(void) {
  float
  mx = max(resolution.x, resolution.y),
  mn = min(resolution.x, resolution.y),
  pr = mx/mn;
  vec2 uv = (
    gl_FragCoord.xy-.5*resolution
  )/mn,
  p = uv*4.5/pr;

  vec3 col = vec3(0);
  const float n = 3.5;

  for (float i = .0; i < 6.; i++) {
    p *= 2.;
    p = p-n*clamp(round(p/n), -1.,1.);
    float d = exp(-length(p*.2));

    d = log(1e-5*d);
    d = pow(sin(d*20.+T*1.4), 2.)*.125;
    d = abs(d);
    d = pow(5e-3/d, .25);

    col += d * palette(-length(uv)+i*.1-T*.7);
    col = pow(col, vec3(1.28));
  }

  col *= exp(-125e-5*(length(uv)));
  col = pow(S(.0, 20.,col), vec3(.4545));

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