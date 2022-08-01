import * as THREE from  'three';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import { enemiesOnScreen } from './enemiesLogic.js';
import { Buttons } from '../libs/other/buttons.js';


/**
 * type == 1: Inimigo Aereo;
 * type == 2: Inimigo Terreste;
 * type == 3: Tiro Player;
 * type == 4: Missel Player;
 */

var shots = [];
var shotsCounter = 0;
var shotsOnScreen = [];

var clickOnPrevFrame = false;
var taSegurando = false;

var audioLoader = new THREE.AudioLoader();
var listener = new THREE.AudioListener();

var enemyShotSound = new THREE.Audio(listener);
var enemyMissel = new THREE.Audio(listener);

var playerShotSound = new THREE.Audio(listener);
var playerMissel = new THREE.Audio(listener);

var loader = new GLTFLoader();


var butoes_tiro = new Buttons(buttonAR , buttonTERRA);

var pressAR = false;
var pressTERRA = false;

function buttonAR(event){
  switch(event.target.id){
    case "joystickAr":
      pressAR = true;
      break;
    case "joystickTerra":
      pressTERRA = true;
      break;
  }
}

function buttonTERRA(event){
  pressAR = false;
  pressTERRA = false;
}

export function playerShoot(scn, player, keyboard) {
  console.log('segudando', taSegurando)

  if(keyboard.pressed("ctrl") || pressAR === true){
    buildShot(scn, null, player, 3);
    if(clickOnPrevFrame)
      taSegurando = true;
    else
      taSegurando = false;

    clickOnPrevFrame = true;
  } else {
    clickOnPrevFrame = false;
    taSegurando = false;
  }
  
  if(keyboard.pressed("space") || pressTERRA === true && player.canMissel)
    buildShot(scn, null, player, 4);

  for(const enemy of enemiesOnScreen){
    if(enemy.type === 'air' && enemy.canShot)
      buildShot(scn, enemy, player, 1);

    if(enemy.type === 'grd' && enemy.canShot)
      buildShot(scn, enemy, player, 2);
  }
}

function buildShot(scn, enemy, player, type, click){
  if(type === 1){
    if(enemy.canShot){
      enemy.canShot = false;
      var newShot = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 0.8, 10),
        new THREE.MeshPhongMaterial({color: "rgb(255, 0, 0)", shininess: "1000", specular:"rgb(255,255,255)"})
      );

      newShot.rodou = false;
      newShot.type = 1;

      audioLoader.load('./sounds/enemyShot.mp3', function(buffer) {
        enemyShotSound.setBuffer(buffer);
        enemyShotSound.setLoop(false);
        if(enemyShotSound.isPlaying){
          enemyShotSound.stop();
        }
        enemyShotSound.setVolume(0.4);
        enemyShotSound.play();
      });

      newShot.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
      newShot.lookAt(player.position);
      scn.add(newShot);
      shotsCounter++;
      shots.push(newShot);

      setTimeout(() => {
        enemy.canShot = true;
      }, 3000);
    }
  }

  if(type === 2){
    if(enemy.canShot){
      enemy.canShot = false;
      
      var newShot = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 2, 10, 10),
        new THREE.MeshLambertMaterial({color: "rgb(255, 0, 0)"})
      );
      
      newShot.rodou = false;
      newShot.type = 2;
      
      newShot.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
      const name = Math.random();
      newShot.name = name;

      shotsCounter++;
      shots.push(newShot);

      var asset = {
        object: null,
        loaded: false,
      };

      loader.load( './assets/bullet.glb', function ( gltf ) {
        let obj = gltf.scene;
        obj.traverse( function ( child ) {
          if ( child.isMesh ) {
            child.castShadow = true;
          }
        });

        audioLoader.load('./sounds/missel.mp3', function(buffer) {
          enemyMissel.setBuffer(buffer);
          enemyMissel.setLoop(false);
          if(enemyMissel.isPlaying){
            enemyMissel.stop();
          }
          enemyMissel.setVolume(0.4);
          enemyMissel.play();
        });
        
        obj.scale.set(6, 6, 6);
        asset.object = gltf.scene;
        asset.object.position.set(newShot.position.x, newShot.position.y, newShot.position.z);
        asset.object.name = name;
        obj.position.set(newShot.position.x, newShot.position.y, newShot.position.z);
        
        shotsOnScreen.push(asset);
        
        scn.add(obj);
      }, null, null);

      setTimeout(() => {
        enemy.canShot = true;
      }, 5000);
    }
  }

  if(type === 3){
    if(!taSegurando)
      player.canShot = true;

    if(player.canShot) {
      player.canShot = false;
      var newShot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 5, 10),
        new THREE.MeshPhongMaterial({color: "rgb(0, 255, 0)", shininess: "1000", specular:"rgb(255,255,255)"})
      );
      newShot.rotateX(3.14/2);

      newShot.rodou = false;
      newShot.type = 3;

      audioLoader.load('./sounds/playerShot.mp3', function(buffer) {
        playerShotSound.setBuffer(buffer);
        playerShotSound.setLoop(false);
        if(playerShotSound.isPlaying){
          playerShotSound.stop();
        }
        playerShotSound.setVolume(0.4);
        playerShotSound.play();
      });

      newShot.position.set(player.position.x, player.position.y, player.position.z);
      scn.add(newShot);
      shotsCounter++;
      shots.push(newShot);

      setTimeout(() => {
        player.canShot = true;
      }, 500);
    }
  }

  if(type === 4){
    if(player.canMissel) {
      player.canMissel = false;

      var newShot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 1, 5, 10),
        new THREE.MeshLambertMaterial({color: "rgb(255, 0, 0)"})
      );

      newShot.rodou = false;
      newShot.type = 4;

      newShot.position.set(player.position.x, player.position.y, player.position.z);
      newShot.rotateX(-3.14/2);
      const name = Math.random();
      newShot.name = name;
      
      shotsCounter++;
      shots.push(newShot);
      
      var asset = {
        object: null,
        loaded: false,
      };
      
      loader.load( './assets/grenade.glb', function ( gltf ) {
        let obj = gltf.scene;
        obj.traverse( function ( child ) {
          if ( child.isMesh ) {
            child.castShadow = true;
          }
        });

        audioLoader.load('./sounds/missel.mp3', function(buffer) {
          playerMissel.setBuffer(buffer);
          playerMissel.setLoop(false);
          if(playerMissel.isPlaying){
            playerMissel.stop();
          }
          playerMissel.setVolume(0.4);
          playerMissel.play();
        });
        
        obj.scale.set(1, 1, 1);
        asset.object = gltf.scene;
        asset.object.position.set(newShot.position.x, newShot.position.y, newShot.position.z);
        asset.object.rotateX(-3.14/2);
        asset.object.name = name;
        obj.position.set(newShot.position.x, newShot.position.y, newShot.position.z);
        
        shotsOnScreen.push(asset);
        
        scn.add(obj);
      }, null, null);

      setTimeout(() => {
        player.canMissel = true;
      }, 2000);
    }
  }
}

