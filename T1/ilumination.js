import * as THREE from  'three';

export function createLight(scene){
    var lightPosition = new THREE.Vector3(10.0, 40,0);
    var lightColor = "rgb(255,255,255)"; 

    var dirLight = new THREE.DirectionalLight(lightColor);
    setDirectionalLighting(scene, dirLight, lightPosition);

    dirLight.castShadow = true;
    
    return dirLight;
}

function setDirectionalLighting(scene, dirLight, position){
  dirLight.position.copy(position);
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.castShadow = true;

  dirLight.shadow.camera.near = 20;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.top = 5;
  dirLight.shadow.camera.bottom = -5;
  dirLight.name = "Direction Light";

  scene.add(dirLight);
}

export function hideLights(dirLight){
   dirLight.visible = false;
}