/*
 * @Author: ZH
 * @Date: 2023-01-30 15:39:38
 * @LastEditTime: 2023-02-03 21:17:44
 * @LastEditors: ZH
 * @Description:
 */
import * as THREE from "three";
import vertexShader from "../shaders/firework/vertext.glsl";
import fragmentShader from "../shaders/firework/fragment.glsl";
import bVertextShader from "../shaders/bFireWork/vertext.glsl";
import bFragmentShader from "../shaders/bFireWork/fragment.glsl";

export class FireWork {
  constructor(color, position, from = { x: 0, y: 0, z: 0 }) {
    this.color = color;
    this.position = position;
    //   计时
    this.clock = new THREE.Clock();
    // 创建烟花发射的球点
    this.Geometry = new THREE.BufferGeometry();
    const positionArr = new Float32Array(3);
    positionArr[0] = from.x;
    positionArr[0 + 1] = from.y;
    positionArr[0 + 2] = from.z;
    this.Geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positionArr, 3)
    );

    const astep = new Float32Array(3);
    astep[0] = this.position.x - from.x;
    astep[0 + 1] = this.position.y - from.y;
    astep[0 + 2] = this.position.z - from.z;

    this.Geometry.setAttribute("aStep", new THREE.BufferAttribute(astep, 3));

    // material
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0 },
        uColor: { value: new THREE.Color(this.color) },
      },
    });
    // mesh
    this.firework = new THREE.Points(this.Geometry, this.material);
    //爆炸的烟花
    this.boomGeometry = new THREE.BufferGeometry();
    //
    this.count = 360;
    const boomPositionArr = new Float32Array(this.count * 3);
    const scaleFireArray = new Float32Array(this.count);
    const directionArray = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      let i3 = i * 3;
      // 烟花的位置
      boomPositionArr[i3 + 0] = this.position.x;
      boomPositionArr[i3 + 1] = this.position.y;
      boomPositionArr[i3 + 2] = this.position.z;
      // 设置烟花粒子初始大小
      scaleFireArray[i] = Math.random();
      // 设置角度
      let theta = Math.random() * 2 * Math.PI;
      let beta = Math.random() * 2 * Math.PI;
      let radius = Math.random() * 5;

      // directionArray[i3 + 0] = radius * +(Math.sin(theta) * Math.cos(beta));
      // directionArray[i3 + 1] = radius * (Math.sin(theta) * Math.sin(beta));
      // directionArray[i3 + 2] = radius * Math.cos(theta);
      // 极坐标系下的玫瑰花曲线设置成顶点位置
      directionArray[i3 + 0] = this.Tox(i, this.j9(i));
      directionArray[i3 + 1] = this.Toy(i, this.j9(i));
      directionArray[i3 + 2] = Math.pow(
        4 *
          (directionArray[i3 + 0] * directionArray[i3 + 0] +
            directionArray[i3 + 1] * directionArray[i3 + 1]),
        0.33
      );

      this.boomGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(boomPositionArr, 3)
      );
      this.boomGeometry.setAttribute(
        "aScale",
        new THREE.BufferAttribute(scaleFireArray, 1)
      );
      this.boomGeometry.setAttribute(
        "rAngle",
        new THREE.BufferAttribute(directionArray, 3)
      );

      this.boomMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 20 },
          uColor: { value: new THREE.Color(this.color) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: bVertextShader,
        fragmentShader: bFragmentShader,
      });
      this.bFireWork = new THREE.Points(this.boomGeometry, this.boomMaterial);
    }
    // 创建音频
    this.audio = new THREE.AudioListener();
    this.sendaudio = new THREE.AudioListener();
    this.sound = new THREE.Audio(this.audio);
    this.sendSound = new THREE.Audio(this.sendaudio);
    // 创建音频加载器
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      `./assets/audio/pow${Math.floor(Math.random() * 4) + 1}.ogg`,
      (buffer) => {
        this.sound.setBuffer(buffer);
        this.sound.setLoop(false);
        this.sound.setVolume(1);
      }
    );
    audioLoader.load(`./assets/audio/send.mp3`, (buffer) => {
      this.sendSound.setBuffer(buffer);
      this.sound.setLoop(false);
      this.sendSound.setVolume(1);
      this.sendSound.play();
    });
  }
  addScene(scene, camera) {
    scene.add(this.firework);
    this.scene = scene;
  }
  updateTime() {
    const elapsedTime = this.clock.getElapsedTime();

    if (elapsedTime < 1) {
      this.material.uniforms.uTime.value = elapsedTime;
      this.material.uniforms.uSize.value = 50;
    } else {
      const deltime = elapsedTime - 1;
      //让点元素消失
      this.material.uniforms.uSize.value = 0;
      this.firework.clear();
      this.scene.remove(this.firework);
      this.Geometry.dispose();
      this.material.dispose();
      if (!this.sound.isPlaying && !this.play) {
        this.sound.play();
        this.play = true;
      }
      //加入爆炸烟花
      this.scene.add(this.bFireWork);
      this.boomMaterial.uniforms.uTime.value = deltime;
      this.boomMaterial.uniforms.uSize.value -= 0.1;
      if (this.boomMaterial.uniforms.uSize.value < 0) {
        this.boomMaterial.uniforms.uSize.value = 0;
      }
      if (deltime > 3) {
        this.bFireWork.clear();
        this.boomGeometry.dispose();
        this.boomMaterial.dispose();
        this.scene.remove(this.bFireWork);
        return "remove";
      }
    }
  }
  // 极坐标转y/x坐标
  Tox(o, p) {
    return p * Math.cos((o * Math.PI) / 180);
  }
  Toy(o, p) {
    return p * Math.sin((o * Math.PI) / 180);
  }
  // 玫瑰花曲线
  j9(o) {
    return 10 * Math.cos((6 * o * Math.PI) / 180);
  }
}
