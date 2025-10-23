import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import UserHeader from './UserHeader';
import { useNavigate } from 'react-router-dom';
import { createNotification, sendEmail } from '../../services/notifications';

function BookAppointmentOutPocket() {
	const navigate = useNavigate();
	const { currentUser, userData, loading } = useAuth();

	const [appointmentDate, setAppointmentDate] = useState('');
	const [appointmentTime, setAppointmentTime] = useState('');
	const [patientComplaint, setPatientComplaint] = useState('');
	const [submitting, setSubmitting] = useState(false);

	// Providers & suggestions
	const [providers, setProviders] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [selectedProvider, setSelectedProvider] = useState(null);

	// Fetch providers
	useEffect(() => {
		const fetchProviders = async () => {
			const querySnapshot = await getDocs(collection(db, 'hps'));
			const providerList = [];
			querySnapshot.forEach((docSnap) => {
				providerList.push({ id: docSnap.id, ...docSnap.data() });
			});
			setProviders(providerList);
		};

		fetchProviders();
	}, []);

	// Filter provider suggestions
	useEffect(() => {
		if (inputValue.trim() === '') {
			setSuggestions([]);
		} else {
			const filtered = providers.filter((hp) =>
				hp.name.toLowerCase().includes(inputValue.toLowerCase())
			);
			setSuggestions(filtered);
		}
	}, [inputValue, providers]);

	// Select provider
	const handleSelect = (hp) => {
		setInputValue(hp.name);
		setSelectedProvider(hp);
		setSuggestions([]);
	};

	// Handle Paystack payment + booking
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!selectedProvider ||
			!appointmentDate ||
			!appointmentTime ||
			!patientComplaint
		) {
			Swal.fire(
				'Missing Info',
				'Please fill in all fields and select a valid provider.',
				'warning'
			);
			return;
		}

		// Open Paystack payment
		const paystack = window.PaystackPop.setup({
			key: import.meta.env.VITE_PAYSTACK_KEY, // Replace with your live key in prod
			email: currentUser.email,
			amount: 2000 * 100, // Example: ₦2000 consultation fee
			currency: 'NGN',
			onClose: () => {
				Swal.fire('Cancelled', 'You cancelled the payment.', 'info');
				setSubmitting(false);
			},
			callback: function (response) {
				(async () => {
					try {
						setSubmitting(true);

						// 1. Verify payment with your PHP backend
						const verifyUrl =
							import.meta.env.VITE_VERIFY_URL +
							'?reference=' +
							response.reference;
						const verifyRes = await fetch(verifyUrl);
						const verifyData = await verifyRes.json();

						//console.log("Verify response:", verifyData);

						if (!verifyData.status) {
							Swal.fire(
								'Payment Failed',
								'Payment could not be verified.',
								'error'
							);
							setSubmitting(false);
							return;
						}

						// 2. Build appointment data
						const baseData = {
							name: userData.first_name + ' ' + userData.last_name,
							name_lower: (
								userData.first_name +
								' ' +
								userData.last_name
							).toLowerCase(),
							userId: userData.userId,
							firebaseUid: currentUser.uid,
							appointment_date: appointmentDate,
							appointment_time: appointmentTime,
							patient_complaint: patientComplaint,
							hpId: selectedProvider.hpId || '',
							hpfirebaseUid: selectedProvider.firebaseUid || '',
							hpName: selectedProvider.name || '',
							hp_approved: 'Pending',
							hmoId: '',
							hmofirebaseUid: '',
							hmoName: '',
							hmo_approved: '',
							treatment_sheet: '',
							amount: 2000,
							paid: true,
							paymentRef: response.reference,
							query: false,
							date_claim: '',
							referral: 'No',
							referral_from: '',
							status: 'Pending',
							cancelled_at: '',
							outOfPocket: 'Yes',
						};

						// 3. Save appointment into Firestore
						const docRef = doc(collection(db, 'appointments'));
						await setDoc(docRef, { ...baseData, appointmentId: docRef.id });

						// 4. Notifications & Emails (safe execution)
						(async () => {
							// Patient notification
							try {
								await createNotification({
									userId: userData.userId,
									title: 'Appointment Booked',
									message: `Your appointment with ${selectedProvider.name} has been booked successfully.`,
									type: 'success',
									link: '/user/user_appointments',
								});
							} catch (err) {
								console.error('Notification error (patient):', err);
							}

							// Provider notification
							try {
								await createNotification({
									userId: selectedProvider.userId || selectedProvider.hpId,
									title: 'New Appointment Request',
									message: `${userData.first_name} ${userData.last_name} booked an appointment for ${appointmentDate} at ${appointmentTime}.`,
									type: 'info',
									link: '/hp/appointments',
								});
							} catch (err) {
								console.error('Notification error (provider):', err);
							}

							// Patient email
							try {
								await sendEmail(
									currentUser.email,
									userData.first_name,
									'Appointment Confirmation',
									`
              <p>Hello ${userData.first_name},</p>
              <p>Your appointment with <b>${
								selectedProvider.name
							}</b> has been booked for <b>${appointmentDate} ${appointmentTime}</b>.</p>
              <p>Thank you for choosing ${
								import.meta.env.VITE_COMPANY_NAME
							}.</p>
            `
								);
							} catch (err) {
								console.error('Email error (patient):', err);
							}

							// Provider email
							if (selectedProvider.email) {
								try {
									await sendEmail(
										selectedProvider.email,
										selectedProvider.name,
										'New Appointment Request',
										`
                <p>Hello ${selectedProvider.name},</p>
                <p>You have a new appointment request from <b>${userData.first_name} ${userData.last_name}</b> 
                on <b>${appointmentDate} ${appointmentTime}</b>.</p>
                <p>Please log in to review and approve it.</p>
              `
									);
								} catch (err) {
									console.error('Email error (provider):', err);
								}
							}
						})();

						// 5. Success alert + redirect
						Swal.fire(
							'Success',
							'Appointment booked and payment successful.',
							'success'
						).then(() => {
							navigate('/user/user_appointments');
						});

						// Reset form
						setInputValue('');
						setSelectedProvider(null);
						setAppointmentDate('');
						setAppointmentTime('');
						setPatientComplaint('');
					} catch (error) {
						console.error('Error during payment verification/booking:', error);
						Swal.fire(
							'Error',
							'Something went wrong while booking the appointment. ' + error,
							'error'
						);
					} finally {
						setSubmitting(false);
					}
				})();
			},
		});

		paystack.openIframe();
	};

	if (loading) return <p>Loading...</p>;

	return (
		<>
			<UserHeader page_title={'Book Out-of-Pocket Appointment'} />
			<div className="db-content-box bg-white round-10 mb-25">
				<form className="form-wrapper style-two" onSubmit={handleSubmit}>
					<div className="row">
						{/* Choose HP */}
						<div className="col-xxl-4 col-xl-4 col-md-4">
							<div className="form-group mb-15 position-relative">
								<label
									htmlFor="hpName"
									className="fs-13 d-block fw-medium text-title mb-8">
									Choose HP
								</label>
								<input
									type="text"
									id="hpName"
									className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
									placeholder="Type Health Provider Name"
									value={inputValue}
									onChange={(e) => {
										setInputValue(e.target.value);
										setSelectedProvider(null);
									}}
								/>
								{suggestions.length > 0 && (
									<ul
										className="autocomplete-suggestions position-absolute bg-white p-2 shadow-sm rounded w-100"
										style={{ zIndex: 999 }}>
										{suggestions.map((hp) => (
											<div
												key={hp.id}
												onClick={() => handleSelect(hp)}
												className="p-2 hover:bg-light cursor-pointer">
												{hp.name}
											</div>
										))}
									</ul>
								)}
								{!selectedProvider && inputValue && (
									<p className="text-danger mt-2 fs-12">
										Please select a valid health provider
									</p>
								)}
							</div>
						</div>

						{/* Appointment Date */}
						<div className="col-xxl-4 col-xl-4 col-md-4">
							<div className="form-group mb-15">
								<label
									htmlFor="appointment_date"
									className="fs-13 d-block fw-medium text-title mb-8">
									Appointment Date
								</label>
								<input
									type="date"
									id="appointment_date"
									value={appointmentDate}
									onChange={(e) => setAppointmentDate(e.target.value)}
									min={dayjs().format('YYYY-MM-DD')}
									className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
								/>
							</div>
						</div>

						{/* Appointment Time */}
						<div className="col-md-4">
							<div className="form-group mb-15">
								<label
									htmlFor="appointment_time"
									className="fs-13 d-block fw-medium text-title mb-8">
									Appointment Time
								</label>
								<input
									type="time"
									id="appointment_time"
									value={appointmentTime}
									onChange={(e) => setAppointmentTime(e.target.value)}
									className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
								/>
							</div>
						</div>

						{/* Complaint */}
						<div className="col-12">
							<div className="form-group mb-20">
								<label
									htmlFor="patient_complaint"
									className="fs-13 d-block fw-medium text-title mb-8">
									Patient Complaint
								</label>
								<textarea
									id="patient_complaint"
									value={patientComplaint}
									onChange={(e) => setPatientComplaint(e.target.value)}
									className="fs-13 w-100 ht-150 bg-transparent round-5 text-para resize-0"
									placeholder="List any health conditions or complaints you have"></textarea>
							</div>
						</div>
					</div>

					<div className="btn-wrap d-flex justify-content-end">
						<button
							type="submit"
							disabled={loading || submitting}
							className="tb-btn style-one font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition">
							{submitting ? 'Processing Payment...' : 'Pay & Book Appointment'}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}

export default BookAppointmentOutPocket;
