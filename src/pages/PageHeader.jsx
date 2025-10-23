import { Link } from 'react-router-dom';

function PageHeader({ page_title, page_title_small, bg }) {
	return (
		<>
			{/* Breadcrumb Area Start */}
			<div className="breadcrumb-area bg-ash">
				<div
					className="breadcrumb-wrap bg-f bg-2 position-relative z-1 round-20"
					style={{ backgroundImage: `url('/assets/images/br-bg-${bg}.jpg')` }}>
					<div className="container">
						<h2 className="section-title fw-bold text-white text-center mb-13">
							{page_title}
						</h2>
						<ul className="br-menu text-center list-unstyled mb-0">
							<li className="position-relative fs-xx-14 d-inline-block">
								<Link to="/">Home</Link>
							</li>
							<li className="position-relative fs-xx-14 d-inline-block">
								{page_title_small}
							</li>
						</ul>
					</div>
				</div>
			</div>
		</>
	);
}

export default PageHeader;
