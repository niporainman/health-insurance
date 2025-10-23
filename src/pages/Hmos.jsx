import NavigationTop from '../pages/NavigationTop';
import PageHeader from './PageHeader';
import Footer from '../pages/Footer';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const company_name = import.meta.env.VITE_COMPANY_NAME;

function Hmos() {
	useEffect(() => {
		document.title = `${company_name} - HMOs Welcome`;
	}, []);

	return (
		<>
			<NavigationTop />
			<PageHeader
				page_title="HMOs Welcome"
				page_title_small={`HMOS on ${company_name}`}
				bg="2"
			/>

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
									HMOS
								</h6>
								<h2
									className="section-title title-anim fw-black text-title mb-15 me-xxl-5"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="300">
									{company_name}: Your Partner in Health
								</h2>
								<p
									className="fs-xx-14 mb-28"
									data-aos="fade-up"
									data-aos-duration="1100"
									data-aos-delay="400">
									By partnering with us, you can offer your members seamless
									access to a wide directory of qualified healthcare providers,
									simplified claims processing, and integrated telehealth
									solutions. Our robust, secure system helps reduce
									administrative overhead, improve patient-provider
									coordination, and deliver a superior healthcare experience.
									Sign up today to expand your reach and provide your members
									with the convenient, quality care they deserve.
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
												Expand Your Reach and Grow Your Network
											</h3>
											<p className="mb-0">
												Join our platform to connect with a rapidly growing
												community of individuals and families seeking quality
												health coverage. By partnering with us, your HMO gains
												access to a wider audience that is actively looking for
												trusted healthcare providers and insurance plans.
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
												Streamlined Operations and Real-Time Management
											</h3>
											<p className="mb-0">
												Our all-in-one dashboard makes it easy to manage
												members, approve appointments, and track payments in
												real time. Automated notifications and secure data
												handling reduce paperwork and administrative costs,
												allowing your team to focus on delivering excellent
												care.
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
												Build Trust Through Transparency
											</h3>
											<p className="mb-0">
												Patients appreciate clear information and quick
												responses. With our platform, your HMO can showcase
												available plans, coverage details, and participating
												providers, giving potential members the confidence they
												need to choose your services.
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
												Increase Member Satisfaction and Retention
											</h3>
											<p className="mb-0">
												Integrated appointment scheduling, seamless claims
												processing, and instant updates mean happier members and
												stronger loyalty. When patients experience smooth
												interactions, they’re more likely to stay with your
												network.
											</p>
										</div>
									</div>
								</div>
								<div className="btn-wrap d-flex flex-wrap align-items-center">
									<Link
										to="/hmo_signup"
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
								</div>
							</div>
						</div>
						<div className="col-xl-6 ps-xxl-4">
							<img
								src="/assets/images/hmos.jpg"
								alt="hmos"
								style={{ height: '700px', objectFit: 'cover' }}
							/>
						</div>
					</div>
				</div>
			</div>
			{/* Why Choose Us Section End */}

			<Footer />
		</>
	);
}

export default Hmos;
