import phoneIconWhite from '/assets/images/phone-icon-white.svg';
import mailIconWhite from '/assets/images/mail-icon-white.svg';
import pinIconWhite from '/assets/images/pin-icon-white.svg';
import logoWhite from '/assets/images/logo-white.png';
import planeIcon from '/assets/images/plane.svg';
import { Link } from 'react-router-dom';
const company_phone = import.meta.env.VITE_COMPANY_PHONE;
const company_email = import.meta.env.VITE_COMPANY_EMAIL;
const company_address = import.meta.env.VITE_COMPANY_ADDRESS;
const company_name = import.meta.env.VITE_COMPANY_NAME;
function Footer() {
	return (
		<>
			{/* Footer Start */}
			<footer className="footer-area style-one">
				<div className="footer-top position-relative z-1 bg-title round-20 pt-120">
					<div className="container style-one">
						<div
							className="contact-info-box d-flex flex-wrap align-items-center round-15"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="200">
							<div className="contact-item d-flex flex-wrap align-items-center position-relative z-1">
								<div className="contact-icon position-relative d-flex flex-column align-items-center justify-content-center rounded-circle bg_primary">
									<img src={phoneIconWhite} alt="Icon" />
								</div>
								<div className="contact-info">
									<span className="d-block text-title lh-1">Hot Line</span>
									<a
										href="tel:123456789043"
										className="text-title link-hover-title fs-18 font-secondary fw-semibold">
										{company_phone}
									</a>
								</div>
							</div>
							<div className="contact-item d-flex flex-wrap align-items-center position-relative z-1">
								<div className="contact-icon position-relative d-flex flex-column align-items-center justify-content-center rounded-circle bg_primary">
									<img src={mailIconWhite} alt="Icon" />
								</div>
								<div className="contact-info">
									<span className="d-block text-title lh-1">Support Email</span>
									{/* Note: In React, directly using __cf_email__ for spam protection might require a third-party library or a custom solution to decode. For simplicity, I'm showing the decoded email. */}
									<a
										href="mailto:info@example.com"
										className="text-title link-hover-title fs-18 font-secondary fw-semibold">
										{company_email}
									</a>
								</div>
							</div>
							<div className="contact-item d-flex flex-wrap align-items-center position-relative z-1">
								<div className="contact-icon position-relative d-flex flex-column align-items-center justify-content-center rounded-circle bg_primary">
									<img src={pinIconWhite} alt="Icon" />
								</div>
								<div className="contact-info">
									<span className="d-block text-title lh-1">Visit Us On</span>
									<p className="d-inline-block text-title fs-18 font-secondary fw-semibold mb-0">
										{company_address}
									</p>
								</div>
							</div>
						</div>
						<div className="row pt-120 pb-90">
							<div className="col-xxl-3 col-xl-4 col-md-6 col-md-6 pe-xxl-4 pe-xl-4 pe-lg-5">
								<div
									className="footer-widget mb-30"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="300">
									<a href="index.html" className="logo d-block mb-32">
										<img src={logoWhite} alt="Logo" />
									</a>
									<p className="comp-desc text-white fs-xx-14 mb-22">
										We strive to create a welcoming environment where patients
										can receive quality healthcare through affordable health
										insuraance
									</p>
									<div className="social-share d-flex align-items-center">
										<span className="text-white me-3 fs-xx-14">Follow Us:</span>
										<ul className="social-profile style-two list-unstyled mb-0">
											<li>
												<a
													href="https://www.facebook.com/"
													target="_blank"
													rel="noopener noreferrer"
													className="d-flex flex-column align-items-center justify-content-center rounded-circle">
													<i className="ri-facebook-fill"></i>
												</a>
											</li>
											<li>
												<a
													href="https://x.com/?lang=en"
													target="_blank"
													rel="noopener noreferrer"
													className="d-flex flex-column align-items-center justify-content-center rounded-circle">
													<i className="ri-twitter-x-line"></i>
												</a>
											</li>
											<li>
												<a
													href="https://www.instagram.com/"
													target="_blank"
													rel="noopener noreferrer"
													className="d-flex flex-column align-items-center justify-content-center rounded-circle">
													<i className="ri-instagram-fill"></i>
												</a>
											</li>
											<li>
												<a
													href="https://www.linkedin.com/"
													target="_blank"
													rel="noopener noreferrer"
													className="d-flex flex-column align-items-center justify-content-center rounded-circle">
													<i className="ri-linkedin-fill"></i>
												</a>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div className="col-xxl-2 offset-xxl-1 col-xl-2 col-md-6 col-md-3 ps-xl-4">
								<div
									className="footer-widget mb-30"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="400">
									<h3 className="footer-widget-title fs-24 fw-extrabold text-white position-relative">
										Health Providers
									</h3>
									<ul className="footer-menu list-unstyled mb-0">
										<li>
											<Link to="/hps" className="link">
												<span className="link-container">
													<span className="link-title1 title text-white">
														Why Join {company_name}
													</span>
													<span className="link-title2 title text_secondary">
														Why Join {company_name}
													</span>
												</span>
											</Link>
										</li>
										<li>
											<Link to="/hp_login" className="link">
												<span className="link-container">
													<span className="link-title1 title text-white">
														HP Login
													</span>
													<span className="link-title2 title text_secondary">
														HP Login
													</span>
												</span>
											</Link>
										</li>
										<li>
											<Link to="/hp_signup" className="link">
												<span className="link-container">
													<span className="link-title1 title text-white">
														HP Signup
													</span>
													<span className="link-title2 title text_secondary">
														HP Signup
													</span>
												</span>
											</Link>
										</li>
									</ul>
								</div>
							</div>
							<div className="col-xl-3 col-md-3 col-md-6 ps-xxl-57 ps-xl-5">
								<div
									className="footer-widget mb-30"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="500">
									<h3 className="footer-widget-title fs-24 fw-extrabold text-white position-relative">
										HMOs
									</h3>
									<ul className="footer-menu list-unstyled mb-0">
										<li>
											<Link to="/hmos" className="link">
												<span className="link-container">
													<span className="link-title1 title text-white">
														Why Join {company_name}
													</span>
													<span className="link-title2 title text_secondary">
														Why Join {company_name}
													</span>
												</span>
											</Link>
										</li>
										<li>
											<Link to="/hmo_login" className="link">
												<span className="link-container">
													<span className="link-title1 title text-white">
														HMO Login
													</span>
													<span className="link-title2 title text_secondary">
														HMO Login
													</span>
												</span>
											</Link>
										</li>
										<li>
											<Link to="/hmo_signup" className="link">
												<span className="link-container">
													<span className="link-title1 title text-white">
														HMO Signup
													</span>
													<span className="link-title2 title text_secondary">
														HMO Signup
													</span>
												</span>
											</Link>
										</li>
									</ul>
								</div>
							</div>
							<div className="col-xl-3 col-md-6 ps-xxl-5 ps-xl-0">
								<div
									className="footer-widget mb-30"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="600">
									<h3 className="footer-widget-title fs-24 fw-extrabold text-white position-relative">
										Subscribe Newsletter
									</h3>
									<p className="text-white fs-xx-14 mb-22 pe-xxl-5">
										Sign up for our newsletter to latest weekly updates & news
									</p>
									<form action="#" className="newsletter-form d-flex flex-wrap">
										<input
											type="email"
											placeholder="Enter Your Email"
											className="round-10 fs-15 text-white outline-0"
										/>
										<button
											type="submit"
											className="border-0 round-10 transition">
											<img src={planeIcon} alt="Icon" className="transition" />
										</button>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="footer-bottom">
					<div className="container style-one">
						<div className="row">
							<div className="col-md-6 mb-sm-10">
								<p className="copyright-text mb-0 text-center text-md-start fs-xx-14">
									<i className="ri-copyright-line"></i>2025 {company_name}. All
									Rights Reserved
								</p>
							</div>
							<div className="col-md-6">
								<ul className="footer-bottom-menu list-unstyled text-md-end text-center mb-0">
									<li>
										<Link
											to="/privacy"
											className="text-para hover-text-primary link-hover-primary fs-xx-14">
											Privacy Policy
										</Link>
									</li>
									<li>
										<Link
											to="/terms"
											className="text-para hover-text-primary link-hover-primary fs-xx-14">
											Terms & Conditions
										</Link>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</footer>
			{/* Footer End */}

			{/* Back to Top */}
			<div id="progress-wrap" className="progress-wrap style-one">
				<svg
					className="progress-circle svg-content"
					width="100%"
					height="100%"
					viewBox="-1 -1 102 102">
					<path
						id="progress-path"
						d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
				</svg>
			</div>
		</>
	);
}

export default Footer;
