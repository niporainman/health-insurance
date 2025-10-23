import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import AdminHeader from './AdminHeader';
import { Link } from 'react-router-dom';
const us = import.meta.env.VITE_ADMIN_URL;

function Users() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				// Make sure a user is signed in
				if (!auth.currentUser) return;

				const snapshot = await getDocs(collection(db, 'users'));
				setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
			} catch (err) {
				console.error('Error fetching users:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	if (loading) {
		return (
			<>
				<AdminHeader page_title="Users" />
				<div className="db-content-wrapper">
					<p>Loading users...</p>
				</div>
			</>
		);
	}

	return (
		<>
			<AdminHeader page_title="Users" />
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
											<th>Gender</th>
											<th>Phone</th>
											<th>View Details</th>
										</tr>
									</thead>
									<tbody>
										{users.length === 0 ? (
											<tr>
												<td colSpan="5">No users found.</td>
											</tr>
										) : (
											users.map((u, i) => (
												<tr key={u.id}>
													<td>{i + 1}</td>
													<td>
														{u.first_name} {u.last_name}
													</td>
													<td>{u.gender}</td>
													<td>{u.phone}</td>
													<td>
														<Link to={`/admin${us}/user_details/${u.id}`}>
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

export default Users;
