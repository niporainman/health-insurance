import NavigationTop from '../pages/NavigationTop';
import PageHeader from './PageHeader';
import Footer from '../pages/Footer';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const company_name = import.meta.env.VITE_COMPANY_NAME;
const company_phone = import.meta.env.VITE_COMPANY_PHONE;

function About() {
	useEffect(() => {
		document.title = `${company_name} - About us`;
	}, []);

	const swiperParams = {
		loop: true,
		speed: 1500,
		slidesPerView: 2,
		spaceBetween: 24,
		autoHeight: true,
		autoplay: {
			delay: 300500,
			disableOnInteraction: true,
		},
		navigation: {
			nextEl: '.testimonial-next',
			prevEl: '.testimonial-prev',
		},
		breakpoints: {
			0: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 1,
			},
			992: {
				slidesPerView: 1.3,
			},
			1200: {
				slidesPerView: 1.6,
			},
			1400: {
				slidesPerView: 2,
			},
			1600: {
				slidesPerView: 2,
			},
		},
		modules: [Navigation, Autoplay],
	};

	return (
		<>
			<NavigationTop />
			<PageHeader page_title="About us" page_title_small="About" bg="2" />

			{/* Directory Section Start */}
			<div className="container style-one pt-120 pb-90">
				<div className="row justify-content-center">
					<div className="col-xl-4 col-lg-6">
						<div className="directory-card style-three bg-mauve d-flex flex-wrap round-20 mb-30 transition">
							<div className="directory-icon bg-white d-flex flex-column align-items-center justify-content-center rounded-circle">
								<img
									src="/assets/images/doctor.svg"
									alt="Image"
									className="transition"
								/>
							</div>
							<div className="directory-info">
								<h3 className="fs-24 fw-extrabold">
									<Link
										to="/user/user_plans"
										className="text-title link-hover-primary hover-text-primary">
										Find Affordable Plans
									</Link>
								</h3>
								<p className="text-title">
									Compare a wide range of health insurance options and choose
									the plan that fits your family and your budget.
								</p>
								<Link
									to="/user/user_plans"
									className="font-secondary text-title link-hover-title fw-bold">
									Browse Plans{' '}
									<img src="/assets/images/right-arrow-black.svg" alt="Icon" />
								</Link>
							</div>
						</div>
					</div>

					<div className="col-xl-4 col-lg-6">
						<div className="directory-card style-three bg-jordyBlue d-flex flex-wrap round-20 mb-30 transition">
							<div className="directory-icon bg-white d-flex flex-column align-items-center justify-content-center rounded-circle">
								<img
									src="/assets/images/phone-big.svg"
									alt="Image"
									className="transition"
								/>
							</div>
							<div className="directory-info">
								<h3 className="fs-24 fw-extrabold">
									<Link
										to="/contact"
										className="text-title link-hover-primary hover-text-primary">
										24/7 Support
									</Link>
								</h3>
								<p className="text-title">
									Our team is ready day or night to answer questions, guide you
									through enrollment, and assist with claims.
								</p>
								<Link
									to="/contact"
									className="font-secondary text-title link-hover-title fw-bold">
									Contact Us{' '}
									<img src="/assets/images/right-arrow-black.svg" alt="Icon" />
								</Link>
							</div>
						</div>
					</div>

					<div className="col-xl-4 col-lg-6">
						<div className="directory-card style-three bg-chard d-flex flex-wrap round-20 mb-30 transition">
							<div className="directory-icon bg-white d-flex flex-column align-items-center justify-content-center rounded-circle">
								<img
									src="/assets/images/medical-history.svg"
									alt="Image"
									className="transition"
								/>
							</div>
							<div className="directory-info">
								<h3 className="fs-24 fw-extrabold">
									<Link
										to="/user_signup"
										className="text-title link-hover-primary hover-text-primary">
										Easy Enrollment
									</Link>
								</h3>
								<p className="text-title">
									Sign up in minutes and start enjoying reliable health coverage
									for you and your loved ones.
								</p>
								<Link
									to="/user_signup"
									className="font-secondary text-title link-hover-title fw-bold">
									Get Started{' '}
									<img src="/assets/images/right-arrow-black.svg" alt="Icon" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Directory Section End */}

			{/* About Us Section Start */}
			<div className="about-area style-two pb-120">
				<div className="container style-one">
					<div className="row align-items-center">
						<div className="col-lg-6 pe-xxl-1">
							<div className="about-img-wrap position-relative mb-md-30">
								<div className="about-img round-20">
									<img
										src="/assets/images/about4.webp"
										alt="About Us"
										className="round-20"
										style={{ height: '500px', objectFit: 'cover' }}
									/>
								</div>
								<div className="booking-doctor">
									<div className="about-img-two round-20">
										<img
											src="/assets/images/about3.webp"
											alt="Image"
											className="round-20"
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="col-lg-6 ps-xxl-5">
							<div className="about-content ps-xxl-5">
								<h6 className="section-subtitle fw-medium font-primary d-inline-block text_secondary position-relative mb-15">
									What we are all about
								</h6>
								<h2 className="section-title fw-black text-title me-xxl-5">
									Affordable Health Insurance You Can Trust
								</h2>
								<p className="mb-32">
									We believe quality healthcare should never be out of reach.
									Our mission is to provide affordable insurance plans that give
									individuals and families peace of mind, with coverage that
									fits every lifestyle and budget.
								</p>
								<div className="feature-item-wrap me-xxl-5 pe-xxl-4">
									<div className="feature-item d-flex flex-wrap align-items-center round-10">
										<span className="feature-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-ash transition">
											<img
												src="/assets/images/nurse.svg"
												alt="Icon"
												className="transition"
											/>
										</span>
										<div className="feature-info">
											<h3 className="fs-24 fw-extrabold text-title mb-10">
												Customer-Focused Plans
											</h3>
											<p className="mb-0">
												Our policies are designed around your real
												needs—flexible, transparent, and easy to understand.
											</p>
										</div>
									</div>
									<div className="feature-item d-flex flex-wrap align-items-center round-10">
										<span className="feature-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-ash transition">
											<img
												src="/assets/images/bandage.svg"
												alt="Icon"
												className="transition"
											/>
										</span>
										<div className="feature-info">
											<h3 className="fs-24 fw-extrabold text-title">
												Trusted Expertise
											</h3>
											<p className="mb-0">
												Our team brings years of experience to help you select
												the perfect coverage with confidence.
											</p>
										</div>
									</div>
								</div>
								<div className="btn-wrap d-flex flex-wrap align-items-center">
									<Link
										to="/user_signup"
										className="btn style-one font-secondary fw-semibold position-relative z-1 round-10 me-lg-30 me-md-2">
										<span>
											Sign Up
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
									<div className="contact-card w-50 d-flex flex-wrap align-items-center">
										<div className="contact-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-ash transition">
											<img
												src="/assets/images/phone-blue.svg"
												alt="Icon"
												className="transition"
											/>
										</div>
										<div className="contact-info">
											<span className="d-block fs-15 fs-xx-14">
												Customer Care
											</span>
											<a
												href="tel:+123456789043"
												className="d-inline-block font-secondary fw-semibold text-title fs-xx-14 hover-text-secondary">
												{company_phone}
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* About Us Section End */}

			{/* Funfacts Section Start */}
			<div className="bg-title counter-area round-20 pt-120 pb-90">
				<div className="container style-one">
					<div className="counter-card-wrap style-two d-flex flex-wrap">
						<div className="counter-card d-flex flex-wrap align-items-center mb-30">
							<div className="counter-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-chard">
								<img src="/assets/images/award-black.svg" alt="Icon" />
							</div>
							<div className="counter-text">
								<h4 className="text-white fw-black">
									<span className="counter fw-black">90</span>+
								</h4>
								<p className="fs-xxl-20 text-white mb-0">Industry Awards</p>
							</div>
						</div>

						<div className="counter-card d-flex flex-wrap align-items-center mb-30">
							<div className="counter-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-mauve">
								<img src="/assets/images/expert-black.svg" alt="Icon" />
							</div>
							<div className="counter-text">
								<h4 className="text-white fw-black">
									<span className="counter fw-black">143</span>+
								</h4>
								<p className="fs-xxl-20 text-white mb-0">Insurance Experts</p>
							</div>
						</div>

						<div className="counter-card d-flex flex-wrap align-items-center mb-30">
							<div className="counter-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-jordyBlue">
								<img src="/assets/images/bookmap-black.svg" alt="Icon" />
							</div>
							<div className="counter-text">
								<h4 className="text-white fw-black">
									<span className="counter fw-black">85</span>+
								</h4>
								<p className="fs-xxl-20 text-white mb-0">HMOs</p>
							</div>
						</div>

						<div className="counter-card d-flex flex-wrap align-items-center mb-30">
							<div className="counter-icon d-flex flex-column align-items-center justify-content-center rounded-circle bg-berylGreen">
								<img src="/assets/images/star-black.svg" alt="Icon" />
							</div>
							<div className="counter-text">
								<h4 className="text-white fw-black">
									<span className="counter fw-black">1</span>K+
								</h4>
								<p className="fs-xxl-20 text-white mb-0">Happy Customers</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Funfacts Section End */}
			<br />
			<br />
			{/* Moving Text Start */}
			<div className="move-text mb-120">
				<ul className="list-unstyled mb-0">
					<li>Comprehensive Coverage</li>
					<li>24/7 Telehealth Services</li>
					<li>Wellness Programs</li>
					<li>Customized Plans</li>
					<li>Global Travel Protection</li>
					<li>Mental Health Support</li>
					<li>Preventive Care Benefits</li>
				</ul>
			</div>
			{/* Moving Text End */}

			{/* Why Choose Us Section Start */}
			<div className="wh-area style-one bg-ash ptb-120">
				<div className="container style-one">
					<div className="row">
						<div className="col-xl-6">
							<div className="wh-content mb-lg-30">
								<h6
									className="section-subtitle fw-medium font-primary d-inline-block text_secondary position-relative mb-15"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="200">
									WHY CHOOSE US
								</h6>
								<h2
									className="section-title title-anim fw-black text-title mb-15 me-xxl-5"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="300">
									Your Partner in Health: Comprehensive, Accessible, and
									Affordable Care
								</h2>
								<p
									className="fs-xx-14 mb-28"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="400">
									We're dedicated to empowering you with health plans that fit
									your life. Our mission is to make quality healthcare
									accessible to everyone, ensuring peace of mind for you and
									your family.
								</p>
								<div className="feature-item-wrap me-xxl-5">
									<div
										className="feature-item d-flex flex-wrap"
										data-aos="fade-up"
										data-aos-duration="1100"
										data-aos-delay="500">
										<span className="feature-icon position-relative">
											<img src="/assets/images/check.svg" alt="Check Icon" />
										</span>
										<div className="feature-info">
											<h3 className="fs-24 fw-extrabold text-title mb-10">
												Extensive Provider Network
											</h3>
											<p className="mb-0">
												Access thousands of top-rated doctors, specialists, and
												hospitals in our network, making it easy to find quality
												care close to home.
											</p>
										</div>
									</div>
									<div
										className="feature-item d-flex flex-wrap"
										data-aos="fade-up"
										data-aos-duration="1100"
										data-aos-delay="600">
										<span className="feature-icon position-relative">
											<img src="/assets/images/check.svg" alt="Check Icon" />
										</span>
										<div className="feature-info">
											<h3 className="fs-24 fw-extrabold text-title">
												Flexible & Affordable Plans
											</h3>
											<p className="mb-0">
												Choose from a variety of plans with competitive premiums
												and customizable benefits to meet your unique health and
												budget needs.
											</p>
										</div>
									</div>
									<div
										className="feature-item d-flex flex-wrap"
										data-aos="fade-up"
										data-aos-duration="1100"
										data-aos-delay="700">
										<span className="feature-icon position-relative">
											<img src="/assets/images/check.svg" alt="Check Icon" />
										</span>
										<div className="feature-info">
											<h3 className="fs-24 fw-extrabold text-title">
												24/7 Telehealth & Support
											</h3>
											<p className="mb-0">
												Get virtual consultations with doctors anytime,
												anywhere, along with dedicated customer support to help
												with your claims and questions.
											</p>
										</div>
									</div>
									<div
										className="feature-item d-flex flex-wrap"
										data-aos="fade-up"
										data-aos-duration="1100"
										data-aos-delay="800">
										<span className="feature-icon position-relative">
											<img src="/assets/images/check.svg" alt="Check Icon" />
										</span>
										<div className="feature-info">
											<h3 className="fs-24 fw-extrabold text-title">
												Preventive Care Benefits
											</h3>
											<p className="mb-0">
												We cover routine check-ups, screenings, and
												immunizations at no additional cost to help you stay
												healthy and proactive about your well-being.
											</p>
										</div>
									</div>
								</div>
								<div className="btn-wrap d-flex flex-wrap align-items-center">
									<Link
										to="/user_signup"
										className="btn style-one font-secondary fw-semibold position-relative z-1 round-10">
										<span>
											Sign Up
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
									<div className="google-ratings position-relative">
										<img src="/assets/images/google.svg" alt="Google Icon" />
										<h6 className="fs-22 fw-semibold mb-15">4.9/5.0</h6>
										<span className="fs-xx-14">Google Ratings</span>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-6 ps-xxl-4">
							<div
								className="wh-img-wrap bg-f position-relative round-15"
								data-aos="fade-up"
								data-aos-duration="1100"
								data-aos-delay="200">
								<div className="circle-text-wrap d-flex flex-column align-items-center justify-content-center bg-ash position-absolute">
									<img
										src="/assets/images/circle-logo.svg"
										alt="Logo"
										className="d-block mx-auto"
									/>
									<img
										src="/assets/images/circle-text-2.svg"
										alt="Circle Text"
										className="circle-text position-absolute rotate"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Why Choose Us Section End */}

			<div className="bg-ash pb-90">
				<div className="container style-one">
					<div className="text-center">
						<h6
							className="section-subtitle fw-medium font-primary d-inline-block text_secondary position-relative mb-15"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="200">
							SUCCESS STORIES
						</h6>
						<h2
							className="section-title fw-black text-title mb-35"
							data-aos="fade-up"
							data-aos-duration="1100"
							data-aos-delay="300">
							What Our Members Say
						</h2>
					</div>

					<div
						className="testimonial-slider-two"
						data-aos="fade-up"
						data-aos-duration="1100"
						data-aos-delay="400">
						<Swiper {...swiperParams}>
							<SwiperSlide>
								<div className="testimonial-card style-three position-relative d-flex flex-wrap align-items-center bg-white round-20 mb-30">
									<div className="client-img round-20">
										<img
											src="/assets/images/client-7.jpg"
											alt="Client Testimonial"
											className="round-20"
										/>
									</div>
									<div className="client-info">
										<div className="d-flex flex-wrap align-items-center justify-content-between">
											<div>
												<h5 className="fs-22 fw-extrabold text-title mb-8">
													Sam Nweke
												</h5>
												<span>Small Business Owner</span>
											</div>
											<ul className="rating style-two list-unstyled mb-0">
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
											</ul>
										</div>
										<p className="mb-0">
											“I've never had health insurance that was so easy to use.
											The app makes everything from finding a doctor to
											submitting a claim a breeze. It's truly a game-changer.”
										</p>
										<img
											src="/assets/images/quote-blue-2.svg"
											alt="Quote Icon"
											className="quote-icon"
										/>
									</div>
								</div>
							</SwiperSlide>
							<SwiperSlide>
								<div className="testimonial-card style-three position-relative d-flex flex-wrap align-items-center bg-white round-20 mb-30">
									<div className="client-img round-20">
										<img
											src="/assets/images/client-8.jpg"
											alt="Client Testimonial"
											className="round-20"
										/>
									</div>
									<div className="client-info">
										<div className="d-flex flex-wrap align-items-center justify-content-between">
											<div>
												<h5 className="fs-22 fw-extrabold text-title mb-8">
													David Oladapo
												</h5>
												<span>Freelance Designer</span>
											</div>
											<ul className="rating style-two list-unstyled mb-0">
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
											</ul>
										</div>
										<p className="mb-0">
											“The telehealth service saved me so much time. I was able
											to get a consultation and a prescription from the comfort
											of my home. The support team is also incredibly helpful.”
										</p>
										<img
											src="/assets/images/quote-blue-2.svg"
											alt="Quote Icon"
											className="quote-icon"
										/>
									</div>
								</div>
							</SwiperSlide>
							<SwiperSlide>
								<div className="testimonial-card style-three position-relative d-flex flex-wrap align-items-center bg-white round-20 mb-30">
									<div className="client-img round-20">
										<img
											src="/assets/images/client-9.jpg"
											alt="Client Testimonial"
											className="round-20"
										/>
									</div>
									<div className="client-info">
										<div className="d-flex flex-wrap align-items-center justify-content-between">
											<div>
												<h5 className="fs-22 fw-extrabold text-title mb-8">
													Maria Aminat
												</h5>
												<span>Graphic Designer</span>
											</div>
											<ul className="rating style-two list-unstyled mb-0">
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
												<li>
													<i className="ri-star-fill"></i>
												</li>
											</ul>
										</div>
										<p className="mb-0">
											“I appreciate the comprehensive coverage for my annual
											check-ups and preventative care. It gives me peace of mind
											knowing my health is a priority for my insurance
											provider.”
										</p>
										<img
											src="/assets/images/quote-blue-2.svg"
											alt="Quote Icon"
											className="quote-icon"
										/>
									</div>
								</div>
							</SwiperSlide>
						</Swiper>
						<div className="slider-btn style-one">
							<button className="prev-btn testimonial-prev border-0 me-2 d-flex flex-column align-items-center justify-content-center rounded-circle transition">
								<i className="ri-arrow-left-s-line"></i>
							</button>
							<button className="next-btn testimonial-next border-0 ms-2 d-flex flex-column align-items-center justify-content-center rounded-circle transition">
								<i className="ri-arrow-right-s-line"></i>
							</button>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
}

export default About;
