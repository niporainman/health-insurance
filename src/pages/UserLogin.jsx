import {
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
} from 'firebase/auth';
import { getDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import NavigationTop from './NavigationTop';
import PageHeader from './PageHeader';
import Footer from './Footer';
import { Link } from 'react-router-dom';

export default function Login() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const { currentUser, role } = useAuth();

	// Friendly Firebase errors
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

	const generateUserId = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		return Array.from(
			{ length: 8 },
			() => chars[Math.floor(Math.random() * chars.length)]
		).join('');
	};

	useEffect(() => {
		if (currentUser && role === 'user') {
			navigate('/user');
		}
	}, [currentUser, role, navigate]);

	const showLoginError = (err) => {
		const code = err.code || err.message;
		Swal.fire('Login Failed', getFriendlyError(code), 'error');
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			// trim to avoid accidental whitespace
			const emailTrimmed = email.trim();
			await signInWithEmailAndPassword(auth, emailTrimmed, password);
			// navigation handled by AuthContext effect
		} catch (err) {
			await signOut(auth);
			showLoginError(err);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		const provider = new GoogleAuthProvider();
		provider.setCustomParameters({ prompt: 'select_account' });

		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			if (!user?.uid) throw { code: 'no-user' };

			const userRef = doc(db, 'users', user.uid);
			const snap = await getDoc(userRef);

			if (!snap.exists()) {
				// Create a pending record
				await setDoc(userRef, {
					user_id: generateUserId(),
					first_name: user.displayName?.split(' ')[0] || '',
					last_name: user.displayName?.split(' ')[1] || '',
					email: user.email || '',
					phone: '',
					gender: '',
					address: '',
					email_sent: true,
					email_confirmed: true,
					acc_approved: true, // set false if you want manual approval
					date_reg: serverTimestamp(),
					employment_status: '',
					marital_status: '',
					number_dependants: null,
					dob: null,
					health_preconditions: '',
					role: 'user',
				});

				// Force sign-out so user must re-login (if you need onboarding)
				// await signOut(auth);
				// Swal.fire('Account Created',
				//   'Your profile has been created. Please complete your details.',
				//   'info'
				// );
				// return;
			}

			// Existing or approved → proceed
			navigate('/user');
		} catch (err) {
			if (err.code === 'auth/popup-closed-by-user') return;
			await signOut(auth);
			showLoginError(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavigationTop />
			<PageHeader page_title="Login" page_title_small="Login" bg="1" />

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
										Don't Have An Account?{' '}
										<Link
											to="/user_signup"
											className="text-title fw-bold link-hover-primary">
											Sign Up
										</Link>
									</p>
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