export function moveShots(){
  for(const shot of shots){
    var index;
    var aux;

    if(shot.type === 2 || shot.type === 4) {
      index = shotsOnScreen.findIndex(st => st.object.name === shot.name);
      aux = shotsOnScreen[index];
    }

    if(shot.type === 1){
      shot.translateZ(1.2);
      if(shot.position.z < -90) { 
        shot.removeFromParent();
        const indexToRemove = shots.indexOf(shot);
        shots.splice(indexToRemove, 1);
        shotsCounter--;
      }
    }

    if(shot.type === 2 && aux !== undefined){
      if(shot.position.y < 36){
          shot.translateY(1.2);
          aux.object.translateY(1.2);
      } else{
        if(!shot.rodou){
          shot.rotateX(90 * (Math.PI/180));
          aux.object.rotateX(90 * (Math.PI/180));
        }
        shot.rodou = true;
        shot.translateY(1.2);
        aux.object.translateY(1.2);
      }
      if(shot.position.y > 60){
        shot.removeFromParent();
        aux.object.removeFromParent();
        const indexToRemove = shots.indexOf(shot);
        shots.splice(indexToRemove, 1);
        shotsCounter--;

        shotsOnScreen.splice(index, 1);
      }
      shotsOnScreen[index];
    }

    if(shot.type === 3){
      shot.translateY(-2);
      if(shot.position.z < -190){
        shot.removeFromParent();
        const indexToRemove = shots.indexOf(shot);
        shots.splice(indexToRemove, 1);
        shotsCounter--;
      }
    }

    if(shot.type === 4){
      if(aux !== undefined && aux.object) {
        shot.translateY(1);
        shot.rotateX(-1 * (Math.PI/180) / 2);

        aux.object.translateY(1);
        aux.object.rotateX(-1 * (Math.PI/180) / 2);

        if(shot.position.y < -20){
          shot.removeFromParent();
          aux.object.removeFromParent();

          const indexToRemove = shots.indexOf(shot);
          shots.splice(indexToRemove, 1);
          shotsCounter--;
          
          shotsOnScreen.splice(index, 1);
        }
      }
    }
  }
}


export function clearShots(){
  for(const shot of shots){
      shot.removeFromParent();
  }
  for(const shot of shotsOnScreen) {
    shot.object.removeFromParent();
  }

  shots = [];
  shotsCounter = 0;
  shotsOnScreen = [];
}

export function removeShot(name) {
  const index = shotsOnScreen.findIndex(st => st.object.name === name);
  const aux = shotsOnScreen[index];

  aux.object.removeFromParent();
}

export function decrementaShots(){
  shotsCounter--;
}

export{
  shots,
  shotsCounter,
}