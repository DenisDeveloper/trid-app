import THREE from 'three';
import $ from 'jquery';

var scene, camera, renderer;
var geometry, material, sphere, cloudMesh;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.z = 5;

  // var geometry = new THREE.SphereGeometry(0.5, 32, 32);
  // var material = new THREE.MeshPhongMaterial({
  //   color: 0x156289
  // });
  // material.map = THREE.TextureLoader('img/earthmap1k.jpg');
  // var earthMesh = new THREE.Mesh(geometry, material);
  // scene.add(earthMesh);

  // var ambientLight = new THREE.AmbientLight( 0x000000 );
  // scene.add( ambientLight );
  //
  // var lights = [];
  // lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
  // lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
  // lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
  // lights[3] = new THREE.DirectionalLight( 0xffffff, 1 );
  //
  // lights[0].position.set( 0, 200, 0 );
  // lights[1].position.set( 100, 380, 350 );
  // lights[2].position.set( -100, -200, -100 );
  // lights[3].position.set( 5, 5, 5 );
  //
  // // scene.add( lights[0] );
  // scene.add( lights[3] );
  // // scene.add( lights[3] );
  // // scene.add( lights[2] );

  var light = new THREE.AmbientLight(0x222222)
  scene.add(light)
  var light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 5, 5)
  scene.add(light)
  light.castShadow = true
  light.shadow.camera.near = 0.01
  light.shadow.camera.far = 15
  light.shadow.camera.fov = 45
  light.shadow.camera.left = -1
  light.shadow.camera.right = 1
  light.shadow.camera.top = 1
  light.shadow.camera.bottom = -1
    // light.shadowCameraVisible	= true
  light.shadow.bias = 0.001
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024

  var geometry = new THREE.SphereGeometry(0.5, 32, 32);
  var material = new THREE.MeshPhongMaterial();
  material.map = new THREE.TextureLoader().load('img/earthmap1k.jpg');
  material.bumpMap = new THREE.TextureLoader().load('img/earthbump1k.jpg');
  material.bumpScale = 0.1;
  material.specularMap = new THREE.TextureLoader().load('img/earthspec1k.jpg');
  material.specular = new THREE.Color('grey');
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);


  cloudMesh = createEarthCloud();
  sphere.add(cloudMesh);

  //mesh = new THREE.Mesh( geometry, material );
  //scene.add( mesh );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

}

function createEarthCloud() {
  // create destination canvas
  var canvasResult = document.createElement('canvas')
  canvasResult.width = 1024
  canvasResult.height = 512
  var contextResult = canvasResult.getContext('2d')

  // load earthcloudmap
  var imageMap = new Image();
  imageMap.addEventListener("load", function() {

    // create dataMap ImageData for earthcloudmap
    var canvasMap = document.createElement('canvas')
    canvasMap.width = imageMap.width
    canvasMap.height = imageMap.height
    var contextMap = canvasMap.getContext('2d')
    contextMap.drawImage(imageMap, 0, 0)
    var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

    // load earthcloudmaptrans
    var imageTrans = new Image();
    imageTrans.addEventListener("load", function() {
      // create dataTrans ImageData for earthcloudmaptrans
      var canvasTrans = document.createElement('canvas')
      canvasTrans.width = imageTrans.width
      canvasTrans.height = imageTrans.height
      var contextTrans = canvasTrans.getContext('2d')
      contextTrans.drawImage(imageTrans, 0, 0)
      var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
        // merge dataMap + dataTrans into dataResult
      var dataResult = contextMap.createImageData(canvasMap.width, canvasMap.height)
      for (var y = 0, offset = 0; y < imageMap.height; y++) {
        for (var x = 0; x < imageMap.width; x++, offset += 4) {
          dataResult.data[offset + 0] = dataMap.data[offset + 0]
          dataResult.data[offset + 1] = dataMap.data[offset + 1]
          dataResult.data[offset + 2] = dataMap.data[offset + 2]
          dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0]
        }
      }
      // update texture with result
      contextResult.putImageData(dataResult, 0, 0)
      material.map.needsUpdate = true;
    })
    imageTrans.src = 'img/earthcloudmaptrans.jpg';
  }, false);
  imageMap.src = 'img/earthcloudmap.jpg';

  var geometry = new THREE.SphereGeometry(0.52, 90, 90)
  var material = new THREE.MeshPhongMaterial({
    map: new THREE.Texture(canvasResult),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  })
  var mesh = new THREE.Mesh(geometry, material)
  return mesh
}

function animate() {

  requestAnimationFrame(animate);

  // sphere.rotation.x += 0.01;
  sphere.rotation.y += 1 / 16 * 0.2;
  cloudMesh.rotation.y += 1 / 32 * 0.02;

  renderer.render(scene, camera);

}
