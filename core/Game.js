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
  }
};
