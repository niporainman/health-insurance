import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";
import HpHeader from "./HpHeader";
import Swal from "sweetalert2";
import { createNotification, sendEmail } from "../../services/notifications";

function HpAppointmentDetails() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [user, setUser] = useState(null);
  const [hmo, setHmo] = useState(null);
  const [hp, setHp] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [claimAmount, setClaimAmount] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [formData, setFormData] = useState({
    treatment_sheet: "",
  });

  /** Format helpers **/
  function formatReadableDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    const suffix = (n) =>
      ["th", "st", "nd", "rd"][
        n % 10 > 3 || Math.floor(n % 100 / 10) === 1 ? 0 : n % 10
      ];
    const dayWithSuffix = date.getDate() + suffix(date.getDate());
    const relative =
      diffDays === 0
        ? "(Today)"
        : diffDays === 1
        ? "(Tomorrow)"
        : diffDays > 0
        ? `(in ${diffDays} day${diffDays > 1 ? "s" : ""} time)`
        : `(${Math.abs(diffDays)} day${
            Math.abs(diffDays) > 1 ? "s" : ""
          } ago)`;

    return `${date.toLocaleDateString("en-US", {
      weekday: "short",
    })}, ${date.toLocaleDateString("en-US", {
      month: "long",
    })} ${dayWithSuffix}, ${date.getFullYear()} ${relative}`;
  }

  function formatFirestoreTimestamp(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    const suffix = (n) =>
      ["th", "st", "nd", "rd"][
        n % 10 > 3 || Math.floor(n % 100 / 10) === 1 ? 0 : n % 10
      ];
    const dayWithSuffix = date.getDate() + suffix(date.getDate());
    const relative =
      diffDays === 0
        ? "(Today)"
        : diffDays === 1
        ? "(Tomorrow)"
        : diffDays > 0
        ? `(in ${diffDays} day${diffDays > 1 ? "s" : ""} time)`
        : `(${Math.abs(diffDays)} day${
            Math.abs(diffDays) > 1 ? "s" : ""
          } ago)`;

    return `${date.toLocaleDateString("en-US", {
      weekday: "short",
    })}, ${date.toLocaleDateString("en-US", {
      month: "long",
    })} ${dayWithSuffix}, ${date.getFullYear()} ${relative}`;
  }

  const notifyUpdate = (msg, icon = "info") => {
    Swal.fire({
      toast: true,
      position: "top-end",   // adjust if you prefer bottom
      icon,
      title: msg,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };
  

  /** Listen to appointment changes live **/
  useEffect(() => {
    const appointmentRef = doc(db, "appointments", id);
    const unsub = onSnapshot(appointmentRef, async (snap) => {
      if (!snap.exists()) {
        alert("Appointment not found.");
        return;
      }
      const appointmentData = { id: snap.id, ...snap.data() };

      setAppointment((prev) => {
      if (prev && JSON.stringify(prev) !== JSON.stringify(appointmentData)) {
        notifyUpdate("Appointment details updated", "info");
      }
      return appointmentData;
    });

      // fetch related docs in parallel
      try {
        const promises = [];

        if (appointmentData.firebaseUid) {
          promises.push(getDoc(doc(db, "users", appointmentData.firebaseUid)));
        } else promises.push(null);

        if (appointmentData.hmofirebaseUid) {
          promises.push(getDoc(doc(db, "hmos", appointmentData.hmofirebaseUid)));
        } else promises.push(null);

        if (appointmentData.hpfirebaseUid) {
          promises.push(getDoc(doc(db, "hps", appointmentData.hpfirebaseUid)));
        } else promises.push(null);

        const [userSnap, hmoSnap, hpSnap] = await Promise.all(promises);

        if (userSnap?.exists()) setUser({ id: userSnap.id, ...userSnap.data() });
        if (hmoSnap?.exists()) setHmo({ id: hmoSnap.id, ...hmoSnap.data() });
        if (hpSnap?.exists()) setHp({ id: hpSnap.id, ...hpSnap.data() });
      } catch (err) {
        console.error("Error fetching related docs:", err);
      }
    });

    return () => unsub();
  }, [id]);

  /** Sync treatment form with appointment **/
  useEffect(() => {
    if (appointment?.treatment_sheet !== undefined) {
      setFormData((prev) => ({
        ...prev,
        treatment_sheet: appointment.treatment_sheet,
      }));
    }
  }, [appointment]);

  /** Actions **/
const companyName = import.meta.env.VITE_COMPANY_NAME;

// Approve
const handleApprove = async (id) => {
  setLoadingId(id);
  try {
    await updateDoc(doc(db, "appointments", id), { hp_approved: "Approved" });

    if (user) {
      await createNotification({
        userId: user.id,
        title: "Appointment Approved",
        message: `Your appointment (${id}) with ${hp?.name || "the health provider"} has been approved. We look forward to seeing you!`,
        type: "success",
        link: `/appointments/${id}`,
      });

      await sendEmail(
        user.email,
        appointment.name,
        "Your Appointment Has Been Approved",
        `Hello ${appointment.name},<br /><br />
        We’re happy to let you know that your appointment (${id}) with <b>${hp?.name}</b> has been <b>approved</b>.<br /><br />
        We look forward to assisting you soon.<br /><br />
        Regards,<br />${companyName}`
      );
    }

    if (hmo) {
      await createNotification({
        userId: hmo.id,
        title: "Appointment Approved by HP",
        message: `Appointment (${id}) for ${appointment?.name} has been approved by ${hp?.name}.`,
        type: "info",
        link: `/hmo/appointments/${id}`,
      });

      await sendEmail(
        hmo.email,
        hmo.name,
        "Appointment Approved by HP",
        `Hello ${hmo.name},<br /><br />
        Appointment (${id}) for ${appointment?.name} has been approved by ${hp?.name}.<br /><br />
        Regards,<br />${companyName}`
      );
    }
    notifyUpdate("Appointment approved", "success");
  } catch (error) {
    console.error("Error approving appointment:", error);
    notifyUpdate("Error approving appointment", "error");
  } finally {
    setLoadingId(null);
  }
};

// Reject
const handleReject = async (id) => {
  setLoadingId(id);
  try {
    await updateDoc(doc(db, "appointments", id), { hp_approved: "Rejected" });

    if (user) {
      await createNotification({
        userId: user.id,
        title: "Appointment Rejected",
        message: `We’re sorry, your appointment (${id}) with ${hp?.name || "the health provider"} has been rejected. Please contact support or try again.`,
        type: "error",
        link: `/appointments/${id}`,
      });

      await sendEmail(
        user.email,
        appointment.name,
        "Your Appointment Could Not Be Approved",
        `Hello ${appointment.name},<br /><br />
        Unfortunately, your appointment (${id}) with <b>${hp?.name}</b> could not be approved at this time.<br />
        Please reach out if you need further assistance, or try booking again later.<br /><br />
        We appreciate your patience and understanding.<br /><br />
        Regards,<br />${companyName}`
      );
    }

    if (hmo) {
      await createNotification({
        userId: hmo.id,
        title: "Appointment Rejected by HP",
        message: `Appointment (${id}) for ${appointment?.name} has been rejected by ${hp?.name}.`,
        type: "warning",
        link: `/hmo/appointments/${id}`,
      });

      await sendEmail(
        hmo.email,
        hmo.name,
        "Appointment Rejected by HP",
        `Hello ${hmo.name},<br /><br />
        Appointment (${id}) for ${appointment?.name} has been rejected by ${hp?.name}.<br /><br />
        Regards,<br />${companyName}`
      );
    }
    notifyUpdate("Appointment rejected", "success");
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    notifyUpdate("Error rejecting appointment", "error");
  } finally {
    setLoadingId(null);
  }
};

// Query
const handleQuery = async () => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to query this appointment?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, query it",
    cancelButtonText: "No, don't.",
  });
  if (!result.isConfirmed) return;

  try {
    await updateDoc(doc(db, "appointments", appointment.id), { query: true });

    if (hmo) {
      await createNotification({
        userId: hmo.id,
        title: "Appointment Queried",
        message: `Appointment (${appointment.id}) for ${appointment?.name} has been queried by ${hp?.name}.`,
        type: "warning",
        link: `/hmo/appointments/${appointment.id}`,
      });

      await sendEmail(
        hmo.email,
        hmo.name,
        "Appointment Queried",
        `Hello ${hmo.name},<br /><br />
        Appointment (${appointment.id}) for ${appointment?.name} has been queried by ${hp?.name}.<br /><br />
        Regards,<br />${companyName}`
      );
    }

    Swal.fire("Queried!", "This entry has been queried.", "success");
  } catch (error) {
    console.error("Error querying:", error);
    Swal.fire("Error", "Failed to query. Please try again.", "error");
  }
};

