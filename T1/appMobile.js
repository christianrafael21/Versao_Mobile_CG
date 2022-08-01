import * as THREE from  'three';
import { degreesToRadians} from '../libs/util/util.js';
import { animateDeadEnemies, animateDeadPlayer, colisions} from './colision.js';
import {inicializeKeyboard, keyboardUpdate, moveDown, moveUp, moveLeft,moveRight, fixRotation, rotateAirplane} from './playerLogic.js'
import { moveEnemies } from './enemiesLogic.js';
import { generateLife, movelife } from './lifeCSG.js';
import { playerShoot, moveShots } from './shots.js';
import {initRenderer,
       initCamera,
       onWindowResize} from "../libs/util/util.js";
import { jogo, reiniciaJogo, reiniciaJogo2 } from './ondas.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import { createLight } from './ilumination.js';
import { animateExplosoes } from './colision.js';
import { Water } from '../build/jsm/objects/Water.js';  // Water shader in here

// Inicialização de elelmentos -------------------------------------------------------------------------------------------------- 
var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer({ alpha: true });    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 100, 140)); // Init camera in this position
createLight(scene);

var scene2 = new THREE.Scene();    // Create second
// scene2.background = new THREE.Color(0xa3a3a3);
renderer.autoClear = false;

let posicaoSomePlano = -11E-14;
let posicaoCriaPlano = -2E-14;
let velocidadePlano = -0.5;

// -- SET SOUNDS ----------------------------------------------------------------------------------
var audioLoader = new THREE.AudioLoader();
var listener = new THREE.AudioListener();

var music = new THREE.Audio(listener);

audioLoader.load('./sounds/resistence.mp3', function(buffer) {
  music.setBuffer(buffer);
  music.setLoop(true);
  music.setVolume( 0.3 );
  if(music.isPlaying){
    music.stop();
  }
  music.play();
});

var deathMusic = new THREE.Audio(listener);

audioLoader.load('./sounds/playerExplode.mp3', function(buffer) {
  deathMusic.setBuffer(buffer);
  deathMusic.setVolume( 0.5 );
  if(deathMusic.isPlaying){
    deathMusic.stop();
  }
})

var loader = new GLTFLoader();

//-- SET WATER SHADER -----------------------------------------------------------------------------
const waterGeometry = new THREE.PlaneGeometry( 150, 500 );

// Water shader parameters
let water;
  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( './assets/textures/waternormals.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x836FFF,
      distortionScale: 0.7,
      //reflectivity: 0.35,
      flowDirection: new THREE.Vector2( -1, 0 ),
    }
  );
  water.translateY(1);
  water.position.set(0,2,-100);
  water.transparent = true;
  water.opacity = 0.5;
  //water.translateZ(500);
  water.rotateX (degreesToRadians(-90));
  water.rotateZ (degreesToRadians(180));
  scene.add(water);
// create the ground plane ------------------------------------------------------------------------------------------------------
//let plane = generatePlano();
let plane = generateTerrain();
//plane.translateZ(100);
scene.add(plane);

let outro;
loader.load('./assets/death-star.gltf', function (glft) {
  let obj = glft.scene;
  obj.traverse(function (child) {
    if(child){
      child.castShadow = true;
    }
  });
  obj.scale.set(40,15,40);
  outro = glft.scene;
  outro.scale.set(40,15,40);
  outro.position.set(465, -80,20);
  obj.position.set(465, -80,20);
  outro.rotateY(degreesToRadians(90));
});

// Create CSG HP ----------------------------------------------------------------------------------------------------------------
var lifeOnScreen = [];
generateLife('lifeV', -10, 150);

var airPlaneGeometry = new THREE.ConeGeometry(4, 8, 20);
var airPlaneMaterial = new THREE.MeshLambertMaterial({color: "rgb(0, 250, 100)"});

// create a airPlane ------------------------------------------------------------------------------------------------------------
var airPlane;
loader.load('./assets/x-wing.gltf', function ( glft ) {
  airPlane = glft.scene;
  airPlane.name = 'F-16D';
  airPlane.scale.set(1.25,1.25,1.25);
  airPlane.rotateY(degreesToRadians(180));
  airPlane.position.set(0.0, 36,80);
  airPlane.traverse(function (child) {
    if(child){
      child.castShadow = true;
    }
  });
  scene.add(airPlane);
});

