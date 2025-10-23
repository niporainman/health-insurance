import { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import {
	createUserWithEmailAndPassword,
	sendEmailVerification,
	GoogleAuthProvider,
	signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import NavigationTop from './NavigationTop';
import PageHeader from './PageHeader';
import Footer from './Footer';

function UserSignUp() {
	// from react-router-dom to navigate after successful registration
	const navigate = useNavigate();
	// Function to convert Firebase error codes to user-friendly messages
	const getFriendlyError = (code) => {
		switch (code) {
			case 'auth/email-already-in-use':
				return 'This email is already registered. Try logging in or use a different email.';
			case 'auth/invalid-email':
				return 'Please enter a valid email address.';
			case 'auth/weak-password':
				return 'Your password is too weak. It should be at least 6 characters.';
			case 'auth/network-request-failed':
				return 'Network error. Please check your internet connection.';
			case 'auth/internal-error':
				return 'Something went wrong. Please try again later.';
			case 'auth/popup-closed-by-user':
				return 'The sign-in popup was closed before completing. Please try again.';
			case 'auth/cancelled-popup-request':
				return 'Only one sign-in popup allowed at a time.';
			default:
				return 'An unexpected error occurred. Please try again.';
		}
	};

	// Set the document title when the component mounts
	useEffect(() => {
		document.title = import.meta.env.VITE_COMPANY_NAME + ' | Sign Up';
	}, []);

	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password: '',
		phone: '',
	});

	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	const generateUserId = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		return Array.from(
			{ length: 8 },
			() => chars[Math.floor(Math.random() * chars.length)]
		).join('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const userCred = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);
			const user = userCred.user;

			await setDoc(doc(db, 'users', user.uid), {
				firebaseUid: user.uid,
				userId: generateUserId(),
				first_name: formData.first_name,
				last_name: formData.last_name,
				email: formData.email,
				phone: formData.phone,
				gender: '',
				address: '',
				email_sent: true,
				email_confirmed: false,
				acc_approved: true,
				date_reg: serverTimestamp(),
				employment_status: '',
				marital_status: '',
				number_dependants: null,
				dob: null,
				health_preconditions: '',
				role: 'user',
			});

			await sendEmailVerification(user);
			navigate('/user');
		} catch (err) {
			const message = getFriendlyError(err.code);
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: message,
			});
		} finally {
			setLoading(false);
		}
	};

	// Function to handle Google sign-in
	const handleGoogleSignIn = async () => {
		const provider = new GoogleAuthProvider();
		setLoading(true);
		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Check if user already exists in Firestore
			const userRef = doc(db, 'users', user.uid);
			const userSnap = await getDoc(userRef);

			if (!userSnap.exists()) {
				// Save new user details
				await setDoc(userRef, {
					firebaseUid: user.uid,
					userId: generateUserId(),
					first_name: user.displayName?.split(' ')[0] || '',
					last_name: user.displayName?.split(' ')[1] || '',
					email: user.email,
					phone: '',
					gender: '',
					address: '',
					email_sent: true,
					email_confirmed: true,
					acc_approved: true,
					date_reg: serverTimestamp(),
					employment_status: '',
					marital_status: '',
					number_dependants: null,
					dob: null,
					health_preconditions: '',
					role: 'user',
				});
			}

			navigate('/user');
		} catch (err) {
			const message = getFriendlyError(err.code);
			Swal.fire({
				icon: 'error',
				title: 'Google Sign-In Failed',
				text: message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavigationTop />
			<PageHeader page_title="Sign Up" page_title_small="Register" bg="2" />

			{/* Account Section Start */}
			<div className="account-wrap position-relative z-1 pt-120 pb-90">
				<div className="container style-one">
					<div className="row justify-content-center">
						<div className="col-lg-6">
							<div className="account-box round-20 mb-30">
								<h4 className="fs-20 fw-extrabold text-title mb-20">
									Create Account
								</h4>
								<form onSubmit={handleSubmit} className="form-wrapper">
									<div className="form-group mb-20">
										<input
											type="text"
											id="first_name"
											value={formData.first_name}
											onChange={handleChange}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="First Name"
											required
										/>
									</div>
									<div className="form-group mb-20">
										<input
											type="text"
											id="last_name"
											value={formData.last_name}
											onChange={handleChange}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="Last Name"
											required
										/>
									</div>
									<div className="form-group mb-20">
										<input
											type="email"
											id="email"
											value={formData.email}
											onChange={handleChange}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="Email Address"
											required
										/>
									</div>
									<div className="form-group mb-20">
										<input
											type="password"
											id="password"
											value={formData.password}
											onChange={handleChange}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="Password"
											required
										/>
									</div>
									<div className="form-group mb-20">
										<input
											type="text"
											id="phone"
											value={formData.phone}
											onChange={handleChange}
											className="w-100 ht-60 bg-ash round-10 text-para border-0"
											placeholder="Phone"
											required
										/>
									</div>
									<div className="form-group mb-20">
										<input type="checkbox" id="terms" required />
										<span>
											{' '}
											I agree to the{' '}
											<Link to="/terms" className="btn-link">
												terms and conditions
											</Link>
										</span>
									</div>
									<button
										type="submit"
										className="btn style-one w-100 d-block font-secondary fw-bold position-relative z-1 round-10"
										disabled={loading}>
										<span>
											{loading ? 'Registering...' : 'Register Now'}
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
										onClick={handleGoogleSignIn}
										className="w-100 tt-btn style-two w-block d-block text-center font-secondary fw-bold text-title bg-ash round-5 border-0"
										disabled={loading}>
										<i className="ri-google-fill"></i> Sign up with Google
									</button>

									<p className="mt-4 mb-0 text-center">
										Already Have An Account?{' '}
										<Link
											to="/user_login"
											className="text-title fw-bold link-hover-primary">
											Login
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

export default UserSignUp;
