import { useEffect, useState, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { toggleTheme } from '../utils/theme';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
	doc,
	getDoc,
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
	updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import HmoFooter from '../pages/hmo/HmoFooter';
const us = import.meta.env.VITE_ADMIN_URL;

function AdminLayout() {
	// Preloader effect
	useEffect(() => {
		const getPreloaderId = document.getElementById('preloader');
		if (getPreloaderId) {
			setTimeout(() => {
				getPreloaderId.classList.add('preloader-hidden');
			}, 1000);
		} else {
			console.log('Preloader element not found');
		}
	}, []);

	// Sidebar toggle logic
	useEffect(() => {
		const button = document.querySelector('.db-burger-menu');
		const buttonTwo = document.querySelector('.db-mobile-menu');
		const body = document.querySelector('body');

		function toggleMenu(e) {
			body.classList.toggle('minimized');
			e.currentTarget.classList.toggle('active');
		}

		if (button) {
			button.addEventListener('click', toggleMenu);
		}
		if (buttonTwo) {
			buttonTwo.addEventListener('click', toggleMenu);
		}

		// Cleanup
		return () => {
			if (button) button.removeEventListener('click', toggleMenu);
			if (buttonTwo) buttonTwo.removeEventListener('click', toggleMenu);
		};
	}, []);

	//notifications effect
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef(null);
	const [notifications, setNotifications] = useState([]);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	//dropdown effect

	// Navigation hook
	const navigate = useNavigate();

	//logout function
	const handleLogout = async () => {
		try {
			await signOut(auth);
			// redirect to login or homepage after logout
			navigate(`/admin${us}`); // or navigate('/')
		} catch (error) {
			console.error('Logout failed:', error.message);
			Swal.fire({
				icon: 'error',
				title: 'Logout Failed',
				text: 'Something went wrong. Please try again.',
			});
		}
	};

	const [name, setName] = useState('');
	const [role, setRole] = useState('');
	const [userId, setUserId] = useState(null); //for notifications

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				try {
					const userDocRef = doc(db, 'admins', user.uid);
					const userSnap = await getDoc(userDocRef);
					if (userSnap.exists()) {
						const data = userSnap.data();
						setName(data.name || '');
						setRole(data.role || '');
						setUserId(user.uid);
					} else {
						console.warn('No user doc found for UID:', user.uid);
					}
				} catch (err) {
					console.error('Error fetching user doc:', err);
				}
			} else {
				setUserId(null);
			}
		});

		return () => unsubscribe();
	}, []);

	//Notifications effect
	useEffect(() => {
		if (!userId) return;

		const q = query(
			collection(db, 'notifications'),
			where('userId', '==', userId),
			orderBy('createdAt', 'desc')
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const notifs = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setNotifications(notifs);
		});

		return () => unsubscribe();
	}, [userId]);

	// Badge count
	const unreadCount = notifications.filter((n) => !n.read).length;

	function formatReadableDate(ts) {
		if (!ts) return '';
		const date = ts.toDate ? ts.toDate() : ts; // handle Firestore Timestamp
		const now = new Date();
		const diffMs = now - date;
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHr = Math.floor(diffMin / 60);
		const diffDays = Math.floor(diffHr / 24);

		if (diffSec < 60) return 'Just now';
		if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
		if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;

		return date.toLocaleDateString(); // fallback
	}

	async function markAsRead(id) {
		try {
			const notifRef = doc(db, 'notifications', id);
			await updateDoc(notifRef, { read: true });
		} catch (err) {
			console.error('Error marking notification as read:', err);
		}
	}

	return (
		<>
			{/* Preloader */}
			<div
				className="preloader-area d-flex flex-column align-items-center justify-content-center h-100"
				id="preloader">
				<span className="d-block stethoscope-icon">
					<i className="ri-stethoscope-line"></i>
				</span>
				<span className="text-primary mt-2 fw-medium">Loading...</span>
			</div>

			{/* Dashboard */}
			<div className="db-wrapper bg-ash overflow-hidden">
				<div className="db-sidebar transition">
					<Link to="/a" className="logo">
						<img
							src="/assets/images/logo.png"
							alt="Logo"
							className="logo-light"
						/>
						<img
							src="/assets/images/logo-white.png"
							alt="Logo"
							className="logo-dark"
						/>
					</Link>

					<ul className="db-sidebar-menu list-unstyled mb-0">
						<li className="menu-item fs-14 position-relative">
							<Link to={`/admin${us}`}>
								<span className="parent transition">
									<i className="fa-solid fa-home"></i> &nbsp;Home
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<Link to="users">
								<span className="parent transition">
									<i className="fa-solid fa-users"></i> &nbsp;Users
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<Link to="hmos">
								<span className="parent transition">
									<i className="fa-solid fa-building"></i> &nbsp;HMOs
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<Link to="hps">
								<span className="parent transition">
									<i className="fa-solid fa-user-doctor"></i> &nbsp;HPs
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<Link to="appointments">
								<span className="parent transition">
									<i className="fa-solid fa-calendar-check"></i>{' '}
									&nbsp;Appointments
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<Link to="new_claims">
								<span className="parent transition">
									<i className="fa-solid fa-money-check-dollar"></i> &nbsp;New
									Claims
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<Link to="old_claims">
								<span className="parent transition">
									<i className="fa-solid fa-money-check-dollar"></i> &nbsp;Old
									Claims
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<Link to="user_plans">
								<span className="parent transition">
									<i className="fa-solid fa-gear"></i> &nbsp;User Plans
								</span>
							</Link>
						</li>

						<li className="menu-item fs-14 position-relative">
							<span
								className="parent transition"
								style={{ cursor: 'pointer' }}
								onClick={handleLogout}>
								<i className="fa-solid fa-stop"></i> &nbsp;Logout
							</span>
						</li>
					</ul>
				</div>

				<div className="db-main transition pb-30">
					<div
						id="navbar"
						className="db-header bg-white navbar-area transition">
						<div className="row align-items-center">
							<div className="col-lg-5">
								<div className="db-header-left d-flex flex-wrap align-items-center">
									<button className="db-burger-menu bg-ash d-none d-xl-flex flex-column align-items-center justify-content-center transition lh-1 round-5 p-0 border-0">
										<img src="/assets/images/sidebar-btn.svg" alt="Image" />
									</button>
								</div>
							</div>
							<div className="col-lg-7">
								<div className="db-header-right d-flex flex-wrap align-items-center justify-content-lg-end justify-content-center">
									<button className="db-switch-theme border-0 bg-transparent p-0 round-5">
										<label id="switch" className="db-switch">
											<input
												type="checkbox"
												onChange={() => toggleTheme()}
												id="slider"
											/>
											<span className="slider"></span>
										</label>
									</button>

									<div
										className="db-notification position-relative"
										ref={dropdownRef}>
										{/* Button */}
										<button
											className="dropdown-toggle d-flex flex-column align-items-center justify-content-center position-relative bg-ash border-0 round-5 p-0 transition"
											type="button"
											onClick={() => setOpen((prev) => !prev)}
											aria-expanded={open}
											aria-haspopup="true">
											<img
												src="/assets/images/bell-2.svg"
												alt="Bell Icon"
												className="notif-btn"
											/>
											{unreadCount > 0 && (
												<span className="d-flex flex-column align-items-center justify-content-center rounded-circle bg_primary text-white fs-12 position-absolute">
													{unreadCount}
												</span>
											)}
										</button>

										{/* Dropdown */}
										<div
											className={`dropdown-menu border-0 ${
												open ? 'show' : ''
											}`}>
											<h3 className="fs-18 fw-semibold mb-15">Notifications</h3>
											<ul className="list-unstyled mb-0">
												{notifications.slice(0, 5).map((n) => (
													<li
														key={n.id}
														className={`position-relative ${
															!n.read ? 'unread' : ''
														}`}>
														<p className="fs-15 fw-semibold font_secondary text-title">
															{n.title}
														</p>
														<span className="fs-14 text-para d-block">
															{formatReadableDate(n.createdAt)}
														</span>
														{!n.read && (
															<span
																onClick={() => markAsRead(n.id)}
																className="btn btn-primary btn-xs">
																Mark as Read
															</span>
														)}
													</li>
												))}
											</ul>

											<Link
												to="notifications"
												className="fs-14 fw-medium mx-auto text_primary text-center d-block mt-3">
												View All
											</Link>
										</div>
									</div>

									<div className="db-user-option position-relative">
										<button
											className="dropdown-toggle d-flex flex-wrap p-0 position-relative w-100 bg-transparent border-0 text-start p-0 transition"
											type="button">
											<span className="d-flex flex-wrap align-items-center">
												<span className="fs-14 text_primary d-none d-md-block lh-1">
													{role}
													<strong className="d-block fs-16 font-secondary fw-bold text-title mt-2">{`${name}`}</strong>
												</span>
											</span>
										</button>
									</div>

									<button className="db-mobile-menu bg-ash d-flex flex-column align-items-center justify-content-center d-xl-none transition lh-1 round-5 ms-3 p-0 border-0">
										<img src="/assets/images/sidebar-btn.svg" alt="Image" />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="db-content-wrapper">
						<Outlet />
					</div>
					<HmoFooter />
				</div>
			</div>

			{/* Back to Top */}
			<div id="progress-wrap" className="progress-wrap style-one">
				<svg
					className="progress-circle svg-content"
					width="100%"
					height="100%"
					viewBox="-1 -1 102 102">
					<path
						id="progress-path"
						d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
				</svg>
			</div>
		</>
	);
}

export default AdminLayout;
