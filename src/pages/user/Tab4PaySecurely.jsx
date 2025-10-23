import { useState } from 'react';
import Swal from 'sweetalert2';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { addMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createNotification, sendEmail } from '../../services/notifications';

function BuyPlan({ plan, hmo, provider }) {
	const [selectedDuration, setSelectedDuration] = useState(null);
	const [paying, setPaying] = useState(false);
	const { currentUser: user, userData } = useAuth();
	const navigate = useNavigate();

	// Duration options from plan
	const durationOptions = [
		{ label: plan.duration1, price: plan.price1 },
		{ label: plan.duration2, price: plan.price2 },
		{ label: plan.duration3, price: plan.price3 },
		{ label: plan.duration4, price: plan.price4 },
	].filter((opt) => Number(opt.label) > 0 && Number(opt.price) > 0);

	//generate random id as enrolle number and purchase id
	const generateId = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		return Array.from(
			{ length: 8 },
			() => chars[Math.floor(Math.random() * chars.length)]
		).join('');
	};

	// Save plan to Firestore
	const handleSavePlan = async (
		paymentRef,
		duration,
		price,
		status = 'Approved',
		failureReason = ''
	) => {
		try {
			setPaying(true);

			const startDate = new Date();
			const endDate = addMonths(startDate, Number(duration));

			if (!userData?.userId) {
				Swal.fire(
					'Error',
					'User profile not available yet. Please try again.',
					'error'
				);
				return false;
			}

			// Generate a Firestore docRef so we can include purchaseId
			const docRef = doc(collection(db, 'user_plans'));

			const planData = {
				userId: userData.userId,
				firebaseUid: user.uid,
				hmoId: hmo.hmoId,
				hmofirebaseUid: hmo.firebaseUid,
				hmoName: hmo.name,
				planId: plan.plan_id,
				planName: plan.plan_name,
				hpId: provider.hpId,
				hpfirebaseUid: provider.firebaseUid,
				hpName: provider.name,
				duration: Number(duration),
				price: Number(price),
				paymentRef,
				status,
				failureReason,
				startDate,
				endDate,
				timestamp: serverTimestamp(),
				enrolleId: generateId(),
				purchaseId: docRef.id, // use Firestore doc ID
			};

			await setDoc(docRef, planData);

			if (status === 'Approved') {
				Swal.fire({
					icon: 'success',
					title: 'Payment Successful',
					text: 'Your plan has been activated.',
					confirmButtonText: 'OK',
				}).then(() => {
					navigate('/user/user_plans');
				});
			} else {
				Swal.fire('Failed', failureReason || 'Payment failed.', 'error');
			}

			return true;
		} catch (err) {
			Swal.fire('Error', 'Error saving plan: ' + err.message, 'error');
			return false;
		} finally {
			setPaying(false);
		}
	};

	// Handle Paystack payment
	const handlePayment = () => {
		if (!selectedDuration || !user) {
			Swal.fire(
				'Missing Info',
				'Please select a plan and make sure you are logged in.',
				'warning'
			);
			return;
		}

		const { label, price } = selectedDuration;

		const paystack = window.PaystackPop.setup({
			key: import.meta.env.VITE_PAYSTACK_KEY,
			email: user.email,
			amount: Number(price) * 100,
			currency: 'NGN',
			onClose: () => {
				Swal.fire('Cancelled', 'You cancelled the transaction.', 'info');
				handleSavePlan(
					'cancelled_by_user',
					parseInt(label),
					price,
					'failure',
					'User cancelled the transaction'
				);
			},
			callback: function (response) {
				(async () => {
					try {
						// Verify with PHP backend
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
							handleSavePlan(
								response.reference,
								parseInt(label),
								price,
								'failure',
								'Payment verification failed'
							);
							return;
						}

						// Save plan as Approved
						const saveResult = await handleSavePlan(
							response.reference,
							parseInt(label),
							price,
							'Approved'
						);

						if (saveResult) {
							// send notification to user
							await createNotification({
								userId: user.uid,
								title: 'Plan Purchased Successfully',
								message: `You successfully purchased the ${plan.plan_name} plan for ₦${price}.`,
								type: 'success',
								link: '/user/user_plans',
							});

							// send email to user
							try {
								await sendEmail(
									user.email,
									`${userData.first_name} ${userData.last_name}`,
									'Plan Purchase Successful',
									`<p>Dear ${userData.first_name},</p>
                <p>Thank you for purchasing the ${
									plan.plan_name
								} plan for ₦${price}. Your plan is now active.</p>
                <p>Best regards,<br/>${
									import.meta.env.VITE_COMPANY_NAME
								} Team</p>`
								);
							} catch (err) {
								console.error('Failed to send email to user:', err);
							}

							// send notification to HMO
							await createNotification({
								userId: hmo.firebaseUid,
								title: 'HMO Plan Purchased Successfully',
								message: `${userData.first_name} ${userData.last_name} successfully purchased your ${plan.plan_name} plan for ₦${price}.`,
								type: 'success',
							});

							// send email to HMO
							try {
								await sendEmail(
									hmo.email,
									hmo.name,
									'HMO Plan Purchased',
									`<p>Dear ${hmo.name},</p>
                <p>${userData.first_name} ${
										userData.last_name
									} has successfully purchased your ${
										plan.plan_name
									} plan for ₦${price}.</p>
                <p>Best regards,<br/>${
									import.meta.env.VITE_COMPANY_NAME
								} Team</p>`
								);
							} catch (err) {
								console.error('Failed to send email to HMO:', err);
							}

							// send notification to HP
							await createNotification({
								userId: provider.firebaseUid,
								title: 'HMO Plan Purchased Successfully',
								message: `${userData.first_name} ${userData.last_name} successfully purchased the ${plan.plan_name} plan for ₦${price} and has selected you as their Primary Health Provider.`,
								type: 'success',
							});

							// send email to HP
							try {
								await sendEmail(
									provider.email,
									provider.name,
									'HMO Plan Purchased',
									`<p>Dear ${provider.name},</p>
                <p>${userData.first_name} ${
										userData.last_name
									} has successfully purchased the ${
										plan.plan_name
									} plan for ₦${price} and has selected you as their Primary Health Provider.</p>
                <p>Best regards,<br/>${
									import.meta.env.VITE_COMPANY_NAME
								} Team</p>`
								);
							} catch (err) {
								console.error('Failed to send email to HP:', err);
							}
						}
					} catch (error) {
						console.error('Verification error:', error);
						Swal.fire(
							'Error',
							'Something went wrong during payment verification.',
							'error'
						);
					}
				})();
			},
		});

		paystack.openIframe();
	};

	return (
		<div>
			<div className="alert alert-info mt-3">
				<h5 className="mb-2 text-title">Summary</h5>
				<p>
					<strong>HMO:</strong> {hmo.name}
				</p>
				<p>
					<strong>Plan:</strong> {plan.plan_name}
				</p>
				<p>
					<strong>Health Provider:</strong> {provider.name}
				</p>
			</div>

			<h4>Select Plan Duration:</h4>
			<div className="containter">
				<div className="row">
					<div className="col-12 col-md-6 mb-3">
						<label htmlFor="duration" className="form-label fw-semibold">
							Choose Plan Duration
						</label>
						<select
							id="duration"
							className="form-select"
							value={selectedDuration?.label || ''}
							onChange={(e) => {
								const selected = durationOptions.find(
									(opt) => String(opt.label) === e.target.value
								);
								setSelectedDuration(selected);
							}}>
							<option value="">-- Select Duration --</option>
							{durationOptions.map((opt, i) => (
								<option key={i} value={opt.label}>
									{opt.label} month plan – ₦{opt.price}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<button
				className="btn btn-primary"
				onClick={handlePayment}
				disabled={!selectedDuration || paying}>
				{paying ? 'Processing...' : 'Pay Now'}
			</button>
		</div>
	);
}

export default BuyPlan;
