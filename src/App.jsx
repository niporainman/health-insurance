import { useEffect } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { initializeTheme } from './utils/theme';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import { auth } from './services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AOS from 'aos';
import 'aos/dist/aos.css';

import UserSignUp from './pages/UserSignUp';
import UserLogin from './pages/UserLogin';
import UserLayout from './layouts/UserLayout';
import UserHome from './pages/user/UserHome';
import BuyPlan from './pages/user/BuyPlan';
import UserPlans from './pages/user/UserPlans';
import UserOtherPlans from './pages/user/UserOtherPlans';
import BookAppointment from './pages/user/BookAppointment';
import BookAppointmentOutPocket from './pages/user/BookAppointmentOutPocket';
import UserAppointments from './pages/user/UserAppointments';
import UserAccount from './pages/user/UserAccount';
import TalkToDoctor from './pages/user/TalkToDoctor';
import TalkToDoctorConvos from './pages/user/TalktoDoctorConvos';
import UserAppointmentDetails from './pages/user/UserAppointmentDetails';
import UserConversationDetails from './pages/user/UserConversationDetails';
import UserNotifications from './pages/user/UserNotifications';

import HmoSignUp from './pages/HmoSignUp';
import HmoLogin from './pages/HmoLogin';
import HmoLayout from './layouts/HmoLayout';
import HmoHome from './pages/hmo/HMOHome';
import AddPlan from './pages/hmo/AddPlan';
import HmoPlans from './pages/hmo/HmoPlans';
import HmoAppointments from './pages/hmo/HmoAppointments';
import HmoNewClaims from './pages/hmo/HmoNewClaims';
import HmoOldClaims from './pages/hmo/HmoOldClaims';
import HmoAccount from './pages/hmo/HmoAccount';
import HmoAppointmentDetails from './pages/hmo/HmoAppointmentDetails';
import HmoPlanDetails from './pages/hmo/HmoPlanDetails';
import HmoNotifications from './pages/hmo/HmoNotifications';

import HpSignUp from './pages/HpSignUp';
import HpLogin from './pages/HpLogin';
import HpLayout from './layouts/HpLayout';
import HpHome from './pages/hp/HpHome';
import HpAppointments from './pages/hp/HpAppointments';
import HpNewClaims from './pages/hp/HpNewClaims';
import HpOldClaims from './pages/hp/HpOldClaims';
import HpAccount from './pages/hp/HpAccount';
import HpAppointmentDetails from './pages/hp/HpAppointmentDetails';
import HpNotifications from './pages/hp/HpNotifications';

import AdminLogin from './pages/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import Users from './pages/admin/Users';
import UserDetails from './pages/admin/UserDetails';
import AdminHmos from './pages/admin/AdminHmos';
import HmoDetails from './pages/admin/HmoDetails';

import AdminHmoPlans from './pages/admin/AdminHmoPlans';
import AdminHmoPlanDetails from './pages/admin/AdminHmoPlanDetails';
import AdminHmoNewClaims from './pages/admin/AdminHmoNewClaims';
import AdminHmoOldClaims from './pages/admin/AdminHmoOldClaims';
import AdminHmoAppointments from './pages/admin/AdminHmoAppointments';

import AdminHps from './pages/admin/AdminHps';
import HpDetails from './pages/admin/HpDetails';

import AdminHpNewClaims from './pages/admin/AdminHpNewClaims';
import AdminHpOldClaims from './pages/admin/AdminHpOldClaims';
import AdminHpAppointments from './pages/admin/AdminHpAppointments';

import Appointments from './pages/admin/Appointments';
import AppointmentDetails from './pages/admin/AppointmentDetails';
import NewClaims from './pages/admin/NewClaims';
import OldClaims from './pages/admin/OldClaims';
import Account from './pages/admin/Account';
import Notifications from './pages/admin/Notifications';
import AdminUserPlans from './pages/admin/AdminUserPlans';

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Home from './pages/Home';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import Hmos from './pages/Hmos';
import Hps from './pages/Hps';
import Contact from './pages/Contact';

