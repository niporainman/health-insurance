import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
const company_phone = import.meta.env.VITE_COMPANY_PHONE;
const company_email = import.meta.env.VITE_COMPANY_EMAIL;
const company_address = import.meta.env.VITE_COMPANY_ADDRESS;

function NavigationTop() {
	const [menuActive, setMenuActive] = useState(false);
	// Preloader effect
	useEffect(() => {
		const getPreloaderId = document.getElementById('preloader');
		if (getPreloaderId) {
			setTimeout(() => {
				getPreloaderId.classList.add('preloader-hidden');
			}, 1000);
		} else {
			console.log('Preloader element not found');
		}
	}, []);
	return (
		<>
			{/* Preloader Start */}
			<div
				className="preloader-area d-flex flex-column align-items-center justify-content-center h-100"
				id="preloader">
				<span className="d-block stethoscope-icon">
					<i className="ri-stethoscope-line"></i>
				</span>
				<span className="text-primary mt-2 fw-medium">Loading...</span>
			</div>
			{/* Preloader End */}

			{/* Navbaar Top Start */}
			<div className="navbar-top bg-title">
				<div className="container style-one">
					<div className="row align-items-center">
						<div className="col-lg-6 pe-lg-0 mb-md-6">
							<p className="fs-15 text-white text-lg-start text-center mb-0">
								Caring Today for a Healthier Tomorrow
							</p>
						</div>
					</div>
				</div>
			</div>
			{/* Navbaar Top End */}

			{/* Navbar Center Start */}
			<div className="navbar-center style-one d-none d-lg-block">
				<div className="container style-one">
					<div className="row align-items-center">
						<div className="col-xl-3 col-lg-2 col-5">
							<Link to="/" className="logo">
								<img
									src="/assets/images/logo.png"
									alt="Logo"
									className="logo-light"
								/>
								<img
									src="/assets/images/logo-white.png"
									alt="Logo"
									className="logo-dark"
								/>
							</Link>
						</div>
						<div className="col-xl-9 col-lg-10 col-7">
							<div className="contact-card-wrap style-two d-none d-lg-flex flex-wrap align-items-center justify-content-lg-end ">
								<div className="contact-card d-flex flex-wrap align-items-center">
									<div className="contact-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white transition">
										<img
											src="/assets/images/phone-blue.svg"
											alt="Icon"
											className="transition"
										/>
									</div>
									<div className="contact-info">
										<span className="d-block fs-15 fs-xx-14">Hot Line</span>
										<a
											href={`tel:${company_phone}`}
											className="d-inline-block font-secondary fw-semibold text-title fs-xx-14 hover-text-secondary">
											{company_phone}
										</a>
									</div>
								</div>
								<div className="contact-card d-flex flex-wrap align-items-center">
									<div className="contact-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white transition">
										<img
											src="/assets/images/mail-blue.svg"
											alt="Icon"
											className="transition"
										/>
									</div>
									<div className="contact-info">
										<span className="d-block fs-15 fs-xx-14">
											Support Email
										</span>
										<a
											href=""
											className="d-inline-block font-secondary fw-semibold text-title fs-xx-14 hover-text-secondary">
											<span className="__cf_email__" data-cfemail="">
												{company_email}
											</span>
										</a>
									</div>
								</div>
								<div className="contact-card d-flex flex-wrap align-items-center">
									<div className="contact-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white transition">
										<img
											src="/assets/images/pin-blue.svg"
											alt="Icon"
											className="transition"
										/>
									</div>
									<div className="contact-info">
										<span className="d-block fs-15 fs-xx-14">Head Office</span>
										<p className="font-secondary fw-semibold text-title fs-xx-14 mb-0">
											{company_address}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Navbar Center End */}

			{/* Navbar Area Start */}
			<div className="navbar-area style-one" id="navbar">
				<div className="container style-one">
					<div className="navbar-wrapper d-flex justify-content-between align-items-center p-0">
						<Link to="/" className="logo d-lg-none">
							<img
								src="/assets/images/logo.png"
								alt="Logo"
								className="logo-light"
							/>
							<img
								src="/assets/images/logo-white.png"
								alt="Logo"
								className="logo-dark"
							/>
						</Link>
						<div className="menu-area me-auto">
							<div className="overlay"></div>
							<nav className={`menu ${menuActive ? 'active' : ''}`}>
								<div className="menu-mobile-header">
									<button
										type="button"
										className="menu-mobile-arrow bg-transparent border-0"
										onClick={() => setMenuActive(false)}>
										<i className="ri-arrow-left-s-line"></i>
									</button>
									<button
										type="button"
										className="menu-mobile-close bg-transparent border-0"
										onClick={() => setMenuActive(false)}>
										<i className="ri-close-line"></i>
									</button>
								</div>
								<ul className="menu-section p-0 mb-0">
									<li>
										<Link to="/" onClick={() => setMenuActive(false)}>
											Home
										</Link>
									</li>
									<li>
										<Link to="/about" onClick={() => setMenuActive(false)}>
											About
										</Link>
									</li>
									<li>
										<Link to="/user" onClick={() => setMenuActive(false)}>
											Account
										</Link>
									</li>
									<li>
										<Link to="/hmos" onClick={() => setMenuActive(false)}>
											HMOs
										</Link>
									</li>
									<li>
										<Link to="/hps" onClick={() => setMenuActive(false)}>
											Health Providers
										</Link>
									</li>
									<li>
										<Link to="/contact" onClick={() => setMenuActive(false)}>
											Contact
										</Link>
									</li>
								</ul>
							</nav>
						</div>
						<div className="other-options d-flex flex-wrap align-items-center justify-content-end">
							<div className="option-item d-lg-none">
								<div className="contact-card-btn">
									<button
										className="dropdown-toggle d-flex align-items-center position-relative bg-transparent border-0 ms-auto transition"
										type="button"
										data-bs-toggle="dropdown"
										aria-expanded="true">
										<img
											src="/assets/images/dot.svg"
											alt="Dot Icon"
											className="action-btn"
										/>
									</button>
									<div className="dropdown-menu top-1 border-0 round-5">
										<div className="contact-card-wrap style-two d-flex flex-wrap">
											<div className="contact-card d-flex flex-wrap align-items-center">
												<div className="contact-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-ash transition">
													<img
														src="/assets/images/phone-blue.svg"
														alt="Icon"
														className="transition"
													/>
												</div>
												<div className="contact-info">
													<span className="d-block fs-15 fs-xx-14">
														Emergency Line
													</span>
													<a
														href={`tel:${company_phone}`}
														className="d-inline-block font-secondary fw-semibold text-title fs-xx-14 hover-text-secondary">
														{company_phone}
													</a>
												</div>
											</div>
											<div className="contact-card d-flex flex-wrap align-items-center">
												<div className="contact-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-ash transition">
													<img
														src="/assets/images/mail-blue.svg"
														alt="Icon"
														className="transition"
													/>
												</div>
												<div className="contact-info">
													<span className="d-block fs-15 fs-xx-14">
														Support Email
													</span>
													<a
														href=""
														className="d-inline-block font-secondary fw-semibold text-title fs-xx-14 hover-text-secondary">
														<span className="__cf_email__" data-cfemail="">
															{company_email}
														</span>
													</a>
												</div>
											</div>
											<div className="contact-card d-flex flex-wrap align-items-center">
												<div className="contact-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-ash transition">
													<img
														src="/assets/images/pin-blue.svg"
														alt="Icon"
														className="transition"
													/>
												</div>
												<div className="contact-info">
													<span className="d-block fs-15 fs-xx-14">
														Head Office
													</span>
													<p className="font-secondary fw-semibold text-title fs-xx-14 mb-0">
														{company_address}
													</p>
												</div>
											</div>
										</div>
										<Link
											to="/user"
											className="btn style-two font-secondary fw-semibold position-relative z-1 round-10">
											<span>
												Make An Appointment
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
										</Link>
									</div>
								</div>
							</div>

							<div className="option-item d-lg-inline-block">
								<Link
									to="/user_signup"
									className="header-link font-secondary fw-semibold position-relative d-inline-block text-title hover-text-secondary link-hover-secondary transition">
									<i className="ri-account-circle-line"></i>
									<span className="d-none d-lg-inline-block">
										Login/Register
									</span>
								</Link>
							</div>
							<div className="option-item d-lg-none me-0">
								<button
									type="button"
									className="menu-mobile-trigger"
									onClick={() => setMenuActive(!menuActive)}>
									<span></span>
									<span></span>
									<span></span>
									<span></span>
								</button>
							</div>
							<div className="option-item d-none d-lg-block">
								<Link
									to="/user/book_appointment"
									className="btn style-two font-secondary fw-semibold position-relative z-1 round-10">
									<span>
										Make An Appointment
										<img
											src="/assets/images/right-arrow-white.svg"
											alt="Icon"
											className="transition icon-left"
										/>
									</span>
									<img
										src="assets/images/right-arrow-white.svg"
										alt="Icon"
										className="transition icon-right"
									/>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Navbar Area End*/}
		</>
	);
}

export default NavigationTop;
