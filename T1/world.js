import * as THREE from  'three';
import { scene, lifeOnScreen } from './appMobile.js';
import { degreesToRadians} from '../libs/util/util.js';
import { CSG } from "../libs/other/CSGMesh.js";
import { MeshLambertMaterial } from '../build/three.module.js';


// create a sphere
//var sphereGeometry = new THREE.SphereGeometry( 1500, 32, 150 );
//var sphereMaterial = new THREE.MeshLambertMaterial();

//var sphere = new THREE.Mesh(sphereGeometry);
//sphere.position.set(0,0,0);

//-- SET WATER SHADER -----------------------------------------------------------------------------

// create a texture
var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load('./assets/textures/deathstar.jpg');

// create a cylinder
var cylinderGeometry1 = new THREE.CylinderGeometry( 3200, 3200, 800, 300 );
var cylinderGeometry2 = new THREE.CylinderGeometry( 3150, 3150, 300, 300 );
var cylinderMaterial = new THREE.MeshLambertMaterial();

cylinderMaterial.map = texture;
cylinderMaterial.map.wrapS = THREE.RepeatWrapping;
cylinderMaterial.map.wrapT = THREE.RepeatWrapping;
//cylinderMaterial.map.minFilter = THREE.LinearFilter;
cylinderMaterial.map.magFilter = THREE.NearestFilter;

// cylinders
var cylinderDir = new THREE.Mesh(cylinderGeometry1, cylinderMaterial);
cylinderDir.rotateX(degreesToRadians(90));
cylinderDir.rotateZ(degreesToRadians(90));
cylinderDir.position.set(550, -3250, 0);
cylinderDir.receiveShadow = true;

var cylinderEsq = new THREE.Mesh(cylinderGeometry1, cylinderMaterial);
cylinderEsq.rotateX(degreesToRadians(90));
cylinderEsq.rotateZ(degreesToRadians(90));
cylinderEsq.position.set(-550, -3250, 0);
cylinderEsq.receiveShadow = true;

var cylinderCenter = new THREE.Mesh(cylinderGeometry2, cylinderMaterial);
cylinderCenter.rotateX(degreesToRadians(90));
cylinderCenter.rotateZ(degreesToRadians(90));
cylinderCenter.position.set(0, -3250, 0);
cylinderCenter.receiveShadow = true;

// sphere
//var sphereGeometry = new THREE.SphereGeometry(180, 30, 30);
//var sphereMaterial = new THREE.MeshLambertMaterial();
//var galaxy = textureLoader.load('./assets/textures/galaxy.jpg');

//sphereMaterial.map = galaxy;
//sphereMaterial.map.wrapS = THREE.RepeatWrapping;
//sphereMaterial.map.wrapT = THREE.RepeatWrapping;
//sphereMaterial.map.minFilter = THREE.LinearFilter;
//sphereMaterial.map.magFilter = THREE.NearestFilter;

//var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

export function criaWorld(){
    scene.add(cylinderDir, cylinderEsq, cylinderCenter);
    console.log(cylinderCenter.position);
}

export function rotateWorld(){
    cylinderCenter.rotateY(-3.14/600);
    cylinderDir.rotateY(-3.14/600);
    cylinderEsq.rotateY(-3.14/600);
}