function App() {
	useEffect(() => {
		initializeTheme();
	}, []);

	useEffect(() => {
		AOS.init({
			duration: 1000,
			once: true,
			startEvent: 'DOMContentLoaded',
		});
	}, []);

	//if logged in already, redirect to user dashboard
	const PublicOnlyRoute = ({ children, redirect }) => {
		const [user, loading] = useAuthState(auth);
		if (loading) return <div>Loading...</div>;

		return user ? <Navigate to={redirect} /> : children;
	};

	//append to create a different url, not the regular admin, i call it the url scrambler or us for short
	const us = import.meta.env.VITE_ADMIN_URL;

	return (
		<AuthProvider>
			<Router>
				<Routes>
					{/*ADMIN ROUTES*/}
					<Route
						path={`/admin_login${us}`}
						element={
							<PublicOnlyRoute redirect={`/admin${us}`}>
								<AdminLogin />
							</PublicOnlyRoute>
						}
					/>
					{/*Nested ADMIN routes */}
					<Route
						path={`/admin${us}`}
						element={
							<ProtectedRoute redirect={`/admin_login${us}`}>
								<RequireRole
									allowedRoles={['admin']}
									redirectTo={`/admin${us}`}>
									<AdminLayout />
								</RequireRole>
							</ProtectedRoute>
						}>
						<Route index element={<AdminHome />} />
						<Route path="users" element={<Users />} />
						<Route path="user_details/:id" element={<UserDetails />} />

						<Route path="hmos" element={<AdminHmos />} />
						<Route path="hmo_details/:id" element={<HmoDetails />} />
						<Route path="hmo_plans/:id" element={<AdminHmoPlans />} />
						<Route
							path="hmo_plan_details/:id"
							element={<AdminHmoPlanDetails />}
						/>
						<Route path="hmo_new_claims/:id" element={<AdminHmoNewClaims />} />
						<Route path="hmo_old_claims/:id" element={<AdminHmoOldClaims />} />
						<Route
							path="hmo_appointments/:id"
							element={<AdminHmoAppointments />}
						/>

						<Route path="hps" element={<AdminHps />} />
						<Route path="hp_details/:id" element={<HpDetails />} />
						<Route path="hp_new_claims/:id" element={<AdminHpNewClaims />} />
						<Route path="hp_old_claims/:id" element={<AdminHpOldClaims />} />
						<Route
							path="hp_appointments/:id"
							element={<AdminHpAppointments />}
						/>

						<Route path="appointments" element={<Appointments />} />
						<Route
							path="appointment_details/:id"
							element={<AppointmentDetails />}
						/>
						<Route path="new_claims" element={<NewClaims />} />
						<Route path="old_claims" element={<OldClaims />} />
						<Route path="user_plans" element={<AdminUserPlans />} />
						<Route path="account" element={<Account />} />
						<Route path="notifications" element={<Notifications />} />
					</Route>

					{/* USER ROUTES */}
					<Route
						path="/user_signup"
						element={
							<PublicOnlyRoute redirect="/user">
								<UserSignUp />
							</PublicOnlyRoute>
						}
					/>
					<Route
						path="/user_login"
						element={
							<PublicOnlyRoute redirect="/user">
								<UserLogin />
							</PublicOnlyRoute>
						}
					/>
					{/*Nested user routes */}
					<Route
						path="/user"
						element={
							<ProtectedRoute redirect="/user_login">
								<RequireRole allowedRoles={['user']} redirectTo="/">
									<UserLayout />
								</RequireRole>
							</ProtectedRoute>
						}>
						<Route index element={<UserHome />} />
						<Route path="buy_plan" element={<BuyPlan />} />
						<Route path="user_plans" element={<UserPlans />} />
						<Route path="user_other_plans" element={<UserOtherPlans />} />
						<Route path="book_appointment" element={<BookAppointment />} />
						<Route
							path="book_appointment_out_pocket"
							element={<BookAppointmentOutPocket />}
						/>
						<Route path="user_appointments" element={<UserAppointments />} />
						<Route path="user_account" element={<UserAccount />} />
						<Route path="talk_doctor" element={<TalkToDoctor />} />
						<Route
							path="talk_to_doctor_convos"
							element={<TalkToDoctorConvos />}
						/>
						<Route
							path="user_appointment_details/:id"
							element={<UserAppointmentDetails />}
						/>
						<Route
							path="user_conversation_details/:id"
							element={<UserConversationDetails />}
						/>
						<Route path="notifications" element={<UserNotifications />} />
					</Route>

					{/*HMO ROUTES*/}
					<Route
						path="/hmo_signup"
						element={
							<PublicOnlyRoute redirect="/hmo">
								<HmoSignUp />
							</PublicOnlyRoute>
						}
					/>
					<Route
						path="/hmo_login"
						element={
							<PublicOnlyRoute redirect="/hmo">
								<HmoLogin />
							</PublicOnlyRoute>
						}
					/>
					{/*Nested hmo routes */}
					<Route
						path="/hmo"
						element={
							<ProtectedRoute redirect="/hmo_login">
								<RequireRole allowedRoles={['hmo']} redirectTo="/">
									<HmoLayout />
								</RequireRole>
							</ProtectedRoute>
						}>
						<Route index element={<HmoHome />} />
						<Route path="add_plan" element={<AddPlan />} />
						<Route path="hmo_plans" element={<HmoPlans />} />
						<Route path="hmo_appointments" element={<HmoAppointments />} />
						<Route path="new_claims" element={<HmoNewClaims />} />
						<Route path="old_claims" element={<HmoOldClaims />} />
						<Route path="hmo_account" element={<HmoAccount />} />
						<Route
							path="hmo_appointment_details/:id"
							element={<HmoAppointmentDetails />}
						/>
						<Route path="hmo_plan_details/:id" element={<HmoPlanDetails />} />
						<Route path="notifications" element={<HmoNotifications />} />
					</Route>

					{/*HP ROUTES*/}
					<Route
						path="/hp_signup"
						element={
							<PublicOnlyRoute redirect="/hp">
								<HpSignUp />
							</PublicOnlyRoute>
						}
					/>
					<Route
						path="/hp_login"
						element={
							<PublicOnlyRoute redirect="/hp">
								<HpLogin />
							</PublicOnlyRoute>
						}
					/>
					{/*Nested hp routes */}
					<Route
						path="/hp"
						element={
							<ProtectedRoute redirect="/hp_login">
								<RequireRole allowedRoles={['hp']} redirectTo="/">
									<HpLayout />
								</RequireRole>
							</ProtectedRoute>
						}>
						<Route index element={<HpHome />} />
						<Route path="hp_appointments" element={<HpAppointments />} />
						<Route path="hp_account" element={<HpAccount />} />
						<Route path="new_claims" element={<HpNewClaims />} />
						<Route path="old_claims" element={<HpOldClaims />} />
						<Route
							path="hp_appointment_details/:id"
							element={<HpAppointmentDetails />}
						/>
						<Route path="notifications" element={<HpNotifications />} />
					</Route>

					{/* Public Routes */}
					<Route path="/" element={<Home />} />
					<Route path="about" element={<About />} />
					<Route path="terms" element={<Terms />} />
					<Route path="privacy" element={<Privacy />} />
					<Route path="forgot_password" element={<ForgotPassword />} />
					<Route path="reset_password" element={<ResetPassword />} />
					<Route path="hmos" element={<Hmos />} />
					<Route path="hps" element={<Hps />} />
					<Route path="contact" element={<Contact />} />

					{/* Redirect to home if no route matches */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
