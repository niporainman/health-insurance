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

function HpDetails() {
	const { id } = useParams();
	const [hp, setHp] = useState(null);
	const [loading, setLoading] = useState(true);

	const [appointments, setAppointments] = useState([]);
	const [newClaims, setNewClaims] = useState([]);
	const [oldClaims, setOldClaims] = useState([]);

	useEffect(() => {
		if (!id) return;

		const fetchData = async () => {
			try {
				// --- Fetch HP data ---
				const hpRef = doc(db, 'hps', id);
				const hpSnap = await getDoc(hpRef);
				if (!hpSnap.exists()) {
					setHp(null);
					return;
				}
				const hpData = { id: hpSnap.id, ...hpSnap.data() };
				setHp(hpData);

				// Timestamp for new/old claim separation
				const thirtyDaysAgo = Timestamp.fromDate(
					new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				);

				// --- Last 5 appointments ---
				const appQ = query(
					collection(db, 'appointments'),
					where('hpfirebaseUid', '==', id),
					orderBy('createdAt', 'desc'),
					limit(5)
				);
				const appSnap = await getDocs(appQ);
				setAppointments(appSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

				// --- Last 5 NEW claims ---
				const newQ = query(
					collection(db, 'appointments'),
					where('hpfirebaseUid', '==', id),
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
					where('hpfirebaseUid', '==', id),
					where('claim', '==', true),
					where('claimDate', '<', thirtyDaysAgo),
					orderBy('claimDate', 'desc'),
					limit(5)
				);
				const oldSnap = await getDocs(oldQ);
				setOldClaims(oldSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
			} catch (err) {
				console.error('Error fetching HP details:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (loading) {
		return (
			<>
				<AdminHeader page_title="HP Details" />
				<div className="db-content-wrapper">
					<p>Loading HP...</p>
				</div>
			</>
		);
	}

	if (!hp) {
		return (
			<>
				<AdminHeader page_title="HP Details" />
				<div className="db-content-wrapper">
					<p>No Health Provider found.</p>
					<Link to={`/admin${us}/hps`}>Back to Health Providers</Link>
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
								{item.hpName || item.hpName === ''
									? item.hpName
									: item.hpName ?? 'N/A'}
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
			<AdminHeader page_title={`${hp.name} | HP Details`} />

			{/* HP Basic Data */}
			<div className="db-content-box bg-white round-10 mb-25 p-3">
				<h4 className="fs-17 fw-extrabold text-title mb-15">HP Data</h4>
				<b>Name:</b> {hp.name}
				<br />
				<b>Phone:</b> {hp.phone}
				<br />
				<b>Email:</b> {hp.email}
				<br />
				<b>Status:</b> {hp.acc_approved ? 'Approved' : 'Not Approved'}
				<br />
				<b>Date Registered:</b> {formatDate(hp.date_reg)}
			</div>

			{/* Sections */}
			<Section
				title=" Appointments"
				items={appointments}
				seeMore={`/admin${us}/hp_appointments/${id}`}
				renderRows={renderRows}
			/>

			<Section
				title=" New Claims"
				items={newClaims}
				type="claim" // ADD THIS
				seeMore={`/admin${us}/hp_new_claims/${id}`}
				renderRows={renderRows}
			/>

			<Section
				title=" Old Claims"
				items={oldClaims}
				type="claim" // ADD THIS
				seeMore={`/admin${us}/hp_old_claims/${id}`}
				renderRows={renderRows}
			/>

			<Link to={`/admin${us}/hps`} className="btn btn-secondary mt-3 mb-3">
				Back to HPs
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

export default HpDetails;
