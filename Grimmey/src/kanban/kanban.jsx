import React, { useState } from 'react'
import { TodoColumn } from './todo.jsx'
import { DndContext, useDraggable } from '@dnd-kit/core';

export function KanbanBoard() {

								const [tasks, setTasks] = useState({
																freezer: ['drag1', 'drag2', 'drag3'],
																todo: [],
																doing: [],
																done: [],
																compost: []
								});

								const [activeId, setActiveId] = useState(null);

								function handleDragStart(event) {
																setActiveId(event.active.id);
								}

								function handleDragEnd(event) {

																const { active, over } = event;

																if (!over) return;

																const activeContainer = findContainer(active.id);
																const overContainer = over.id.includes('drag') 
																																								? findContainer(over.id) : over.id;

																if (!activeContainer || !overContainer) return;

																setTasks(prev => {

																								const activeItems = prev[activeContainer];
																								const overItems   = prev[overContainer];

																								const activeIndex = activeItems.indexOf(active.id);
																								const overIndex   = overItems.indexOf(over.id);

																								if (activeContainer == overContainer) {
																																
																																return {
																																								...prev,
																																								[activeContainer]: arrayMove(activeItems, activeIndex, overIndex)
																																};
																								} else {
																																return {
																																								...prev, 
																																								[activeContainer]: activeItems.filter(id => id !== active.id),
																																								[overContainer] : [...overItems, active.id]
																																};
																								}

																});

																setActiveId(null);

								}

								function findContainer(id) {
																if (id in tasks) return id;
																return Object.keys(tasks).find(key => tasks[key].includes(id));
								}

								return(
																<div className="container">
																								<DndContext 
																																								onDragStart={handleDragStart}
																																								onDragEnd={handleDragEnd} >
																																
																																<TodoColumn id="freezer" tasks={tasks.freezer}>
																																								{tasks.freezer.map(taskId => (
																																																<TaskCard key={taskId} id={taskId} >
																																																								Task {taskId}
																																																</TaskCard>)
																																								)}
																																</TodoColumn>

																																<TodoColumn id="todo" tasks={tasks.todo}>
																																								{tasks.todo.map(taskId => (
																																																<TaskCard key={taskId} id={taskId} >
																																																								Task {taskId}
																																																</TaskCard>)
																																								)}
																																</TodoColumn>

																																<TodoColumn id="doing" tasks={tasks.doing}>
																																								{tasks.doing.map(taskId => (
																																																<TaskCard key={taskId} id={taskId} >
																																																								Task {taskId}
																																																</TaskCard>)
																																								)}
																																</TodoColumn>

																								</DndContext>
																</div>
								)
}

function TaskCard({ id, children  }) {

								const {attributes, listeners, setNodeRef, transform} = useDraggable({
																id: `${id}`
								});

								const style = transform ? {
																transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
								} : undefined;
								
								return(
																								<button
																																style={style}
																																className="task-card"
																																ref={setNodeRef}
																																{...listeners} 
																																{...attributes}>
																																								{children}
																								</button>
								)
}