var deadAirPlane;
loader.load('./assets/x-wing.gltf', function ( glft ){
  deadAirPlane = glft.scene;
  deadAirPlane.name = 'DEAD';
  deadAirPlane.scale.set(1.25,1.25,1.25);
  deadAirPlane.rotateY(-9.45);
  deadAirPlane.position.set(0.0, 36,80);
  deadAirPlane.traverse(function (child) {
    if(child){
      child.castShadow = true;
    }
  });
});

//TODO -------------------------------------------------------------------------------------------------------------------------------

var boxPlane = new THREE.Mesh(airPlaneGeometry, airPlaneMaterial);

boxPlane.position.set(0.0, 36, 80);
boxPlane.rotateX(-3.14/2);

boxPlane.canShot = true;
boxPlane.canMissel = true;

var deadBoxPlane = new THREE.Mesh(airPlaneGeometry, airPlaneMaterial);
 
deadBoxPlane.position.set(0.0, 36, 80);
deadBoxPlane.rotateX(-3.14/2);

// create a keyboard -------------------------------------------------------------------------------------------------------------
var keyboard = inicializeKeyboard();
 
// Listen window size changes ----------------------------------------------------------------------------------------------------
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

var airplaneHp = 5;
var playerHpOnScreen = [];

var canGame = true;
var colisaoAtivada = true;
var canSwitchGodMode = true;

export function setHp(){
  airplaneHp = 5;
}

//-------------------------------------------------------------------------------
// Setting virtual camera
//-------------------------------------------------------------------------------
var lookAtVec   = new THREE.Vector3( 0, 0, 0);
var camPosition = new THREE.Vector3( 0, 0, 20 );
var upVec       = new THREE.Vector3( 0, 1, 0 );
var vcWidth = 200;
var vcHeidth = 50; 
var virtualCamera = new THREE.PerspectiveCamera(45, vcWidth/vcHeidth, 1.0, 25.0);
  virtualCamera.position.copy(camPosition);
  virtualCamera.up.copy(upVec);
  virtualCamera.lookAt(lookAtVec);

// Create helper for the virtual camera
const cameraHelper = new THREE.CameraHelper(virtualCamera);
scene2.add(cameraHelper);

function controlledRender()
{
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Set main viewport
  renderer.setViewport(0, 0, width, height); // Reset viewport    
  renderer.setScissorTest(false); // Disable scissor to paint the entire window
  renderer.clear();   // Clean the window
  renderer.render(scene, camera);   

  // Set virtual camera viewport 
  var offset = 10;
  renderer.setViewport(offset, height-vcHeidth-offset, vcWidth, vcHeidth);  // Set virtual camera viewport  
  renderer.setScissor(offset, height-vcHeidth-offset, vcWidth, vcHeidth); // Set scissor with the same size as the viewport
  renderer.setScissorTest(true); // Enable scissor to paint only the scissor are (i.e., the small viewport)
  renderer.setClearColor(0x000000, 0);
  renderer.clear(); // Clean the small viewport
  renderer.render(scene2, virtualCamera);  // Render scene of the virtual camera
}

var pause = false;
var canClick = true;

function atualizaMusica(){
  if(pause && music.isPlaying)
    music.stop();

  if(!pause && !music.isPlaying)
    music.play()
}

// ----------------------- INICIANDO JOGO COM BOTÃO START--------------------------------
function start(){
  var button  = document.getElementById("myBtn");
  button.addEventListener("click", iniciaGame);
          
  function iniciaGame() {
    var loadingScreen = document.getElementById( 'load-tela' );
    document.getElementById('load-screen').style.display= "none";
    loadingScreen.transition = 0;
    loadingScreen.classList.add( 'fade-out' );
    loadingScreen.addEventListener( 'transitionend', (e) => {
      var element = e.target;
      element.remove();  
    }); 
    addJoysticks();
    
    render(); 
  }
}

// ------------------------------TELA DE GAME OVER--------------------------------------

var joy;
export function showGameOverScreen() {
  pause = true;

  deathMusic.play();

  hideJoysticks();

  var gameOver = document.getElementById('over');
  document.getElementById('game-over').style.display = "block";
  gameOver.transition = 0;
  gameOver.classList.add('tela-over');
  setTimeout(() => {
    pause = false;
    document.getElementById('game-over').style.display = "none";
    gameOver.classList.remove('tela-over');
    deathMusic.stop();
    
    joy[0].el.style.display = 'block';

  }, 13000);
}


start();

//------------------------------ADICIONANDO JOYSTICK------------------------------------------------

var shotBtns;
var fwdValue = 0;
var bkdValue = 0;
var rgtValue = 0;
var lftValue = 0;

