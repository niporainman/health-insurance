import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import Swal from 'sweetalert2';

import NavigationTop from './NavigationTop';
import PageHeader from './PageHeader';
import Footer from './Footer';

function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setLoading(true);

		const actionCodeSettings = {
			url: `${import.meta.env.VITE_URL}/hmo_reset_password`,
			handleCodeInApp: true,
		};

		try {
			await sendPasswordResetEmail(auth, email, actionCodeSettings);

			Swal.fire({
				icon: 'success',
				title: 'Email Sent!',
				text: 'Password reset email has been sent. Please check your inbox.',
				confirmButtonColor: '#3085d6',
			});

			setEmail('');
		} catch (err) {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: err.message,
				confirmButtonColor: '#d33',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavigationTop />
			<PageHeader
				page_title="Forgot Password"
				page_title_small="Login"
				bg="2"
			/>

			{/* Account Section Start */}
			<div className="account-wrap position-relative z-1 pt-120 pb-90">
				<div className="container style-one">
					<div className="row justify-content-center">
						<div className="col-lg-6">
							<div className="account-box round-20 mb-30">
								<h4 className="fs-20 fw-extrabold text-title mb-20">
									Enter your email address
								</h4>

								<form onSubmit={handleResetPassword} className="form-wrapper">
									<div className="form-group mb-20">
										<input
											type="email"
											id="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="Email Address"
											required
										/>
									</div>

									<button
										type="submit"
										className="btn style-one w-100 d-block font-secondary fw-bold position-relative z-1 round-10"
										disabled={loading}>
										<span>
											{loading ? 'Sending...' : 'Reset Password'}
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

export default ForgotPassword;
