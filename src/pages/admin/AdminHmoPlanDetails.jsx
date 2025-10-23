import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import Swal from 'sweetalert2';

function AdminHmoPlanDetails() {
	const { id } = useParams(); // planId from URL
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		plan_name: '',
		plan_desc: '',
		price1: '',
		duration1: '',
		price2: '',
		duration2: '',
		price3: '',
		duration3: '',
		price4: '',
		duration4: '',
		active: true,
	});
	const errors = {};
	const [loading, setLoading] = useState(true);

	// Load plan from Firestore
	useEffect(() => {
		const fetchPlan = async () => {
			try {
				const docRef = doc(db, 'plans', id);
				const snapshot = await getDoc(docRef);
				if (snapshot.exists()) {
					setFormData(snapshot.data());
				} else {
					Swal.fire('Not Found', 'Plan not found', 'error');
					navigate('/');
				}
			} catch (error) {
				console.error('Error fetching plan:', error);
				Swal.fire('Error', 'Could not load plan', 'error');
			} finally {
				setLoading(false);
			}
		};

		fetchPlan();
	}, [id, navigate]);

	if (loading) return <p>Loading plan...</p>;

	return (
		<>
			<div className="db-content-box bg-white round-10 mb-25">
				<AdminHeader page_title={`${formData.plan_name} | Plan Details`} />
				<form className="form-wrapper style-two">
					<div className="row">
						<div className="col-xxl-12 col-xl-12 col-md-12">
							<div className="form-group mb-15">
								<label
									htmlFor="plan_name"
									className="fs-13 d-block fw-medium text-title mb-8">
									Plan name
								</label>
								<input
									type="text"
									id="plan_name"
									value={formData.plan_name}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.plan_name ? 'is-invalid' : ''
									}`}
									placeholder="Enter name of plan"
								/>
								{errors.plan_name && (
									<div className="invalid-feedback">{errors.plan_name}</div>
								)}
							</div>
						</div>

						<div className="col-12">
							<div className="form-group mb-15">
								<label
									htmlFor="plan_desc"
									className="fs-13 d-block fw-medium text-title mb-8">
									Plan Description
								</label>
								<textarea
									id="plan_desc"
									value={formData.plan_desc}
									className={`fs-13 w-100 ht-80 bg-transparent round-5 text-para resize-0 ${
										errors.plan_desc ? 'is-invalid' : ''
									}`}
									placeholder="Enter a description of the insurance plan and what it covers"></textarea>

								{errors.plan_desc && (
									<div className="invalid-feedback">{errors.plan_desc}</div>
								)}
							</div>
						</div>

						<div
							className="col-12"
							style={{
								fontWeight: '900',
								margin: '10px 0px',
								borderBottom: '1px solid grey',
							}}>
							Price points
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="price1"
									className="fs-13 d-block fw-medium text-title mb-8">
									Price Point
								</label>
								<input
									type="number"
									id="price1"
									value={formData.price1}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.price1 ? 'is-invalid' : ''
									}`}
									placeholder=""
								/>

								{errors.price1 && (
									<div className="invalid-feedback">{errors.price1}</div>
								)}
							</div>
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="duration1"
									className="fs-13 d-block fw-medium text-title mb-8">
									Duration
								</label>
								<input
									type="number"
									id="duration1"
									value={formData.duration1}
									min="1"
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.duration1 ? 'is-invalid' : ''
									}`}
									placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
								/>

								{errors.duration1 && (
									<div className="invalid-feedback">{errors.duration1}</div>
								)}
							</div>
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="price2"
									className="fs-13 d-block fw-medium text-title mb-8">
									Price Point
								</label>
								<input
									type="number"
									id="price2"
									value={formData.price2}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.price2 ? 'is-invalid' : ''
									}`}
									placeholder=""
								/>
								{errors.price2 && (
									<div className="invalid-feedback">{errors.price2}</div>
								)}
							</div>
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="duration2"
									className="fs-13 d-block fw-medium text-title mb-8">
									Duration
								</label>
								<input
									type="number"
									id="duration2"
									value={formData.duration2}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.duration2 ? 'is-invalid' : ''
									}`}
									placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
								/>
								{errors.duration2 && (
									<div className="invalid-feedback">{errors.duration2}</div>
								)}
							</div>
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="price3"
									className="fs-13 d-block fw-medium text-title mb-8">
									Price Point
								</label>
								<input
									type="number"
									id="price3"
									value={formData.price3}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.price3 ? 'is-invalid' : ''
									}`}
									placeholder=""
								/>
								{errors.price3 && (
									<div className="invalid-feedback">{errors.price3}</div>
								)}
							</div>
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="duration3"
									className="fs-13 d-block fw-medium text-title mb-8">
									Duration
								</label>
								<input
									type="number"
									id="duration3"
									value={formData.duration3}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.duration3 ? 'is-invalid' : ''
									}`}
									placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
								/>
								{errors.duration3 && (
									<div className="invalid-feedback">{errors.duration3}</div>
								)}
							</div>
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="price4"
									className="fs-13 d-block fw-medium text-title mb-8">
									Price Point
								</label>
								<input
									type="number"
									id="price4"
									value={formData.price4}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.price4 ? 'is-invalid' : ''
									}`}
									placeholder=""
								/>
								{errors.price4 && (
									<div className="invalid-feedback">{errors.price4}</div>
								)}
							</div>
						</div>

						<div className="col-xxl-6 col-xl-6 col-md-6">
							<div className="form-group mb-15">
								<label
									htmlFor="duration4"
									className="fs-13 d-block fw-medium text-title mb-8">
									Duration
								</label>
								<input
									type="number"
									id="duration4"
									value={formData.duration4}
									className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${
										errors.duration4 ? 'is-invalid' : ''
									}`}
									placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
								/>
								{errors.duration4 && (
									<div className="invalid-feedback">{errors.duration4}</div>
								)}
							</div>
						</div>
					</div>
				</form>
			</div>
		</>
	);
}

export default AdminHmoPlanDetails;