function addJoysticks(){
  
  joy = nipplejs.create({
    zone: document.getElementById('joystickWrapper1'),
    mode: 'static',
    position: {left: '20vw', top: '88vh'},
  });

  shotBtns = document.querySelector('.botoes');
  shotBtns.style.display = 'block';
  
  joy.on('move', function (evt, data) {
    const forward = data.vector.y
    const turn = data.vector.x
    fwdValue = bkdValue = lftValue = rgtValue = 0;

    if (forward > 0) 
      fwdValue = Math.abs(forward)
    else if (forward < 0)
      bkdValue = Math.abs(forward)

    if (turn > 0) 
      rgtValue = Math.abs(turn)
    else if (turn < 0)
      lftValue = Math.abs(turn)
  })


  joy.on('end', function (evt) {
    bkdValue = 0
    fwdValue = 0
    lftValue = 0
    rgtValue = 0
  })



}

function hideJoysticks() {
  joy[0].el.style.display = 'none';
}

function movimentaJoystick(obj,airPlane){
  if (fwdValue > 0 && obj.position.y < 36.16 && airPlane != undefined) {
    moveUp(obj,airPlane);
    console.log(obj.position);
  }
  
  if (bkdValue > 0 && obj.position.y > 34 && airPlane != undefined) {
    moveDown(obj,airPlane);
    console.log(obj.position);
  }

  if (lftValue > 0  && obj.position.x > -50 && airPlane != undefined) {
    moveLeft(obj,airPlane);
    rotateAirplane('esq', airPlane);
  }else{
    fixRotation('esq', airPlane);
  }

  if (rgtValue > 0  && obj.position.x < 56 && airPlane != undefined) {
    moveRight(obj,airPlane);
    rotateAirplane('dir', airPlane);
  } else{
    fixRotation('dir', airPlane);
}
} 
//----------------------------FUNÇÃO RENDER---------------------------------------------------------


function render()
{
  if(keyboard.pressed('P') && canClick){
    canClick = false;
    pause = !pause;
    
    setTimeout(() => {
      canClick = true;
    }, 500);
  }
  movimentaJoystick(boxPlane,airPlane);
  atualizaMusica();
  keyboardUpdate(keyboard, boxPlane, airPlane);

  if(pause) {
    requestAnimationFrame(render);
  } else {
    if(keyboard.pressed('enter')){
      reiniciaJogo();
    }
    else{
      if(airplaneHp <= 0){
        reiniciaJogo2();
      }
      else{
        jogo();
      }
    }
    
    movelife();
      
    moveEnemies();
  
    water.material.uniforms[ 'time' ].value = water.material.uniforms[ 'time' ].value - 0.05;
    
    worldMovement();
    //moveCenario();
    //rotateWorld();
    requestAnimationFrame(render);
    
    atualizaVidas(airplaneHp);
    
    controlledRender();
    
    if(keyboard.pressed("G") && canSwitchGodMode) {
      canSwitchGodMode = false;
      colisaoAtivada = !colisaoAtivada;
  
      setTimeout(() => {
        canSwitchGodMode = true;
      }, 100);
    }
    
    playerShoot(scene, boxPlane, keyboard);

    airplaneHp -= colisions(1, airplaneHp, colisaoAtivada);
    airplaneHp -= colisions(2, airplaneHp, colisaoAtivada);
    airplaneHp -= colisions(3, airplaneHp, colisaoAtivada);
    colisions(4, airplaneHp, colisaoAtivada);
    colisions(5, airplaneHp, colisaoAtivada);
    airplaneHp -= colisions(6, airplaneHp, colisaoAtivada);
  
    moveShots();
    
    animateExplosoes();
    animateDeadEnemies();
    animateDeadPlayer(scene);
  }
}

// plane functions ----------------------------------------------------------------------------------------------------------------
var criaPlano = false;
var criaPlanoAux = true;
var planoAux = null;

