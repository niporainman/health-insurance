import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

function AdminHome() {
	const [stats, setStats] = useState({
		users: 0,
		hmos: 0,
		hps: 0,
		appointments: 0,
		new_claims: 0,
		old_claims: 0,
		user_plans: 0,
	});

	useEffect(() => {
		// Real-time counts for straight collections
		const unsubscribers = [
			onSnapshot(collection(db, 'users'), (snap) =>
				setStats((s) => ({ ...s, users: snap.size }))
			),
			onSnapshot(collection(db, 'hmos'), (snap) =>
				setStats((s) => ({ ...s, hmos: snap.size }))
			),
			onSnapshot(collection(db, 'hps'), (snap) =>
				setStats((s) => ({ ...s, hps: snap.size }))
			),
			onSnapshot(collection(db, 'appointments'), (snap) =>
				setStats((s) => ({ ...s, appointments: snap.size }))
			),
			onSnapshot(collection(db, 'user_plans'), (snap) =>
				setStats((s) => ({ ...s, user_plans: snap.size }))
			),
		];

		// Claims require extra filtering
		const claimsQuery = query(
			collection(db, 'appointments'),
			where('claim', '==', true)
		);

		const unsubClaims = onSnapshot(claimsQuery, (snap) => {
			const now = new Date();
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(now.getDate() - 30);

			let newClaims = 0;
			let oldClaims = 0;

			snap.forEach((doc) => {
				const data = doc.data();
				const claimDate = data.claimDate?.toDate?.();
				if (!claimDate) return;

				if (claimDate >= thirtyDaysAgo && claimDate <= now) {
					newClaims++;
				} else if (claimDate < thirtyDaysAgo) {
					oldClaims++;
				}
			});

			setStats((s) => ({
				...s,
				new_claims: newClaims,
				old_claims: oldClaims,
			}));
		});

		return () => {
			unsubscribers.forEach((u) => u());
			unsubClaims();
		};
	}, []);

	return (
		<div className="container style-one pt-20 pb-90">
			<div className="row justify-content-center">
				<Card
					to="users"
					title="Users"
					count={stats.users}
					icon="fa-users"
					bg="bg-primary"
				/>
				<Card
					to="hmos"
					title="HMOs"
					count={stats.hmos}
					icon="fa-hospital"
					bg="bg-success"
				/>
				<Card
					to="hps"
					title="Health Providers"
					count={stats.hps}
					icon="fa-user-md"
					bg="bg-info"
				/>
				<Card
					to="appointments"
					title="Appointments"
					count={stats.appointments}
					icon="fa-calendar-check"
					bg="bg-warning"
				/>
				<Card
					to="new_claims"
					title="New Claims"
					count={stats.new_claims}
					icon="fa-file-medical"
					bg="bg-mailbu"
				/>
				<Card
					to="old_claims"
					title="Old Claims"
					count={stats.old_claims}
					icon="fa-file-invoice-dollar"
					bg="bg-secondary"
				/>
				<Card
					to="user_plans"
					title="User Plans"
					count={stats.user_plans}
					icon="fa-gear"
					bg="bg-yellow"
				/>
			</div>
		</div>
	);
}

function Card({ to, title, count, icon, bg }) {
	return (
		<div className="col-xl-4 col-md-6">
			<div className="pricing-card round-20 hover-lift">
				<Link
					to={to}
					className={`pricing-header ${bg} d-flex flex-wrap align-items-center round-10`}>
					<div className="pricing-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white">
						<i className={`fa fa-solid ${icon}`}></i>
					</div>
					<div className="pricing-header-text">
						<h6 className="fs-20 text-title mb-13">{title}</h6>
						<h2 className="fw-bold text-title mb-0">{count}</h2>
					</div>
				</Link>
			</div>
		</div>
	);
}

export default AdminHome;
