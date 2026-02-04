import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { OrbitControls, useGLTF, Html, Center, PointerLockControls, useTexture } from '@react-three/drei'
import nipplejs from 'nipplejs';

import luxuryFile from '../assets/luxury.glb';
import villaFile from '../assets/villa.glb';
import modernApt from '../assets/apartment_floor_plan.glb';
import aprtFile from '../assets/apartment.glb';
import aprtPlan from '../assets/apartment_plan/source/apartment2.glb';

function MobileFirstPersonControls({ 
								colliders, 
								gltf, 
								meshComments, 
								setMeshComments }) {

							 const raycaster   = useRef(new THREE.Raycaster());
								const joystickRef = useRef(null);

								const { camera } = useThree();
								const velocity = useRef(new THREE.Vector3())
								const moveDirection = useRef({ x: 0, z: 0 });

								const SPEED = 5;
								const EYE_HEIGHT = .5;
								const FLOOR_Y = 0;
								const CEILING_Y = 3;
								const PLAYER_RADIUS = 0.3;

								const lookTouch = useRef(null);
								const lastLookPos = useRef({ x: 0, y: 0 });

								useEffect(() => {
																if (gltf?.scene) {
																const box = new THREE.Box3().setFromObject(gltf.scene);
																const center = box.getCenter(new THREE.Vector3());
																const size = box.getSize(new THREE.Vector3());

																camera.position.set(
																								center.x, 
																								EYE_HEIGHT, 
																								center.z + size.z * 0.3
																);
																camera.rotation.set(0, 0, 0);
																} else {
																					camera.position.set(0, EYE_HEIGHT, 5);
																				 camera.rotation.set(0, 0, 0);			
																}
								}, [gltf, camera])

								useEffect(() => {
																let joystick;

																if (joystickRef.current) {
																								joystick = nipplejs.create({
																																zone: joystickRef.current,
																																mode: 'static',
																																position: { left: '80px', bottom: '80px' },
																																size: 100,
																																threshold: 0.1,
																																color: 'white'
																								})
																

																joystick.on('move', (_, data) => {
																								const max = 50;
																								moveDirection.current.x = Math.max(-1, Math.min(1, data.vector.x))
																								moveDirection.current.z = Math.max(-1, Math.min(1, data.vector.y))
																})

																joystick.on('end', () => {
																								moveDirection.current.x = 0;
																								moveDirection.current.z = 0;
																});
																}

																return () => joystick?.destroy();
								}, [])

								useEffect(() => {

																const handleTouchStart  = (e) => {
																								const touch = Array.from(e.touches).find(
																																t => t.clientX > window.innerWidth / 2
																								)

																								if (!touch)  return

																								lookTouch.current = touch.identifier;
																								lastLookPos.current = { x: touch.clientX, y: touch.clientY }
																};

																const handleTouchMove = (e) => {
																								const touch = Array.from(e.touches).find(
																																t => t.identifer === lookTouch.current
																								)

																								if (!touch) return

																								const dx = touch.clientX - lastLookPos.current.x;
																								const dy = touch.clientY - lastLookPos.current.y;

																								camera.rotation.order = 'XYZ';
																								camera.rotation.y -= dx * 0.003;
																								camera.rotation.x -= dy * 0.003;

																								camera.rotation.x = Math.max(
																																-Math.PI / 2,
																																Math.min(Math.PI / 2, camera.rotation.x)
																								)

																								lastLookPos.current = { x: touch.clientX, y: touch.clientY };
																};

																const handleTouchEnd = (e) => {
																								Array.from(e.changedTouches).forEach(t => {
																																if (t.identifier === lookTouch.current) {
																																								lookTouch.current = null;
																																}
																								})
																};

																document.addEventListener('touchstart', handleTouchStart,  { passive: false });
																document.addEventListener('touchmove', handleTouchMove, { passive: false });
																document.addEventListener('touchend', handleTouchEnd);

																return () => {
																								document.removeEventListener('touchstart', handleTouchStart);
																								document.removeEventListener('touchmove', handleTouchMove);
																								document.removeEventListener('touchend', handleTouchEnd);
																}
								}, []);

								const checkCollision = (newPosition) => {
																if (!colliders || colliders.length === 0) return false;

																for (const collider of colliders) {
																								if (!collider) continue;

																								const box = new THREE.Box3().setFromObject(collider);
																								box.expandByScalar(PLAYER_RADIUS);

																								if (box.containsPoint(newPosition)) {
																																return true;
																								}
																}
																return false;
								};

								  // Movement update
										useFrame((state, delta) => {
												// Calculate movement based on camera direction
												const forward = new THREE.Vector3();
												camera.getWorldDirection(forward);
												forward.y = 0;
												forward.normalize();
												
												const right = new THREE.Vector3();
												right.crossVectors(forward, camera.up).normalize();
												
												velocity.current.set(0, 0, 0);
												velocity.current.addScaledVector(forward, -moveDirection.current.z * SPEED * delta);
												velocity.current.addScaledVector(right, -moveDirection.current.x * SPEED * delta);
												
												// Apply movement with collision
												/*const newPosition = camera.position.clone().add(velocity.current);
												newPosition.y = camera.position.y;
												
												if (!checkCollision(newPosition)) {
														camera.position.add(velocity.current);
												}*/
												
														camera.position.add(velocity.current);
								    // camera.position.add(velocity.current);
																		// Simple direct movement test (ignore camera direction for now)
																		if (moveDirection.current.x !== 0 || moveDirection.current.z !== 0) {
																				camera.position.x += moveDirection.current.x * SPEED * delta;
																				camera.position.z += moveDirection.current.z * SPEED * delta;
																				
																				console.log('New camera pos:', camera.position);
																		}
												// Floor/ceiling collision
												if (camera.position.y < FLOOR_Y + EYE_HEIGHT) {
														camera.position.y = FLOOR_Y + EYE_HEIGHT;
												}
												if (camera.position.y > CEILING_Y - 0.2) {
														camera.position.y = CEILING_Y - 0.2;
												}
										});

								  const handleAddComment = () => {
																const direction = new THREE.Vector3();
																camera.getWorldDirection(direction);

																raycaster.current.set(camera.position, direction);
																const hits = raycaster.current.intersectObjects(colliders, true);

																if (hits.length > 0 && hits[0].distance < 5) {
																								
																								const comment = prompt('Add Comment:');
																								if (comment) {
																																setMeshComments(prev => [...prev, {
																																								id: Date.now(),
																																								mesh: hits[0].object, 
																																								text: comment,
																																								position: hits[0].point.clone(),
																																								meshName: hits[0].object.name || 'Unnamed'
																																}]);
																								}
																} else { 

																								alert('Zoom in to clic better')
																}
										}

								  return (
												<>
														{/* Virtual Joystick Visual 
														{joystickActive && (
																<Html fullscreen>
																		<div style={{
																				position: 'absolute',
																				left: joystickCenter.current.x,
																				top: joystickCenter.current.y,
																				transform: 'translate(-50%, -50%)',
																				width: '100px',
																				height: '100px',
																				borderRadius: '50%',
																				border: '3px solid rgba(255, 255, 255, 0.5)',
																				pointerEvents: 'none'
																		}}>
																				<div style={{
																						position: 'absolute',
																						left: `${50 + moveDirection.current.x * 50}%`,
																						top: `${50 + moveDirection.current.z * 50}%`,
																						transform: 'translate(-50%, -50%)',
																						width: '40px',
																						height: '40px',
																						borderRadius: '50%',
																						background: 'rgba(0, 200, 255, 0.8)'
																				}} />
																		</div>
																</Html>
														)} */}
																<Html fullscreen>																	
																								<div
																								  ref={joystickRef}
																										id="joystick-zone"
																										style={{
																												position: 'absolute',
																												left: 0,
																												bottom: 0,
																												width: '40vw',
																												height: '40vh',
																												touchAction: 'none'
																										}}
																								/>

																								<div
																										style={{
																												position: 'absolute',
																												right: 0,
																												top: 0,
																												width: '60vw',
																												height: '100vh',
																												touchAction: 'none'
																										}}
																								/>
																</Html>
																		
																		
																{/* Add Comment Button */}
														<Html fullscreen>
																<button
																		onClick={handleAddComment}
																		style={{
																				position: 'absolute',
																				bottom: '4em',
																				right: '30px',
																				width: '60px',
																				height: '60px',
																				borderRadius: '50%',
																				background: 'rgba(255, 150, 0, 0.9)',
																				border: '3px solid white',
																				color: 'white',
																				fontSize: '24px',
																				cursor: 'pointer',
																				boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
																				zIndex: 1000
																		}}
																>
																		💬
																</button>
														</Html>
												</>
  );
}