function worldMovement() {
  if(plane) {
    plane.translateY(velocidadePlano);
    // console.log(plane.position)
  }
  if(planoAux) {
    planoAux.translateY(velocidadePlano);
    // console.log(planoAux.position)
  }
  
  if(plane && plane.position.y < posicaoSomePlano) {
      console.log('sumiu plano')
      plane.removeFromParent();
      plane = null;
      criaPlano = true;
    }
    
    if(planoAux && planoAux.position.y < posicaoSomePlano) {
      console.log('sumiu aux')
      planoAux.removeFromParent();
      planoAux = null;
      criaPlanoAux = true;
    }
    
    if(criaPlanoAux && plane && plane.position.y < posicaoCriaPlano) {
      console.log('criou aux')
      criaPlanoAux = false;
      planoAux = generateTerrain();
      planoAux.translateY(380);
      scene.add(planoAux);
    }
    
    if(criaPlano && planoAux && planoAux.position.y < posicaoCriaPlano) {
      console.log('criou')
      criaPlano = false;
      plane = generateTerrain();
      plane.translateY(387);
      scene.add(plane);
    }
}

//var vPlane = true;
//var vAux = false;

function moveCenario(){
  //var plano2;
  if(plane !== undefined && outro !== undefined){
    if(plane.position.z < 930){
      plane.translateY(velocidadePlano);
    }
    else{
      plane.removeFromParent();
    }

    if(outro.position.z < 930){
      outro.translateX(velocidadePlano);
    }
    else{
      outro.removeFromParent();
    }

    if(plane.position.z > 180){
      //outro = outro;
      outro.position.set(465, -80,-800);
      scene.add(outro);
    }

    if(outro.position.z > 180){
      plane.position.set(465, -80,-800);
      scene.add(plane);
    }
  }
}

function generatePlano() {
  var textureLoader = new THREE.TextureLoader();
  var grass = textureLoader.load('./assets/textures/grama.jpg');
  var rock = textureLoader.load('./assets/textures/terra.jpg');
  var areia = textureLoader.load('./assets/textures/areia.jpg');
  
  var geometry1 = new THREE.BoxGeometry(120,0.2,500);
  var geometry2 = new THREE.BoxGeometry(40,0.2,500);
  var geometry3 = new THREE.BoxGeometry(240,0.2,500);
  var geometry4 = new THREE.BoxGeometry(15,0.2,500);
  
  var material1 = new THREE.MeshLambertMaterial();
  var material2 = new THREE.MeshLambertMaterial();
  var material3 = new THREE.MeshLambertMaterial();

  material1.map = areia;
  material1.map.wrapS = THREE.RepeatWrapping;
  material1.map.wrapT = THREE.RepeatWrapping;
  material1.map.minFilter = THREE.LinearFilter;
  material1.map.magFilter = THREE.NearestFilter;

  material2.map = rock;
  material2.map.wrapS = THREE.RepeatWrapping;
  material2.map.wrapT = THREE.RepeatWrapping;
  material2.map.minFilter = THREE.LinearFilter;
  material2.map.magFilter = THREE.NearestFilter;

  material3.map = grass;
  material3.map.wrapS = THREE.RepeatWrapping;
  material3.map.wrapT = THREE.RepeatWrapping;
  material3.map.minFilter = THREE.LinearFilter;
  material3.map.magFilter = THREE.NearestFilter;
  
  var cube1 = new THREE.Mesh(geometry1, material1);
  var cube2 = new THREE.Mesh(geometry2, material2);
  var cube3 = new THREE.Mesh(geometry2, material2);
  var cube4 = new THREE.Mesh(geometry3, material3);
  var cube5 = new THREE.Mesh(geometry3, material3);
  var cube6 = new THREE.Mesh(geometry4, material2);
  var cube7 = new THREE.Mesh(geometry4, material2);

  cube1.add(cube2, cube3, cube4, cube5);

  cube1.translateY(-10);

  cube6.translateX(-85);
  cube6.translateY(5);
  cube6.rotateZ(degreesToRadians(-10));

  cube7.translateX(85);
  cube7.translateY(5);
  cube7.rotateZ(degreesToRadians(10));

  cube2.translateX(-70);
  cube2.translateY(2);
  cube2.rotateZ(degreesToRadians(-25));

  cube3.translateX(70);
  cube3.translateY(2);
  cube3.rotateZ(degreesToRadians(25));

  cube4.translateY(7);
  cube4.translateX(207);

  cube5.translateY(7);
  cube5.translateX(-207);

  cube1.position.set(0,0,-100);

  return cube1;
}

