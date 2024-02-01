const WIDTH = window.visualViewport.width * 0.96;
const HEIGHT = 800;
const BOX_SIZE = 200;
const BOX_RADIUS = BOX_SIZE / 2;

const AXES = [
  new p5.Vector(1, 0, 0),
  new p5.Vector(0, 1, 0),
  new p5.Vector(0, 0, 1),
]

function setup() {
  let canvas = createCanvas(WIDTH, HEIGHT, WEBGL);
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

function drawCone(pos, dir) {
  push();
  translate(pos);
  const tangent = dir.copy().normalize();
  const up = tangent.x === 0 && tangent.z === 0 
    ? new p5.Vector(1, 0, 0) 
    : new p5.Vector(0, 1, 0);
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

function offset(base, axis, mag) {
  return p5.Vector.add(base, p5.Vector.mult(axis, mag));
}

function drawLines() {
  let charge = chargePos();
  let fluxValue = 0;
  let faceValue = 0;
  let faceNum = 1;
  let html_string = "<table class='table-fixed border w-full'><tr><th>Face&nbsp;&nbsp;</th><th>Row&nbsp;&nbsp;</th><th>Column&nbsp;&nbsp;</th><th>Ecos(Theta)&nbsp;&nbsp;</th><th>E&nbsp;&nbsp;</th><th>Theta&nbsp;&nbsp;</th><th>Flux&nbsp;&nbsp;</th></tr>";

  let FACES = document.getElementById("numArrows").value;
  let SUB_SIZE = BOX_SIZE / FACES;

  for (let sign of [-1, 1]) {
    for (let axis of AXES) {
      let center = p5.Vector.mult(axis, BOX_RADIUS * sign);
      let others = AXES.filter(a => a !== axis);
      let corner = center.copy();
      
      for (let other of others) {
        corner = offset(corner, other, -BOX_RADIUS);
      }

      // drawing sub-squares
      stroke(100, 100, 100);

      let top = corner.copy()
      let bottom = offset(corner, others[1], BOX_SIZE);
      let left = corner.copy();
      let right = offset(left, others[0], BOX_SIZE);

      for (let i = 0; i < FACES - 1; i++) {
        top = offset(top, others[0], SUB_SIZE);
        bottom = offset(bottom, others[0], SUB_SIZE);
        left = offset(left, others[1], SUB_SIZE);
        right = offset(right, others[1], SUB_SIZE);
        line(top.x, top.y, top.z, bottom.x, bottom.y, bottom.z);
        line(left.x, left.y, left.z, right.x, right.y, right.z);
      }

      // moving corner to first start
      for (let other of others) {
        corner = offset(corner, other, SUB_SIZE / 2);
      }

      // face nums
      push();
      fill(90, 255, 90);
      translate(p5.Vector.mult(axis, 100 * sign));
      text("" + faceNum, 0, 0, 0);
      rotateZ(PI / 2 * -sign * axis.x);
      rotateX(PI / 2 * sign * axis.z);
      if (sign * axis.y == -1)
        rotateZ(PI);
      pop();

      for (let h = 0; h < FACES; h++) {
        for (let k = 0; k < FACES; k++) {
          let start = corner.copy();
          start = offset(start, others[0], h * SUB_SIZE);
          start = offset(start, others[1], k * SUB_SIZE);
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
          drawCone(endNorm, p5.Vector.sub(endNorm, start));

          // outward line
          let endOut = p5.Vector.add(start, p5.Vector.setMag(toStart, magOut));
          stroke(0, 0, 255);
          line(start.x, start.y, start.z, endOut.x, endOut.y, endOut.z);

          // outward cone
          fill(0, 0, 255);
          drawCone(endOut, toStart);
          html_string += `
            <tr>
              <td>${faceNum}</td>
              <td>${h + 1}</td>
              <td>${k + 1}</td>
              <td>${magNorm.toFixed(2)}</td>
              <td>${magOut.toFixed(2)}</td>
              <td>${(theta * 180 / Math.PI).toFixed(2)}</td>
              <td>${(magNorm / Math.pow(FACES, 2)).toFixed(2)}</td>
            </tr>
          `;
        }
      }
      document.getElementById("face" + faceNum + "-value").innerHTML = html_string + "</table>";
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
