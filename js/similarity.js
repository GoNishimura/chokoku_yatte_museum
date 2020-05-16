var pose1ImageElement = document.getElementById('pose1');
var pose2ImageElement = document.getElementById('pose2');

// For more detailed Posenet setup, please refer its own document.
// Load Posenet model
posenet.load().then(function(net) {
  // Estimate the two poses
  return Promise.all([
    net.estimateSinglePose(pose1ImageElement),
    net.estimateSinglePose(pose2ImageElement)
  ])
}).then(function(poses){
  // Calculate the weighted distance between the two poses
  var weightedDistance = pns.poseSimilarity(poses[0], poses[1]);
  // var weightedDistance = pns.poseSimilarity(poses[0], poses[1], {strategy: 'cosineSimilarity'});
  console.log(poses[0]);
  console.log(weightedDistance)
})