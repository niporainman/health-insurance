import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";
import HmoHeader from "./HmoHeader";
import Swal from 'sweetalert2';
import { createNotification, sendEmail } from "../../services/notifications";

function HmoAppointmentDetails() {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [user, setUser] = useState(null);
    const [hmo, setHmo] = useState(null);
    const [hp, setHp] = useState(null);
    const [loading, setLoading] = useState({ id: null, action: null });

function formatReadableDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  const suffix = (n) => ["th", "st", "nd", "rd"][(n % 10 > 3 || Math.floor(n % 100 / 10) === 1) ? 0 : n % 10];
  const dayWithSuffix = date.getDate() + suffix(date.getDate());

  const relative = diffDays === 0
    ? "(Today)"
    : diffDays === 1
    ? "(Tomorrow)"
    : diffDays > 0
    ? `(in ${diffDays} day${diffDays > 1 ? "s" : ""} time)`
    : `(${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago)`;

  return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.toLocaleDateString('en-US', { month: 'long' })} ${dayWithSuffix}, ${date.getFullYear()} ${relative}`;
}

function formatFirestoreTimestamp(timestamp) {
  if (!timestamp) return "";

  // Convert Firestore Timestamp to JS Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();

  // Calculate difference in days
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  // Add suffix to day
  const suffix = (n) => ["th", "st", "nd", "rd"][
    (n % 10 > 3 || Math.floor(n % 100 / 10) === 1) ? 0 : n % 10
  ];
  const dayWithSuffix = date.getDate() + suffix(date.getDate());

  // Relative wording
  const relative = diffDays === 0
    ? "(Today)"
    : diffDays === 1
    ? "(Tomorrow)"
    : diffDays > 0
    ? `(in ${diffDays} day${diffDays > 1 ? "s" : ""} time)`
    : `(${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago)`;

  return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.toLocaleDateString('en-US', { month: 'long' })} ${dayWithSuffix}, ${date.getFullYear()} ${relative}`;
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

useEffect(() => {
  const appointmentRef = doc(db, "appointments", id);

  const unsubscribe = onSnapshot(appointmentRef, (snapshot) => {
    if (!snapshot.exists()) {
      alert("Appointment not found.");
      return;
    }

    const newData = { id: snapshot.id, ...snapshot.data() };

    setAppointment((prev) => {
      if (prev && JSON.stringify(prev) !== JSON.stringify(newData)) {
        notifyUpdate("Appointment details updated", "info");
      }
      return newData;
    });

    const fetchRelatedData = async () => {
      const appointmentData = snapshot.data();

      // Prepare promises
      const promises = [];

      // User
      if (appointmentData.firebaseUid) {
        const userRef = doc(db, "users", appointmentData.firebaseUid);
        promises.push(getDoc(userRef).then((userSnap) => {
          if (userSnap.exists()) {
            setUser({ id: userSnap.id, ...userSnap.data() });
          }
        }));
      }

      // HMO
      if (appointmentData.hmofirebaseUid) {
        const hmoRef = doc(db, "hmos", appointmentData.hmofirebaseUid);
        promises.push(getDoc(hmoRef).then((hmoSnap) => {
          if (hmoSnap.exists()) {
            setHmo({ id: hmoSnap.id, ...hmoSnap.data() });
          }
        }));
      }

      // HP
      if (appointmentData.hpfirebaseUid) {
        const hpRef = doc(db, "hps", appointmentData.hpfirebaseUid);
        promises.push(getDoc(hpRef).then((hpSnap) => {
          if (hpSnap.exists()) {
            setHp({ id: hpSnap.id, ...hpSnap.data() });
          }
        }));
      }

      // Run all in parallel
      await Promise.all(promises);
    };

    fetchRelatedData();
  });

  return () => unsubscribe();
}, [id]);

const handleApprove = async () => {
  if (!appointment) return;
   setLoading({ id, action: "approve" });

  try {
    const appointmentRef = doc(db, "appointments", appointment.id);

    // Update Firestore first
    await updateDoc(appointmentRef, {
      hmo_approved: "Approved",
      hmoApprovalDate: new Date(),
    });

    // Prepare tasks
    const tasks = [];

    if (user) {
      tasks.push(
        createNotification({
          userId: user.id,
          title: "Appointment Approved",
          message: `Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by your HMO.`,
          type: "success",
          link: "/appointments",
        })
      );
    }

    if (hp) {
      tasks.push(
        createNotification({
          userId: hp.id,
          title: "Appointment Approved",
          message: `The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HMO.`,
          type: "success",
          link: "/hp/appointments",
        })
      );
    }

    if (user?.email) {
      tasks.push(
        sendEmail(
          user.email,
          appointment.name,
          "Your Appointment Has Been Approved",
          `Hello ${appointment.name},<br/>Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HMO.<br /><br />Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        )
      );
    }

    if (hp?.email) {
      tasks.push(
        sendEmail(
          hp.email,
          appointment.hpName,
          "Appointment Approved",
          `Hello ${appointment.hpName}, <br /><br /> The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HMO. <br /><br />Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        )
      );
    }

    // Run notifications + emails in parallel
    await Promise.all(tasks);

    notifyUpdate("Appointment approved", "success");
  } catch (error) {
    console.error("Error approving appointment:", error);
    notifyUpdate("Failed to approve appointment.", "error");
  } finally {
    setLoading({ id: null, action: null });
  }
};

const handleReject = async () => {
  if (!appointment) return;
   setLoading({ id, action: "reject" });

  try {
    const appointmentRef = doc(db, "appointments", appointment.id);

    // Update Firestore first
    await updateDoc(appointmentRef, {
      hmo_approved: "Rejected",
      hmoRejectionDate: new Date(),
    });

    // Prepare tasks
    const tasks = [];

    if (user) {
      tasks.push(
        createNotification({
          userId: user.id,
          title: "Appointment Rejected",
          message: `Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by your HMO.`,
          type: "error",
          link: "/appointments",
        })
      );
    }

    if (hp) {
      tasks.push(
        createNotification({
          userId: hp.id,
          title: "Appointment Rejected",
          message: `The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HMO.`,
          type: "warning",
          link: "/hp/appointments",
        })
      );
    }

    if (user?.email) {
      tasks.push(
        sendEmail(
          user.email,
          appointment.name,
          "Your Appointment Has Been Rejected",
          `Hello ${appointment.name},<br/>We regret to inform you that your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been <b>rejected</b> by the HMO.<br /><br />Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        )
      );
    }

    if (hp?.email) {
      tasks.push(
        sendEmail(
          hp.email,
          appointment.hpName,
          "Appointment Rejected",
          `Hello ${appointment.hpName}, <br /><br /> The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been <b>rejected</b> by the HMO. <br /><br />Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        )
      );
    }

    // Run notifications + emails in parallel
    await Promise.all(tasks);

    notifyUpdate("Appointment rejected", "success");
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    notifyUpdate("Failed to reject appointment.", "error");
  } finally {
    setLoading({ id: null, action: null });
  }
};
  
if (!appointment) return <p>Loading appointment...</p>;
if (!user) return <p>Loading user info...</p>;
if (!hmo) return <p>Loading hmo info...</p>;
if (!hp) return <p>Loading hp info...</p>;


  
  
  return (
    <div className="container db-content-wrapper">
      <HmoHeader page_title={`${appointment.name} | Appointment Details`} />
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

           
        </div>
    </div>

    <div className="col-xxl-12 col-xl-12">
         
        <div className="db-content-box bg-white round-10 mb-25">
        <h4 className="fs-17 fw-extrabold text-title mb-15">HMO Details</h4>
        <b>HMO:</b> {hmo.name}<br />
        <b>Status:</b>{" "}
            <span style={{
            color:
                appointment.hmo_approved === "Approved"
                ? "green"
                : appointment.hmo_approved === "Rejected"
                ? "red"
                : "orange"
            }}>
            {appointment.hmo_approved}
            </span><br />

                       
        {appointment.hp_approved === "Approved" && appointment.hmo_approved !== "Approved" && (
        <button
            onClick={() => handleApprove(appointment.id)}
            className="btn btn-xs btn-success"
            disabled={loading === appointment.id}
        >
            {loading === appointment.id ? "Approving..." : "Approve"}
        </button>
        )}


        {appointment.hp_approved == "Approved" && appointment.hmo_approved == "Approved" && (
        <button
            onClick={() => handleReject(appointment.id)}
            className="btn btn-xs btn-danger"
            disabled={loading === appointment.id}
        >
            {loading === appointment.id ? "Rejecting..." : "Reject"}
        </button>
        )}



        </div>
    </div>

     <div className="col-xxl-12 col-xl-12">
         
        <div className="db-content-box bg-white round-10 mb-25">
        <h4 className="fs-17 fw-extrabold text-title mb-15">HP Details</h4>
        <b>HP:</b> {hp.name}<br />
        <b>Status:</b> <span style={{
            color:
                appointment.hp_approved === "Approved"
                ? "green"
                : appointment.hp_approved === "Rejected"
                ? "red"
                : "orange"
            }}>
            {appointment.hp_approved}
            </span><br />

        </div>
    </div>

    <div className="col-xxl-12 col-xl-12">   
        <div className="db-content-box bg-white round-10 mb-25">
            <h4 className="fs-17 fw-extrabold text-title mb-15">Treatment Sheet</h4>
            {appointment.treatment_sheet}
        </div>
    </div>
   
</div>

       </div>

  )
}

export default HmoAppointmentDetails