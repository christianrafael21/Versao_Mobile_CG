import * as THREE from  'three';
import { setEnemiesCounter, textureOnScreen } from './enemiesLogic.js';
import { setCanCreateShot } from './playerLogic.js';
import { enemiesOnScreen } from './enemiesLogic.js';
import { shots, decrementaShots, removeShot } from './shots.js';
import { scene,
         airPlane, 
         boxPlane,
         deadAirPlane,
         lifeOnScreen,
         showGameOverScreen } from './appMobile.js';

var deadEnemies = [];
var deadPlayer = [];
var explosionsOnScreen = [];

var set = false;

var audioLoader = new THREE.AudioLoader();
var listener = new THREE.AudioListener();

var enemyExplodeSound = new THREE.Audio(listener);
var playerExplodeSound = new THREE.Audio(listener);

var textureLoader = new THREE.TextureLoader();

export function detectCollisionCubes(object1, object2){
    object1.geometry.computeBoundingBox();
    object2.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    object2.updateMatrixWorld();
    
    var box1 = object1.geometry.boundingBox.clone();
    box1.applyMatrix4(object1.matrixWorld);
  
    var box2 = object2.geometry.boundingBox.clone();
    box2.applyMatrix4(object2.matrixWorld);
  
    return box1.intersectsBox(box2);
}

export function animateDeadEnemies() {
  for(const enemy of deadEnemies) {
    enemy.rotateY(3.14/12);
    const scaleValue = enemy.scale.x - 0.1;
    enemy.scale.set(scaleValue, scaleValue, scaleValue); 
    if(enemy.scale.x <= 0)
      enemy.removeFromParent();
  }
}

export function animateDeadPlayer(scene) {
  for(const player of deadPlayer) {
    if(set){
      scene.add(player);
      player.rotateZ(3.14/40);
      setTimeout(() => {
        set = false;
        player.removeFromParent();
        deadPlayer.shift();
        return;
      },440);
    }
  }
}

/**
 * tipo 1: Player x Inimigo
 * tip2 2: Player x TiroAereo
 * tipo 3: Player x TiroTerrestre
 * tipo 4: TiroPlayer x InimigoAereo
 * tipo 5: MisselPlayer x InimigoTerrestre
 */

