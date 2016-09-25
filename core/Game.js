import fragmentShaderText from './shaders/shader.fs';
import vertexShaderText from './shaders/shader.vs';
import { boxVertices, boxIndices } from './vertices/box.js';
import { glMatrix, mat4 } from 'gl-matrix';
import Stats from 'stats-js';

/* FPS stats config */
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

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
    let { canvas } = this;
    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.log('WebGl not supported');
      return;
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPHT_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

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

    let boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    let boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

    gl.vertexAttribPointer(
      positionAttribLocation, // attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // type of the elements
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 * 4)
      0 // offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
      texCoordAttribLocation, // attribute location
      2,
      gl.FLOAT,
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    let textureImage = new Image();
    textureImage.src = './crate.png';

    let boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(program);

    let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    let worldMatrix = new Float32Array(16);
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    // Main renderer, replace with the loop
    let xRotationMatrix = new Float32Array(16);
    let yRotationMatrix = new Float32Array(16);

    let identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    let angle;
    let loop = () => {
      stats.begin();

      angle = performance.now() / 1000 / 6 * 2 * Math.PI;
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
      mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

      gl.clearColor(0.75, 0.85, 0.81, 1.0);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

      gl.bindTexture(gl.TEXTURE_2D, boxTexture);
      gl.activeTexture(gl.TEXTURE0);

      gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(loop);

      stats.end();
    };

    requestAnimationFrame(loop);
  }
};