function MobileSceneContent({ sceneFile, initialCameraPos, interactionMode, useMobileFPS }) {

								const [meshComments, setMeshComments] = useState([]);

								const gltf = useLoader(GLTFLoader, sceneFile);
								const { camera } = useThree();
								const controlsRef = useRef();
								const [colliders, setColliders] = useState([]);

								useEffect(() => {
if (gltf.scene) {

																								const meshes = [];
																								const box = new THREE.Box3().setFromObject(gltf.scene);
																								const center = box.getCenter(new THREE.Vector3());
																								const size = box.getSize(new THREE.Vector3());

																								gltf.scene.position.sub(center);

																								const maxDim = Math.max(size.x, size.y, size.z);
																								const distance = maxDim * 2.5;
																								
																								camera.position.set(
																																								distance * 0.7,
																																								distance * 0.8, 
																																								distance * 0.7);
																								camera.lookAt(0, 0, 0);
																								
																								gltf.scene.traverse((child) => {
																																if (child.isMesh) {
																																								child.material = child.material.clone();
																																								meshes.push(child);
																																}
																								});
																								setColliders(meshes);
																}
								}, [gltf, camera])

								/*useEffect(() => {
																const navigate = () => {
																								if (!controlsRef.current) {
																																setTimeout(navigate, 50);
																																return;
																								}

																								const angle = Math.PI / 4;
																								
																						const newCameraPos = new THREE.Vector3(
																								targetPos.x + optimalDistance * Math.cos(angle),
																								targetPos.y + optimalDistance * 0.8, // Height
																								targetPos.z + optimalDistance * Math.sin(angle)
																						);
																						
																						camera.position.copy(newCameraPos);
																						controlsRef.current.target.copy(targetPos);
																						controlsRef.current.update();
																};
																navigate();
								}, []) */

								return (
																<>
																						<ambientLight intensity={0.8} />
																						<directionalLight position={[10, 10, 10]} intensity={0.5} />
																						<directionalLight position={[-10, 10, -10]} intensity={0.3} />
																						
																						<primitive object={gltf.scene} />
																								
																								  {useMobileFPS ? (
																																<MobileFirstPersonControls 
																																		colliders={colliders}
																																		meshComments={meshComments}
																																  setMeshComments={setMeshComments}
																																		gltf={gltf} />

																																) : (
																										<OrbitControls 
																																ref={controlsRef}
																																enableDamping
																																dampingFactor={0.05}
																																minDistance={1}
																																maxDistance={100}
																																maxPolarAngle={Math.PI / 1.5}
																																enablePan={true}
																																panSpeed={1.2}
																																rotateSpeed={0.8}
																																enableZoom={true}
																																zoomSpeed={1.5}
																																zoomToCursor={true}
																																touches={{
																																								ONE: THREE.TOUCH.ROTATE,
																																								TWO: THREE.TOUCH.DOLLY_PAN
																																}}
																																enabled={interactionMode=== 'view' }
																														/> )}

																								{/* Render comment pins */}
																								{meshComments.map((comment, i) => (
																										<group key={comment.id} position={comment.position}>
																												<mesh>
																														<sphereGeometry args={[0.15, 16, 16]} />
																														<meshBasicMaterial color="orange" />
																												</mesh>
																												<Html position={[0, 0.3, 0]} center>
																														<div style={{
																																background: 'orange',
																																color: 'white',
																																width: '24px',
																																height: '24px',
																																borderRadius: '50%',
																																display: 'flex',
																																alignItems: 'center',
																																justifyContent: 'center',
																																fontSize: '12px',
																																fontWeight: 'bold',
																																border: '2px solid white'
																														}}>
																																{i + 1}
																														</div>
																												</Html>
																										</group>
																								))}
																     
																						
																						<axesHelper args={[5]} />	
																								
																</>
								)
}



