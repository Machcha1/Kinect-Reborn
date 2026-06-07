let video;
let bodyPose;
let poses = [];

let previousNose = null;
let movementScore = 0;
let totalMovement = 0;
let framesTracked = 0;

function preload() {
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(900, 600);

  video = createCapture(VIDEO);
  video.size(900, 600);
  video.hide();

  bodyPose.detectStart(video, gotPoses);
}

function gotPoses(results) {
  poses = results;
}

function draw() {
  background(5, 10, 25);

  tint(0, 220, 255, 130);
  image(video, 0, 0, width, height);
  noTint();

  drawGrid();

  if (poses.length > 0) {
    drawBody(poses[0]);
    trackMovement(poses[0]);
  }

  drawAnalytics();
}

function drawGrid() {
  stroke(0, 255, 255, 35);
  strokeWeight(1);

  for (let x = 0; x < width; x += 40) {
    line(x, 0, x, height);
  }

  for (let y = 0; y < height; y += 40) {
    line(0, y, width, y);
  }
}

function drawBody(pose) {
  let connections = bodyPose.getSkeleton();

  stroke(0, 255, 255);
  strokeWeight(4);

  for (let i = 0; i < connections.length; i++) {
    let a = connections[i][0];
    let b = connections[i][1];

    let pointA = pose.keypoints[a];
    let pointB = pose.keypoints[b];

    if (pointA.confidence > 0.2 && pointB.confidence > 0.2) {
      line(pointA.x, pointA.y, pointB.x, pointB.y);
    }
  }

  for (let i = 0; i < pose.keypoints.length; i++) {
    let keypoint = pose.keypoints[i];

    if (keypoint.confidence > 0.2) {
      noStroke();
      fill(0, 255, 255);
      circle(keypoint.x, keypoint.y, 12);
    }
  }
}

function trackMovement(pose) {
  let nose = pose.keypoints.find(k => k.name === "nose");

  if (nose && nose.confidence > 0.2) {
    if (previousNose !== null) {
      movementScore = dist(nose.x, nose.y, previousNose.x, previousNose.y);
      totalMovement += movementScore;
      framesTracked++;
    }

    previousNose = {
      x: nose.x,
      y: nose.y
    };
  }
}

function drawAnalytics() {
  let averageMovement = framesTracked > 0 ? totalMovement / framesTracked : 0;

  fill(0, 0, 0, 190);
  stroke(0, 255, 255);
  strokeWeight(2);
  rect(20, 20, 330, 170, 18);

  noStroke();
  fill(0, 255, 255);
  textSize(20);
  text("KINECT REBORN", 40, 55);

  fill(255);
  textSize(14);
  text("People detected: " + poses.length, 40, 90);
  text("Current movement: " + nf(movementScore, 1, 2), 40, 118);
  text("Average movement: " + nf(averageMovement, 1, 2), 40, 146);
  text("Frames tracked: " + framesTracked, 40, 174);
}