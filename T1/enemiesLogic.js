import * as THREE from  'three';
import { scene} from './appMobile.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';

/**
 * CIMA -> 300
 * LADOS -> -350 e 350
 */

// inicialize elements -------------------------------------------------------------------------------------------------------------
var enemiesOnScreenCounter = 0;
var enemyMaterialAir = new THREE.MeshLambertMaterial({color: "rgb(250, 0, 100)"});
var enemyMaterialGround = new THREE.MeshLambertMaterial({color: "rgb(250, 0, 150)"});
var enemyGeometryAir = new THREE.BoxGeometry(12, 12, 12);
var enemyGeometryGround = new THREE.BoxGeometry(14, 10, 14);
// create vet of enemies -----------------------------------------------------------------------------------------------------------
var enemiesOnScreen = [];
let textureOnScreen = [];

var airEnemiesShotsOnScreen = [];
var groundEnemiesShotOnScreen = [];

export function moveEnemies() {
  for(const enemy of enemiesOnScreen) {
    const aux = textureOnScreen[enemiesOnScreen.indexOf(enemy)];
    
    if(aux !== undefined && aux.object){
      enemy.translateX(enemy.speedX);
      enemy.translateZ(enemy.speedZ);
    
      aux.object.translateX(enemy.speedX);
      aux.object.translateZ(enemy.speedZ);

      if(enemy.isArch) {
        enemy.rotateY(enemy.spin);
        aux.object.rotateY(enemy.spin);
      }
  
      if(enemy.position.z > 110 || enemy.position.x < -140 || enemy.position.x > 120) {
        enemy.removeFromParent();
        aux.object.removeFromParent();

        const indexToRemove = enemiesOnScreen.indexOf(enemy);
        enemiesOnScreen.splice(indexToRemove, 1);
        enemiesOnScreenCounter--;

        textureOnScreen.splice(indexToRemove);
      }
    }
  }
}

function generateEnemyVertical(type, x, z) {
  enemiesOnScreenCounter++;
  var newEnemy;
  let asset = {
    object: null,
    loaded: false,
  }

  let loader = new GLTFLoader();

    if(type === 'air') {
      loader.load( './assets/t-figther.gltf', function ( gltf ) {
        console.log('ta carregando')
        let obj = gltf.scene;
        obj.traverse( function ( child ) {
          if ( child.isMesh ) {
              child.castShadow = true;
          }
        });
        newEnemy = new THREE.Mesh(enemyGeometryAir, enemyMaterialAir);
        newEnemy.speedX = 0;
        newEnemy.speedZ = 1;
        newEnemy.position.set(x, 36, z);
        newEnemy.type = 'air';

        obj.scale.set(2.0, 2.0, 2.0);
        asset.object = gltf.scene;
        asset.object.position.set(x, 36, z);
        obj.position.set(x, 36, z);

        newEnemy.canShot = true;
    
        enemiesOnScreen.push(newEnemy);

        textureOnScreen.push(asset);
        
        newEnemy.isArch = false;

        scene.add(obj);
      }, null, null);
    } else {
      loader.load( './assets/droid-tank.gltf', function ( gltf ) {
        let obj = gltf.scene;
        obj.traverse( function ( child ) {
          if ( child.isMesh ) {
              child.castShadow = true;
          }
        });
        newEnemy = new THREE.Mesh(enemyGeometryGround, enemyMaterialGround);
        newEnemy.speedX = 0;
        newEnemy.speedZ = 0.5;
        newEnemy.position.set(x, 10, z);
        newEnemy.type = 'grd';
        obj.scale.set(0.3, 0.3, 0.3);
        asset.object = gltf.scene;
        asset.object.position.set(x, 10, z);
        obj.position.set(x, 10, z);

        newEnemy.canShot = true;
    
        enemiesOnScreen.push(newEnemy);

        textureOnScreen.push(asset);
        
        newEnemy.isArch = false;

        scene.add(obj);
      }, null, null);
    }
}

function generateEnemyHorizontal(type, x, z, side) {
  enemiesOnScreenCounter++;
  var newEnemy;
  let asset = {
    object: null,
    loaded: false,
  }
  
  let loader = new GLTFLoader();

  loader.load( './assets/t-advanced.gltf', function ( gltf ) {
    let obj = gltf.scene;
    obj.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
      }
    });
    if(type === 'air') {
      newEnemy = new THREE.Mesh(enemyGeometryAir, enemyMaterialAir);
      newEnemy.type = 'air';
      
      if(side === 'dir')
        newEnemy.speedX = 0.8;
      else
        newEnemy.speedX = -0.8;
        
        newEnemy.speedZ = 0;
        newEnemy.position.set(x, 36, z);

        obj.scale.set(1.25, 1.25, 1.25);
        asset.object = gltf.scene;
        asset.object.position.set(x, 36, z);
        obj.position.set(x, 36, z);
    } else {
      newEnemy = new THREE.Mesh(enemyGeometryGround, enemyMaterialGround);
      newEnemy.type = 'grd';
      
      if(side === 'dir')
        newEnemy.speedX = 0.8;
      else
        newEnemy.speedX = -0.8;
      
      newEnemy.speedZ = 0;
      newEnemy.position.set(x, 10, z);

      obj.scale.set(1.25, 1.25, 1.25);
      asset.object = gltf.scene;
      asset.object.position.set(x, 10, z);
      obj.position.set(x, 10, z);
    }

      newEnemy.canShot = true;
      
      enemiesOnScreen.push(newEnemy);

      textureOnScreen.push(asset);
      
      newEnemy.isArch = false;

      scene.add(obj);
    }, null, null);
  }
  
