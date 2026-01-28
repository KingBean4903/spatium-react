import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Plane(props) {

								const meshRef = useRef();

								useEffect(() => { meshRef.current.rotation.x = -0.5 * Math.PI }, [])

								return(
																<mesh 
																								{...props}
																								ref={meshRef}
																								>
																								<planeGeometry args={[60, 20]} />
																								<meshLambertMaterial color="#AAAAAA" />
																</mesh>
								)
}

function Cube(props) {

								const cubeRef = useRef();

								useFrame((state, delta) => {
																cubeRef.current.rotation.x += 0.02;
																cubeRef.current.rotation.y += 0.02;
																cubeRef.current.rotation.z += 0.02;
								})

								return(
																<mesh 
																								{...props}
																								ref={cubeRef}
																								>
																								<boxGeometry args={[4, 4, 4]} />
																								<meshLambertMaterial color="#ff0000"  />
																</mesh>
								)
}

function Sphere(props) {

								const spRef = useRef();
								let step = 0;

								useFrame((state, delta) => {
																step += 0.04;
																spRef.current.position.x = 20 + (10 * (Math.cos(step)));
																spRef.current.position.y = 2 + (10 * Math.abs(Math.sin(step)));
								})

								return(
																<mesh
																								{...props}
																								ref={spRef}>
																								<sphereGeometry args={[ 4, 20, 20 ]} />
																								<meshLambertMaterial color="#7777ff"  />
																</mesh>
								)
}

export function SceneTwo() {


								return(
																<Canvas 
																								camera={{ 
																																fov: 45,
																																near: 0.1,
																								        far: 1000,
																																position: [-30, 40, 30]
																								}}>
																								<spotLight 
																																color="#ffffff"
																																intensity={8000}
																																castShadow={true}
																																shadow={{
																																								mapSize: new THREE.Vector2(1024, 1024),
																																								camera: { far: 130, near: 40}
																																}}
																																position={[ -40, 40, -15 ]} 
																																
																																									/>
																								<Sphere position={[ 20, 4, 2 ]} />
																								<Cube position={[ -4, 3, 0]} />
																								<Plane position={[ 15, 0, 0]} />
																								<axesHelper args={[5]} />
																</Canvas>
								)
}
