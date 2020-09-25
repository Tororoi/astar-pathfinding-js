class Tile {
    constructor(i, j) {
      this.i = i;
      this.j = j;
      this.index = this.j+this.i*rows;
      this.inMaze = false;
    }
    show() {if (this.inMaze) offScreenCTX.fillRect(this.i, this.j, 1, 1);}
  }