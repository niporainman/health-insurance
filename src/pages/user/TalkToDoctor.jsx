import { useState } from 'react';
import {
	collection,
	query,
	where,
	doc,
	setDoc,
	getDocs,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import UserHeader from './UserHeader';
import { createNotification, sendEmail } from '../../services/notifications';

function TalkToDoctor() {
	const navigate = useNavigate();
	const { currentUser, userData, loading } = useAuth();

	const [affectedArea, setAffectedArea] = useState('');
	const [consultationLevel, setConsultationLevel] = useState('');
	const [healthComplaint, setHealthComplaint] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!affectedArea || !consultationLevel || !healthComplaint) {
			Swal.fire('Missing Info', 'Please fill in all fields.', 'warning');
			return;
		}

		// Consultation pricing
		let amount = 0;
		if (
			['Common Health Concern', 'Minor Health Concern'].includes(
				consultationLevel
			)
		) {
			amount = 3500 * 100;
		} else if (
			[
				'Moderate Health Concern',
				'Severe Health Concern',
				'Emergency',
			].includes(consultationLevel)
		) {
			amount = 7000 * 100;
		}

		// Open Paystack payment
		const paystack = window.PaystackPop.setup({
			key: import.meta.env.VITE_PAYSTACK_KEY,
			email: currentUser.email,
			amount,
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

						if (!verifyData.status) {
							Swal.fire(
								'Payment Failed',
								'Payment could not be verified.',
								'error'
							);
							setSubmitting(false);
							return;
						}

						// 2. Match doctor by affected area
						const q = query(
							collection(db, 'doctors'),
							where('speciality', '==', affectedArea)
						);
						const doctorSnap = await getDocs(q);

						let matchedDoctor = null;
						if (!doctorSnap.empty) {
							matchedDoctor = {
								id: doctorSnap.docs[0].id,
								...doctorSnap.docs[0].data(),
							};
						}

						// 3. Save consultation record
						const docRef = doc(collection(db, 'talk_to_doctors'));
						const baseData = {
							appointmentId: docRef.id,
							name: userData.first_name + ' ' + userData.last_name,
							name_lower: (
								userData.first_name +
								' ' +
								userData.last_name
							).toLowerCase(),
							userId: userData.userId,
							firebaseUid: currentUser.uid,
							affectedArea,
							consultationLevel,
							healthComplaint,
							status: 'Pending',
							doctor: matchedDoctor ? matchedDoctor.name : '',
							doctor_email: matchedDoctor ? matchedDoctor.email : '',
							amount: amount / 100, // store in Naira
							paid: true,
							paymentRef: response.reference,
							createdAt: serverTimestamp(),
						};
						await setDoc(docRef, baseData);

						// 4. Notifications & Emails (non-blocking)
						(async () => {
							// Patient notification
							try {
								await createNotification({
									userId: userData.firebaseUid,
									title: 'Consultation Request Sent',
									message: `Your request has been sent to ${
										matchedDoctor ? matchedDoctor.name : 'a doctor'
									}.`,
									type: 'success',
									link: '/user/talk_to_doctor_convos',
								});
							} catch (err) {
								console.error('Notification error (patient):', err);
							}

							// Patient email
							try {
								await sendEmail(
									currentUser.email,
									userData.first_name,
									'Consultation Request Confirmation',
									`
                    <p>Hello ${userData.first_name},</p>
                    <p>Your consultation request for <b>${affectedArea}</b> has been received.</p>
                    <p>A doctor will get in touch with you soon.</p>
                  `
								);
							} catch (err) {
								console.error('Email error (patient):', err);
							}

							// Doctor email
							if (matchedDoctor?.email) {
								try {
									await sendEmail(
										matchedDoctor.email,
										matchedDoctor.name,
										'New Consultation Request',
										`
                      <p>Hello Dr. ${matchedDoctor.name},</p>
                      <p>You have a new consultation request from <b>${
												userData.first_name + ' ' + userData.last_name
											}</b>.</p>
                      <p><b>Affected Area:</b> ${affectedArea}</p>
                      <p><b>Level:</b> ${consultationLevel}</p>
                      <p><b>Complaint:</b> ${healthComplaint}</p>
                    `
									);
								} catch (err) {
									console.error('Email error (doctor):', err);
								}
							}
						})();

						// 5. Success alert + redirect
						Swal.fire(
							'Success',
							'Consultation request sent and payment successful.',
							'success'
						).then(() => {
							navigate('/user/talk_to_doctor_convos');
						});

						// Reset form
						setAffectedArea('');
						setConsultationLevel('');
						setHealthComplaint('');
					} catch (error) {
						console.error('Error during payment verification/booking:', error);
						Swal.fire(
							'Error',
							'Something went wrong while booking the consultation. ' + error,
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
			<UserHeader page_title={'Talk to Health Insurance Demo Doctor'} />
			<div className="db-content-box bg-white round-10 mb-25">
				<form className="form-wrapper style-two" onSubmit={handleSubmit}>
					<div className="row">
						{/* Choose Affected area */}
						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15 position-relative">
								<label
									htmlFor="affectedArea"
									className="fs-13 d-block fw-medium text-title mb-8">
									Choose Affected Area
								</label>
								<select
									type="text"
									id="affectedArea"
									value={affectedArea}
									onChange={(e) => setAffectedArea(e.target.value)}
									className="fs-13 w-100 ht-40 bg-transparent round-5 text-para">
									<option value="">Choose an area</option>
									<option value="Head">Head</option>
									<option value="Eyes">Eyes</option>
									<option value="Ears">Ears</option>
									<option value="Nose">Nose</option>
									<option value="Mouth/Teeth">Mouth / Teeth</option>
									<option value="Neck">Neck</option>
									<option value="Chest/Lungs">Chest / Lungs</option>
									<option value="Heart">Heart</option>
									<option value="Stomach">Stomach</option>
									<option value="Back">Back</option>
									<option value="Spine">Spine</option>
									<option value="Arms">Arms</option>
									<option value="Hands/Wrists">Hands / Wrists</option>
									<option value="Legs">Legs</option>
									<option value="Knees">Knees</option>
									<option value="Feet/Ankles">Feet / Ankles</option>
									<option value="Skin">Skin</option>
									<option value="Kidneys">Kidneys</option>
									<option value="Liver">Liver</option>
									<option value="Reproductive Organs">
										Reproductive Organs
									</option>
								</select>
							</div>
						</div>

						{/* Choose Consultation level */}
						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15 position-relative">
								<label
									htmlFor="consultationLevel"
									className="fs-13 d-block fw-medium text-title mb-8">
									Condition Severity
								</label>
								<select
									type="text"
									id="consultationLevel"
									value={consultationLevel}
									onChange={(e) => setConsultationLevel(e.target.value)}
									className="fs-13 w-100 ht-40 bg-transparent round-5 text-para">
									<option value="">Choose a Level</option>
									<option value="Common Health Concern">
										Common Health Concern
									</option>
									<option value="Minor Health Concern">
										Minor Health Concern
									</option>
									<option value="Moderate Health Concern">
										Moderate Health Concern
									</option>
									<option value="Severe Health Concern">
										Severe Health Concern
									</option>
									<option value="Emergency">Emergency</option>
									<option value=""></option>
								</select>
							</div>
						</div>

						{/* Complaint */}
						<div className="col-12">
							<div className="form-group mb-20">
								<label
									htmlFor="healthComplaint"
									className="fs-13 d-block fw-medium text-title mb-8">
									Health Complaint
								</label>
								<textarea
									id="healthComplaint"
									value={healthComplaint}
									onChange={(e) => setHealthComplaint(e.target.value)}
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
							{submitting ? 'Processing Payment...' : 'Proceed'}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}

export default TalkToDoctor;
