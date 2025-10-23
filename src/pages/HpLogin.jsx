import {
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
} from 'firebase/auth';
import { getDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';
import NavigationTop from './NavigationTop';
import PageHeader from './PageHeader';
import Footer from './Footer';

export default function HpLogin() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	// Friendly Firebase error messages
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

	const generateHpId = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		return Array.from(
			{ length: 8 },
			() => chars[Math.floor(Math.random() * chars.length)]
		).join('');
	};

	// Verify HP exists and is approved
	const verifyHp = async (uid) => {
		const snap = await getDoc(doc(db, 'hps', uid));
		if (!snap.exists()) throw new Error('not-hp');
		const data = snap.data();
		if (!data.acc_approved) throw new Error('not-approved');
		return data;
	};

	// Email/Password Login
	const handleLogin = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			return Swal.fire({
				icon: 'warning',
				title: 'Missing Fields',
				text: 'Please enter both email and password.',
			});
		}
		if (loading) return;
		setLoading(true);

		try {
			const cred = await signInWithEmailAndPassword(
				auth,
				email.trim(),
				password
			);
			await verifyHp(cred.user.uid);
			navigate('/hp');
		} catch (err) {
			await signOut(auth);
			if (err.message === 'not-hp') {
				Swal.fire(
					'Access Denied',
					'You are not registered as a Health Provider.',
					'error'
				);
			} else if (err.message === 'not-approved') {
				Swal.fire(
					'Account Restricted',
					'Your account is pending approval. Contact support.',
					'error'
				);
			} else {
				Swal.fire('Login Failed', getFriendlyError(err.code));
			}
		} finally {
			setLoading(false);
		}
	};

	//Google Login
	const handleGoogleLogin = async () => {
		if (loading) return;
		setLoading(true);
		const provider = new GoogleAuthProvider();

		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			if (!user?.uid)
				throw new Error('Login failed. No user information returned.');

			const docRef = doc(db, 'hps', user.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				// Create HP account in PENDING state
				await setDoc(docRef, {
					hpId: generateHpId(),
					name: user.displayName?.split(' ')[0] || '',
					email: user.email,
					phone: '',
					logo: '',
					contact_person: '',
					contact_person_phone: '',
					contact_person1: '',
					contact_person1_phone: '',
					email_sent: true,
					email_confirmed: true,
					acc_approved: false, // requires admin approval
					date_reg: serverTimestamp(),
					role: 'hp',
				});
				// Inform user they need approval
				await signOut(auth);
				return Swal.fire(
					'Registration Pending',
					'Your account has been created and awaits admin approval.',
					'info'
				);
			}

			// Existing account → check approval
			await verifyHp(user.uid);
			navigate('/hp');
		} catch (err) {
			await signOut(auth);
			if (err.message === 'not-hp') {
				Swal.fire(
					'Access Denied',
					'You are not registered as a Health Provider.',
					'error'
				);
			} else if (err.message === 'not-approved') {
				Swal.fire(
					'Account Restricted',
					'Your account is pending approval. Contact support.',
					'error'
				);
			} else {
				Swal.fire('Login Failed', getFriendlyError(err.code));
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavigationTop />
			<PageHeader page_title="HP Login" page_title_small="Login" bg="2" />

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
											to="/hp_signup"
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
