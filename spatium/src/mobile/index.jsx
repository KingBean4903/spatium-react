import React from 'react';
import MobileScene from './mobile-scene.jsx';
import TitleBar from './titlebar.jsx'
import styles from './mobile.module.css'

export default function MobileView() {


								return(
																<div className={styles.mobile_container}>
																								<TitleBar />
																								<MobileScene />
																								<div className={styles.btm_nav}>
																																<ul>
																																								<li>Plans</li>
																																								<li>Matls</li>
																																								<li>Walk</li>
																																								<li>Chat</li>
																																								<li>More</li>
																																</ul>
																								</div>
																</div>
								)

}
