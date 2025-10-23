import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import AdminHeader from './AdminHeader';
import { Link, useParams } from 'react-router-dom';
const us = import.meta.env.VITE_ADMIN_URL;

function UserDetails() {
	const { id } = useParams();
	const [user, setUser] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				if (!auth.currentUser) return;

				// Create a reference to the single user doc
				const userRef = doc(db, 'users', id);

				// Fetch the document
				const snapshot = await getDoc(userRef);

				if (snapshot.exists()) {
					setUser({ id: snapshot.id, ...snapshot.data() });
				} else {
					console.warn('No such user!');
				}
			} catch (err) {
				console.error('Error fetching user:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [id]);

	if (loading) {
		return (
			<>
				<AdminHeader page_title="User Details" />
				<div className="db-content-wrapper">
					<p>Loading user...</p>
				</div>
			</>
		);
	}

	return (
		<div className="container db-content-wrapper">
			<AdminHeader
				page_title={`${user.first_name} ${user.last_name} | Appointment Details`}
			/>
			<div className="row patient-stat-box round-10 bg-title mb-30">
				<div className="col-4 patient-stat-item d-flex flex-wrap align-items-center">
					<div className="patient-stat-icon bg-yellow d-flex flex-column align-items-center justify-content-center rounded-circle">
						<img src="/assets/images/user.svg" alt="Icon" />
					</div>
					<div className="patient-stat-info">
						<h4 className="fw-bold text-white">
							{user.first_name} {user.last_name}
						</h4>
						<span className="fs-14 text-white">Patient Name</span>
					</div>
				</div>
				<div className="col-4 patient-stat-item d-flex flex-wrap align-items-center">
					<div className="patient-stat-icon bg-flower d-flex flex-column align-items-center justify-content-center rounded-circle">
						<img src="/assets/images/women-2.svg" alt="Icon" />
					</div>
					<div className="patient-stat-info">
						<h4 className="fw-bold text-white">{user.gender}</h4>
						<span className="fs-14 text-white">Gender</span>
					</div>
				</div>
				<div className="col-4 patient-stat-item d-flex flex-wrap align-items-center">
					<div className="patient-stat-icon bg-melanine d-flex flex-column align-items-center justify-content-center rounded-circle">
						<img src="/assets/images/age.svg" alt="Icon" />
					</div>
					<div className="patient-stat-info">
						<h4 className="fw-bold text-white">
							{user?.dob
								? new Date().getFullYear() -
								  user.dob.toDate().getFullYear() -
								  (new Date() <
								  new Date(
										new Date().getFullYear(),
										user.dob.toDate().getMonth(),
										user.dob.toDate().getDate()
								  )
										? 1
										: 0)
								: 'N/A'}
						</h4>
						<span className="fs-14 text-white">Patient Age</span>
					</div>
				</div>
			</div>

			<div className="row">
				{/* left & right columns, details etc. (unchanged UI) */}
				<div className="col-xxl-6 col-xl-6">
					<div className="db-content-box bg-white round-10 mb-25">
						<h4 className="fs-17 fw-extrabold text-title mb-15">User Data</h4>
						<b>First Name:</b> {user.first_name}
						<br />
						<b>Last Name:</b> {user.last_name}
						<br />
						<b>Phone:</b> {user.phone}
						<br />
						<b>Address:</b> {user.address}
						<br />
						<b>Employement Status:</b> {user.employment_status}
						<br />
						<b>Health Preconditions:</b> {user.health_preconditions} <br />
						<b>Marital Status:</b> {user.marital_status}
						<br />
						<b>Number of Dependants:</b> {user.number_dependants}
						<br />
					</div>
					<Link to={`/admin${us}/users`}>Back to Users</Link>
				</div>
			</div>
		</div>
	);
}

export default UserDetails;
