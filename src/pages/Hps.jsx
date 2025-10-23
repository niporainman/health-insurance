import NavigationTop from '../pages/NavigationTop';
import PageHeader from './PageHeader';
import Footer from '../pages/Footer';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const company_name = import.meta.env.VITE_COMPANY_NAME;

function Hps() {
	useEffect(() => {
		document.title = `${company_name} - Health Providers Welcome`;
	}, []);

	return (
		<>
			<NavigationTop />
			<PageHeader
				page_title="Health Providers"
				page_title_small={`Partnering with ${company_name}`}
				bg="2"
			/>

			{/* Why Partner With Us Section Start */}
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
									Health Providers
								</h6>
								<h2
									className="section-title title-anim fw-black text-title mb-15 me-xxl-5"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="300">
									{company_name}: Empowering Healthcare Delivery
								</h2>
								<p
									className="fs-xx-14 mb-28"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="400">
									Join our platform to connect with patients and HMOs in one
									seamless ecosystem. We help healthcare providers simplify
									appointment management, reduce administrative stress, and
									increase visibility. With secure digital tools, real-time
									notifications, and patient-centered features, you can focus on
									what matters most, which is delivering quality care.
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
												Reach More Patients
											</h3>
											<p className="mb-0">
												Gain access to a wider pool of patients and HMO members
												actively seeking reliable healthcare providers. Our
												platform increases your visibility and helps you grow
												your practice.
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
												Efficient Appointment Management
											</h3>
											<p className="mb-0">
												Schedule, approve, or transfer appointments with ease.
												Real-time updates and reminders reduce no-shows and keep
												your operations running smoothly.
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
												Simplified Collaboration with HMOs
											</h3>
											<p className="mb-0">
												Our integrated system ensures faster approvals,
												transparency in care delivery, and smoother
												communication with HMOs so you spend less time on admin
												work and more on patient care.
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
												Boost Patient Trust and Satisfaction
											</h3>
											<p className="mb-0">
												When patients experience fast approvals, easy
												scheduling, and clear communication, they are more
												satisfied leading to loyalty and stronger provider–
												patient relationships.
											</p>
										</div>
									</div>
								</div>
								<div className="btn-wrap d-flex flex-wrap align-items-center">
									<Link
										to="/hp_signup"
										className="btn style-one font-secondary fw-semibold position-relative z-1 round-10">
										<span>
											Join as a Health Provider
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
						<div className="col-xl-6 ps-xxl-4">
							<img
								src="/assets/images/hps.jpg"
								alt="health-providers"
								style={{ height: '700px', objectFit: 'cover' }}
							/>
						</div>
					</div>
				</div>
			</div>
			{/* Why Partner With Us Section End */}

			<Footer />
		</>
	);
}

export default Hps;
