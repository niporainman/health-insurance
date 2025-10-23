import NavigationTop from '../pages/NavigationTop';
import PageHeader from './PageHeader';
import Footer from '../pages/Footer';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { sendEmail } from '../services/notifications';

const company_name = import.meta.env.VITE_COMPANY_NAME;
const company_phone = import.meta.env.VITE_COMPANY_PHONE;
const company_email = import.meta.env.VITE_COMPANY_EMAIL;

function Contact() {
	useEffect(() => {
		document.title = `${company_name} - Contact Us`;
	}, []);

	const [submitting, setSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		subject: '',
		message: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.subject ||
			!formData.message
		) {
			Swal.fire('Missing Info', 'Please fill in all fields.', 'warning');
			setSubmitting(false);
			return;
		}

		try {
			await sendEmail(
				company_email,
				company_name,
				formData.subject,
				`${formData.firstName} ${formData.lastName} said: ${formData.message}. Reply to: ${formData.email}`
			);
			Swal.fire('Success', 'Message Sent!', 'success');

			// Optional: reset the form after success
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				subject: '',
				message: '',
			});
		} catch (err) {
			console.error('Email error', err);
			Swal.fire('Error', 'Failed to send message. Try again later.', 'error');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<NavigationTop />
			<PageHeader
				page_title="Contact Us"
				page_title_small={`Contact Us`}
				bg="2"
			/>

			{/* Contact Us Section Start */}
			<div className="container style-one pt-120">
				<div className="row justify-content-center pb-90 gx-xxl-18">
					<div className="col-xl-4 col-md-6">
						<div className="contact-info-card text-center bg-mauve round-20 mb-30">
							<div className="contact-icon mx-auto d-flex flex-column align-items-center justify-content-center rounded-circle bg-white">
								<img src="/assets/images/phone-large.svg" alt="Phone Icon" />
							</div>
							<h3 className="fs-24 fw-extrabold text-title">Phone Support</h3>
							<p className="text-title text-center px-xxl-4 mx-xxl-3">
								Call us Mon. – Fri., 8 am – 5 pm and our representatives will
								help you make an appointment that’s convenient for you.
							</p>
							<a
								href={`tel:${company_phone}`}
								className="btn style-one font-secondary fw-semibold position-relative z-1 round-10">
								<span>
									Call Support: {company_phone}
									<img
										src="/assets/images/phone-white-big.svg"
										alt="Phone Icon"
										className="transition icon-left style-one"
									/>
								</span>
								<img
									src="/assets/images/phone-white-big.svg"
									alt="Phone Icon"
									className="transition icon-right style-one"
								/>
							</a>
						</div>
					</div>
					<div className="col-xl-4 col-md-6">
						<div className="contact-info-card text-center bg-jordyBlue round-20 mb-30">
							<div className="contact-icon mx-auto d-flex flex-column align-items-center justify-content-center rounded-circle bg-white">
								<img src="/assets/images/video-big.svg" alt="Video Icon" />
							</div>
							<h3 className="fs-24 fw-extrabold text-title">Video Calls</h3>
							<p className="text-title text-center px-xxl-4 mx-xxl-3">
								You can talk to a doctor without leaving your home. It’s the
								easiest way to get the care you need to stay healthy.
							</p>
							<Link
								to="/user/talk_doctor"
								className="btn style-two font-secondary fw-semibold position-relative z-1 round-10">
								<span>
									Book a Call
									<img
										src="/assets/images/right-arrow-white.svg"
										alt="Arrow Icon"
										className="transition icon-left"
									/>
								</span>
								<img
									src="/assets/images/right-arrow-white.svg"
									alt="Arrow Icon"
									className="transition icon-right"
								/>
							</Link>
						</div>
					</div>
					<div className="col-xl-4 col-md-6">
						<div className="contact-info-card text-center bg-chard round-20 mb-30">
							<div className="contact-icon mx-auto d-flex flex-column align-items-center justify-content-center rounded-circle bg-white">
								<img src="/assets/images/user-big.svg" alt="User Icon" />
							</div>
							<h3 className="fs-24 fw-extrabold text-title">
								Book An Appointment
							</h3>
							<p className="text-title text-center px-xxl-5 mx-xxl-4">
								Make an appointment with us at the nearest facility help to
								recieve quality healthcare.
							</p>
							<Link
								to="/user/book_appointment"
								className="btn style-one font-secondary fw-semibold position-relative z-1 round-10">
								<span>
									Book An Appointment
									<img
										src="/assets/images/right-arrow-white.svg"
										alt="Arrow Icon"
										className="transition icon-left"
									/>
								</span>
								<img
									src="/assets/images/right-arrow-white.svg"
									alt="Arrow Icon"
									className="transition icon-right"
								/>
							</Link>
						</div>
					</div>
				</div>
				<div className="text-center">
					<h6 className="section-subtitle fw-medium font-primary d-inline-block text_secondary text-center position-relative mb-15">
						Get In Touch
					</h6>
					<h2 className="section-title fw-black text-title text-center mb-35">
						We would love to hear from you{' '}
					</h2>
				</div>
				<div className="row pb-90">
					<div className="col-xxl-7 col-xl-6 pe-xxl-4">
						<div className="form-box style-one round-20 mb-30">
							<form
								className="contact-form form-wrapper"
								onSubmit={handleSubmit}>
								<div className="row gx-xl-3">
									<div className="col-md-6">
										<div className="form-group position-relative mb-20">
											<input
												type="text"
												id="firstName"
												name="firstName"
												value={formData.firstName}
												onChange={handleChange}
												required
												className="w-100 ht-60 round-10 bg-ash text-para border-0"
												placeholder="First Name"
											/>
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group position-relative mb-20">
											<input
												type="text"
												id="lastName"
												name="lastName"
												value={formData.lastName}
												onChange={handleChange}
												required
												className="w-100 ht-60 round-10 bg-ash text-para border-0"
												placeholder="Last Name"
											/>
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group mb-20">
											<input
												type="email"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												placeholder="Email"
												required
												className="w-100 ht-60 round-10 bg-ash text-para border-0"
											/>
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group mb-20">
											<input
												type="text"
												id="subject"
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												placeholder="Subject"
												className="w-100 ht-60 round-10 bg-ash text-para border-0"
											/>
										</div>
									</div>
									<div className="col-12">
										<div className="form-group mb-20">
											<textarea
												name="message"
												id="message"
												required
												value={formData.message}
												onChange={handleChange}
												cols="30"
												rows="10"
												placeholder="Write A Message"
												className="w-100 round-10 bg-ash text-para border-0 resize-0"></textarea>
										</div>
									</div>
									<button
										type="submit"
										disabled={submitting}
										className="btn style-two font-secondary fw-semibold position-relative z-1 round-10">
										<span>
											{submitting ? 'Sending Message...' : 'Send'}
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
								</div>
							</form>
						</div>
					</div>
					<div className="col-xxl-5 col-xl-6 ps-xxl-0">
						<div className="comp-map style-two w-100 round-20 mb-30">
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126614.56223805303!2d3.822658318380997!3d7.386909894867472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10398d77eeff086f%3A0x3b33e0f76e8e04a9!2sIbadan%2C%20Oyo!5e0!3m2!1sen!2sng!4v1758689683295!5m2!1sen!2sng"
								className="round-20"></iframe>
						</div>
					</div>
				</div>
			</div>
			{/* Contact Us Section End */}

			<Footer />
		</>
	);
}

export default Contact;
