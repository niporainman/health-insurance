import {
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import NavigationTop from './NavigationTop';
import PageHeader from './PageHeader';
import Footer from './Footer';

const us = import.meta.env.VITE_ADMIN_URL;

export default function AdminLogin() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	//friendly error messages
	const getFriendlyError = (code) => {
		switch (code) {
			case 'auth/invalid-email':
				return 'Please enter a valid email address.';
			case 'auth/user-disabled':
				return 'This account has been disabled. Contact support.';
			case 'auth/user-not-found':
				return 'No account found with this email.';
			case 'auth/wrong-password':
				return 'Incorrect password. Please try again.';
			case 'auth/too-many-requests':
				return 'Too many failed attempts. Please try again later.';
			case 'auth/popup-closed-by-user':
				return 'Google sign-in was canceled.';
			case 'auth/popup-blocked':
				return 'Your browser blocked the sign-in popup.';
			case 'auth/invalid-credential':
				return 'Your login credentials are invalid or expired. Please try again.';
			default:
				return 'Something went wrong. Please try again.';
		}
	};

	const verifyAdmin = async (uid) => {
		const adminRef = doc(db, 'admins', uid);
		const snap = await getDoc(adminRef);
		if (!snap.exists()) throw new Error('not-admin');
		const data = snap.data();
		if (data.status !== 'active') throw new Error('inactive');
		return data;
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const cred = await signInWithEmailAndPassword(auth, email, password);
			await verifyAdmin(cred.user.uid);
			navigate(`/admin${us}`);
		} catch (err) {
			if (err.message === 'not-admin') {
				await signOut(auth);
				Swal.fire('Access Denied', 'You are not an admin.', 'error');
			} else if (err.message === 'inactive') {
				await signOut(auth);
				Swal.fire(
					'Account Inactive',
					'Contact support to reactivate.',
					'error'
				);
			} else {
				Swal.fire('Login Failed', getFriendlyError(err.code), 'error');
			}
		} finally {
			setLoading(false);
		}
	};

	// Function to handle Google login
	const handleGoogleLogin = async () => {
		setLoading(true);
		const provider = new GoogleAuthProvider();
		try {
			const cred = await signInWithPopup(auth, provider);
			await verifyAdmin(cred.user.uid);
			navigate(`/admin${us}`);
		} catch (err) {
			await signOut(auth);
			if (err.message === 'not-admin') {
				Swal.fire('Access Denied', 'You are not an admin.', 'error');
			} else if (err.message === 'inactive') {
				Swal.fire(
					'Account Inactive',
					'Contact support to reactivate.',
					'error'
				);
			} else {
				Swal.fire('Login Failed', getFriendlyError(err.code), 'error');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavigationTop />
			<PageHeader page_title="Admin Login" page_title_small="Login" bg="2" />

			{/* Account Section Start */}
			<div className="account-wrap position-relative z-1 pt-120 pb-90">
				<div className="container style-one">
					<div className="row justify-content-center">
						<div className="col-lg-6">
							<div className="account-box round-20 mb-30">
								<h4 className="fs-20 fw-extrabold text-title mb-20">
									Welcome Back
								</h4>
								<form onSubmit={handleLogin} className="form-wrapper">
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
									<div className="form-group mb-20">
										<input
											type="password"
											id="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="Password"
											required
										/>
									</div>

									<button
										type="submit"
										className="btn style-one w-100 d-block font-secondary fw-bold position-relative z-1 round-10"
										disabled={loading}>
										<span>
											{loading ? 'Signing in...' : 'Login'}
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
									<div className="or-text text-center position-relative">
										<span>Or</span>
									</div>
									<button
										type="button"
										onClick={handleGoogleLogin}
										className="w-100 border-0 tt-btn style-two w-block d-block text-center font-secondary fw-bold text-title bg-ash round-5">
										<i className="ri-google-fill"></i>Login with Google
									</button>

									<p className="mt-4 mb-0 text-center">
										Forgot Your Password?{' '}
										<Link
											to="/forgot_password"
											className="text-title fw-bold link-hover-primary">
											Reset it
										</Link>
									</p>
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
