let video;
let poseNet;
let poses = [];
let videoSize = [640, 480];
var data;
var images = [];
var imagePoses;
let useResNet = false;
// let useResNet = true;
let cosineSimilarity = false;
// let cosineSimilarity = true;
let debug = false;
// let debug = true;

function preload() {
  loadJSON("image_info.json", preloadImages);
}

function preloadImages(jsonData) {
  data = jsonData;

  for (var i = 0; i < jsonData.length; i++) {
    images[i] = loadImage("data/" + data[i].id);
  }

  imagePoses = loadJSON('image_poses.json');
}

function setup() {
  createCanvas(windowWidth, 800);
  video = createCapture(VIDEO);
  video.size(videoSize[0], videoSize[1]); // strong resize

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
  frameRate(10);
}

function modelReady() {
  select('#status').hide();
}

async function draw() {
  clear();
  image(video, 0, 0, videoSize[0], videoSize[1]);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
  if (poses.length > 0) {
    var bestID = 0;
    var bestScore = 1;
    var scores = [];
    for (var i = 0; i < images.length; i++) {
      if (cosineSimilarity) {
        scores.push(pns.poseSimilarity(
        poses[0].pose, imagePoses[i][0].pose, {strategy: 'cosineSimilarity'}));
      }
      else {
        scores.push(pns.poseSimilarity(poses[0].pose, imagePoses[i][0].pose));
      }
    }
    var xOffset = -50;
    var yOffset = 0;
    var mainRatio = 0.8;
    var subRatio = 0.25;
    // get min from array
    if (cosineSimilarity) {
      bestScore = scores.reduce(function(a, b) {return Math.max(a, b);});    
    }
    else {
      bestScore = scores.reduce(function(a, b) {return Math.min(a, b);});    
    }
    bestID = scores.indexOf(bestScore);
    image(images[bestID], videoSize[0]+xOffset, 0, 
      images[bestID].width*mainRatio, images[bestID].height*mainRatio);
    fill(255, 0, 0);
    textSize(30);
    textAlign(CENTER);
    text('Most significant', videoSize[0]+xOffset+images[bestID].width*mainRatio*0.5, 30);
    if (debug) {
      textSize(50);
      textAlign(LEFT);
      text(bestID, videoSize[0]+xOffset, 100+yOffset);
      text(poses.length, videoSize[0]+xOffset, 200+yOffset);
      text(bestScore, videoSize[0]+xOffset, 300+yOffset);
      textSize(30);
      for (var i = 0; i < scores.length; i++) {
        text(scores[i], videoSize[0]+50+xOffset, 400+30*i+yOffset);
      }
    }
    var sortedScores;
    if (cosineSimilarity) {
      sortedScores = scores.concat().sort().reverse();
    }
    else {
      sortedScores = scores.concat().sort();
    }
    for (var i = 0; i < 5; i++) {
      tempScore = sortedScores[i];
      originalID = scores.indexOf(tempScore);
      image(images[originalID], windowWidth/5*i, videoSize[1]+yOffset,
        images[originalID].width*subRatio, images[originalID].height*subRatio);
      textSize(30);
      textAlign(CENTER);
      text(i+1, 
        windowWidth/5*i+images[originalID].width*subRatio*0.5, 
        videoSize[1]+yOffset+images[originalID].height*subRatio
      )
    }
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}