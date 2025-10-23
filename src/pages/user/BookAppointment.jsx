import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext"; // adjust path
import dayjs from "dayjs";
import Swal from 'sweetalert2';
import UserHeader from "./UserHeader";
import { Link, useNavigate } from "react-router-dom";
import { createNotification,sendEmail } from '../../services/notifications';



function BookAppointment() {
  const navigate = useNavigate();
  const { currentUser, userData, loading } = useAuth();

  const [userPlans, setUserPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [patientComplaint, setPatientComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch valid user plans
  useEffect(() => {
    const fetchPlans = async () => {
      if (!currentUser || !userData) return;

      const q = query(
        collection(db, 'user_plans'),
        where('firebaseUid', '==', currentUser.uid),
        where('status', '==', 'Approved')
      );

      const querySnapshot = await getDocs(q);
      const now = dayjs();

      const validPlans = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(plan => {
          const months = parseInt(plan.duration);
          const timestamp = plan.timestamp?.toDate?.();
          if (!timestamp || isNaN(months)) return false;
          const expiry = dayjs(timestamp).add(months, 'month');
          return expiry.isAfter(now);
        });

      setUserPlans(validPlans);
    };

    fetchPlans();
  }, [currentUser, userData]);


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedPlanId || !appointmentDate || !appointmentTime || !patientComplaint) {
    alert("Please fill in all fields.");
    return;
  }

  const selectedPlan = userPlans.find(plan => plan.id === selectedPlanId);
  if (!selectedPlan) {
    alert("Invalid plan selected.");
    return;
  }

  try {
    setSubmitting(true);

    // Pre-generate doc ref
    const docRef = doc(collection(db, "appointments"));

    const baseData = {
      appointmentId: docRef.id,
      name: userData.first_name + " " + userData.last_name,
      name_lower: (userData.first_name + " " + userData.last_name).toLowerCase(),
      userId: userData.userId,
      firebaseUid: currentUser.uid,
      enrolleId: selectedPlan.enrolleId || "",
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      patient_complaint: patientComplaint,

      hpId: selectedPlan.hpId || "",
      hpfirebaseUid: selectedPlan.hpfirebaseUid || "",
      hp_approved: "Pending",
      hpName: selectedPlan.hpName || "",
      treatment_sheet: "",
      amount: "",
      query: false,
      claim: false,

      hmoId: selectedPlan.hmoId || "",
      hmofirebaseUid: selectedPlan.hmofirebaseUid || "",
      hmoName: selectedPlan.hmoName || "",
      hmo_approved: "Pending",
      paid: false,
      referral: "No",
      referral_from: "",
      status: "Pending",
      cancelled_at: "",
      createdAt: serverTimestamp(),
    };

    // Save appointment
    await setDoc(docRef, baseData);

    // --- Notifications ---
    const notifPromises = [
      // User
      createNotification({
        userId: currentUser.uid,
        title: "Appointment Booked",
        message: `Your appointment with ${selectedPlan.hpName} is pending approval.`,
        type: "success",
        link: `/user/user_appointments/${docRef.id}`
      })
    ];

    if (selectedPlan.hmofirebaseUid) {
      notifPromises.push(
        createNotification({
          userId: selectedPlan.hmofirebaseUid,
          title: "New Appointment",
          message: `An appointment has been booked by ${userData.first_name} ${userData.last_name}.`,
          type: "info",
          link: `/hmo/appointments/${docRef.id}`
        })
      );
    }

    if (selectedPlan.hpfirebaseUid) {
      notifPromises.push(
        createNotification({
          userId: selectedPlan.hpfirebaseUid,
          title: "New Appointment Request",
          message: `You have a new appointment request from ${userData.first_name} ${userData.last_name}.`,
          type: "info",
          link: `/hp/appointments/${docRef.id}`
        })
      );
    }

    await Promise.all(notifPromises);

    // --- Emails ---
    const emailPromises = [
      sendEmail(
        userData.email,
        `${userData.first_name} ${userData.last_name}`,
        "Appointment Booked",
        `Dear ${userData.first_name}, your appointment with ${selectedPlan.hpName} is pending approval.<br/>
        <p>Best regards,<br/>${import.meta.env.VITE_COMPANY_NAME} Team</p>`
      )
    ];

    if (selectedPlan.hmoEmail) {
      emailPromises.push(
        sendEmail(
          selectedPlan.hmoEmail,
          selectedPlan.hmoName,
          "New Appointment Booked",
          `An appointment has been booked by ${userData.first_name} ${userData.last_name}.`
        )
      );
    }

    if (selectedPlan.hpEmail) {
      emailPromises.push(
        sendEmail(
          selectedPlan.hpEmail,
          selectedPlan.hpName,
          "New Appointment Request",
          `You have a new appointment request from ${userData.first_name} ${userData.last_name}.`
        )
      );
    }

    await Promise.all(emailPromises);

    // --- Success feedback ---
    Swal.fire("Success", "Appointment booked successfully.", "success").then(() => {
      navigate("/user/user_appointments");
    });

    // Reset form
    setSelectedPlanId("");
    setAppointmentDate("");
    setAppointmentTime("");
    setPatientComplaint("");

  } catch (error) {
    console.error("Error saving appointment:", error);
    Swal.fire("Error", "Something went wrong while booking the appointment. " + error, "error");
  } finally {
    setSubmitting(false);
  }
};



  if (loading) return <p>Loading...</p>;

  return (
    <>
      <UserHeader page_title={"Book an Appointment"} />
      <div className="db-content-box bg-white round-10 mb-25">

        <form className="form-wrapper style-two" onSubmit={handleSubmit}>
          <div className="row">
            {/* Choose Plan */}
            <div className="col-xxl-4 col-xl-4 col-md-4">
              <div className="form-group mb-15">
                <label htmlFor='user_plans' className="fs-13 d-block fw-medium text-title mb-8">Choose a Plan</label>
                {userPlans.length > 0 ? (
                  <select
                    id='user_plans'
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
                  >
                    <option value="">-- Select Plan --</option>
                    {userPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.planName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-danger fs-13">
                    No valid insurance plan found.{" "}
                    <Link to="/user/book_appointment_out_pocket" className="text-primary text-decoration-underline">
                      Use out-of-pocket appointment
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Appointment Date */}
            <div className="col-xxl-4 col-xl-4 col-md-4">
              <div className="form-group mb-15">
                <label htmlFor="appointment_date" className="fs-13 d-block fw-medium text-title mb-8">Appointment Date</label>
                <input
                  type="date"
                  id="appointment_date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={dayjs().format("YYYY-MM-DD")}
                  className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group mb-15">
                <label htmlFor="appointment_time" className="fs-13 d-block fw-medium text-title mb-8">
                  Appointment Time
                </label>
                <input
                  type="time"
                  id="appointment_time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
                />
              </div>
            </div>

            {/* Complaint */}
            <div className="col-12">
              <div className="form-group mb-20">
                <label htmlFor="patient_complaint" className="fs-13 d-block fw-medium text-title mb-8">Patient Complaint</label>
                <textarea
                  id="patient_complaint"
                  value={patientComplaint}
                  onChange={(e) => setPatientComplaint(e.target.value)}
                  className="fs-13 w-100 ht-150 bg-transparent round-5 text-para resize-0"
                  placeholder="List any health conditions or complaints you have"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="btn-wrap d-flex justify-content-end">
            <button
              type="submit"
              disabled={loading || userPlans.length === 0}
              className="tb-btn style-one font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition"
            >
             {submitting ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>

      </div>
    </>
  );
}

export default BookAppointment;