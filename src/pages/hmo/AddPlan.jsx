import { useEffect, useState } from 'react';
import { addDoc, collection,doc,getDoc } from 'firebase/firestore';
import { auth, db } from "../../services/firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate} from 'react-router-dom';
import HmoHeader from './HmoHeader'
import Swal from 'sweetalert2';

function AddPlan() {
  
  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | HMO Add a Plan";
  }, []);

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
    duration4: ''
  });

  const [firebaseUid, setFirebaseUid] = useState('');
  const [errors, setErrors] = useState({});

  //grab the UID
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFirebaseUid(user.uid || '');
        }
      });
  
      return () => unsubscribe();
    }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // NEW: Clear error for the current field as user types
    setErrors((prevErrors) => ({ ...prevErrors, [id]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    const requiredFields = ['plan_name', 'plan_desc', 'price1', 'duration1'];

    for (const field of requiredFields) {
      // Check for empty string, null, or undefined
      if (formData[field] === '' || formData[field] === null || formData[field] === undefined) {
        newErrors[field] = `Please fill the ${field.replace('_', ' ')} field.`;
        isValid = false;
      }
      if (field.startsWith('duration')) {
      const val = parseInt(formData[field]);
      if (isNaN(val) || val <= 0) {
        newErrors[field] = `Enter a valid number of months for ${field}`;
        isValid = false;
      }
    }
    }

    setErrors(newErrors);

    if (!isValid) {
      Swal.fire('Validation Error', 'Please correct the highlighted fields.', 'error');
    }

    return isValid;
  };

  const generateUserId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  // Use useNavigate hook from react-router-dom for navigation
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseUid) return;

    if (!validateForm()) {
      return;
    }

      try {
    // Step 1: Get the HMO document using the UID
    const hmoDocRef = doc(db, 'hmos', firebaseUid);
    const hmoSnap = await getDoc(hmoDocRef);

    if (!hmoSnap.exists()) {
      Swal.fire('Error', 'HMO profile not found.', 'error');
      return;
    }

    const hmoData = hmoSnap.data();
    const hmoId = hmoData.hmoId; // your custom generated HMO ID
      
      await addDoc(collection(db, 'plans'), {
        firebaseUid: firebaseUid,
        plan_id: generateUserId(),
        hmoId: hmoId,
        plan_name: formData.plan_name,
        plan_desc: formData.plan_desc,
        price1: formData.price1,
        duration1: Number(formData.duration1),
        price2: formData.price2,
        duration2: Number(formData.duration2),
        price3: formData.price3,
        duration3: Number(formData.duration3),
        price4: formData.price4,
        duration4: Number(formData.duration4),
        active: true,
      });
      navigate('/hmo/hmo_plans');
      //Swal.fire('Success', 'Insurance plan has been added.', 'success');
      //setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Something went wrong while adding your plan.', 'error');
    }
  };

  return (
    <>
  <div className="db-content-box bg-white round-10 mb-25">
    <HmoHeader page_title={"Add a Plan"} />
<form className="form-wrapper style-two" onSubmit={handleSubmit}>
  <div className="row">
    <div className="col-xxl-12 col-xl-12 col-md-12">
      <div className="form-group mb-15">
        <label htmlFor="plan_name" className="fs-13 d-block fw-medium text-title mb-8">Plan name</label>
        <input
          type="text"
          id="plan_name"
          value={formData.plan_name}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.plan_name ? 'is-invalid' : ''}`}
          placeholder="Enter name of plan"
        />
        {errors.plan_name && <div className="invalid-feedback">{errors.plan_name}</div>}
      </div>
    </div>

     <div className="col-12">
      <div className="form-group mb-15">
        <label htmlFor="plan_desc" className="fs-13 d-block fw-medium text-title mb-8">Plan Description</label>
        <textarea
          id="plan_desc"
          value={formData.plan_desc}
          onChange={handleChange}
          className={`fs-13 w-100 ht-80 bg-transparent round-5 text-para resize-0 ${errors.plan_desc ? 'is-invalid' : ''}`}
          placeholder="Enter a description of the insurance plan and what it covers"
        ></textarea>
    
        {errors.plan_desc && <div className="invalid-feedback">{errors.plan_desc}</div>}
      </div>
    </div>

    <div className='col-12' style={{ fontWeight: '900',margin:'10px 0px', borderBottom:'1px solid grey' }}>
      Plans can have up to 4 price points, each with a duration. You must fill in at least the first price point and duration.
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="price1" className="fs-13 d-block fw-medium text-title mb-8">Price Point</label>
        <input
          type="number"
          id="price1"
          value={formData.price1}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.price1 ? 'is-invalid' : ''}`}
          placeholder="Enter the price point of the plan (e.g., 1000, 5000)"
        />
      
        {errors.price1 && <div className="invalid-feedback">{errors.price1}</div>}
      </div>
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="duration1" className="fs-13 d-block fw-medium text-title mb-8">Duration</label>
        <input
            type="number"
            id="duration1"
            value={formData.duration1}
            onChange={handleChange}
            min="1"
            className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.duration1 ? 'is-invalid' : ''}`}
            placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
          />
        
        {errors.duration1 && <div className="invalid-feedback">{errors.duration1}</div>}
      </div>
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="price2" className="fs-13 d-block fw-medium text-title mb-8">Price Point</label>
        <input
          type="number"
          id="price2"
          value={formData.price2}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.price2 ? 'is-invalid' : ''}`}
          placeholder="Enter the price point of the plan (e.g., 1000, 5000)"
        />
        {errors.price2 && <div className="invalid-feedback">{errors.price2}</div>}
      </div>
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="duration2" className="fs-13 d-block fw-medium text-title mb-8">Duration</label>
        <input
            type="number"
            id="duration2"
            value={formData.duration2}
            onChange={handleChange}
            min="1"
            className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.duration2 ? 'is-invalid' : ''}`}
            placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
          />
        {errors.duration2 && <div className="invalid-feedback">{errors.duration2}</div>}
      </div>
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="price3" className="fs-13 d-block fw-medium text-title mb-8">Price Point</label>
        <input
          type="number"
          id="price3"
          value={formData.price3}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.price3 ? 'is-invalid' : ''}`}
          placeholder="Enter the price point of the plan (e.g., 1000, 5000)"
        />
        {errors.price3 && <div className="invalid-feedback">{errors.price3}</div>}
      </div>
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="duration3" className="fs-13 d-block fw-medium text-title mb-8">Duration</label>
        <input
            type="number"
            id="duration3"
            value={formData.duration3}
            onChange={handleChange}
            min="1"
            className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.duration3 ? 'is-invalid' : ''}`}
            placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
          />
        {errors.duration3 && <div className="invalid-feedback">{errors.duration3}</div>}
      </div>
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="price4" className="fs-13 d-block fw-medium text-title mb-8">Price Point</label>
        <input
          type="number"
          id="price4"
          value={formData.price4}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.price4 ? 'is-invalid' : ''}`}
          placeholder="Enter the price point of the plan (e.g., 1000, 5000)"
        />
        {errors.price4 && <div className="invalid-feedback">{errors.price4}</div>}
      </div>
    </div>

    <div className="col-xxl-6 col-xl-6 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="duration4" className="fs-13 d-block fw-medium text-title mb-8">Duration</label>
        <input
            type="number"
            id="duration4"
            value={formData.duration4}
            onChange={handleChange}
            min="1"
            className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.duration1 ? 'is-invalid' : ''}`}
            placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
          />
        {errors.duration4 && <div className="invalid-feedback">{errors.duration4}</div>}
      </div>
    </div>


  </div>

  <div className="btn-wrap d-flex justify-content-end">
    <button type="submit" className="tb-btn style-one font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition">Save</button>
  </div>
</form>
</div>
    </>
  )
}

export default AddPlan