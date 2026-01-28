import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { OrbitControls, useGLTF, Center, PointerLockControls, useTexture } from '@react-three/drei'
import luxuryFile from './assets/luxury.glb';
import villaFile from './assets/villa.glb';
import modernApt from './assets/apartment_floor_plan.glb';
import aprtFile from './assets/apartment.glb';
import aprtPlan from './assets/apartment_plan/source/apartment2.glb';

function FirstPersonControls({ onLockChange, gltf, selectedMarker, isLocked, setSelectedMarker, setMarkers }) {

								const { camera, gl } = useThree();

								const controlsRef = useRef();
								const collidersReady = useRef(false);
								const colliders = useRef([]);

								const openDoors = useRef(new Set());
								
								const doorCounter = useRef(1);

								const clickedMeshes = useRef(new Map());
								const raycaster = useRef(new THREE.Raycaster());

								const moveState = useRef({
																forward: false,
																backward: false,
																left: false, 
																right: false,
								});

								const velocity  = useRef(new THREE.Vector3())
								const direction = useRef(new THREE.Vector3())
								const SPEED = 5;
								const EYE_HEIGHT = 1.9;
								const FLOOR_Y = 0;
								const CEILING_Y = 0;
								const PLAYER_RADIUS = 0.1;
								const MIN_FOV = 30;
								const MAX_FOV = 75;
								const ZOOM_SPEED = 5;


								function buildColliders() {
																								if (gltf) {
																																colliders.current = [];
																																gltf.scene.traverse((child) => {
																																								if (child.isMesh) {
																																																colliders.current.push(child);
																																								}
																																});
																								}
								}

								useEffect(() => {
																

																if (gltf.scene) {
																														const meshes = [];
																														
																														// Get bounding box of entire model
																														const box = new THREE.Box3().setFromObject(gltf.scene);
																														const center = box.getCenter(new THREE.Vector3());
																														const size = box.getSize(new THREE.Vector3());
																														
																														// Center the model at origin
																														gltf.scene.position.sub(center);
																														
																														// Position camera above to view as floor plan
																														const maxDim = Math.max(size.x, size.z);
																														camera.position.set(0, maxDim * 2, 0); // Height based on model size
																														camera.lookAt(0, EYE_HEIGHT, 0);
																														
																														console.log('Model size:', size);
																														console.log('Camera height:', maxDim * 1.5);
																}

																//camera.position.set(10, 20, 0);
																// camera.lookAt(0, 0, 0);

																const handleKeyDown = (e) =>  {
																								if (!controlsRef.current?.isLocked) return;
																								if (!collidersReady.current) return;

																								switch (e.code) {
																																case 'KeyW': moveState.current.forward = true; break;
																																case 'KeyS': moveState.current.backward = true; break;
																																case 'KeyA': moveState.current.left = true; break;
																																case 'KeyD': moveState.current.right = true; break;
																																case 'KeyM': 
																																																e.preventDefault();
																																																console.log('M clicd')
																																																// Raycast from camera to ground
																																																		const downDirection = new THREE.Vector3(0, -1, 0);
																																																		raycaster.current.set(camera.position, downDirection);
																																																		const groundHits = raycaster.current.intersectObjects(colliders, true);
																																																
																																								     if (groundHits.length > 0) {
																																																				const markerName = prompt('Enter marker name:');
																																																				if (markerName) {
																																																						setMarkers(prev => [...prev, {
																																																								name: markerName,
																																																								position: new THREE.Vector3(
																																																										camera.position.x,
																																																										0.1, // Slightly above floor
																																																										camera.position.z
																																																								)
																																																						}]);
																																																						console.log('Added marker:', markerName);
																																																				}
																																																		}
																																										break;
																																								   
																																case 'KeyE': 
																																								const direction = new THREE.Vector3();
																																								camera.getWorldDirection(direction);
																																								raycaster.current.set(camera.position, direction);
																																								const hits = raycaster.current.intersectObjects(colliders.current, true);

																																								if (hits.length > 0 && hits[0].distance < 3) {
																																																const mesh = hits[0].object;
																																																console.log('Hit mesh', mesh)

																																															/*	if (!mesh.userData.renamedDoor) {
																																																								mesh.userData.originalName = mesh.name;
																																																								mesh.name = `Door_${String(doorCounter.current).padStart(2, '0')}`
																																																								mesh.userData.renamedDoor = true;
																																																								doorCounter.current++;
																																																} */



																																																if (clickedMeshes.current.has(mesh)) {
																																																								mesh.material.color.copy(clickedMeshes.current.get(mesh))
																																																								clickedMeshes.current.delete(mesh);
																																																} else {
																																																								clickedMeshes.current.set(mesh, mesh.material.color.clone());
																																																								mesh.material.color.set(0x00ff00);
																																																}

																																																console.log('Clicd Meshes',JSON.stringify(clickedMeshes.current));

																																									//							const isDoor = mesh.name.toLowerCase().includes('door');
																																								}
																																								break;
																								}
																};

																const handleKeyUp = (e) =>  {

																								if (!controlsRef.current?.isLocked) return;
																								if (!collidersReady.current) return;

																								switch (e.code) {
																																case 'KeyW': moveState.current.forward = false; break;
																																case 'KeyS': moveState.current.backward = false; break;
																																case 'KeyA': moveState.current.left = false; break;
																																case 'KeyD': moveState.current.right = false; break;

																								}
																};

																const handleWheel = (e) => {
																								e.preventDefault();

																								camera.fov = THREE.MathUtils.clamp(
																																camera.fov + e.deltaY * 0.05,
																																MIN_FOV,
																																MAX_FOV);

																								camera.updateProjectionMatrix();
																}

																// Properly check pointer lock state
																		const handleLock = () => {
																				if (document.pointerLockElement === gl.domElement) {
																						setIsLocked(true);
																				}
																		};
																		
																		const handleUnlock = () => {
																				if (document.pointerLockElement !== gl.domElement) {
																						setIsLocked(false);
																				}
																		};

																// Prevent auto-lock on canvas click
																										const handleCanvasClick = (e) => {
																												// Only lock if clicking directly on canvas, not UI overlay
																												if (e.target.tagName === 'CANVAS' && !isLocked.current) {
																														controlsRef.current?.lock();
																												}
																										};

																document.addEventListener('keydown', handleKeyDown);
																document.addEventListener('keyup', handleKeyUp);
																		gl.domElement.addEventListener('click', handleCanvasClick);
																
																// document.addEventListener('wheel', handleWheel, { passive: false });
																//document.addEventListener('pointerlockchange', handleLock);
																//document.addEventListener('pointerlockerror', handleUnlock);
															  // Click canvas to lock
																/*				const handleClick = () => {
																						if (controlsRef.current && !isLocked) {
																								controlsRef.current.lock();
																						}
																				};
																				gl.domElement.addEventListener('click', handleClick);	*/
																								const controls = controlsRef.current;

																	if (controls && onLockChange) {
																						controls.addEventListener('lock', () => onLockChange(true));
																						controls.addEventListener('unlock', () => onLockChange(false));
																 }

																								gl.domElement.addEventListener('click', () => {
																										if (!controls.isLocked) controls.lock();
																								});

																 if (selectedMarker) {
																														camera.position.set(
																																selectedMarker.position.x,
																																EYE_HEIGHT,
																																selectedMarker.position.z
																														);
																														console.log('Navigated to:', selectedMarker.name);
																								      camera.rotation.set(0, 0, 0)
																														setSelectedMarker(null); // Reset after navigation
																}

																return () => {
																								document.removeEventListener('keydown', handleKeyDown);
																								document.removeEventListener('keyup', handleKeyUp);
																						controls.removeEventListener('lock', () => onLockChange(true));
																						controls.removeEventListener('unlock', () => onLockChange(false));
																      gl.domElement.removeEventListener('click', handleCanvasClick);
																								
																								// document.removeEventListener('wheel', handleWheel);
																								//document.removeEventListener('pointerlockchange', handleLock);
																						  //document.removeEventListener('pointerlockerror', handleUnlock);
																						  //gl.domElement.removeEventListener('click', handleClick);
																};

								}, [selectedMarker, camera, setSelectedMarker ])
								
								// Check collisions
								const checkCollision = (newPosition) => {
																
																if (!colliders || colliders.length === 0) return false;

																collidersReady.current = true;

																for (const collider of colliders.current) {
																								if (!collider) return

																								const box = new THREE.Box3().setFromObject(collider);

																								box.expandByScalar(PLAYER_RADIUS);

																								if (box.containsPoint(newPosition)) {
																																return true;
																								}

																}

																return false;
								}



								useFrame((state, delta) => {

																if (!controlsRef.current) return;

																if (!collidersReady.current && gltf?.scene) {
																								buildColliders();
																								collidersReady.current = true;
																}

																const controls = controlsRef.current;

																direction.current.set(0, 0, 0);

																// Animate doors
																openDoors.current.forEach((door) => {
																								if (door.userData.targetRotation !== undefined) {
																																door.rotation.y = THREE.MathUtils.lerp(
																																								door.rotation.y,
																																								door.userData.targetRotation,
																																								delta * 5
																																)
																								}
																});

																if (moveState.current.forward) direction.current.z -= 1;
																if (moveState.current.backward) direction.current.z += 1;
																if (moveState.current.left) direction.current.x -= 1;
																if (moveState.current.right) direction.current.x += 1;

																if (direction.current.length() > 0) {
																								direction.current.normalize();
																}

																// Apply camera rotation to movement detection
																const cameraDirection = new THREE.Vector3();
																camera.getWorldDirection(cameraDirection);
																cameraDirection.y = 0;
																cameraDirection.normalize();

																const cameraRight = new THREE.Vector3();
																cameraRight.crossVectors(camera.up, cameraDirection).normalize();

																// Calculate velocity
												velocity.current.set(0, 0, 0);
												velocity.current.addScaledVector(cameraDirection, -direction.current.z * SPEED * delta);
												velocity.current.addScaledVector(cameraRight, -direction.current.x * SPEED * delta);

																// Apply movement
								    /* const newPosition = camera.position.clone().add(velocity.current);
								    newPosition.y = camera.position.y;
																// Chec collision before moving
																if (!checkCollision(newPosition)) {
																								camera.position.add(velocity.current)
																} */									
								
								    camera.position.add(velocity.current)
																// Collision detection - Floor and Ceiling
												if (camera.position.y < FLOOR_Y + EYE_HEIGHT) {
														camera.position.y = FLOOR_Y + EYE_HEIGHT;
												}
												
												if (camera.position.y > CEILING_Y - 0.2) {
														camera.position.y = CEILING_Y - 0.2;
												}
								});

																return <PointerLockControls ref={controlsRef} />
}



