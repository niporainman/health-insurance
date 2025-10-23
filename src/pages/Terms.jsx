import NavigationTop from '../pages/NavigationTop';
import PageHeader from './PageHeader';
import Footer from '../pages/Footer';
import { useEffect } from 'react';

const company_name = import.meta.env.VITE_COMPANY_NAME;
const company_email = import.meta.env.VITE_COMPANY_EMAIL;

function Terms() {
	useEffect(() => {
		document.title = `${company_name} - Terms & Conditions`;
	}, []);

	return (
		<>
			<NavigationTop />
			<PageHeader
				page_title="Terms & Conditions"
				page_title_small="Terms & Conditions"
				bg="2"
			/>

			<section className="container py-8 terms-content">
				<h3>1. Acceptance of Terms</h3>
				<p>
					By creating an account, purchasing a health plan, or using{' '}
					{company_name}’s services (“Services”), you agree to these Terms &
					Conditions and our Privacy Policy. If you do not agree, please do not
					use our Services.
				</p>

				<h3>2. Services Provided</h3>
				<p>
					{company_name} provides an online platform to browse, purchase, and
					manage health insurance plans, connect with Health Maintenance
					Organizations (HMOs), and schedule medical appointments. We are not a
					medical provider and do not offer medical advice.
				</p>

				<h3>3. User Accounts</h3>
				<ul>
					<li>You must be at least 18 years old to register.</li>
					<li>
						You agree to provide accurate, complete, and current information
						when creating your account.
					</li>
					<li>
						You are responsible for maintaining the confidentiality of your
						login credentials and for all activity under your account.
					</li>
				</ul>

				<h3>4. Insurance Plans & Appointments</h3>
				<ul>
					<li>
						All plans are subject to approval by the respective HMO and may have
						additional terms and eligibility requirements.
					</li>
					<li>
						{company_name} is a technology platform and is not liable for the
						actions, omissions, or services of third-party HMOs or health
						providers.
					</li>
					<li>
						Appointments may require HMO pre-approval. Users must adhere to
						cancellation and rescheduling policies provided within the app.
					</li>
				</ul>

				<h3>5. Payments & Billing</h3>
				<p>
					Payments for insurance plans or appointments are processed through
					secure third-party payment providers. You agree to pay all applicable
					fees, taxes, and charges associated with your chosen plan or service.
				</p>

				<h3>6. User Conduct</h3>
				<p>
					You agree not to misuse the Services, including but not limited to:
				</p>
				<ul>
					<li>Providing false or misleading information</li>
					<li>Attempting to gain unauthorized access to our systems</li>
					<li>
						Interfering with or disrupting the functionality of the platform
					</li>
				</ul>

				<h3>7. Intellectual Property</h3>
				<p>
					All content, trademarks, and software used in the Services remain the
					property of {company_name} or its licensors. You are granted a
					limited, non-exclusive license to use the platform solely for
					personal, non-commercial purposes.
				</p>

				<h3>8. Limitation of Liability</h3>
				<p>
					To the maximum extent permitted by law, {company_name} and its
					affiliates shall not be liable for any indirect, incidental, or
					consequential damages arising out of your use of the Services,
					including delays, data loss, or third-party actions.
				</p>

				<h3>9. Disclaimers</h3>
				<p>
					Our Services are provided “as is” and “as available” without
					warranties of any kind, either express or implied. We do not guarantee
					continuous, uninterrupted access or the accuracy of plan details
					provided by third parties.
				</p>

				<h3>10. Termination</h3>
				<p>
					We may suspend or terminate your account at our discretion if you
					violate these Terms or engage in fraudulent or illegal activities.
				</p>

				<h3>11. Changes to Terms</h3>
				<p>
					We may update these Terms from time to time. Continued use of the
					Services after updates constitutes acceptance of the new Terms.
				</p>

				<h3>12. Governing Law</h3>
				<p>
					These Terms are governed by and construed in accordance with the laws
					of your local jurisdiction, without regard to conflict of law
					principles.
				</p>

				<h3>13. Contact Us</h3>
				<p>
					For questions about these Terms, please contact us at:
					<br />
					<strong>Email:</strong> {company_email}
				</p>
			</section>

			<Footer />
		</>
	);
}

export default Terms;
