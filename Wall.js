class Wall {
    constructor(i1, j1, i2, j2) {
      this.i1 = i1;
      this.j1 = j1;
      this.i2 = i2;
      this.j2 = j2;
      this.removed = false;
      if (i1-i2 == 0) {
        let y1 = cells[i1][j1].j*inc+inc/2;
        let y2 = cells[i2][j2].j*inc+inc/2;
        this.x1 = cells[i1][j1].i*inc;
        this.y1 = (y1+y2)/2;
        this.x2 = cells[i1][j1].i*inc+inc;
        this.y2 = this.y1;
      } else {
        let x1 = cells[i1][j1].i*inc+inc/2;
        let x2 = cells[i2][j2].i*inc+inc/2;
        this.x1 = (x1+x2)/2;
        this.y1 = cells[i1][j1].j*inc;
        this.x2 = this.x1;
        this.y2 = cells[i1][j1].j*inc+inc;
      }
    }
    show() {
        offScreenCTX.fillStyle = "black";
        offScreenCTX.beginPath();
        offScreenCTX.moveTo(this.x1, this.y1);
        offScreenCTX.lineTo(this.x2, this.y2);
        offScreenCTX.stroke();
    }
}