import React from 'react'
import { useDroppable } from '@dnd-kit/core';

export function TodoColumn(props) {

								const {isOver, setNodeRef} = useDroppable({
																id: `${props.id}`
								})

								const style = {
																background: isOver ? '#f5f5f5' : undefined,
								};

								return(
																<div style={style} ref={setNodeRef} className="column">
																  {props.children}	
																</div>
								)
}
