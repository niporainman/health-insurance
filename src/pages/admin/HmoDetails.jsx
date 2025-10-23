import { useEffect, useState } from 'react';
import {
	doc,
	getDoc,
	collection,
	query,
	where,
	orderBy,
	limit,
	getDocs,
	Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import AdminHeader from './AdminHeader';
import { Link, useParams } from 'react-router-dom';

const us = import.meta.env.VITE_ADMIN_URL;

function HmoDetails() {
	const { id } = useParams();
	const [hmo, setHmo] = useState(null);
	const [loading, setLoading] = useState(true);

	const [appointments, setAppointments] = useState([]);
	const [newClaims, setNewClaims] = useState([]);
	const [oldClaims, setOldClaims] = useState([]);
	const [plans, setPlans] = useState([]);

	useEffect(() => {
		if (!id) return;

		const fetchData = async () => {
			try {
				// --- Fetch HMO data ---
				const hmoRef = doc(db, 'hmos', id);
				const hmoSnap = await getDoc(hmoRef);
				if (!hmoSnap.exists()) {
					setHmo(null);
					return;
				}
				const hmoData = { id: hmoSnap.id, ...hmoSnap.data() };
				setHmo(hmoData);

				// Timestamp for new/old claim separation
				const thirtyDaysAgo = Timestamp.fromDate(
					new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				);

				// --- Last 5 appointments ---
				const appQ = query(
					collection(db, 'appointments'),
					where('hmofirebaseUid', '==', id),
					orderBy('createdAt', 'desc'),
					limit(5)
				);
				const appSnap = await getDocs(appQ);
				setAppointments(appSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

				// --- Last 5 NEW claims ---
				const newQ = query(
					collection(db, 'appointments'),
					where('hmofirebaseUid', '==', id),
					where('claim', '==', true),
					where('claimDate', '>=', thirtyDaysAgo),
					orderBy('claimDate', 'desc'),
					limit(5)
				);
				const newSnap = await getDocs(newQ);
				setNewClaims(newSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

				// --- Last 5 OLD claims ---
				const oldQ = query(
					collection(db, 'appointments'),
					where('hmofirebaseUid', '==', id),
					where('claim', '==', true),
					where('claimDate', '<', thirtyDaysAgo),
					orderBy('claimDate', 'desc'),
					limit(5)
				);
				const oldSnap = await getDocs(oldQ);
				setOldClaims(oldSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

				// --- Last 5 Plans ---
				const planQ = query(
					collection(db, 'plans'),
					where('firebaseUid', '==', id),
					orderBy('plan_name', 'asc'),
					limit(5)
				);
				const planSnap = await getDocs(planQ);
				setPlans(planSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
			} catch (err) {
				console.error('Error fetching HMO details:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (loading) {
		return (
			<>
				<AdminHeader page_title="HMO Details" />
				<div className="db-content-wrapper">
					<p>Loading HMO...</p>
				</div>
			</>
		);
	}

	if (!hmo) {
		return (
			<>
				<AdminHeader page_title="HMO Details" />
				<div className="db-content-wrapper">
					<p>No HMO found.</p>
					<Link to={`/admin${us}/hmos`}>Back to HMOs</Link>
				</div>
			</>
		);
	}

	// parse strings, numbers, Firestore Timestamps, and plain timestamp objects
	const parsePossibleDate = (v) => {
		if (!v) return null;

		// Firestore Timestamp object (has toDate)
		if (typeof v.toDate === 'function') return v.toDate();

		// plain object like { seconds:..., nanoseconds:... }
		if (typeof v === 'object' && v.seconds) return new Date(v.seconds * 1000);

		// milliseconds number
		if (typeof v === 'number') return new Date(v);

		// string handling
		if (typeof v === 'string') {
			// try built-in Date parser (works for ISO YYYY-MM-DD or full ISO with time)
			const iso = new Date(v);
			if (!isNaN(iso)) return iso;

			// fallback for YYYY-MM-DD (some browsers parse it as UTC; this makes local)
			const m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
			if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

			// fallback for DD/MM/YYYY
			const m2 = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
			if (m2) return new Date(Number(m2[3]), Number(m2[2]) - 1, Number(m2[1]));
		}

		return null;
	};

	const formatDate = (value) => {
		const d = parsePossibleDate(value);
		if (!d) return 'N/A';

		const day = d.getDate();
		const suffix =
			day % 10 === 1 && day !== 11
				? 'st'
				: day % 10 === 2 && day !== 12
				? 'nd'
				: day % 10 === 3 && day !== 13
				? 'rd'
				: 'th';

		const month = d.toLocaleString('default', { month: 'long' }); // e.g. September
		const year = d.getFullYear();

		return `${day}${suffix} ${month}, ${year}`;
	};

	const renderRows = (items, type = 'appointment') =>
		items.length === 0 ? (
			<tr>
				<td colSpan={type === 'plan' ? 3 : 5}>No records found.</td>
			</tr>
		) : (
			items.map((item, idx) => (
				<tr key={item.id}>
					<td>{idx + 1}</td>
					<td>{type === 'plan' ? item.plan_name : item.name || 'N/A'}</td>

					{type !== 'plan' && (
						<>
							<td>
								{item.hmoName || item.hmoName === ''
									? item.hmoName
									: item.hmoName ?? 'N/A'}
							</td>
							<td>
								{item.hpName || item.hpName === ''
									? item.hpName
									: item.hpName ?? 'N/A'}
							</td>
							<td>
								{type === 'appointment'
									? formatDate(item.appointment_date)
									: type === 'claim'
									? formatDate(item.claimDate)
									: 'N/A'}
							</td>
						</>
					)}

					{type === 'plan' && <td>{item.active ? 'Active' : 'Inactive'}</td>}
				</tr>
			))
		);

	return (
		<div className="container db-content-wrapper">
			<AdminHeader page_title={`${hmo.name} | HMO Details`} />

			{/* HMO Basic Data */}
			<div className="db-content-box bg-white round-10 mb-25 p-3">
				<h4 className="fs-17 fw-extrabold text-title mb-15">HMO Data</h4>
				<b>Name:</b> {hmo.name}
				<br />
				<b>Phone:</b> {hmo.phone}
				<br />
				<b>Email:</b> {hmo.email}
				<br />
				<b>Status:</b> {hmo.acc_approved ? 'Approved' : 'Not Approved'}
				<br />
				<b>Date Registered:</b> {formatDate(hmo.date_reg)}
			</div>

			{/* Sections */}
			<Section
				title=" Appointments"
				items={appointments}
				seeMore={`/admin${us}/hmo_appointments/${id}`}
				renderRows={renderRows}
			/>

			<Section
				title=" New Claims"
				items={newClaims}
				type="claim" // ADD THIS
				seeMore={`/admin${us}/hmo_new_claims/${id}`}
				renderRows={renderRows}
			/>

			<Section
				title=" Old Claims"
				items={oldClaims}
				type="claim" // ADD THIS
				seeMore={`/admin${us}/hmo_old_claims/${id}`}
				renderRows={renderRows}
			/>

			<Section
				title=" HMO Plans"
				items={plans}
				type="plan"
				seeMore={`/admin${us}/hmo_plans/${id}`}
				renderRows={renderRows}
			/>

			<Link to={`/admin${us}/hmos`} className="btn btn-secondary mt-3 mb-3">
				Back to HMOs
			</Link>
		</div>
	);
}

function Section({ title, items, seeMore, renderRows, type }) {
	return (
		<div className="db-content-box bg-white round-10 mb-25 p-3">
			<h5 className="fs-16 fw-bold mb-2">{title}</h5>
			<div className="table-responsive mb-3">
				<table className="table table-sm">
					<thead>
						<tr>
							<th>#</th>
							{type === 'plan' ? (
								<>
									<th>Plan Name</th>
									<th>Status</th>
								</>
							) : (
								<>
									<th>Name</th>
									<th>HMO</th>
									<th>HP</th>
									<th>Date</th>
								</>
							)}
						</tr>
					</thead>
					<tbody>{renderRows(items, type)}</tbody>
				</table>
			</div>
			<Link to={seeMore} className="btn btn-primary btn-xs">
				See More
			</Link>
		</div>
	);
}

export default HmoDetails;
