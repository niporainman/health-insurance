import NavigationTop from '../pages/NavigationTop';
import Footer from '../pages/Footer';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
const company_name = import.meta.env.VITE_COMPANY_NAME;

function Home() {
	useEffect(() => {
		document.title = `${company_name} - Affordable Healthcare Insurance`;
	}, []);
	return (
		<>
			<NavigationTop />
			<div className="bg-ash">
				{/* Hero Section Start */}
				<div className="hero-area style-one position-relative">
					<div className="hero-slider-one swiper">
						<div className="swiper-wrapper">
							{/* Slide 1 */}
							<div className="swiper-slide">
								<div className="hero-slide-item position-relative overflow-hidden">
									<div className="hero-bg bg-f bg-1"></div>
									<div className="container style-one">
										<div className="row">
											<div className="col-xxl-8 col-xl-10 pe-xxl-4">
												<div className="hero-content">
													<h6
														className="section-subtitle style-two fw-medium font-primary d-inline-block text_white position-relative mb-12"
														data-aos="fade-up"
														data-aos-duration="1100"
														data-aos-delay="200">
														{company_name}
													</h6>
													<h1
														className="fw-black title-anim text-title"
														data-aos="fade-up"
														data-aos-duration="1100"
														data-aos-delay="300">
														Linking You to HMOs and Health Providers for Smarter
														Insurance Choices
													</h1>
													<p
														className="fs-xxl-20 text-title"
														data-aos="fade-up"
														data-aos-duration="1100"
														data-aos-delay="450">
														Find the best health insurance plans and approved
														hospitals or doctors in just a few clicks.
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							{/* end of slideee */}
						</div>
					</div>
				</div>
				{/* Hero Section End */}

				{/* Category Section Start */}
				<div className="container-fluid px-xxl-4">
					<div className="row justify-content-center gx-xxl-18">
						<div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6">
							<div
								className="category-card style-one bg-yellow text-center round-20 mb-30 transition"
								data-aos="fade-up"
								data-aos-duration="1100"
								data-aos-delay="200">
								<div className="cat-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white mx-auto">
									<i className="flaticon-stethoscope"></i>
								</div>
								<h3 className="fs-22 fw-extrabold">
									<a href="#" className="text-title link-hover-title">
										HMO Plans
									</a>
								</h3>
								<span className="text-title">Compare Packages</span>
							</div>
						</div>
						<div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6">
							<div
								className="category-card style-one bg-flower text-center round-20 mb-30 transition"
								data-aos="fade-up"
								data-aos-duration="1100"
								data-aos-delay="300">
								<div className="cat-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white mx-auto">
									<i className="flaticon-cardiogram"></i>
								</div>
								<h3 className="fs-22 fw-extrabold">
									<a href="#" className="text-title link-hover-title">
										Partner Hospitals
									</a>
								</h3>
								<span className="text-title">Verified Network</span>
							</div>
						</div>
						<div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6">
							<div
								className="category-card style-one bg-melanine text-center round-20 mb-30 transition"
								data-aos="fade-up"
								data-aos-duration="1100"
								data-aos-delay="400">
								<div className="cat-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white mx-auto">
									<i className="flaticon-urology"></i>
								</div>
								<h3 className="fs-22 fw-extrabold">
									<a href="#" className="text-title link-hover-title">
										Specialist Clinics
									</a>
								</h3>
								<span className="text-title">Expert Care</span>
							</div>
						</div>
						<div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6">
							<div
								className="category-card style-one bg-chard text-center round-20 mb-30 transition"
								data-aos="fade-up"
								data-aos-duration="1100"
								data-aos-delay="500">
								<div className="cat-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white mx-auto">
									<i className="flaticon-syringe"></i>
								</div>
								<h3 className="fs-22 fw-extrabold">
									<a href="#" className="text-title link-hover-title">
										Diagnostics
									</a>
								</h3>
								<span className="text-title">Labs & Imaging</span>
							</div>
						</div>
						<div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6">
							<div
								className="category-card style-one bg-jordyBlue text-center round-20 mb-30 transition"
								data-aos="fade-up"
								data-aos-duration="1100"
								data-aos-delay="600">
								<div className="cat-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white mx-auto">
									<i className="flaticon-microscope"></i>
								</div>
								<h3 className="fs-22 fw-extrabold">
									<a href="#" className="text-title link-hover-title">
										Health Providers
									</a>
								</h3>
								<span className="text-title">Find Specialists</span>
							</div>
						</div>
						<div className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6">
							<div
								className="category-card style-one bg-mauve text-center round-20 mb-30 transition"
								data-aos="fade-up"
								data-aos-duration="1100"
								data-aos-delay="700">
								<div className="cat-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-white mx-auto">
									<i className="flaticon-wheelchair"></i>
								</div>
								<h3 className="fs-22 fw-extrabold">
									<a href="#" className="text-title link-hover-title">
										Insurance
									</a>
								</h3>
								<span className="text-title">Get Help & Advice</span>
							</div>
						</div>
					</div>
				</div>
				{/* Category Section End */}
			</div>
			<br />
			<br />
			<div className="about-area style-one pb-120">
				<div className="container style-one">
					<div className="row align-items-center">
						<div className="col-lg-6 pe-xxl-2">
							<div className="about-img-wrap d-flex flex-wrap position-relative justify-content-between mb-md-30">
								<div
									className="about-img"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="200">
									<img
										src="/assets/images/pic2.webp"
										alt="About Us"
										style={{ height: '500px', objectFit: 'cover' }}
									/>
								</div>
								<div
									className="about-img"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="300">
									<img
										src="/assets/images/pic3.jpg"
										style={{ height: '500px', objectFit: 'cover' }}
										alt="About Us"
									/>
								</div>

								<div
									className="book-doctor text-center bg-white round-10 position-absolute"
									data-aos="fade-in"
									data-aos-duration="1100"
									data-aos-delay="300">
									<div className="doctor-img mx-auto round-12">
										<img
											src="/assets/images/pic4.jpg"
											alt="Advisor"
											className="round-12"
											style={{ height: '100%', objectFit: 'cover' }}
										/>
									</div>
									<h3 className="fs-22 fw-semibold">
										<a className="text-title hover-text-primary">Get Started</a>
									</h3>
									<span className="d-block"></span>
									<Link
										className="tb-btn style-one font-secondary fw-semibold d-inline-block border-0 text-white round-10 transition"
										to="/user_signup">
										Sign up
									</Link>
								</div>
							</div>
						</div>

						<div className="col-lg-6 ps-xxl-5">
							<div className="about-content ps-xxl-5">
								<h6
									className="section-subtitle fw-semibold font-primary d-inline-block text_secondary position-relative mb-15"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="200">
									ABOUT OUR PLATFORM
								</h6>

								<h2
									className="section-title fw-black text-title me-xxl-5"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="300">
									A Marketplace Connecting You to HMOs & Trusted Health
									Providers
								</h2>

								<p
									className="mb-38"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="400">
									We connect individuals and families with verified HMOs and
									accredited health providers so you can compare plans, book
									covered care, and manage claims with confidence. Our platform
									makes it simple to find the right coverage and the right
									provider — fast.
								</p>

								<div
									className="counter-card-wrap d-flex flex-wrap justify-content-md-between justify-content-center bg-ash round-15"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="500">
									<div className="counter-card position-relative">
										<h4 className="text-title fw-black">
											<span className="counter fw-black">80</span>+
										</h4>
										<p className="fs-xxl-18 mb-0">Partner HMOs</p>
									</div>
									<div className="counter-card position-relative">
										<h4 className="text-title fw-black">
											<span className="counter fw-black">527</span>+
										</h4>
										<p className="fs-xxl-18 mb-0">Verified Providers</p>
									</div>
									<div className="counter-card position-relative">
										<h4 className="text-title fw-black">
											<span className="counter fw-black">10k</span>+
										</h4>
										<p className="fs-xxl-18 mb-0">Satisfied Members</p>
									</div>
								</div>

								<ul
									className="feature-list d-flex flex-wrap align-items-center justify-content-between list-unstyled"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="600">
									<li className="position-relative font-secondary fs-18 fw-semibold text-title">
										<img src="/assets/images/check.svg" alt="Icon" /> Compare
										plans & prices instantly
									</li>
									<li className="position-relative font-secondary fs-18 fw-semibold text-title">
										<img src="/assets/images/check.svg" alt="Icon" /> Book
										appointments & manage claims
									</li>
								</ul>

								<div
									className="btn-wrap d-flex flex-wrap align-items-center"
									data-aos="fade-in"
									data-aos-duration="1100"
									data-aos-delay="700">
									<Link
										to="/about"
										className="btn style-one font-secondary fw-semibold position-relative z-1 round-10">
										<span>
											Learn More
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

									<Link
										to="/contact"
										className="font-secondary fw-semibold text-title link-hover-title pb-1 ms-lg-30 ms-sm-3">
										Contact Us
										<img
											src="/assets/images/right-arrow-2.svg"
											alt="Icon"
											className="position-relative ms-2 top-n1"
										/>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<br />
			<br />
			<div className="bg-ash ptb-120">
				<div className="container style-one">
					<div className="text-center">
						<h6
							className="section-subtitle fw-medium font-primary d-inline-block text_secondary position-relative mb-15"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="200">
							HOW IT WORKS
						</h6>
						<h2
							className="section-title title-anim fw-black text-title mb-40"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="300">
							How Our Health Insurance Platform Works
						</h2>
					</div>

					<div className="work-process-wrap d-flex flex-wrap justify-content-lg-between justify-content-center style-one pb-90">
						{/* Step 1 */}
						<div
							className="process-card style-one position-relative transition mb-30"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="200">
							<img
								src="/assets/images/right-top-curve-arrow.png"
								alt="Icon"
								className="right-arrow"
							/>
							<div className="process-img position-relative rounded-circle">
								<img
									src="/assets/images/pic4.jpg"
									alt="Image"
									className="rounded-circle"
									style={{ height: '100%', objectFit: 'cover' }}
								/>
								<span className="process-counter text_primary font-secondary fw-extrabold fs-18 d-flex flex-column align-items-center justify-content-center rounded-circle bg-white">
									01
								</span>
							</div>
							<h3 className="fs-24 fw-extrabold text-title text-center mb-18">
								Search for a Plan
							</h3>
							<p className="text-center mb-0 px-xxl-5 px-lg-3 mx-xxl-4">
								Compare HMO plans, coverage, and prices to find the right fit
								for you or your family from our growing list of trusted
								providers.
							</p>
						</div>

						{/* Step 2 */}
						<div
							className="process-card style-one position-relative transition mb-30"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="300">
							<img
								src="/assets/images/right-down-curve-arrow.png"
								alt="Icon"
								className="right-arrow"
							/>
							<div className="process-img position-relative rounded-circle">
								<img
									src="/assets/images/pic5.webp"
									alt="Image"
									className="rounded-circle"
									style={{ height: '100%', objectFit: 'cover' }}
								/>
								<span className="process-counter text_primary font-secondary fw-extrabold fs-18 d-flex flex-column align-items-center justify-content-center rounded-circle bg-white">
									02
								</span>
							</div>
							<h3 className="fs-24 fw-extrabold text-title text-center mb-18">
								Review Plan Details
							</h3>
							<p className="text-center mb-0 px-xxl-5 px-lg-3 mx-xxl-4">
								Explore each HMO’s benefits, approved hospitals, and provider
								network to be sure you’re choosing the coverage that meets your
								needs.
							</p>
						</div>

						{/* Step 3 */}
						<div
							className="process-card style-one position-relative transition mb-30"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="400">
							<div className="process-img position-relative rounded-circle">
								<img
									src="/assets/images/pic6.webp"
									alt="Image"
									className="rounded-circle"
									style={{ height: '100%', objectFit: 'cover' }}
								/>
								<span className="process-counter text_primary font-secondary fw-extrabold fs-18 d-flex flex-column align-items-center justify-content-center rounded-circle bg-white">
									03
								</span>
							</div>
							<h3 className="fs-24 fw-extrabold text-title text-center mb-18">
								Enroll & Book Care
							</h3>
							<p className="text-center mb-0 px-xxl-5 px-lg-3 mx-xxl-4">
								Sign up securely, pay online, and start booking covered
								appointments with approved providers right away.
							</p>
						</div>
					</div>

					<div className="promo-video style-one position-relative bg-f round-20">
						<a
							className="play-video d-flex flex-wrap flex-column align-items-center justify-content-center rounded-circle bg-white position-absolute"
							data-fslightbox=""
							href="https://www.youtube.com/watch?v=xs7MNNqdN-o">
							<span className="ripple"></span>
							<i className="ri-play-large-fill"></i>
						</a>
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
}

export default Home;
