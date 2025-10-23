import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";
import HmoHeader from './HmoHeader'
import Swal from 'sweetalert2';

function HmoPlanDetails() {
  const { id } = useParams(); // planId from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    plan_name: "",
    plan_desc: "",
    price1: "",
    duration1: "",
    price2: "",
    duration2: "",
    price3: "",
    duration3: "",
    price4: "",
    duration4: "",
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Load plan from Firestore
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const docRef = doc(db, "plans", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setFormData(snapshot.data());
        } else {
          Swal.fire("Not Found", "Plan not found", "error");
          navigate("/hmo/plans");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        Swal.fire("Error", "Could not load plan", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, navigate]);

  // Handle form input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Save changes
  const handleSubmit = async (e) => {
  e.preventDefault();

  let newErrors = {};

  // 🔹 Required fields
  if (!formData.plan_name.trim()) {
    newErrors.plan_name = "Plan name is required";
  }
  if (!formData.plan_desc.trim()) {
    newErrors.plan_desc = "Plan description is required";
  }

  // 🔹 First price+duration pair is compulsory
  if (!formData.price1 || Number(formData.price1) <= 0) {
    newErrors.price1 = "First price point is required";
  }
  if (!formData.duration1 || Number(formData.duration1) <= 0) {
    newErrors.duration1 = "First duration is required";
  }

  // 🔹 Optional pairs: if one is filled, the other must be filled too
  const optionalPairs = [
    { price: formData.price2, duration: formData.duration2, label: "2" },
    { price: formData.price3, duration: formData.duration3, label: "3" },
    { price: formData.price4, duration: formData.duration4, label: "4" },
  ];

  optionalPairs.forEach((pair) => {
    if (pair.price && !pair.duration) {
      newErrors[`duration${pair.label}`] = `Duration ${pair.label} is required if price is set`;
    }
    if (pair.duration && !pair.price) {
      newErrors[`price${pair.label}`] = `Price ${pair.label} is required if duration is set`;
    }
  });

  // 🔹 If we found validation errors, show them
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const docRef = doc(db, "plans", id);
    await updateDoc(docRef, formData);
    Swal.fire("Success", "Plan updated successfully", "success");
  } catch (error) {
    console.error("Error updating plan:", error);
    Swal.fire("Error", "Failed to update plan", "error");
  }
  };



 
  // Toggle active/inactive
  const handleToggleActive = async () => {
    try {
      const docRef = doc(db, "plans", id);
      await updateDoc(docRef, { active: !formData.active });
      setFormData((prev) => ({ ...prev, active: !prev.active }));
      Swal.fire(
        "Updated",
        `Plan has been ${formData.active ? "deactivated" : "activated"}`,
        formData.active ? "info" : "success"
      );
    } catch (error) {
      console.error("Error updating active state:", error);
      Swal.fire("Error", "Could not update plan status", "error");
    }
  };


  // Delete plan (soft delete)
  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete this plan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const docRef = doc(db, "plans", id);
          await updateDoc(docRef, { deleted: true });
          Swal.fire("Deleted", "Plan has been deleted", "success");
          navigate("/hmo/hmo_plans");
        } catch (error) {
          console.error("Error deleting plan:", error);
        }
      }
    });
  };

  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + "{} | HMO Plan Details";
  }, []);

  if (loading) return <p>Loading plan...</p>;
  

  return (
    <>
      <div className="db-content-box bg-white round-10 mb-25">
        <HmoHeader page_title={`${formData.plan_name} | Plan Details`} />
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
                    className={`fs-13 w-100 ht-40 bg-transparent round-5 text-para ${errors.duration4 ? 'is-invalid' : ''}`}
                    placeholder="Enter duration in months (e.g., 1, 3, 6, 12)"
                  />
                {errors.duration4 && <div className="invalid-feedback">{errors.duration4}</div>}
              </div>
            </div>


          </div>

          <div className="btn-wrap d-flex justify-content-end">
            <button
              type="button"
              className="tb-btn style-two font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition me-2"
              onClick={handleToggleActive}
            >
              {formData.active ? "Deactivate" : "Activate"}
            </button>
            
            <button
              type="button"
              className="tb-btn style-five font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition me-2"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button type="submit" className="tb-btn style-one font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </>
  )
}

export default HmoPlanDetails