function generateEnemyDiagonal(type, x, z, hor, vert) {
  enemiesOnScreenCounter++;
  var newEnemy;
  let asset = {
    object: null,
    loaded: false,
  }

  let loader = new GLTFLoader();

  loader.load( './assets/t-advanced.gltf', function ( gltf ) {
    let obj = gltf.scene;
    obj.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
      }
    });
    if(type === 'air') {
      newEnemy = new THREE.Mesh(enemyGeometryAir, enemyMaterialAir);
      newEnemy.type = 'air';
      if(hor === 'dir')
      newEnemy.speedX = 0.75;
      else
      newEnemy.speedX = -0.75;
      
      if(vert === 'up')
      newEnemy.speedZ = -0.75;
      else
      newEnemy.speedZ = 0.75;
      
      newEnemy.position.set(x, 36, z);

      asset.object = gltf.scene;
      asset.object.position.set(x, 36, z);
      obj.position.set(x, 36, z);
    } else {
      newEnemy = new THREE.Mesh(enemyGeometryGround, enemyMaterialGround);
      newEnemy.type = 'grd';
      
      if(hor === 'dir')
      newEnemy.speedX = 0.25;
      else
      newEnemy.speedX = -0.25;
      
      if(vert === 'up')
      newEnemy.speedZ = -0.5;
      else
      newEnemy.speedZ = 0.5;
      
      newEnemy.position.set(x, 10, z);

      asset.object = gltf.scene;
      asset.object.position.set(x, 10, z);
      obj.position.set(x, 10, z);
    }
    
    newEnemy.canShot = true;

    enemiesOnScreen.push(newEnemy);

    textureOnScreen.push(asset);
    
    newEnemy.isArch = false;
    scene.add(obj);
  }, null, null);
}

function generateEnemyArco(type, x, z, rot) {
  enemiesOnScreenCounter++;
  var newEnemy;
  let asset = {
    object: null,
    loaded: false,
  }

  let loader = new GLTFLoader();

  loader.load( './assets/t-advanced.gltf', function ( gltf ) {
    let obj = gltf.scene;
    obj.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = true;
      }
    });
  
    if(type === 'air') {
      newEnemy = new THREE.Mesh(enemyGeometryAir, enemyMaterialAir);
      newEnemy.type = 'air';
      
      newEnemy.speedX = 0;
      newEnemy.speedZ = -1;
      
      if(rot === 'dir')
        newEnemy.spin = -1 * (Math.PI/180) / 4;
      else
        newEnemy.spin = 1 * (Math.PI/180) / 4;
      
      newEnemy.position.set(x, 36, z);

      obj.scale.set(1.25, 1.25, 1.25);
      asset.object = gltf.scene;
      asset.object.position.set(x, 36, z);
      obj.position.set(x, 36, z);
    } else {
      newEnemy = new THREE.Mesh(enemyGeometryGround, enemyMaterialGround);
      newEnemy.type = 'grd';
      newEnemy.speedX = 0;
      newEnemy.speedZ = 0.5;

      newEnemy.position.set(x, 10, z);

      obj.scale.set(1.25, 1.25, 1.25);
      asset.object = gltf.scene;
      asset.object.position.set(x, 10, z);
      obj.position.set(x, 10, z);
    }

    newEnemy.canShot = true;
    
    enemiesOnScreen.push(newEnemy);

    textureOnScreen.push(asset);
    
    newEnemy.isArch = true;
    scene.add(obj);
  }, null, null);
}


// auxiliar functions ---------------------------------------------------------------------------------------------------------------
export function clearEnemies(){
  for(const enemy of enemiesOnScreen){
    const index = enemiesOnScreen.indexOf(enemy);
    enemy.removeFromParent();
    textureOnScreen[index].object.removeFromParent();
  }
  enemiesOnScreen = [];
  enemiesOnScreenCounter = 0;

  textureOnScreen = [];
}

export function setEnemiesCounter(){  
  enemiesOnScreenCounter--;
}

export function resetEnemies () {
  enemiesOnScreen = [];
  enemiesOnScreenCounter = 0;

  textureOnScreen = [];
}

export function resetEnemiesShot(){
  airEnemiesShotsOnScreen = [];
  groundEnemiesShotOnScreen = [];
  groundShotCounter = 0;
  airShotCounter = 0;
}

// exports --------------------------------------------------------------------------------------------------------------------------
export {
  enemiesOnScreenCounter,
  enemiesOnScreen,
  textureOnScreen,
  groundEnemiesShotOnScreen,
  airEnemiesShotsOnScreen,
  generateEnemyArco,
  generateEnemyHorizontal,
  generateEnemyVertical,
  generateEnemyDiagonal,
}
