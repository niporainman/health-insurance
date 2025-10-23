import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from "../../services/firebase";
import { onAuthStateChanged } from 'firebase/auth';
import HpHeader from "./HpHeader";
import Swal from 'sweetalert2';
 import axios from 'axios';

function HpAccount() {
  // Set the document title when the component mounts
  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | HP Account";
  }, []);

// Function to upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_upload'); // replace with your preset
  formData.append('cloud_name', 'dx6o1kzbu'); // replace with your Cloudinary cloud name

  try {
    const response = await axios.post('https://api.cloudinary.com/v1_1/dx6o1kzbu/image/upload', formData);
    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed.');
  }
};


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    logo: '',
    contact_person: '',
    contact_person_phone: '',
    contact_person1: '',
    contact_person_phone1: ''
  });

  const [userId, setUserId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, 'hps', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const initialForm = {
            name: data.name ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            logo: data.logo ?? '',
            contact_person: data.contact_person ?? '',
            contact_person_phone: data.contact_person_phone ?? '',
            contact_person1: data.contact_person1 ?? '',
            contact_person_phone1: data.contact_person_phone1 ?? ''
          };

          setFormData(initialForm);

          // Check for any empty fields for initial alert
          const requiredFields = ['phone', 'logo', 'contact_person', 'contact_person_phone'];
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
  const { id, value, files } = e.target;

  if (id === 'logo' && files && files[0]) {
    handleLogoUpload(files[0]); // separate async handler
  } else {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [id]: '' }));
  }
};

const handleLogoUpload = async (file) => {
  try {
    const uploadedUrl = await uploadToCloudinary(file);
    setFormData((prev) => ({ ...prev, logo: uploadedUrl }));
    setErrors((prevErrors) => ({ ...prevErrors, logo: '' }));
  } catch (err) {
    console.error('Error uploading logo:', err);
    Swal.fire('Upload Error', 'Failed to upload logo. Please try again.', 'error');
  }
};


  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    const requiredFields = ['phone', 'logo', 'contact_person', 'contact_person_phone'];

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
      await updateDoc(doc(db, 'hps', userId), {
        phone: formData.phone,
        logo: formData.logo,
        contact_person: formData.contact_person,
        contact_person_phone: formData.contact_person_phone,
        contact_person1: formData.contact_person1,
        contact_person_phone1: formData.contact_person_phone1
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
     <HpHeader page_title={"HP Account Details"} />
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
    {['name', 'email'].map((field) => (
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

    {/* Logo */}
    <div className="col-xxl-3 col-xl-4 col-md-6">
      {formData.logo && (
  <div className="mt-2">
    <img
      src={formData.logo}
      alt="Company Logo Preview"
      style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
    />
  </div>
)}

      <div className="form-group mb-15">
        <label htmlFor="logo" className="fs-13 d-block fw-medium text-title mb-8">Company Logo</label>
        <input
          type="file"
          id="logo"
          accept="image/*"
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.logo ? 'is-invalid' : ''}`}
        />
        {/* Error message for field */}
        {errors.logo && <div className="invalid-feedback">{errors.logo}</div>}
      </div>
    </div>

    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="contact_person" className="fs-13 d-block fw-medium text-title mb-8">Contact Person 1</label>
        <input
          type="text"
          id="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.contact_person ? 'is-invalid' : ''}`}
        />
        {/* Error message for field */}
        {errors.contact_person && <div className="invalid-feedback">{errors.contact_person}</div>}
      </div>
    </div>

    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="contact_person_phone" className="fs-13 d-block fw-medium text-title mb-8">Contact Person 1 Phone</label>
        <input
          type="text"
          id="contact_person_phone"
          value={formData.contact_person_phone}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.contact_person_phone ? 'is-invalid' : ''}`}
        />
        {/* Error message for field */}
        {errors.contact_person_phone && <div className="invalid-feedback">{errors.contact_person_phone}</div>}
      </div>
    </div>

        <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="contact_person1" className="fs-13 d-block fw-medium text-title mb-8">Contact Person 2</label>
        <input
          type="text"
          id="contact_person1"
          value={formData.contact_person1}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.contact_person1 ? 'is-invalid' : ''}`}
        />
        {/* Error message for field */}
        {errors.contact_person1 && <div className="invalid-feedback">{errors.contact_person1}</div>}
      </div>
    </div>

    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15">
        <label htmlFor="contact_person_phone1" className="fs-13 d-block fw-medium text-title mb-8">Contact Person 2 Phone</label>
        <input
          type="text"
          id="contact_person_phone1"
          value={formData.contact_person_phone1}
          onChange={handleChange}
          className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.contact_person_phone1 ? 'is-invalid' : ''}`}
        />
        {/* Error message for field */}
        {errors.contact_person_phone1 && <div className="invalid-feedback">{errors.contact_person_phone1}</div>}
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

export default HpAccount