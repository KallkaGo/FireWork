import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import * as dat from "dat.gui";
import { FireWork } from "./firework";

let debugShow = false
const debugObject = {
  pointSize: 40,
  explodePointSize:20
  
}

//创建gui对象
if (window.location.hash === '#debug') debugShow = true
if (debugShow) {
  const gui = new dat.GUI({width:400});
  gui.add(debugObject, 'pointSize').min(0).max(100).step(0.01).name('烟花初始粒子大小')
  gui.add(debugObject,'explodePointSize').min(0).max(50).step(0.01).name('烟花爆炸粒子大小')
}




// 初始化场景
const scene = new THREE.Scene();

// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerHeight / window.innerHeight,
  0.1,
  1000
);
// 设置相机位置
// object3d具有position，属性是1个3维的向量
camera.position.set( 6,4,15)
// 更新摄像头
camera.aspect = window.innerWidth / window.innerHeight;
//   更新摄像机的投影矩阵
camera.updateProjectionMatrix();
scene.add(camera);


// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 0.1;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.BasicShadowMap;
// renderer.shadowMap.type = THREE.VSMShadowMap;

// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);

// 监听屏幕大小改变的变化，设置渲染的尺寸
window.addEventListener("resize", () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  //   更新摄像机的投影矩阵
  camera.updateProjectionMatrix();

  //   更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  //   设置渲染器的像素比例
  renderer.setPixelRatio(window.devicePixelRatio);
});

// 将渲染器添加到body
document.body.appendChild(renderer.domElement);

// 初始化控制器
const controls = new OrbitControls(camera, renderer.domElement);










// 设置控制器阻尼
controls.enableDamping = true;
// 设置自动旋转
// controls.autoRotate = true;

let fireWorks = [];

const createFireWork = () => { 
  let color = `hsl(${Math.floor(Math.random() * 360)},100%,80%)`;
  let position = {
    x: (Math.random() - 0.5) * 10,
    y: Math.random() + 5,
    z: (Math.random() - 0.5) * 10,
  };
  let fireWork = new FireWork(color, position);
  if (debugShow) {
    fireWork.material.uniforms.uSize.value = debugObject.pointSize
    fireWork.boomMaterial.uniforms.uSize.value = debugObject.explodePointSize
  } 
  fireWork.addScene(scene, camera);
  fireWorks.push(fireWork);
};

const handleClick = (e) => {
  if(e.keyCode === 69) createFireWork()
}


// 监听事件
window.addEventListener("keyup", handleClick);


//magic
const t1 = gsap.timeline({ defaults: { duration: 2, } })
t1.fromTo('nav',{y:"100%"},{y:"-80%"})


const clock = new THREE.Clock();
function animate(t) {
  const elapsedTime = clock.getElapsedTime();
  controls.update()
  // update firework
  fireWorks.forEach((item, index) => {
    const res = item.updateTime();
    if (res === "remove") fireWorks.splice(index, 1);
  });
 
  requestAnimationFrame(animate);
  // 使用渲染器渲染相机看这个场景的内容渲染出来
  
  renderer.render(scene, camera);
}

animate();
