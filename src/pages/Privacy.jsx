import NavigationTop from '../pages/NavigationTop';
import PageHeader from './PageHeader';
import Footer from '../pages/Footer';
import { useEffect } from 'react';

const company_name = import.meta.env.VITE_COMPANY_NAME;
const company_email = import.meta.env.VITE_COMPANY_EMAIL;

function Privacy() {
	useEffect(() => {
		document.title = `${company_name} - Privacy Policy`;
	}, []);

	return (
		<>
			<NavigationTop />
			<PageHeader
				page_title="Privacy Policy"
				page_title_small="Privacy Policy"
				bg="2"
			/>

			<section className="container py-8 privacy-content">
				<h3>1. Introduction</h3>
				<p>
					{company_name} (“we,” “our,” “us”) respects your privacy and is
					committed to protecting your personal information. This Privacy Policy
					explains how we collect, use, disclose, and safeguard your information
					when you use our health insurance web application and related
					services.
				</p>

				<h3>2. Information We Collect</h3>
				<ul>
					<li>
						<strong>Personal Information:</strong> Name, email, phone number,
						date of birth, insurance plan details, and appointment data that you
						provide during registration or when purchasing a plan.
					</li>
					<li>
						<strong>Health-Related Data:</strong> Information about your
						selected health providers, HMOs, or appointment requests (but we do
						not store medical records unless required for plan administration).
					</li>
					<li>
						<strong>Usage Data:</strong> IP address, browser type, device
						information, and pages visited, collected automatically through
						analytics tools and cookies.
					</li>
				</ul>

				<h3>3. How We Use Your Information</h3>
				<ul>
					<li>To create and manage your user account</li>
					<li>
						To process insurance purchases, plan registrations, and appointment
						bookings
					</li>
					<li>
						To communicate updates, confirmations, and service notifications
					</li>
					<li>To improve our services and develop new features</li>
					<li>To comply with legal obligations and protect against fraud</li>
				</ul>

				<h3>4. Sharing of Information</h3>
				<p>We may share your information with:</p>
				<ul>
					<li>
						Health Maintenance Organizations (HMOs) and health providers for the
						purpose of processing your insurance plan or appointment.
					</li>
					<li>
						Third-party service providers (such as Firebase) for data hosting,
						analytics, and email notifications.
					</li>
					<li>
						Legal authorities if required to comply with applicable laws,
						regulations, or court orders.
					</li>
				</ul>

				<h3>5. Data Security</h3>
				<p>
					We implement industry-standard safeguards, including encrypted
					connections (HTTPS), access controls, and regular security reviews.
					However, no method of electronic storage is 100% secure, and we cannot
					guarantee absolute security.
				</p>

				<h3>6. Your Rights</h3>
				<p>
					Depending on your location, you may have the right to access, correct,
					delete, or restrict the use of your personal data. Contact us at the
					email address below to exercise these rights.
				</p>

				<h3>7. Cookies & Tracking</h3>
				<p>
					We use cookies and similar technologies to enhance user experience and
					analyze traffic. You can disable cookies in your browser settings, but
					some features may not work properly.
				</p>

				<h3>8. Children’s Privacy</h3>
				<p>
					Our services are not directed to children under 13 (or the applicable
					age of consent in your jurisdiction). We do not knowingly collect data
					from minors.
				</p>

				<h3>9. Changes to This Policy</h3>
				<p>
					We may update this Privacy Policy from time to time. The revised
					version will be posted on this page with a new “Last updated” date.
				</p>

				<h3>10. Contact Us</h3>
				<p>
					If you have any questions about this Privacy Policy or our practices,
					please contact us at:
					<br />
					<strong>Email:</strong> {company_email}
				</p>
			</section>

			<Footer />
		</>
	);
}

export default Privacy;
