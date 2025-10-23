import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import AdminHeader from './AdminHeader';
import { Link } from 'react-router-dom';
const us = import.meta.env.VITE_ADMIN_URL;

function AdminHps() {
	const [hps, setHps] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchHps = async () => {
			try {
				// Make sure a user is signed in
				if (!auth.currentUser) return;

				const snapshot = await getDocs(collection(db, 'hps'));
				setHps(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
			} catch (err) {
				console.error('Error fetching Hps:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchHps();
	}, []);

	if (loading) {
		return (
			<>
				<AdminHeader page_title="HPs" />
				<div className="db-content-wrapper">
					<p>Loading HPs...</p>
				</div>
			</>
		);
	}

	return (
		<>
			<AdminHeader page_title="Health Providers" />
			<div className="db-content-wrapper">
				<div className="row">
					<div className="col-12">
						<div className="db-content-box bg-ash round-10 mb-25">
							<div className="db-table style-two table-responsive">
								<table className="table text-nowrap align-middle mb-0">
									<thead>
										<tr>
											<th>#</th>
											<th>Name</th>
											<th>Phone</th>
											<th>Contact Person</th>
											<th>Contact Person Phone</th>
											<th>View Details</th>
										</tr>
									</thead>
									<tbody>
										{hps.length === 0 ? (
											<tr>
												<td colSpan="5">No HMOs found.</td>
											</tr>
										) : (
											hps.map((u, i) => (
												<tr key={u.id}>
													<td>{i + 1}</td>
													<td>{u.name}</td>
													<td>{u.phone}</td>
													<td>{u.contact_person}</td>
													<td>{u.contact_person_phone}</td>
													<td>
														<Link to={`/admin${us}/hp_details/${u.id}`}>
															<button className="tb-btn style-three border-0 round-5 transition">
																<img
																	src="/assets/images/briefcase-blue.svg"
																	alt="Icon"
																/>
															</button>
														</Link>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default AdminHps;
