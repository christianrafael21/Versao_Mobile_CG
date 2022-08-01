import * as THREE from  'three';
import { scene, lifeOnScreen } from './appMobile.js';
import { degreesToRadians} from '../libs/util/util.js';
import { CSG } from "../libs/other/CSGMesh.js";

var hpGeometry = new THREE.ConeGeometry(4, 8, 20);
var hpMaterial = new THREE.MeshLambertMaterial({color: "rgb(0, 250, 100)"});

function vidacsg(posX,posY,posZ){

  //----------------------Create a corte 1 -----------------------------
 var geometrycube = new THREE.Mesh(new THREE.BoxGeometry( 1.1, 4, 10 ));
 geometrycube.position.set(0,8,0);
 
 ////----------------------create a corte 2 -----------------------------
 var geometrycube2 = new THREE.Mesh(new THREE.BoxGeometry( 1.1, 4, 10 ));
 geometrycube2.position.set(0,8,0);
 geometrycube2.rotateZ(80.11);
 
 //----------------------Create a cylinder 1 -----------------------------
 var cylinderCSG = new THREE.Mesh(new THREE.CylinderGeometry( 1, 4, 0.1, 18 ));
 cylinderCSG.position.set(0,8,0);
 cylinderCSG.rotateX(degreesToRadians(-90));
 
 // CSG
 cylinderCSG.matrixAutoUpdate = false;
 cylinderCSG.updateMatrix();
 geometrycube.matrixAutoUpdate = false;
 geometrycube.updateMatrix();
 geometrycube2.matrixAutoUpdate = false;
 geometrycube2.updateMatrix();
 var vida = CSG.fromMesh(cylinderCSG);
 var corte1 = CSG.fromMesh(geometrycube);
 var corte2 = CSG.fromMesh(geometrycube2);
 var corteCSG = vida.subtract(corte1);
 var corteCSG2 = corteCSG.subtract(corte2);
 var life = CSG.toMesh(corteCSG2, new THREE.Matrix4());
 life.material = new THREE.MeshPhongMaterial ({color : "rgb(200,0,0)"});
 life.scale.set(1.5,1.5,1.5);
 
 life.position.set(posX,posY,posZ);
 return life;
}
//vidacsg(scene,0,15,0);

//função de geração das vidas
export function generateLife(type, x, z) {
  var lifeAux = vidacsg(x, 25, z);

  if(type === 'lifeV') {
    lifeAux.speedX = 0;
    lifeAux.speedZ = 1;
    lifeAux.type = 'lifeV';
  }

  lifeOnScreen.push(lifeAux);
  
  scene.add(lifeAux);
}

// função de movimentação da vidaCSG
export function movelife() {
  for(const life of lifeOnScreen) {
    const indexToRemove = lifeOnScreen.indexOf(life);

    life.translateX(life.speedX);
    life.translateZ(life.speedZ);

    if(life.isArch)
      life.rotateY(life.spin);
  
    if(life.position.z > 120 || life.position.x < -120 || life.position.x > 120) {
      life.removeFromParent();
      lifeOnScreen.splice(indexToRemove, 1);
    }
  }
}