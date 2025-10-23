import { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import AdminHeader from './AdminHeader';

function UserPlans() {
	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				try {
					// 1️⃣ Get all user plans
					const q = query(collection(db, 'user_plans'));
					const snapshot = await getDocs(q);
					const planData = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}));

					// 2️⃣ Collect unique firebaseUids
					const uids = [...new Set(planData.map((p) => p.firebaseUid))];

					// Firestore `in` can only take max 10 items, so batch if needed
					const fetchUsersInBatches = async (allUids) => {
						const userMap = {};
						const chunkSize = 10;
						for (let i = 0; i < allUids.length; i += chunkSize) {
							const chunk = allUids.slice(i, i + chunkSize);
							const uq = query(
								collection(db, 'users'),
								where('firebaseUid', 'in', chunk)
							);
							const userSnap = await getDocs(uq);
							userSnap.docs.forEach((d) => {
								const data = d.data();
								userMap[data.firebaseUid] = {
									first_name: data.first_name || '',
									last_name: data.last_name || '',
								};
							});
						}
						return userMap;
					};

					// 3️⃣ Fetch user details and merge
					const userMap = await fetchUsersInBatches(uids);
					const merged = planData.map((plan) => ({
						...plan,
						first_name: userMap[plan.firebaseUid]?.first_name || 'N/A',
						last_name: userMap[plan.firebaseUid]?.last_name || 'N/A',
					}));

					setPlans(merged);
				} catch (error) {
					console.error('Error fetching user plans or users:', error);
				} finally {
					setLoading(false);
				}
			} else {
				setPlans([]);
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<>
				<AdminHeader page_title={'Insurance Plans'} />
				<div className="db-content-wrapper">
					<p>Loading plans...</p>
				</div>
			</>
		);
	}

	return (
		<>
			<AdminHeader page_title={'Insurance Plans'} />
			<div className="db-content-wrapper">
				<div className="row">
					{plans.length === 0 ? (
						<p>No insurance plans found.</p>
					) : (
						plans.map((plan) => {
							const startDate = plan.startDate?.seconds
								? new Date(plan.startDate.seconds * 1000)
								: null;
							const endDate = plan.endDate?.seconds
								? new Date(plan.endDate.seconds * 1000)
								: null;

							const isExpired =
								plan.status !== 'Pending' && endDate && endDate < new Date();
							const isPending = plan.status === 'Pending';

							return (
								<div className="col-md-4 mb-3" key={plan.id}>
									<div className="db-single-doctor-stat text-center bg-white round-10 mb-25">
										<div className="db-stat-icon bg-chard d-flex flex-column justify-content-center align-items-center round-10 mx-auto transition">
											<img src="/assets/images/heart-shape.svg" alt="Icon" />
										</div>
										<h3 className="fs-30 fw-bold text-title">
											{plan.planName}
										</h3>
										<p className="fs-14 text-title">{plan.hmoName}</p>
										<p className="fs-14 text-title">{plan.hpName}</p>

										{/* Display user full name */}
										<p className="fs-14 text-title">
											User: {plan.first_name} {plan.last_name}
										</p>

										{!isPending && (
											<p>
												{plan.duration} Month(s)
												<br />
												{startDate
													? startDate.toLocaleDateString()
													: 'N/A'} -{' '}
												{endDate ? endDate.toLocaleDateString() : 'N/A'}
											</p>
										)}

										<span
											className={`d-inline-block db-taglist fs-13 lh-1 fw-medium round-5 text-white ${
												isPending
													? 'bg-danger'
													: isExpired
													? 'bg-danger'
													: 'bg_secondary'
											}`}>
											{isPending
												? 'Pending'
												: isExpired
												? 'Expired'
												: plan.status}
										</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</>
	);
}

export default UserPlans;
