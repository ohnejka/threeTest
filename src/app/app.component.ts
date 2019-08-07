import {Component, ElementRef, ViewChild, OnInit} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('canvas') canvasRef: ElementRef<HTMLCanvasElement>;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;
  private requestAnimationId: number;
  private mixer: THREE.AnimationMixer;
  private clock: THREE.Clock;
  private worldMesh: THREE.Mesh;
  private worldGroup: THREE.Group;
  private mesh: THREE.Mesh;
  private cameraImported: THREE.PerspectiveCamera;

  ngOnInit(): void {
    this.initThreeJs();
  }

  private initThreeJs = () => {
    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(50,
      window.innerWidth/window.innerHeight, 0.001, 100000000);
    this.camera.position.z = 10;
    this.camera.position.y = 3;



    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvasRef.nativeElement,
    });

    this.renderer.setClearColor(0x353535);

    this.scene = new THREE.Scene();

    this.orbitControls = new OrbitControls(this.camera, this.canvasRef.nativeElement);

    const light = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(light);

    const axesHelper = new THREE.AxesHelper( 3 );
    this.scene.add( axesHelper );

    this.loadModel('./assets/polly_cam_sm.glb');
  };

  private loadModel = (url: string) => {
    const loader = new GLTFLoader();

    //Optional: Provide a DRACOLoader instance to decode compressed mesh data
    DRACOLoader.setDecoderPath( './assets/libs/draco/' );
    loader.setDRACOLoader( new DRACOLoader() );

    //Optional: Pre-fetch Draco WASM/JS module.
    DRACOLoader.getDecoderModule();

    loader.load(url, this.onLoadHandler, this.onProgressHandler, this.onLoadErrorHandler);
  }

  private onLoadHandler = (loadedModel: GLTF) => {
    console.log(loadedModel);

    this.worldGroup = loadedModel.scene.children[1] as THREE.Group;

    const material = new THREE.MeshNormalMaterial();

    this.worldGroup.children.forEach( (mesh: THREE.Mesh) => {
      mesh.material = material;
    });
    this.scene.add(this.worldGroup);

    // this.worldMesh = loadedModel.scene.getObjectByName('World') as THREE.Mesh;
    // // this.worldMesh.rotateY(135);
    // // this.worldMesh.material = new THREE.MeshBasicMaterial({color: 0xffffff});
    // this.scene.add(this.worldMesh);
    // console.log(this.worldMesh);

    // const sculptures = loadedModel.scene.getObjectByName('SCULPTURES') as THREE.Mesh;
    // sculptures.rotateY(135);
    // sculptures.material = new THREE.MeshBasicMaterial({color: 0xffffff});
    // this.scene.add(sculptures);
    // console.log(sculptures);

    // const curve = loadedModel.scene.children[0] as THREE.Mesh;
    // this.scene.add(curve);
    // console.log(curve);

    // const empty = loadedModel.scene.children[1] as THREE.Mesh;
    // this.scene.add(empty);
    // console.log(empty);

    const cameraObj = loadedModel.scene.children[0] as THREE.Mesh;
    this.scene.add(cameraObj);

    this.cameraImported = loadedModel.cameras[0] as THREE.PerspectiveCamera;
    console.log(this.cameraImported);
    const cameraHelper = new THREE.CameraHelper(this.cameraImported);
    this.scene.add(cameraHelper);


    // this.camera = camera;


    this.mixer = new THREE.AnimationMixer( this.cameraImported );
    let animation = loadedModel.animations[0];
    this.mixer.clipAction(animation).play();

    this.requestAnimationLoopStep();
  }

  private onProgressHandler = (): void => {
    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  };
  private onLoadErrorHandler = (event: ErrorEvent): void => {
    console.error('Ошибка загрузки модели', event);
  };


  private requestAnimationLoopStep = (): void => {
    this.requestAnimationId = requestAnimationFrame(this.animate);
  };


  private animate = (time: number): void => {
    this.cameraImported.up = new THREE.Vector3(0, 1, 0);
    this.cameraImported.lookAt(0, 0, 0);

    const delta = 0.5 * this.clock.getDelta();
    this.mixer.update( delta );

    this.requestAnimationLoopStep();
    this.renderer.render(this.scene, this.camera);
  };
}
