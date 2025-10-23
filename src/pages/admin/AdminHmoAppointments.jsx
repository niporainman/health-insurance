import { useEffect, useState, useRef } from 'react';
import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
	doc,
	getDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import AdminHeader from './AdminHeader';
import { Link, useParams } from 'react-router-dom';
const us = import.meta.env.VITE_ADMIN_URL;

function AdminHmoAppointments() {
	const { id } = useParams(); // hmo firebaseUid
	const [appointments, setAppointments] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const unsubscribeRef = useRef(null);
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
		if (!id) return;

		const baseCol = collection(db, 'appointments');
		const filters = [where('hmofirebaseUid', '==', id)];

		// status filter
		if (statusFilter === 'Pending') {
			filters.push(where('hmo_approved', 'in', ['', null, 'Pending']));
		} else if (['Approved', 'Rejected'].includes(statusFilter)) {
			filters.push(where('hmo_approved', '==', statusFilter));
		}

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
			// default ordering by appointment date
			q = query(baseCol, ...filters, orderBy('appointment_date', 'desc'));
		}

		// clean up previous subscription
		if (unsubscribeRef.current) unsubscribeRef.current();

		const unsubscribe = onSnapshot(
			q,
			(snap) => {
				const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
				setAppointments(data);
			},
			(err) => console.error('Error fetching appointments:', err)
		);

		unsubscribeRef.current = unsubscribe;
		return () => unsubscribe();
	}, [id, searchTerm, statusFilter]);

	return (
		<div className="db-content-box bg-white round-10 mb-25">
			<AdminHeader page_title={`${hmoName} Appointments`} />

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

					<div className="col-md-4">
						<label className="fs-13 d-block fw-medium text-title mb-8">
							Filter
						</label>
						<select
							className="fs-13 w-100 ht-40 bg-transparent round-5"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}>
							<option value="">All</option>
							<option value="Pending">Pending</option>
							<option value="Approved">Approved</option>
							<option value="Rejected">Rejected</option>
						</select>
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
							<th>Time</th>
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
									No appointments found.
								</td>
							</tr>
						)}
						{appointments.map((appt, i) => (
							<tr key={appt.id}>
								<td>{i + 1}</td>
								<td>{appt.name}</td>
								<td>{appt.appointment_date}</td>
								<td>{appt.appointment_time || '—'}</td>
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

export default AdminHmoAppointments;