// Claim Submit
const handleClaimSubmit = async (e) => {
  e.preventDefault();
  if (!claimAmount) {
    Swal.fire("Error", "Please enter a valid amount.", "error");
    return;
  }
  setClaimLoading(true);
  try {
    await updateDoc(doc(db, "appointments", id), {
      claim: true,
      claimDate: serverTimestamp(),
      amount: Number(claimAmount),
    });

    if (hmo) {
      await createNotification({
        userId: hmo.id,
        title: "Claim Submitted",
        message: `${hp?.name} has submitted a claim of ₦${claimAmount} for appointment (${id}) of ${appointment?.name}.`,
        type: "info",
        link: `/hmo/appointments/${id}`,
      });

      await sendEmail(
        hmo.email,
        hmo.name,
        "Claim Submitted",
        `Hello ${hmo.name},<br /><br />
        ${hp?.name} has submitted a claim of ₦${claimAmount} for appointment (${id}) of ${appointment?.name}.<br /><br />
        Regards,<br />${companyName}`
      );
    }

    Swal.fire("Success", "Claim has been submitted successfully.", "success");
    setClaimAmount("");
  } catch (error) {
    console.error("Error submitting claim:", error);
    Swal.fire("Error", "Something went wrong while submitting claim.", "error");
  } finally {
    setClaimLoading(false);
  }
};

  const handleTreatment = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "appointments", id), {
        treatment_sheet: formData.treatment_sheet,
      });
      Swal.fire("Success", "Treatment Sheet updated successfully.", "success");
    } catch (error) {
      console.error("Error updating treatment sheet:", error);
      Swal.fire("Error", "Failed to update treatment sheet.", "error");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /** Loading states **/
  if (!appointment) return <p>Loading appointment...</p>;
  if (!user) return <p>Loading user info...</p>;
  if (!hmo) return <p>Loading hmo info...</p>;
  if (!hp) return <p>Loading hp info...</p>;
  
  return (
    <div className="container db-content-wrapper">
      <HpHeader page_title={`${appointment.name} | Appointment Details`} />
      <div className="row patient-stat-box round-10 bg-title mb-30">
        <div className="col-4 patient-stat-item d-flex flex-wrap align-items-center">
            <div className="patient-stat-icon bg-yellow d-flex flex-column align-items-center justify-content-center rounded-circle">
                <img src="/assets/images/user.svg" alt="Icon" />
            </div>
            <div className="patient-stat-info">
                <h4 className="fw-bold text-white">{appointment.name}</h4>
                <span className="fs-14 text-white">Patient Name</span>
            </div>
        </div>
        <div className="col-4 patient-stat-item d-flex flex-wrap align-items-center">
            <div className="patient-stat-icon bg-flower d-flex flex-column align-items-center justify-content-center rounded-circle">
                <img src="/assets/images/women-2.svg" alt="Icon" />
            </div>
            <div className="patient-stat-info">
                <h4 className="fw-bold text-white">{user.gender}</h4>
                <span className="fs-14 text-white">Gender</span>
            </div>
        </div>
        <div className="col-4 patient-stat-item d-flex flex-wrap align-items-center">
            <div className="patient-stat-icon bg-melanine d-flex flex-column align-items-center justify-content-center rounded-circle">
                <img src="/assets/images/age.svg" alt="Icon" />
            </div>
            <div className="patient-stat-info">
                <h4 className="fw-bold text-white">{
  user?.dob
    ? new Date().getFullYear() - user.dob.toDate().getFullYear() -
      (new Date() < new Date(new Date().getFullYear(), user.dob.toDate().getMonth(), user.dob.toDate().getDate()) ? 1 : 0)
    : "N/A"
}</h4>
                <span className="fs-14 text-white">Patient Age</span>
            </div>
        </div>
      </div>

<div className="row">
    <div className="col-xxl-6 col-xl-6">
         
        <div className="db-content-box bg-white round-10 mb-25">
        <h4 className="fs-17 fw-extrabold text-title mb-15">User Data</h4>
        <b>Enrolle ID:</b> {appointment.enrolleId}<br />
        <b>First Name:</b> {user.first_name}<br />
        <b>Last Name:</b> {user.last_name}<br />
        <b>Phone:</b> {user.phone}<br />
        <b>Address:</b> {user.address}<br />
        <b>Employement Status:</b> {user.employment_status}<br />
        <b>Health Preconditions:</b> {user.health_preconditions} <br />
        <b>Marital Status:</b> {user.marital_status}<br />
        <b>Number of Dependants:</b> {user.number_dependants}<br />
           
        </div>
    </div>

    <div className="col-xxl-6 col-xl-6">
         
        <div className="db-content-box bg-white round-10 mb-25">
        <h4 className="fs-17 fw-extrabold text-title mb-15">Appointment Details</h4>
        <b>Date:</b> {formatReadableDate(appointment.appointment_date)}<br />
         <b>Time:</b> {appointment.appointment_time
          ? new Date(`1970-01-01T${appointment.appointment_time}`).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : ""}<br />
        <b>Patient Complaint:</b> {appointment.patient_complaint}<br />
        <b>Cost</b>: {appointment.amount ? `₦${appointment.amount.toLocaleString()}` : "N/A"}<br />
        <b>Query</b>{" "}
        <span
          style={{
            color: appointment.query ? "red" : "green",
            fontWeight: appointment.query ? "bold" : "normal",
          }}
        >
          {appointment.query ? "Yes" : "No"}
        </span>
        <br />
        {appointment.outOfPocket !== "Yes" && hmo && (
          <>
            <b>Claim Date:</b>{" "}
            {appointment.claimDate ? formatFirestoreTimestamp(appointment.claimDate) : "N/A"}
            <br />
            <b>HMO Paid:</b>{" "}
            <span
              style={{
                color: appointment.paid ? "green" : "red",
                fontWeight: "normal",
              }}
            >
              {appointment.paid ? "Yes" : "No"}
            </span>
            <br />
          </>
        )}
       {appointment.cancelled_at && (
        <>
            <b>Cancelled At:</b> {formatReadableDate(appointment.cancelled_at)}<br />
        </>
        )}
         <button onClick={handleQuery} className="tb-btn style-five font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition py-2">
         Query
        </button>
           
        </div>
    </div>

    <div className="col-xxl-12 col-xl-12">
         
        <div className="db-content-box bg-white round-10 mb-25">
        <h4 className="fs-17 fw-extrabold text-title mb-15">HMO Details</h4>
        <b>HMO:</b> {hmo.name}<br />
        <b>Status:</b> <span style={{
            color:
                appointment.hmo_approved === "Approved"
                ? "green"
                : appointment.hmo_approved === "Rejected"
                ? "red"
                : "orange"
            }}>
            {appointment.hmo_approved}
            </span><br />
        



        </div>
    </div>

     <div className="col-xxl-12 col-xl-12">
         
        <div className="db-content-box bg-white round-10 mb-25">
        <h4 className="fs-17 fw-extrabold text-title mb-15">HP Details</h4>
        <b>HP:</b> {hp.name}<br />
        <b>Status:</b>{" "}
            <span style={{
            color:
                appointment.hp_approved === "Approved"
                ? "green"
                : appointment.hp_approved === "Rejected"
                ? "red"
                : "orange"
            }}>
            {appointment.hp_approved}
            </span><br />

                       
        {appointment.hp_approved === "Pending" || appointment.hp_approved == "Rejected" && (
        <button
            onClick={() => handleApprove(appointment.id)}
            className="btn btn-xs btn-success"
            disabled={loadingId === appointment.id}
        >
            {loadingId === appointment.id ? "Approving..." : "Approve"}
        </button>
        )}


        {appointment.hp_approved == "Approved" && appointment.hmo_approved !== "Approved" && (
        <button
            onClick={() => handleReject(appointment.id)}
            className="btn btn-xs btn-danger"
            disabled={loadingId === appointment.id}
        >
            {loadingId === appointment.id ? "Rejecting..." : "Reject"}
        </button>
        )}

        </div>
    </div>

    <div className="col-xxl-12 col-xl-12">   
        <div className="db-content-box bg-white round-10 mb-25">
            <h4 className="fs-17 fw-extrabold text-title mb-15">Treatment Sheet</h4>
            <form className="form-wrapper style-two" onSubmit={handleTreatment}>
              <div className="form-group mb-15">
                <label htmlFor="treatment_sheet" className="fs-13 d-block fw-medium text-title mb-8">Treatment Sheet</label>
                <textarea
                  id="treatment_sheet"
                  value={formData.treatment_sheet}
                  onChange={handleChange}
                  className={`fs-13 w-100 ht-80 bg-transparent round-5 text-para resize-0`}
                  placeholder="Enter treatment details here..."
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-xs fs-14 round-5">Save Changes</button>
            </form>
        </div>
    </div>

{!(appointment.paid || appointment.claim) && (
<div className="col-xxl-12 col-xl-12">   
  <div className="db-content-box bg-white round-10 mb-25">
    <h4 className="fs-17 fw-extrabold text-title mb-15">Claims</h4>
    <form className="form-wrapper style-two" onSubmit={handleClaimSubmit}>
      <div className="form-group mb-15">
        <label htmlFor="claim_amount" className="fs-13 d-block fw-medium text-title mb-8">
          Amount
        </label>
        <input
          type="number"
          id="claim_amount"
          value={claimAmount}
          onChange={(e) => setClaimAmount(e.target.value)}
          className="fs-13 w-100 bg-transparent round-5 text-para"
          placeholder="Enter claim amount"
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-xs fs-14 round-5"
        disabled={claimLoading}
      >
        {claimLoading ? "Submitting..." : "Submit Claim"}
      </button>
    </form>
  </div>
</div>
)}
   
</div>

       </div>

  )
}

export default HpAppointmentDetails