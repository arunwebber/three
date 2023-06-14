import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GUI } from 'dat.gui';

const App = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const selectedObjectRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, raycaster;
    let gui;

    const init = () => {
      // Create a scene
      scene = new THREE.Scene();

      // Create a perspective camera
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      // Create a WebGL renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Create a raycaster
      raycaster = new THREE.Raycaster();

      // Create GUI panel
      gui = new GUI();

      // GUI controls
      const spareObjectControls = {
        size: 1,
        color: '#ff0000',
        positionX: 0,
        positionY: 0,
        positionZ: 0,
      };

      const sizeController = gui.add(spareObjectControls, 'size', 1, 5).name('Size');
      sizeController.onChange((value) => {
        selectedObjectRef.current.scale.set(value, value, value);
      });

      const colorController = gui.addColor(spareObjectControls, 'color').name('Color');
      colorController.onChange((value) => {
        selectedObjectRef.current.material.color.set(value);
      });

      const positionFolder = gui.addFolder('Position');
      positionFolder
        .add(spareObjectControls, 'positionX', -5, 5)
        .name('X')
        .onChange((value) => {
          selectedObjectRef.current.position.x = value;
        });
      positionFolder
        .add(spareObjectControls, 'positionY', -5, 5)
        .name('Y')
        .onChange((value) => {
          selectedObjectRef.current.position.y = value;
        });
      positionFolder
        .add(spareObjectControls, 'positionZ', -5, 5)
        .name('Z')
        .onChange((value) => {
          selectedObjectRef.current.position.z = value;
        });
      positionFolder.open();

      // Event listeners
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Render the scene
      render();
    };

    const handleMouseDown = (event) => {
      event.preventDefault();

      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouseRef.current, camera);

      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        selectedObjectRef.current = intersects[0].object;
      } else {
        createSpareObject();
      }
    };

    const handleMouseMove = (event) => {
      event.preventDefault();
    
      if (selectedObjectRef.current) {
        const { x, y } = selectedObjectRef.current.position || { x: 0, y: 0 };
    
        mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        raycaster.setFromCamera(mouseRef.current, camera);
    
        const intersects = raycaster.intersectObjects(scene.children);
    
        if (intersects.length > 0) {
          const { x: newX, y: newY } = intersects[0].point;
          selectedObjectRef.current.position.set(newX, newY, 0);
        } else {
          selectedObjectRef.current.position.set(x, y, 0);
        }
      }
    };
    

    const handleMouseUp = () => {
      selectedObjectRef.current = null;
    };

    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    };

    const createSpareObject = () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const object = new THREE.Mesh(geometry, material);
      scene.add(object);
      selectedObjectRef.current = object;
    };

    // Initialize the application
    init();

    // Clean up on unmount
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} />;
};

export default App;