function generateTerrain(){
  var textureLoader = new THREE.TextureLoader();
  var grass = textureLoader.load('./assets/textures/grama.jpg');
  var rock = textureLoader.load('./assets/textures/terra.jpg');
  var areia = textureLoader.load('./assets/textures/areia.jpg');
  
  var geometry1 = new THREE.PlaneBufferGeometry(120,500, 10, 10);
  var geometry2 = new THREE.PlaneBufferGeometry(40,500, 10, 10);
  var geometry3 = new THREE.PlaneBufferGeometry(240,500, 10, 10);

  const vertex2 = new THREE.Vector3();
  const positionAttribute2 = geometry2.getAttribute('position');
  for(var i=0; i<positionAttribute2.count; i++){
    var x = positionAttribute2.getX( i );
    var y = positionAttribute2.getY( i );
    var z = positionAttribute2.getZ( i );

    z += Math.random() * 5;
    
    positionAttribute2.setXYZ( i, x, y, z );
  }

  const vertex3 = new THREE.Vector3();
  const positionAttribute3 = geometry3.getAttribute('position');
  for(var i=0; i<positionAttribute3.count; i++){
    var x = positionAttribute3.getX( i );
    var y = positionAttribute3.getY( i );
    var z = positionAttribute3.getZ( i );

    z += Math.random() * 10;
    
    positionAttribute3.setXYZ( i, x, y, z );
  }

  var material1 = new THREE.MeshLambertMaterial();
  var material2 = new THREE.MeshLambertMaterial();
  var material3 = new THREE.MeshLambertMaterial();

  material1.map = areia;
  material1.map.wrapS = THREE.RepeatWrapping;
  material1.map.wrapT = THREE.RepeatWrapping;
  material1.map.minFilter = THREE.LinearFilter;
  material1.map.magFilter = THREE.NearestFilter;

  material2.map = rock;
  material2.map.wrapS = THREE.RepeatWrapping;
  material2.map.wrapT = THREE.RepeatWrapping;
  material2.map.minFilter = THREE.LinearFilter;
  material2.map.magFilter = THREE.NearestFilter;

  material3.map = grass;
  material3.map.wrapS = THREE.RepeatWrapping;
  material3.map.wrapT = THREE.RepeatWrapping;
  material3.map.minFilter = THREE.LinearFilter;
  material3.map.magFilter = THREE.NearestFilter;
  
  var cube1 = new THREE.Mesh(geometry1, material1);
  var cube2 = new THREE.Mesh(geometry2, material2);
  var cube3 = new THREE.Mesh(geometry2, material2);
  var cube4 = new THREE.Mesh(geometry3, material3);
  var cube5 = new THREE.Mesh(geometry3, material3);

  cube1.add(cube2, cube3, cube4, cube5);

  cube1.rotateX(degreesToRadians(-90));
  //cube1.translateY(-10);

  cube2.translateX(-70);
  cube2.translateZ(8);
  cube2.rotateY(degreesToRadians(-10));

  cube3.translateX(70);
  cube3.translateZ(8);
  cube3.rotateY(degreesToRadians(10));

  cube4.translateY(7);
  cube4.translateX(207);

  cube5.translateY(7);
  cube5.translateX(-207);

  cube1.position.set(0,0,-150);

  // scene.add(cube1);
  return cube1;
}

function generateCube(x, y, z){
  var geometry = new THREE.BoxGeometry(80,30,500);
  var material = new THREE.MeshLambertMaterial();
  
  var cube = new THREE.Mesh(geometry, material);
  cube.position.set(x,y,z);
  scene.add(cube);
}

function atualizaVidas(vidas) {
  removeVidas();
  let posicaoVida = {x: -20, y: 0, z: 0};
  for(let i = 0; i < vidas; i++) {
    createEsferaVida(posicaoVida);
    posicaoVida.x += 10;
  }
}

function createEsferaVida(pos) {
  let material = new THREE.MeshBasicMaterial({color: "rgb(150, 250, 0)"});
  let geometry = new THREE.SphereGeometry(3, 20, 20);
  let sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(pos.x, pos.y, pos.z);
  playerHpOnScreen.push(sphere);
  scene2.add(sphere);
}

function removeVidas() {
  for(const vida of playerHpOnScreen)
    vida.removeFromParent();
}

function restartGame() {
  airplaneHp = 5;

  airPlane.position.set(0.0, 36, 80);
  boxPlane.position.set(0.0, 36, 80);
  scene.add(airPlane);

  canGame = true;
}

export function finalizaGame() {
  canGame = false;
  lifeOnScreen = [];
  removeAllLifes();
};

function removeAllLifes() {
  for(const life of lifeOnScreen)
    life.removeFromParent();
}

export { 
  airPlane,
  boxPlane, 
  scene,
  deadBoxPlane,
  deadAirPlane,
  lifeOnScreen,
  createEsferaVida,
  airplaneHp,
};