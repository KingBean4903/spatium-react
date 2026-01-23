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
																								<meshBasicMaterial color="#AAAAAA" />
																</mesh>
								)
}

function Cube(props) {

								const cubeRef = useRef();

								return(
																<mesh 
																								{...props}
																								ref={cubeRef}
																								>
																								<boxGeometry args={[4, 4, 4]} />
																								<meshBasicMaterial color="#ff0000" wireframe={true} />
																</mesh>
								)
}

function Sphere(props) {

								const spRef = useRef();

								return(
																<mesh
																								{...props}
																								ref={spRef}>
																								<sphereGeometry args={[ 4, 20, 20 ]} />
																								<meshBasicMaterial color="#7777ff" wireframe={true} />
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
																								<Sphere position={[ 20, 4, 2 ]} />
																								<Cube position={[ -4, 3, 0]} />
																								<Plane position={[ 15, 0, 0]} />
																								<axesHelper args={[5]} />
																</Canvas>
								)
}
