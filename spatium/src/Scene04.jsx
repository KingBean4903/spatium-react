import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { OrbitControls, useGLTF, Html, Center, PointerLockControls, useTexture } from '@react-three/drei'
import luxuryFile from './assets/luxury.glb';
import villaFile from './assets/villa.glb';
import modernApt from './assets/apartment_floor_plan.glb';
import aprtFile from './assets/apartment.glb';
import aprtPlan from './assets/apartment_plan/source/apartment2.glb';

function SceneContent({ sceneFile, markers, setMarkers, selectedMarker, setSelectedMarker, initialCameraPos }) {

								const gltf = useLoader(GLTFLoader, sceneFile);
								const [colliders, setColliders] = useState([]);
								const { camera } = useThree();
								const [meshComments, setMeshComments] = useState([]);	
								const controlsRef = useRef();

								// In SceneContent, add debounce ref
								const clickTimeout = useRef(null);
								const isProcessingClick = useRef(false);

								useEffect(() => {

																if (gltf.scene) {
																								const meshes = [];

																								const box    = new THREE.Box3().setFromObject(gltf.scene);
																								const center = box.getCenter(new THREE.Vector3());
																								const size   = box.getSize(new THREE.Vector3());

																								gltf.scene.position.sub(center);

																								const boundaries = {
																																minX: -size.x / 2,
																																maxX: size.x / 2,
																																minZ: -size.z / 2,
																																maxZ: size.z / 2,
																																minY: 0,
																																maxY: size.y * 2
																								};

																								console.log('Room boundaries:', boundaries);

																								const maxDim = Math.max(size.x, size.y, size.z);
																								const distance = maxDim * 1.2;

																								camera.position.set(distance, distance, distance);
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

								useEffect(() => {
																if (selectedMarker) {
																												const navigate = () => {
																														if (!controlsRef.current) {
																																setTimeout(navigate, 50);
																																return;
																														}
																																				// Check if reset
																														if (selectedMarker.reset) {
																																camera.position.copy(initialCameraPos);
																																controlsRef.current.target.set(0, 0, 0);
																																controlsRef.current.update();
																																console.log('View reset');
																																setSelectedMarker(null);
																																return;
																														}
																														
																														const targetPos = selectedMarker.position.clone();
																														
																														// Calculate appropriate distance based on nearby objects
																														let optimalDistance = 5; // Default
																														
																														if (colliders.length > 0) {
																																// Find meshes near the marker
																																const nearbyMeshes = colliders.filter(mesh => {
																																		const meshPos = new THREE.Vector3();
																																		mesh.getWorldPosition(meshPos);
																																		return meshPos.distanceTo(targetPos) < 10; // Within 10 units
																																});
																																
																																if (nearbyMeshes.length > 0) {
																																		// Calculate bounding box of nearby area
																																		const box = new THREE.Box3();
																																		nearbyMeshes.forEach(mesh => box.expandByObject(mesh));
																																		const size = box.getSize(new THREE.Vector3());
																																		
																																		// Set distance based on room size
																																		const maxDim = Math.max(size.x, size.y, size.z);
																																		optimalDistance = maxDim * 0.5; // 20% larger than room
																																		
																																		console.log('Room size:', size, 'Optimal distance:', optimalDistance);
																																}
																														}
																														
																														// Position camera at calculated distance
																														const angle = Math.PI / 4; // 45 degrees
																														const newCameraPos = new THREE.Vector3(
																																targetPos.x + optimalDistance * Math.cos(angle),
																																targetPos.y + optimalDistance * 0.8, // Height
																																targetPos.z + optimalDistance * Math.sin(angle)
																														);
																														
																														camera.position.copy(newCameraPos);
																														controlsRef.current.target.copy(targetPos);
																														controlsRef.current.update();
																														
																														console.log('Navigated to:', selectedMarker.name);
																														setSelectedMarker(null);
																												};
																												
																												navigate();
																}
								}, [ selectedMarker, camera, setSelectedMarker ])

								/* useFrame(() => {
																if (controlsRef.current && colliders.length > 0) {
																								const boundaries = colliders[0]?.userData.boundaries;

																								if (boundaries) {
																																const target = controlsRef.current.target;

																																target.x = THREE.MathUtils.clamp(target.x, boundaries.minX, boundaries.maxX);
																																target.y = THREE.MathUtils.clamp(target.y, boundaries.minY, boundaries.maxY);
																																target.z = THREE.MathUtils.clamp(target.z, boundaries.minZ, boundaries.maxZ);

																																controlsRef.current.update();
																								}
																}
								})*/

										// Click to add markers
										const handleSceneClick = (e) => {
																  console.log('Click detected:', e);
																		console.log('Shift key pressed:', e.shiftKey);
																		console.log('Click point:', e.point);
								   e.stopPropagation();

																								// Prevent multiple rapid clicks
																		if (isProcessingClick.current) return;
																		
																		// Clear any pending clicks
																		if (clickTimeout.current) {
																				clearTimeout(clickTimeout.current);
																		}

								      // Debounce the click
										clickTimeout.current = setTimeout(() => {
												isProcessingClick.current = true;

												if (e.shiftKey) {
												
																				e.stopPropagation();
																				const markerName = prompt('Enter room/area name:');
																				if (!markerName) return;
																				
																				setMarkers(prev => [...prev, {
																						name: markerName,
																						position: e.point.clone()
																				}]);
												} else {

																				 // Add comment to clicked mesh
																				const clickedMesh = e.object;
																				
																				const comment = prompt('Add comment to this object:');
																				if (comment)  {
																				
																				const newComment = {
																						mesh: clickedMesh,
																						text: comment,
																						position: e.point.clone()
																				};
																				
																				setMeshComments(prev => [...prev, newComment]);
																				console.log('Added comment:', comment, 'to', clickedMesh.name);
												}
												}
																		 isProcessingClick.current = false;
										}, 200);
										};


								return (
																								<>
																																      <ambientLight intensity={0.8} />
																																						<directionalLight position={[10, 10, 10]} intensity={0.5} />
																																						<directionalLight position={[-10, 10, -10]} intensity={0.3} />
																																						
																																						<primitive 
																																								object={gltf.scene}
																																								onClick={handleSceneClick}
																																						/>
																																								
																																								{/* Mesh Comments */}
																																				{meshComments.map((comment, i) => (
																																						<Html key={i} position={comment.position} center>
																																								<div style={{
																																										background: 'rgba(255, 200, 0, 0.9)',
																																										color: 'black',
																																										padding: '8px 12px',
																																										borderRadius: '6px',
																																										fontSize: '12px',
																																										maxWidth: '200px',
																																										boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
																																										position: 'relative'
																																								}}>
																																										{comment.text}
																																										<button
																																												onClick={(e) => {
																																														e.stopPropagation();
																																														setMeshComments(prev => prev.filter((_, idx) => idx !== i));
																																												}}
																																												style={{
																																														position: 'absolute',
																																														top: '-8px',
																																														right: '-8px',
																																														background: 'red',
																																														color: 'white',
																																														border: 'none',
																																														borderRadius: '50%',
																																														width: '20px',
																																														height: '20px',
																																														cursor: 'pointer',
																																														fontSize: '12px',
																																														lineHeight: '1'
																																												}}
																																										>
																																												✕
																																										</button>
																																								</div>
																																						</Html>
																																				))} 
																																						
																																						{/* Room markers */}
																																						{markers.map((marker, i) => (
																																								<group key={i} position={marker.position}>
																																										<mesh position={[0, 0.5, 0]}>
																																												<cylinderGeometry args={[0.3, 0.3, 1, 16]} />
																																												<meshBasicMaterial color="cyan" transparent opacity={0.6} />
																																										</mesh>
																																										<Html position={[0, 1.2, 0]} center>
																																												<div style={{
																																														background: 'rgba(0, 200, 255, 0.9)',
																																														color: 'white',
																																														padding: '6px 12px',
																																														borderRadius: '6px',
																																														fontSize: '14px',
																																														whiteSpace: 'nowrap',
																																														fontWeight: 'bold'
																																												}}>
																																														{marker.name}
																																												</div>
																																										</Html>
																																								</group>
																																						))}
																																						
																																						<OrbitControls 
																																								ref={controlsRef}
																																								enableDamping
																																								dampingFactor={0.05}
																																								minDistance={5}
																																								maxDistance={100}
																																								maxPolarAngle={Math.PI / 2}
																																						/>
																																						
																																						<axesHelper args={[5]} />
																								</>
								)
}

export function ApartmentScene() {
								
								const gltf = useLoader(GLTFLoader, aprtPlan);

								const [markers, setMarkers] = useState([]);
								const [selectedMarker, setSelectedMarker] = useState(null);

								// In GlbScene, add initial camera position ref
								const initialCameraPos = useRef(new THREE.Vector3(10, 10, 10));

								// Add reset handler
								const handleResetView = () => {
										setSelectedMarker({ reset: true }); // Trigger reset via selectedMarker
								};

								return(
																<div style={{ width: '100vw', 
																								      height: '100vh',
																								      position: 'relative'
																}}>
																	<div style={{
																								position: 'absolute',
																								top: '20px',
																								left: '20px',
																								background: 'rgba(0,0,0,0.7)',
																								color: 'white',
																								padding: '15px',
																								borderRadius: '8px',
																								zIndex: 10,
																								fontFamily: 'sans-serif',
																								fontSize: '14px'
																						}}>
																								<p style={{ margin: '5px 0' }}>🖱️ Drag to rotate</p>
																								<p style={{ margin: '5px 0' }}>🔍 Scroll to zoom</p>
																								<p style={{ margin: '5px 0' }}>⇧ Shift+Click to add room marker</p>
																</div>

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

																								<div style={{
																										position: 'absolute',
																										top: '20px',
																										left: '20px',
																										background: 'rgba(0,0,0,0.7)',
																										color: 'white',
																										padding: '15px',
																										borderRadius: '8px',
																										zIndex: 10,
																										fontFamily: 'sans-serif',
																										fontSize: '14px'
																								}}>
																										<p style={{ margin: '5px 0' }}>🖱️ Drag to rotate</p>
																										<p style={{ margin: '5px 0' }}>🔍 Scroll to zoom</p>
																										<p style={{ margin: '5px 0' }}>⇧ Shift+Click to add marker</p>
																										<button
																												onClick={handleResetView}
																												style={{
																														marginTop: '10px',
																														padding: '8px 16px',
																														background: 'rgba(0, 200, 255, 0.8)',
																														border: 'none',
																														borderRadius: '6px',
																														color: 'white',
																														cursor: 'pointer',
																														fontSize: '14px',
																														width: '100%'
																												}}
																										>
																												🏠 Reset View
																										</button>
																								</div>

																						<Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
																								<SceneContent 
																										sceneFile={aprtPlan}
																										markers={markers}
																										setMarkers={setMarkers}
																										selectedMarker={selectedMarker}
																										setSelectedMarker={setSelectedMarker}
																								  initialCameraPos={initialCameraPos.current}
																								/>
																						</Canvas>

																</div>
								);
								
}