export default function MobileScene() {

								const gltf = useLoader(GLTFLoader, aprtPlan);
								const [useMobileFPS, setUseMobileFPS] = useState(false); // Add this
								const initialCameraPos = useRef(new THREE.Vector3(10, 10, 10));
								const [interactionMode, setInteractionMode] = useState('view');

								return (
																<div style={{ width: '100vw', 
																								      height: '100vh', 
																																position: 'relative' }}>
																{/* View Mode Toggle Buttons */}
														<div style={{
																position: 'absolute',
																top: '20px',
																left: '50%',
																transform: 'translateX(-50%)',
																display: 'flex',
																gap: '10px',
																zIndex: 10
														}}>
																<button
																		onClick={() => setUseMobileFPS(false)}
																		style={{
																				padding: '10px 20px',
																				background: !useMobileFPS ? 'rgba(0, 200, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
																				color: 'white',
																				border: !useMobileFPS ? '2px solid white' : 'none',
																				borderRadius: '8px',
																				cursor: 'pointer',
																				fontSize: '14px',
																				fontWeight: 'bold'
																		}}
																>
																		🏛️ Isometric
																</button>
																<button
																		onClick={() => setUseMobileFPS(true)}
																		style={{
																				padding: '10px 20px',
																				background: useMobileFPS ? 'rgba(0, 200, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
																				color: 'white',
																				border: useMobileFPS ? '2px solid white' : 'none',
																				borderRadius: '8px',
																				cursor: 'pointer',
																				fontSize: '14px',
																				fontWeight: 'bold'
																		}}
																>
																		👤 First Person
																</button>
														</div>
														
														{/* Instructions */}
														<div style={{
																position: 'absolute',
																bottom: '20px',
																left: '20px',
																background: 'rgba(0,0,0,0.7)',
																color: 'white',
																padding: '15px',
																borderRadius: '8px',
																zIndex: 10,
																fontFamily: 'sans-serif',
																fontSize: '14px'
														}}>
																{useMobileFPS ? (
																		<>
																				<p style={{ margin: '5px 0' }}>👈 Left side: Move</p>
																				<p style={{ margin: '5px 0' }}>👉 Right side: Look</p>
																		</>
																) : (
																		<>
																				<p style={{ margin: '5px 0' }}>🖱️ Drag to rotate</p>
																				<p style={{ margin: '5px 0' }}>🔍 Pinch to zoom</p>
																				<p style={{ margin: '5px 0' }}>✌️ Two fingers to pan</p>
																		</>
																)}
														</div>

																						<Canvas camera={{ position: [10, 10, 10], fov: 65 }}>
																								<MobileSceneContent
																										sceneFile={aprtPlan}
																								  useMobileFPS={useMobileFPS}
																								  interactionMode={interactionMode}
																								  initialCameraPos={initialCameraPos.current}
																								/>
																						</Canvas>

																</div>
								)
}
