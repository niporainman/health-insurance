import { useEffect, useState, useRef } from 'react';
import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import AdminHeader from './AdminHeader';
import { Link } from 'react-router-dom';
const us = import.meta.env.VITE_ADMIN_URL;

function NewClaims() {
	const [appointments, setAppointments] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const unsubscribeRef = useRef(null);

	useEffect(() => {
		const baseCol = collection(db, 'appointments');
		const filters = [where('claim', '==', true)];

		let q;
		if (searchTerm.trim()) {
			// search by name_lower
			q = query(
				baseCol,
				...filters,
				where('name_lower', '>=', searchTerm.toLowerCase()),
				where('name_lower', '<=', searchTerm.toLowerCase() + '\uf8ff'),
				orderBy('name_lower') // must order by the same field
			);
		} else {
			// default ordering by claim date
			q = query(baseCol, ...filters, orderBy('claimDate', 'desc'));
		}

		// clean up previous subscription
		if (unsubscribeRef.current) unsubscribeRef.current();

		const unsubscribe = onSnapshot(
			q,
			(snap) => {
				let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
				//only new claims
				const now = new Date();
				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(now.getDate() - 30);

				data = data.filter((appt) => {
					const claimDate = appt.claimDate?.toDate?.();
					if (!claimDate) return false;

					return (
						(!appt.paid || appt.paid === false) &&
						claimDate >= thirtyDaysAgo &&
						claimDate <= now
					);
				});

				if (searchTerm.trim()) {
					data = data.filter((appt) =>
						appt.name?.toLowerCase().includes(searchTerm.toLowerCase())
					);
				}

				data.sort(
					(a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
				);
				setAppointments(data);
			},
			(err) => console.error('Error fetching claims:', err)
		);

		unsubscribeRef.current = unsubscribe;
		return () => unsubscribe();
	}, [searchTerm]);

	return (
		<div className="db-content-box bg-white round-10 mb-25">
			<AdminHeader page_title={`New Claims`} />

			{/* Filters */}
			<div className="form-wrapper style-two mb-20">
				<div className="row mb-20">
					<div className="col-md-4">
						<label className="fs-13 d-block fw-medium text-title mb-8">
							Search
						</label>
						<input
							type="search"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="fs-13 w-100 ht-40 bg-transparent round-5"
							placeholder="Patient name..."
							style={{ border: '1px solid grey', padding: '13px' }}
						/>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="db-table table-responsive">
				<table className="text-nowrap align-middle mb-30">
					<thead>
						<tr>
							<th>#</th>
							<th>Patient Name</th>
							<th>Date</th>
							<th>Complaint</th>
							<th>HP Status</th>
							<th>HMO Status</th>
							<th>View</th>
						</tr>
					</thead>
					<tbody>
						{appointments.length === 0 && (
							<tr>
								<td colSpan="8" className="text-center py-4 fs-14 text-muted">
									No claims found.
								</td>
							</tr>
						)}
						{appointments.map((appt, i) => (
							<tr key={appt.id}>
								<td>{i + 1}</td>
								<td>{appt.name}</td>
								<td>
									{appt.claimDate?.toDate
										? appt.claimDate.toDate().toLocaleDateString('en-GB', {
												day: '2-digit',
												month: 'short',
												year: 'numeric',
										  })
										: '—'}
								</td>

								<td>{appt.patient_complaint?.substring(0, 20)}...</td>
								<td>
									<StatusBadge value={appt.hp_approved} />
								</td>
								<td>
									<StatusBadge value={appt.hmo_approved} />
								</td>
								<td>
									<Link
										to={`/admin${us}/appointment_details/${appt.id}`}
										className="btn btn-xs btn-primary">
										View
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function StatusBadge({ value }) {
	const map = {
		Approved: 'bg-success text-white',
		Pending: 'bg-warning text-dark',
		Rejected: 'bg-danger text-white',
	};
	return (
		<span
			className={`fs-13 lh-1 px-2 py-1 rounded-2 fw-semibold ${
				map[value] || 'bg-secondary text-white'
			}`}>
			{value || '—'}
		</span>
	);
}

export default NewClaims;
