import KeyboardState from '../libs/util/KeyboardState.js';
import { degreesToRadians} from '../libs/util/util.js';

// Variáveis auxiliares ----------------------------------------------------------------------------
var shotOnScreenCounter = 0;
var canCreateShot = true;

var misselOnScreenCounter = 0;

var conserta = false;

var rotaDir = 0;
var rotaEsq = 0;

// Funções Keyboard ---------------------------------------------------------------------------------
export function inicializeKeyboard(){
    var keyboard = new KeyboardState();
    return keyboard;
}

function inclination(airPlane){
  for(var i = 0; i< 3; i++){
    setTimeout(() => {
      airPlane.rotateOnWorldAxis(3.14/9);
    },250);
  }
}


/*
export function keyboardUpdate(kb, obj, airPlane){
  if (kb.pressed("touchstart") && obj.position.y < 36.16 && airPlane != undefined){
    moveUp(obj, airPlane)
  }
}
var joystikUP  = document.getElementById("joystickWrapper1");
joystikUP.addEventListener("click", keyboardUpdate);
*/

export function keyboardUpdate(kb, obj, airPlane){
  kb.update();
  if (kb.pressed("up") && obj.position.y < 36.16 && airPlane != undefined){
    moveUp(obj, airPlane)
  }

  if (kb.pressed("down") && obj.position.y > 35.992 && airPlane != undefined){
    moveDown(obj, airPlane)
  }

  if (kb.pressed("right") && obj.position.x < 57 && airPlane != undefined){
    moveRight(obj, airPlane)
  } else{
      fixRotation('dir', airPlane);
  }

  if (kb.pressed("left") && obj.position.x > -57 && airPlane != undefined){
    moveLeft(obj, airPlane)
  }
  else{
    fixRotation('esq', airPlane);
  }
}

export function moveUp(obj, airPlane) {
  obj.translateY(0.8);
  airPlane.translateZ(0.8);
}

export function moveDown(obj, airPlane) {
  obj.translateY(-0.8);
  airPlane.translateZ(-0.8);
}

export function moveRight(obj, airPlane) {
  obj.translateX(2);
  airPlane.position.set(airPlane.position.x + 2, airPlane.position.y, airPlane.position.z);
  rotateAirplane('dir', airPlane);
}

export function moveLeft(obj, airPlane) {
  obj.translateX(-2);
  airPlane.position.set(airPlane.position.x - 2, airPlane.position.y, airPlane.position.z);
  rotateAirplane('esq', airPlane);
}

export function rotateAirplane(direction, airPlane) {
  if(airPlane !== undefined && direction === 'dir' && rotaDir < 11){
    airPlane.rotateZ(degreesToRadians(3));
    rotaDir = rotaDir + 1;
  }

  if(airPlane !== undefined && direction === 'esq' && rotaEsq < 11){
    airPlane.rotateZ(degreesToRadians(-3));
    rotaEsq = rotaEsq + 1;
  }
}

export function fixRotation(direction, airPlane) {
  if(airPlane !== undefined && direction === 'dir' && rotaDir>0){
    airPlane.rotateZ(degreesToRadians(-3));
    rotaDir--;
  }

  if(airPlane !== undefined && direction === 'esq' && rotaEsq>0){
    airPlane.rotateZ(degreesToRadians(3));
    rotaEsq--;
  }
}

// Funções de atualização de variáveis ----------------------------------------------------------------

export function setCanCreateShot(){
    canCreateShot = true;
}

export function setShotCounter(){
    shotOnScreenCounter--;
}

export function setMisselCounter(){
    misselOnScreenCounter--;
}

export function resetShots (vetShot) {
    vetShot = [];
    shotOnScreenCounter = 0;
    misselOnScreenCounter = 0;
    canCreateShot = true;
  }
