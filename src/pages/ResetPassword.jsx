import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../services/firebase';
import Swal from 'sweetalert2';

import NavigationTop from './NavigationTop';
import PageHeader from './PageHeader';
import Footer from './Footer';

function ResetPassword() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(true);

	const oobCode = searchParams.get('oobCode');
	const mode = searchParams.get('mode');

	useEffect(() => {
		const checkCode = async () => {
			if (mode !== 'resetPassword' || !oobCode) {
				Swal.fire({
					icon: 'error',
					title: 'Invalid link',
					text: 'The password reset link is missing or incorrect.',
				});
				setLoading(false);
				return;
			}

			try {
				await verifyPasswordResetCode(auth, oobCode);
				setLoading(false);
			} catch (err) {
				console.error(err);
				Swal.fire({
					icon: 'error',
					title: 'Invalid or expired link',
					text: 'Please request a new password reset.',
				});
				setLoading(false);
			}
		};

		checkCode();
	}, [oobCode, mode]);

	const handleReset = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			Swal.fire({
				icon: 'warning',
				title: 'Passwords do not match',
				text: 'Please make sure both passwords are the same.',
			});
			return;
		}

		try {
			await confirmPasswordReset(auth, oobCode, newPassword);

			Swal.fire({
				icon: 'success',
				title: 'Password Reset Successful!',
				text: 'You can now log in with your new password.',
				confirmButtonColor: '#3085d6',
			}).then(() => {
				navigate('/hmo_login');
			});
		} catch (err) {
			Swal.fire({
				icon: 'error',
				title: 'Something went wrong',
				text: err.message,
			});
		}
	};

	if (loading) return <p className="text-center mt-10">Verifying link...</p>;

	return (
		<>
			<NavigationTop />
			<PageHeader page_title="Reset Password" page_title_small="Login" bg="2" />

			{/* Account Section Start */}
			<div className="account-wrap position-relative z-1 pt-120 pb-90">
				<div className="container style-one">
					<div className="row justify-content-center">
						<div className="col-lg-6">
							<div className="account-box round-20 mb-30">
								<h4 className="fs-20 fw-extrabold text-title mb-20">
									Set Your New Password
								</h4>

								<form onSubmit={handleReset} className="form-wrapper">
									<div className="form-group mb-20">
										<input
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="New Password"
											required
										/>
									</div>

									<div className="form-group mb-20">
										<input
											type="password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="Confirm New Password"
											required
										/>
									</div>

									<button
										type="submit"
										className="btn style-one w-100 d-block font-secondary fw-bold position-relative z-1 round-10">
										<span>
											Set New Password
											<img
												src="/assets/images/right-arrow-white.svg"
												alt="Icon"
												className="transition icon-left"
											/>
										</span>
										<img
											src="/assets/images/right-arrow-white.svg"
											alt="Icon"
											className="transition icon-right"
										/>
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Account Section End */}

			<Footer />
		</>
	);
}

export default ResetPassword;
