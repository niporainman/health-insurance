import { useEffect, useState } from 'react';
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	getDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import AdminHeader from './AdminHeader';
import { Link, useParams } from 'react-router-dom';
const us = import.meta.env.VITE_ADMIN_URL;

function AdminHmoPlans() {
	const { id } = useParams(); // hmo firebaseUid
	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [hmoName, setHmoName] = useState('');

	useEffect(() => {
		if (!id) return;

		const fetchHmoName = async () => {
			try {
				const hmoRef = doc(db, 'hmos', id);
				const hmoSnap = await getDoc(hmoRef);

				if (hmoSnap.exists()) {
					setHmoName(hmoSnap.data().name || '');
				} else {
					console.warn('HMO not found');
				}
			} catch (error) {
				console.error('Error fetching HMO name:', error);
			}
		};

		fetchHmoName();
	}, [id]);

	useEffect(() => {
		if (!id) {
			setPlans([]);
			setLoading(false);
			return;
		}

		const fetchPlans = async () => {
			setLoading(true);
			try {
				const q = query(
					collection(db, 'plans'),
					where('firebaseUid', '==', id),
					where('deleted', '==', false)
				);

				const snapshot = await getDocs(q); //  wait for query
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setPlans(data);
			} catch (error) {
				console.error('Error fetching plans:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchPlans();
	}, [id]);

	if (loading) {
		return (
			<>
				<AdminHeader page_title={`${hmoName} Plans`} />
				<div className="db-content-wrapper">
					<p>Loading plans...</p>
				</div>
			</>
		);
	}
	return (
		<>
			<AdminHeader page_title={`${hmoName} plans`} />
			<div className="db-content-wrapper">
				<div className="row">
					<div className="col-12">
						<div className="db-content-box bg-ash round-10 mb-25">
							<div className="db-table style-two table-responsive">
								<table className="table text-nowrap align-middle mb-0">
									<thead>
										<tr>
											<th
												scope="col"
												className="text-title bg-white fw-semibold fs-13">
												#
											</th>
											<th
												scope="col"
												className="text-title bg-white fw-bold fs-13">
												Plan Name
											</th>
											<th
												scope="col"
												className="text-title bg-white fw-bold fs-13">
												Status
											</th>

											<th
												scope="col"
												className="text-title bg-white fw-bold fs-13">
												View Details
											</th>
										</tr>
									</thead>
									<tbody>
										{plans.length === 0 ? (
											<tr className="text-center mt-2 p-3">
												<td>No plans found.</td>
											</tr>
										) : (
											plans.map((plan, index) => {
												return (
													<tr key={plan.id}>
														<td>
															<span className="fs-13 lh-1 text-para">
																{index + 1}
															</span>
														</td>
														<td>
															<a className="file-btn d-flex flex-column align-items-center justify-content-center round-5">
																{plan.plan_name}
															</a>
														</td>
														<td>
															<span
																className={`fs-13 lh-1 px-2 py-1 rounded-2 fw-semibold ${
																	plan.active
																		? 'bg-success text-white'
																		: 'bg-danger text-white'
																}`}>
																{plan.active ? 'Active' : 'Inactive'}
															</span>
														</td>

														<td>
															<Link
																to={`/admin${us}/hmo_plan_details/${plan.id}`}>
																<button className="tb-btn style-three d-flex flex-column align-items-center justify-content-center border-0 round-5 transition">
																	<img
																		src="/assets/images/briefcase-blue.svg"
																		alt="Icon"></img>
																</button>
															</Link>
														</td>
													</tr>
												);
											})
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
export default AdminHmoPlans;
