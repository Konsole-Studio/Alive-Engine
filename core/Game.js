import fragmentShaderText from './shaders/fragment.js';
import vertexShaderText from './shaders/vertex.js';

export default class Game {
  constructor(config) {
    let {
      canvasId,
      width,
      height,
    } = config;

    let canvasElement = document.getElementById(canvasId);
    canvasElement.setAttribute('width', width);
    canvasElement.setAttribute('height', height);

    this.assets = [];
    this.actors = [];
    this.scenes = [];
    this.canvas = canvasElement;
    this.initWebgl.bind(this)();
  }

  initWebgl() {
    let gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!gl) {
      console.log('WebGl not supported');
      return;
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPHT_BUFFER_BIT);

    // Shaders
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
      return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Program
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('ERROR linking program!', gl.getProgramInfoLog(program));
      return;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error('ERROR linking program!', gl.getProgramInfoLog(program));
      return;
    }

    // Buffer
    // Tiangle vertices, each line is a point with x and y position
    // Using RGB here for test
    let triangleVertices = [
      0.0, 0.5, 1.0, 1.0, 0.0,
      -0.5, -0.5, 0.7, 0.0, 1.0,
      0.5, -0.5, 0.1, 1.0, 0.6,
    ];

    let triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
      positionAttribLocation, // attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // type of the elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 * 4)
      0 // offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
      colorAttribLocation, // attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // type of the elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 * 4)
      2 * Float32Array.BYTES_PER_ELEMENT// offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Main renderer, replace with the loop
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
};
