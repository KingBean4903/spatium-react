import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import './styles.css'

function Box(props) {

								const meshRef = useRef();

								useFrame((state, delta) => {
																meshRef.current.rotation.x += 0.01;
																meshRef.current.rotation.y += 0.01;
								})

								return(
																<mesh 
																								{...props}
																								ref={meshRef}>
																								<boxGeometry args={[1,  1, 1]}  />
																								<meshBasicMaterial color='#00ff00' />
																</mesh>
								)
}


export function SceneOne() {

								return(
																<Canvas 
																								camera={{
																																fov:45,
																																near: 0.1,
																																far: 1000,
																								        position: [-3, 5, 3]
																																}}
																								>
																								<Box position={[ 1.2, 0, 0  ]} />
																						<axesHelper args={[5]} />
																								
																</Canvas>
								)

}
