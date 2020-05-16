// let img;
let poseNet;
let poses = [];
// let useResNet = false;
let useResNet = true;
var data;
var images = [];
var dataNum;
let maxHeight = 700;

function preload() {
  loadJSON("image_info.json", preloadImages);
}

function preloadImages(jsonData) {
  data = jsonData;

  dataNum = jsonData.length;
  console.log('dataNum:', dataNum);

  for (var i = 0; i < dataNum; i++) {
    images[i] = loadImage("data/" + data[i].id);
  }
}

function setup() {
    createCanvas(windowWidth, maxHeight*dataNum);
    imageReady();
    // for (var i = 16; i < images.length; i++) {
    //     console.log(poses[i].score);
    // }
    frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
}

// when the image is ready, then load up poseNet
function imageReady(){
    // set some options
    let options = {
        imageScaleFactor: 1,
        minConfidence: 0.1,
        // detectionType: 'multiple',
    }
    if (useResNet) options['architecture'] = 'ResNet50';
    
    // assign poseNet
    poseNet = ml5.poseNet(modelReady, options);
    // This sets up an event that listens to 'pose' events
    // poseNet.on('pose', function (results) {
    //     poses = results;
    // });
}

// when poseNet is ready, do the detection
async function modelReady() {
    select('#status').html('Model Loaded');
     
    // When the model is ready, run the singlePose() function...
    // If/When a pose is detected, poseNet.on('pose', ...) will be listening for the detection results 
    // in the draw() loop, if there are any poses, then carry out the draw commands
    // poseNet.singlePose(img)
    // poses[0] = poseNet.singlePose(images[0]);
    // poseNet.singlePose(images[0]);
    for (var i = 0; i < images.length; i++) {
        // if (i == 3) break;
        poses[i] = await poseNet.singlePose(images[i]);
        // poseNet.singlePose(images[i]);
    }
}

// draw() will not show anything until poses are found
function draw() {
    // if (poses.length >= 1) {
    //     console.log('poses:', poses);
    //     console.log('poses[0][0]:', poses[0][0]);
    //     // image(img, 0, 0, width, height);
    //     image(images[0], 0, 0, images[0].width, images[0].height);
    //     drawSkeleton(poses[0]);
    //     drawKeypoints(poses[0]);
    //     noLoop(); // stop looping when the poses are estimated
    // }

    if (poses.length >= dataNum) {
        var yOffset = 0;
        for (var i = 0; i < poses.length; i++) {
            // console.log('poses:', poses);
            // console.log('poses[i][0]:', poses[i][0]);
            // image(img, 0, 0, width, height);
            image(images[i], 0, yOffset, images[i].width, images[i].height);
            drawSkeleton(poses[i], yOffset);
            drawKeypoints(poses[i], yOffset);
            yOffset += images[i].height;
        }
        noLoop(); // stop looping when the poses are estimated
        saveJSON(poses, 'image_poses.json');
    }
}

// The following comes from https://ml5js.org/docs/posenet-webcam
// A function to draw ellipses over the detected keypoints
function drawKeypoints(_pose, yOffset = 0) {
    let pose = _pose[0].pose; // 0 is for accessing main data
    for (let j = 0; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j];
        // Only draw an ellipse is the pose probability is bigger than 0.2
        if (keypoint.score > 0.2) {
            fill(255);
            stroke(20);
            strokeWeight(4);
            ellipse(
                round(keypoint.position.x), round(keypoint.position.y)+yOffset, 8, 8
            );
        }
    }
}

// A function to draw the skeletons
function drawSkeleton(_pose, yOffset = 0) {
    let skeleton = _pose[0].skeleton; // 0 is for accessing main data
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        stroke(255);
        strokeWeight(1);
        line(
            partA.position.x, partA.position.y+yOffset, 
            partB.position.x, partB.position.y+yOffset);
    }
}