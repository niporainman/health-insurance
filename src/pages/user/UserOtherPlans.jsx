import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import UserHeader from "./UserHeader";
import { useNavigate } from "react-router-dom";

function UserOtherPlans() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | Add an existing plan";
  }, []);

  const { currentUser, userData } = useAuth();

  const [formData, setFormData] = useState({
    hmoName: "",
    planName: "",
    enrolleId: ""
  });

  const [hmos, setHmos] = useState([]);
  const [plans, setPlans] = useState([]);
  const [hmoSuggestions, setHmoSuggestions] = useState([]);
  const [planSuggestions, setPlanSuggestions] = useState([]);
  const [selectedHmo, setSelectedHmo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchHmos = async () => {
      const hmoSnapshot = await getDocs(collection(db, "hmos"));
      const hmoList = hmoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHmos(hmoList);
    };

    const fetchPlans = async () => {
      const planSnapshot = await getDocs(collection(db, "plans"));
      const planList = planSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(planList);
    };

    fetchHmos();
    fetchPlans();
  }, []);

  const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "hmoName") {
      if (!value.trim()) {
        setHmoSuggestions([]);
        setSelectedHmo(null);
        setSelectedPlan(null);
        return;
      }

      const filtered = hmos.filter(hmo =>
        hmo.name.toLowerCase().includes(value.toLowerCase())
      );
      setHmoSuggestions(filtered);

      const matched = hmos.find(hmo => hmo.name.toLowerCase() === value.toLowerCase());
      if (matched) {
        setSelectedHmo(matched);
        setHmoSuggestions([]);
      } else {
        setSelectedHmo(null);
        setSelectedPlan(null);
      }
    }

    if (id === "planName") {
      if (!value.trim()) {
        setPlanSuggestions([]);
        return;
      }
      if (selectedHmo) {
        const filtered = plans
          .filter(plan => plan.hmoId === selectedHmo.hmoId)
          .filter(plan => plan.plan_name.toLowerCase().includes(value.toLowerCase()));
        setPlanSuggestions(filtered);

        const matched = filtered.find(plan => plan.plan_name.toLowerCase() === value.toLowerCase());
        setSelectedPlan(matched || null);
        
      } else {
        setPlanSuggestions([]);
        setSelectedPlan(null);
        
      }
    }
  };

  const handleHmoSelect = (hmo) => {
    setFormData((prev) => ({ ...prev, hmoName: hmo.name }));
    setSelectedHmo(hmo);
    setSelectedPlan(null);
    setPlanSuggestions([]);
    setHmoSuggestions([]);
  };

  const handlePlanSelect = (plan) => {
    setFormData((prev) => ({ ...prev, planName: plan.plan_name }));
    setSelectedPlan(plan);
    setPlanSuggestions([]);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedHmo || !selectedPlan || !formData.enrolleId) {
      return Swal.fire("Missing Info", "Please ensure valid HMO, plan, and enrolle number.", "warning");
    }

    let otherPlan = "Yes";

    try {
      await addDoc(collection(db, "user_plans"), {
        userId: userData?.userId,
        firebaseUid: currentUser.uid,
        hmoName: selectedHmo.name,
        hmoId: selectedHmo.hmoId,
        hmofirebaseUid: selectedHmo.firebaseUid,
        planName: selectedPlan.plan_name,
        planId: selectedPlan.id,
        enrolleId: formData.enrolleId,
        otherPlan,
        purchaseId: generateId(),
        status: "Pending",
        timestamp: serverTimestamp(),
      });

      setFormData({ hmoName: "", planName: "", enrolleId: "" });
      setSelectedHmo(null);
      setSelectedPlan(null);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your plan has been saved.',
        confirmButtonText: 'OK'
        }).then(() => {
        navigate("/user/user_plans");
      });

    } catch (err) {
      Swal.fire("Error", "Error saving plan: " + err.message, "error");
    }
  };

  return (
    <div className="db-content-box bg-white round-10 mb-25">
      <UserHeader page_title="Other Plans" />
      <h3>Already insured? Add your plan to your Kolo Health account</h3> <br />
      <form className="form-wrapper style-two" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-xxl-4 col-xl-4 col-md-6 position-relative mb-3">
            <label htmlFor="hmoName" className="fs-13 fw-medium ">HMO Name</label>
            <input
              type="text"
              id="hmoName"
              value={formData.hmoName}
              onChange={handleChange}
              className="form-control"
              placeholder="Type HMO Name"
              autoComplete="off"
              required
            />
            {hmoSuggestions.length > 0 && (
              <ul className="autocomplete-suggestions position-absolute bg-white p-2 shadow-sm rounded w-100">
                {hmoSuggestions.map(hmo => (
                  <div className="p-2 hover:bg-light cursor-pointer" key={hmo.id} onClick={() => handleHmoSelect(hmo)}>
                    {hmo.name}
                  </div>
                ))}
              </ul>
            )}
            {!selectedHmo && formData.hmoName && (
              <p className="text-danger mt-2 fs-12">Please select a valid HMO</p>
            )}
          </div>

          <div className="col-xxl-4 col-xl-4 col-md-6 position-relative mb-3">
            <label htmlFor="planName" className="fs-13 fw-medium ">Insurance Package</label>
            <input
              type="text"
              id="planName"
              value={formData.planName}
              onChange={handleChange}
              className="form-control"
              placeholder="Insurance Package"
              autoComplete="off"
              required
              disabled={!selectedHmo}
            />
            {planSuggestions.length > 0 && (
              <ul className="autocomplete-suggestions position-absolute bg-white p-2 shadow-sm rounded w-100">
                {planSuggestions.map(plan => (
                  <div key={plan.plan_id} onClick={() => handlePlanSelect(plan)}>
                    {plan.plan_name}
                  </div>
                ))}
              </ul>
            )}
            {!selectedPlan && formData.planName && selectedHmo && (
              <p className="text-danger mt-2 fs-12">Please select a valid plan for this HMO</p>
            )}
          </div>

          <div className="col-xxl-4 col-xl-4 col-md-6 mb-3">
            <label htmlFor="enrolleId" className="fs-13 fw-medium ">Enrolle Number</label>
            <input
              type="text"
              id="enrolleId"
              value={formData.enrolleId}
              onChange={handleChange}
              className="form-control"
              placeholder="Enrolle Number"
              required
            />
          </div>
        </div>

       
         <div className="btn-wrap d-flex justify-content-end mt-3">
          <button type="submit" className="tb-btn style-one font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition">Save</button>
        </div>
      </form>
    </div>
  );
}

export default UserOtherPlans;