export function colisions(type, airplaneHp, colisaoAtivada){
  if(!colisaoAtivada) return 0;

  let dano = 0;

  if(airplaneHp <= 0) {
    
    for(const hp of lifeOnScreen){
      hp.removeFromParent();
      lifeOnScreen.splice(0, 1);
    }        
    
    audioLoader.load('./sounds/playerExplode.mp3', function(buffer) {
      playerExplodeSound.setBuffer(buffer);
      playerExplodeSound.setLoop(false);
      if(playerExplodeSound.isPlaying){
        playerExplodeSound.stop();
      }
      playerExplodeSound.setVolume(0.6);
      playerExplodeSound.play();
    });
    
    deadAirPlane.position.set(boxPlane.position.x, boxPlane.position.y, boxPlane.position.z);
    airPlane.removeFromParent();
    deadPlayer.push(deadAirPlane);
    set = true;

    showGameOverScreen();

    return 0;
  }

  if(type === 1){
    for(const enemy of enemiesOnScreen){
      if(detectCollisionCubes(enemy, boxPlane)){
        textureOnScreen[enemiesOnScreen.indexOf(enemy)].object.removeFromParent();
        textureOnScreen.splice(enemiesOnScreen.indexOf(enemy), 1);
        enemiesOnScreen.splice(enemiesOnScreen.indexOf(enemy), 1);
        dano = 2;

        audioLoader.load('./sounds/playerExplode.mp3', function(buffer) {
          playerExplodeSound.setBuffer(buffer);
          playerExplodeSound.setLoop(false);
          if(playerExplodeSound.isPlaying){
            playerExplodeSound.stop();
          }
          playerExplodeSound.setVolume(0.3);
          playerExplodeSound.play();
        });

        createExplosion(enemy.position, type);
      }
    }
  }
  
  if(type === 2){
    for(const shot of shots){
      if(shot.type === 1){
        if(detectCollisionCubes(shot, boxPlane)){
          shots.splice(shots.indexOf(shot), 1);
          scene.remove(shot);
          dano = 1;

          audioLoader.load('./sounds/playerExplode.mp3', function(buffer) {
            playerExplodeSound.setBuffer(buffer);
            playerExplodeSound.setLoop(false);
            if(playerExplodeSound.isPlaying){
              playerExplodeSound.stop();
            }
            playerExplodeSound.setVolume(0.3);
            playerExplodeSound.play();
          });

          createExplosion(shot.position, type);
        }
      }
    }
  }
  
  if(type === 3){
    for(const shot of shots){
      if(shot.type === 2){
        if(detectCollisionCubes(shot, boxPlane)){
          shots.splice(shots.indexOf(shot), 1);
          scene.remove(shot);
          dano = 2;

          removeShot(shot.name);

          audioLoader.load('./sounds/playerExplode.mp3', function(buffer) {
            playerExplodeSound.setBuffer(buffer);
            playerExplodeSound.setLoop(false);
            if(playerExplodeSound.isPlaying){
              playerExplodeSound.stop();
            }
            playerExplodeSound.setVolume(0.3);
            playerExplodeSound.play();
          });

          createExplosion(shot.position, type);
        }
      }
    }
  }

  if(type === 4){
    for(const enemy of enemiesOnScreen){
      for(const shot of shots){
        if(shot.type === 3){
          if(detectCollisionCubes(shot, enemy)){
            const indexEnemy = enemiesOnScreen.indexOf(enemy);
            audioLoader.load('./sounds/enemyExplode.mp3', function(buffer) {
              enemyExplodeSound.setBuffer(buffer);
              enemyExplodeSound.setLoop(false);
              if(enemyExplodeSound.isPlaying){
                enemyExplodeSound.stop();
              }
              enemyExplodeSound.setVolume(0.6);
              enemyExplodeSound.play();
            });
            
            deadEnemies.push(textureOnScreen[indexEnemy].object);
            enemiesOnScreen.splice(indexEnemy, 1);
            textureOnScreen.splice(indexEnemy, 1);
            
            setEnemiesCounter();
            
            shot.removeFromParent();
            const indexShot = shots.indexOf(shot);
            shots.splice(indexShot, 1);
            decrementaShots();
            setCanCreateShot();

            createExplosion(enemy.position, type);
          }   
        }
      }
    }
  }
  
  if(type === 5){
    for(const enemy of enemiesOnScreen){
      for(const shot of shots){
        if(shot.type === 4 && enemy.type == 'grd'){
          if(detectCollisionCubes(shot, enemy)){
            
            audioLoader.load('./sounds/enemyExplode.mp3', function(buffer) {
              enemyExplodeSound.setBuffer(buffer);
              enemyExplodeSound.setLoop(false);
              if(enemyExplodeSound.isPlaying){
                enemyExplodeSound.stop();
              }
              enemyExplodeSound.setVolume(0.6);
              enemyExplodeSound.play();
            });
            
            const indexEnemy = enemiesOnScreen.indexOf(enemy);
            deadEnemies.push(textureOnScreen[indexEnemy].object);
            enemiesOnScreen.splice(indexEnemy, 1);
            textureOnScreen.splice(indexEnemy, 1);
            
            setEnemiesCounter();
            
            shot.removeFromParent();
            const indexShot = shots.indexOf(shot);
            shots.splice(indexShot, 1);
            decrementaShots();
            setCanCreateShot();

            createExplosion(enemy.position, type);

            removeShot(shot.name);
          }   
        }
      }
    }
  }

  if(type === 6){
    for(const hp of lifeOnScreen){
      if(detectCollisionCubes(hp, boxPlane) && airplaneHp < 5){
        lifeOnScreen.splice(lifeOnScreen.indexOf(hp), 1);
        hp.removeFromParent();
        dano = -1;
      }
    }
  }

  return dano;
}

function createExplosion(position, type) {
/**
 * tipo 1: Player x Inimigo
 * tip2 2: Player x TiroAereo
 * tipo 3: Player x TiroTerrestre
 * tipo 4: TiroPlayer x InimigoAereo
 * tipo 5: MisselPlayer x InimigoTerrestre
 */
  if(type === 1)
    var planeGeometry = new THREE.PlaneBufferGeometry(10, 10, 100, 100);

  if(type === 2)
    var planeGeometry = new THREE.PlaneBufferGeometry(4, 4, 100, 100);

  if(type === 3)
    var planeGeometry = new THREE.PlaneBufferGeometry(6, 6, 100, 100);

  if(type === 4)
    var planeGeometry = new THREE.PlaneBufferGeometry(10, 10, 100, 100);

  if(type === 5)
    var planeGeometry = new THREE.PlaneBufferGeometry(15, 15, 100, 100);

  var textura1 = textureLoader.load('./assets/textures/1.png');

  var planeMaterial = new THREE.MeshBasicMaterial({
    map: textura1,
    transparent: true, 
  });

  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  
  plane.position.set(position.x, position.y, position.z);

  var objExplosion = {
    plane,
    img: 1,
    delay: true,
  }

  explosionsOnScreen.push(objExplosion);
  scene.add(plane);
}

export function animateExplosoes() {
  for(const explosion of explosionsOnScreen) {
      if(explosion.img === 16) {
        explosion.plane.removeFromParent();
        explosionsOnScreen.splice(explosionsOnScreen.indexOf(explosion), 1);
      } else {
        explosion.img++;
      }
      var textura = textureLoader.load(`./assets/textures/${explosion.img}.png`);
      explosion.plane.material.map = textura;
  }
}

export {
  deadPlayer,
}