export function GlbScene() {

								//const { scene } = useGLTF(aprtPlan);
								const gltf = useLoader(GLTFLoader, aprtPlan);

								const [isLocked, setIsLocked] = useState(false);
								const [markers, setMarkers]   = useState([]);
								const [selectedMarker, setSelectedMarker]   = useState(null);

								const colliders = useRef([]);


								const handleSceneClick = (e) => {
																				if (!e.shiftKey) return;
																				
																				e.stopPropagation();
																				const markerName = prompt('Enter marker name:');
																				if (!markerName) return;
																				
																				setMarkers(prev => [...prev, {
																						name: markerName,
																						position: e.point.clone()
																				}]);
  };

								return (
																<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
																						{!isLocked && (
																										<div style={{ 
																																		position: 'absolute',
																																		top: '50%',
																																		left: '50%',
																																		transform: 'translate(-50%, -50%)',
																																		color: 'white',
																																		background: 'rgba(0,0,0,0.7)',
																																		padding: '20px',
																																		borderRadius: '8px',
																																		textAlign: 'center',
																																		zIndex: 1,
																																		pointerEvents: 'none'
																																										}}>
																												<h2>Click to Play</h2>
																												<p>WASD to move</p>
																								    <p style={{ margin: '5px 0' }}>M to add marker at current position</p>
																												<p>ESC to unlock</p>
																										</div>
																						)}
																																								<div style={{
																										position: 'absolute',
																										top: '50%',
																										left: '50%',
																										transform: 'translate(-50%, -50%)',
																										width: '4px',
																										height: '4px',
																										background: 'white',
																										borderRadius: '50%',
																										pointerEvents: 'none',
																										zIndex: 2,
																										boxShadow: '0 0 0 2px black'
																								}} />

																																{/* Marker List Sidebar */}
																						<div style={{
																								position: 'absolute',
																								top: '20px',
																								right: '20px',
																								width: '250px',
																								maxHeight: '400px',
																								background: 'rgba(0, 0, 0, 0.8)',
																								borderRadius: '8px',
																								padding: '15px',
																								zIndex: 1000,
																								pointerEvents: 'auto',
																								fontFamily: 'sans-serif',
																								color: 'white',
																								overflowY: 'auto'
																						}}>
																								<h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
																										Navigation Markers ({markers.length})
																								</h3>
																								
																								{markers.length === 0 ? (
																										<p style={{ fontSize: '12px', opacity: 0.7 }}>
																												Shift+Click to add markers
																										</p>
																								) : (
																										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
																												{markers.map((marker, i) => (
																														<div
																																key={i}
																																style={{
																																		background: 'rgba(0, 200, 255, 0.2)',
																																		padding: '10px',
																																		borderRadius: '6px',
																																		cursor: 'pointer',
																																		border: '1px solid rgba(0, 200, 255, 0.5)',
																																		transition: 'all 0.2s',
																																		display: 'flex',
																																		justifyContent: 'space-between',
																																		alignItems: 'center'
																																}}
																																onClick={(e) => { e.stopPropagation(); setSelectedMarker(marker) }}
																																onMouseEnter={(e) => e.target.style.background = 'rgba(0, 200, 255, 0.4)'}
																																onMouseLeave={(e) => e.target.style.background = 'rgba(0, 200, 255, 0.2)'}
																														>
																																<span style={{ fontSize: '14px' }}>{marker.name}</span>
																																<button
																																		onClick={(e) => {
																																				e.stopPropagation();
																																				setMarkers(prev => prev.filter((_, idx) => idx !== i));
																																		}}
																																		style={{
																																				background: 'rgba(255, 0, 0, 0.6)',
																																				border: 'none',
																																				color: 'white',
																																				padding: '4px 8px',
																																				borderRadius: '4px',
																																				cursor: 'pointer',
																																				fontSize: '12px'
																																		}}
																																>
																																		✕
																																</button>
																														</div>
																												))}
																										</div>
																								)}
																						</div>


																<Canvas 
																							onPointerMissed={(e) => {
																																				// Only lock controls if clicking on canvas, not UI
																																				if (e.target.tagName === 'CANVAS') {
																																						// Controls will lock automatically
																																				}
																																		}}
																																		style={{ pointerEvents: 'auto' }}	
																								>
																								<ambientLight intensity={1} />
																								<directionalLight position={[10, 10, 10]} intensity={1}/>
																								<directionalLight position={[-10, -10, -10]} intensity={0.5}/>
																								<hemisphereLight intensity={0.5} groundColor="#444444" />
																								
																																<primitive 
																																							 onClick={handleSceneClick}	
																																								position={[0, 0, 0]}
																																								object={gltf.scene} /> 

																								{/* Show markers in scene */}
																														{markers.map((marker, i) => (
																																<group key={i} position={marker.position}>
																																		<mesh position={[0, 1, 0]}>
																																				<sphereGeometry args={[0.2, 16, 16]} />
																																				<meshBasicMaterial color="cyan" transparent opacity={0.6} />
																																		</mesh>
																																</group>
																														))}
																								

																								<FirstPersonControls  
																																gltf={gltf}	
																																onLockChange={setIsLocked} 
																																isLocked={isLocked}
																																selectedMarker={selectedMarker}
																																setMarkers={setMarkers}
																																setSelectedMarker={setSelectedMarker}
																								/>
								
																								<axesHelper args={[5]}  />
																</Canvas>

																								</div>
								)
}
