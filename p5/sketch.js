const WIDTH = 1200;
const HEIGHT = 800;

const Triangle = {
    Triangle(x, y, s1, s2, angle) {
        this.x = x;
        this.y = y;
        this.w = s1;
        this.h = s2;
        this.angle = angle;
        this.deleted = false;
        return this;
    },
    draw() {
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        triangle(-this.w/2, -this.h/2, this.w/2, -this.h/2, 0, this.h/2);
        pop();
    },
}

function newTriangle(x, y, w, h, angle) {
    let t = Object.create(Triangle);
    t.Triangle(x, y, w, h, angle);
    return t;
}

function areCongruent(t1, t2) {
    // Check if the triangles have the same shape and size
    let sides1 = [t1.w, t1.h, Math.sqrt(t1.w ** 2 + t1.h ** 2)];
    let sides2 = [t2.w, t2.h, Math.sqrt(t2.w ** 2 + t2.h ** 2)];
    sides1.sort();
    sides2.sort();
    let angles1 = [Math.atan2(t1.h, t1.w), Math.atan2(t1.h, -t1.w), Math.atan2(-t1.h, t1.w)];
    let angles2 = [Math.atan2(t2.h, t2.w), Math.atan2(t2.h, -t2.w), Math.atan2(-t2.h, t2.w)];
    angles1.sort();
    angles2.sort();
    for (let i = 0; i < 3; i++) {
        if (sides1[i] !== sides2[i] || angles1[i] !== angles2[i]) {
            return false;
        }
    }
    return true;
}

let triangles = [];
let selectedTriangle = null;
let score = 0;

function mousePressed() {
    for (let i = 0; i < triangles.length; i++) {
        let t = triangles[i];
        let cosA = Math.cos(t.angle);
        let sinA = Math.sin(t.angle);
        let dx = mouseX - t.x;
        let dy = mouseY - t.y;
        let rotatedX = cosA * dx + sinA * dy;
        let rotatedY = -sinA * dx + cosA * dy;
        if (rotatedX > -t.w/2 && rotatedX < t.w/2 && rotatedY > -t.h/2 && rotatedY < t.h/2) {
            if (selectedTriangle != null && selectedTriangle != t && areCongruent(t, selectedTriangle)) {
                t.deleted = true;
                selectedTriangle.deleted = true;
                score++;
                document.getElementById('score-counter').innerHTML = score;
            } else {
                selectedTriangle = t;
            }
            break;
        }
    }
}

function setup() {
    var canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('canv-parent');

    // noStroke();
    translate(0, HEIGHT);
    strokeWeight(1);
    // frameRate(10);
    for (let i = 0; i < 5; i++) {
        
        let w = Math.floor(Math.random() * 100) + 50;
        let h = Math.floor(Math.random() * 100) + 50;
        let x = Math.floor(Math.random() * (WIDTH - 300)) + 150;
        let y = Math.floor(Math.random() * (HEIGHT - 300)) + 150;
        let angle = Math.floor(Math.random() * 360);
        let t = newTriangle(x, y, w, h, angle);
        triangles.push(t);
        
        let x2 = Math.floor(Math.random() * (WIDTH - 300)) + 150;
        let y2 = Math.floor(Math.random() * (HEIGHT - 300)) + 150;
        // Create congruent triangle
        let t2 = newTriangle(x2, y2, w, h, Math.floor(Math.random() * 360));
        triangles.push(t2);
    }
}

function draw() {
    background(230, 230, 230);
    numDeleted = 0;
    for (let i = 0; i < triangles.length; i++) {
        if (triangles[i].deleted)  {
            numDeleted++;
            continue;
        }
        if (triangles[i] == selectedTriangle) {
            fill("blue");
        } else {
            fill("red");
        }
        triangles[i].draw();
    }
    
    if (numDeleted == triangles.length) {
        setup();
    }

    fill("black");
    ellipse(mouseX, mouseY, 10, 10);
}