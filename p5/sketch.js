const WIDTH = window.visualViewport.width * 0.96;
const HEIGHT = 800;
let BOX_SIZE = 200;

const AXES = [
  new p5.Vector(1, 0, 0),
  new p5.Vector(0, 1, 0),
  new p5.Vector(0, 0, 1),
]

function setup() {
  var canvas = createCanvas(WIDTH, HEIGHT, WEBGL);
  canvas.parent("canv-parent");
  strokeWeight(2); // border thickness
  frameRate(60);
  font = loadFont("./Roboto-Regular.ttf");
  textFont(font);
  textSize(36);
}

function chargePos() {
  return new p5.Vector(...[slider1, slider2, slider3].map(s => parseInt(s.value)));
}

function drawCharge() {
  push();
  translate(chargePos());
  rotateX(frameCount / 10);
  rotateY(frameCount / 10);
  stroke(0);
  fill(0, 200 + 50 * sin(frameCount / 30), 200 + 50 * sin(frameCount / 60));
  box(20);
  pop();
}

function drawBox() {
  push();
  noFill();
  strokeWeight(3);
  box(BOX_SIZE);
  pop();
}

function drawLines() {
  let charge = chargePos();
  let fluxValue = 0;
  let faceValue = 0;
  let faceNum = 1;

  let ARROWS = document.getElementById("numArrows").value;
  let BOX_RADIUS = BOX_SIZE / 2;
  let SUB_SIZE = BOX_SIZE / ARROWS;

  for (let sign of [-1, 1]) {
    for (let axis of AXES) {
      let center = p5.Vector.mult(axis, BOX_RADIUS * sign);
      let others = AXES.filter(a => a !== axis);
      let corner = center.copy();
      for (let other of others) {
        corner.add(p5.Vector.mult(other, -(BOX_RADIUS - SUB_SIZE / 2)));
      }

      push();
      fill(90, 255, 90);
      translate(p5.Vector.mult(axis, 100 * sign));
      text("" + faceNum, 0, 0, 0);
      rotateZ(PI / 2 * -sign * axis.x);
      rotateX(PI / 2 * sign * axis.z);
      if (sign * axis.y == -1)
        rotateZ(PI);
      pop();

      for (let h = 0; h < ARROWS; h++) {
        for (let k = 0; k < ARROWS; k++) {
          let start = corner.copy();
          start.add(p5.Vector.mult(others[0], h * SUB_SIZE));
          start.add(p5.Vector.mult(others[1], k * SUB_SIZE));
          let toStart = p5.Vector.sub(start, charge);

          let theta = center.angleBetween(toStart);
          let r = charge.dist(start);
          let Q = 20e-9;
          let A = SUB_SIZE ** 2;
          let e0 = 8.85e-12;

          let magOut = (Q * A) / (4 * PI * e0 * r ** 2);
          let magNorm = magOut * cos(theta);
          fluxValue += magNorm;
          faceValue += magNorm;

          // normal line
          let endNorm = p5.Vector.add(start, p5.Vector.setMag(center, magNorm));
          stroke(255, 0, 0);
          line(start.x, start.y, start.z, endNorm.x, endNorm.y, endNorm.z);

          // normal cone
          fill(255, 0, 0);
          push();
          translate(endNorm);
          let tangentNorm = p5.Vector.sub(endNorm, start).normalize();
          let upNorm = tangentNorm.x === 0 && tangentNorm.z === 0 ? new p5.Vector(1, 0, 0) : new p5.Vector(0, 1, 0);
          let rightNorm = upNorm.cross(tangentNorm).normalize();
          let depthNorm = rightNorm.cross(tangentNorm);
          applyMatrix(
            rightNorm.x, rightNorm.y, rightNorm.z, 0,
            tangentNorm.x, tangentNorm.y, tangentNorm.z, 0,
            depthNorm.x, depthNorm.y, depthNorm.z, 0,
            0, 0, 0, 1
          );
          cone(3, 9);
          pop();

          // outward line
          let endOut = p5.Vector.add(start, p5.Vector.setMag(toStart, magOut));
          stroke(0, 0, 255);
          line(start.x, start.y, start.z, endOut.x, endOut.y, endOut.z);

          // outward cone
          fill(0, 0, 255);
          push();
          translate(endOut);
          const tangent = toStart.copy().normalize();
          const up = createVector(0, 1, 0);
          const right = up.cross(tangent).normalize();
          const forward = right.cross(tangent);
          applyMatrix(
            right.x, right.y, right.z, 0,
            tangent.x, tangent.y, tangent.z, 0,
            forward.x, forward.y, forward.z, 0,
            0, 0, 0, 1
          );
          cone(3, 9);
          pop();
        }
      }
      console.log(faceNum);
      console.log("face" + faceNum + "-val");
      document.getElementById("face" + faceNum + "-value").innerHTML = faceValue.toFixed(2);
      faceNum++;
      faceValue = 0;
    }
  }
  return fluxValue;
}

function draw() {
  background(255, 255, 255);
  orbitControl(3, 3);
  stroke(50);
  drawBox();
  drawLines();
  drawCharge();
  fill(255, 0, 0);
  noStroke();
}