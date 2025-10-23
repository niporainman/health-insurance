import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from "../../services/firebase";
import { onAuthStateChanged } from 'firebase/auth';
import UserHeader from "./UserHeader";
import Swal from 'sweetalert2';

function UserAccount() {
  // Set the document title when the component mounts
  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | User Account";
  }, []);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    employment_status: '',
    marital_status: '',
    number_dependants: '',
    dob: '',
    health_preconditions: ''
  });

  const [userId, setUserId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const initialForm = {
            first_name: data.first_name ?? '',
            last_name: data.last_name ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            address: data.address ?? '',
            gender: data.gender ?? '',
            employment_status: data.employment_status ?? '',
            marital_status: data.marital_status ?? '',
            number_dependants: data.number_dependants !== undefined && data.number_dependants !== null ? data.number_dependants : '',
            dob: data.dob ? new Date(data.dob.seconds * 1000).toISOString().split('T')[0] : '',
            health_preconditions: data.health_preconditions ?? ''
          };

          setFormData(initialForm);

          // Check for any empty fields for initial alert
          const requiredFields = ['phone', 'address', 'gender', 'employment_status', 'marital_status', 'number_dependants', 'dob', 'health_preconditions'];
          const hasMissing = requiredFields.some(field => initialForm[field] === '' || initialForm[field] === null || initialForm[field] === undefined);

          if (hasMissing) {
            setAlert({
              type: 'warning',
              message: 'Some required profile fields are missing. Please complete your information.'
            });
          } else {
            setAlert({
              type: 'success',
              message: 'All profile fields are properly filled. Great job!'
            });
          }
        }
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

    const requiredFields = ['phone', 'address', 'gender', 'employment_status', 'marital_status', 'number_dependants', 'dob', 'health_preconditions'];

    for (const field of requiredFields) {
      // Check for empty string, null, or undefined
      if (formData[field] === '' || formData[field] === null || formData[field] === undefined) {
        newErrors[field] = `Please fill the ${field.replace('_', ' ')} field.`;
        isValid = false;
      }
    }

    // Phone number validation
    if (formData.phone && (formData.phone.length !== 11 || !/^\d+$/.test(formData.phone))) {
      newErrors.phone = 'Phone number must be exactly 11 digits and contain only numbers.';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      Swal.fire('Validation Error', 'Please correct the highlighted fields.', 'error');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (!validateForm()) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        employment_status: formData.employment_status,
        marital_status: formData.marital_status,
        number_dependants: Number(formData.number_dependants), // Ensure it's a number
        dob: new Date(formData.dob),
        health_preconditions: formData.health_preconditions
      });

      Swal.fire('Success', 'Your profile has been updated successfully.', 'success');
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Something went wrong while updating your profile.', 'error');
    }
  };



 // Hide alert after 5 seconds
  useEffect(() => {
    if (alert.message) { // Only run if there's an alert message
      const timer = setTimeout(() => {
        setAlert({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.message]); // Re-run effect when alert.message changes

 
  return (
    <>
     <UserHeader page_title={"Account Details"} />
    <div className="db-content-box bg-white round-10 mb-25">
      <div className="db-content-box-header d-flex flex-wrap align-items-center justify-content-between mb-18">
       {alert.message && (
          <div className={`w-100 alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.message}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}

      </div>
        <form className="form-wrapper style-two" onSubmit={handleSubmit}>
  <div className="row">
    {/* Readonly Fields (No validation needed here) */}
    {['first_name', 'last_name', 'email'].map((field) => (
      <div key={field} className="col-xxl-3 col-xl-4 col-md-6">
        <div className="form-group mb-15">
          <label htmlFor={field} className="fs-13 d-block fw-medium text-title mb-8">
            {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <input
            type={field === 'email' ? 'email' : 'text'}
            id={field}
            value={formData[field]}
            readOnly
            className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
            placeholder={field}
          />
        </div>
      </div>
    ))}

    {/* Editable Phone Field (already done, but re-checked for consistency) */}
    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="phone" className="fs-13 d-block fw-medium text-title mb-8">Phone</label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.phone ? 'is-invalid' : ''}`}
          placeholder="Phone Number"
        />
        {/* Error message for phone field */}
        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
      </div>
    </div>

    {/* Editable Address Field */}
    <div className="col-12">
      <div className="form-group mb-15">
        <label htmlFor="address" className="fs-13 d-block fw-medium text-title mb-8">Address</label>
        <textarea
          id="address"
          value={formData.address}
          onChange={handleChange}
          className={`fs-13 w-100 ht-80 bg-transparent round-5 text-para resize-0 ${errors.address ? 'is-invalid' : ''}`}
          placeholder="Full Address"
        ></textarea>
        {/* Error message for address field */}
        {errors.address && <div className="invalid-feedback">{errors.address}</div>}
      </div>
    </div>

    {/* Gender, Employment, Marital Status Fields */}
    {[
      { id: 'gender', label: 'Gender', options: ['', 'Male', 'Female', 'Other'] }, // Added 'Other' for completeness
      {
        id: 'employment_status',
        label: 'Employment Status',
        options: ['', 'Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired']
      },
      {
        id: 'marital_status',
        label: 'Marital Status',
        options: ['', 'Single', 'Married', 'Divorced', 'Widowed']
      }
    ].map(({ id, label, options }) => (
      <div key={id} className="col-xxl-2 col-xl-4 col-md-6">
        <div className="form-group mb-15">
          <label htmlFor={id} className="fs-13 d-block fw-medium text-title mb-8">{label}</label>
          <select
            id={id}
            value={formData[id]}
            onChange={handleChange}
            className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors[id] ? 'is-invalid' : ''}`}
          >
            {options.map((opt) => <option key={opt || 'select-option'} value={opt}>{opt || 'Select'}</option>)}
          </select>
          {/* Error message for select fields */}
          {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
        </div>
      </div>
    ))}

    {/* Number of Dependents and DOB Fields */}
    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="number_dependants" className="fs-13 d-block fw-medium text-title mb-8">Number of Dependents</label>
        <input
          type="number"
          id="number_dependants"
          min="0"
          value={formData.number_dependants}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.number_dependants ? 'is-invalid' : ''}`}
        />
        {/* Error message for number_dependants field */}
        {errors.number_dependants && <div className="invalid-feedback">{errors.number_dependants}</div>}
      </div>
    </div>

    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="dob" className="fs-13 d-block fw-medium text-title mb-8">Date of Birth</label>
        <input
          type="date"
          id="dob"
          value={formData.dob}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.dob ? 'is-invalid' : ''}`}
        />
        {/* Error message for DOB field */}
        {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
      </div>
    </div>

    {/* Health Pre-conditions Field */}
    <div className="col-12">
      <div className="form-group mb-20">
        <label htmlFor="health_preconditions" className="fs-13 d-block fw-medium text-title mb-8">Health Pre-conditions</label>
        <textarea
          id="health_preconditions"
          value={formData.health_preconditions}
          onChange={handleChange}
          className={`fs-13 w-100 ht-150 bg-transparent round-5 text-para resize-0 ${errors.health_preconditions ? 'is-invalid' : ''}`}
          placeholder="List any existing health conditions or relevant medical history, otherwise type none"
        ></textarea>
        {/* Error message for health_preconditions field */}
        {errors.health_preconditions && <div className="invalid-feedback">{errors.health_preconditions}</div>}
      </div>
    </div>
  </div>

  <div className="btn-wrap d-flex justify-content-end">
    <button type="submit" className="tb-btn style-one font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition">Save Changes</button>
  </div>
</form>
    </div>
    </>
  )
}

export default UserAccount