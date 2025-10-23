import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";
import UserHeader from "./UserHeader";
import Swal from "sweetalert2";
import { createNotification, sendEmail } from "../../services/notifications";

function UserAppointmentDetails() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [user, setUser] = useState(null);
  const [hmo, setHmo] = useState(null);
  const [hp, setHp] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const notifyUpdate = (msg, icon = "info") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title: msg,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

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

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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

  // Live subscribe to appointment and load related docs in parallel
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

      // Fetch related docs in parallel (use state setters inside)
      (async () => {
        try {
          const appt = snapshot.data();

          const promises = [];
          if (appt.firebaseUid) {
            promises.push(getDoc(doc(db, "users", appt.firebaseUid)));
          } else promises.push(null);

          if (appt.hmofirebaseUid) {
            promises.push(getDoc(doc(db, "hmos", appt.hmofirebaseUid)));
          } else promises.push(null);

          if (appt.hpfirebaseUid) {
            promises.push(getDoc(doc(db, "hps", appt.hpfirebaseUid)));
          } else promises.push(null);

          const [userSnap, hmoSnap, hpSnap] = await Promise.all(promises);

          if (userSnap?.exists()) setUser({ id: userSnap.id, ...userSnap.data() });
          if (hmoSnap?.exists()) setHmo({ id: hmoSnap.id, ...hmoSnap.data() });
          if (hpSnap?.exists()) setHp({ id: hpSnap.id, ...hpSnap.data() });
        } catch (err) {
          console.error("Error fetching related docs:", err);
        }
      })();
    });

    return () => unsubscribe();
  }, [id]);

  // Derived date/time helpers
  const getAppointmentDateTime = (date, time) => {
    try {
      return new Date(`${date}T${time}`);
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const now = new Date();
  const appointmentDateTime = appointment
    ? getAppointmentDateTime(appointment.appointment_date, appointment.appointment_time)
    : null;

  // ---- Cancel handler (user cancels) ----
  const handleCancel = async () => {
    if (!appointment) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No, keep it",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const appointmentRef = doc(db, "appointments", appointment.id);
      const nowISO = new Date().toISOString();
      await updateDoc(appointmentRef, { cancelled_at: nowISO, status: "Cancelled" });

      // Prepare notifications + emails for HMO and HP and a confirmation for user
      const tasks = [];

      // notify user (in-app)
      if (user) {
        tasks.push(
          createNotification({
            userId: user.id,
            title: "Appointment Cancelled",
            message: `Your appointment (ID: ${appointment.appointmentId}) scheduled on ${appointment.appointment_date} ${appointment.appointment_time} has been cancelled.`,
            type: "info",
            link: "/appointments",
          })
        );
      }

      // notify HMO (in-app)
      if (hmo) {
        tasks.push(
          createNotification({
            userId: hmo.id,
            title: `Appointment Cancelled for ${appointment.name}`,
            message: `Appointment (ID: ${appointment.appointmentId}) scheduled on ${appointment.appointment_date} ${appointment.appointment_time} has been cancelled by the user.`,
            type: "warning",
            link: `/hmo/appointments/${appointment.id}`,
          })
        );
      }

      // notify HP (in-app)
      if (hp) {
        tasks.push(
          createNotification({
            userId: hp.id,
            title: `Appointment Cancelled for ${appointment.name}`,
            message: `Appointment (ID: ${appointment.appointmentId}) scheduled on ${appointment.appointment_date} ${appointment.appointment_time} has been cancelled by the user.`,
            type: "warning",
            link: `/hp/appointments/${appointment.id}`,
          })
        );
      }

      // Emails (batched). user gets empathetic confirmation, others robotic
      if (user?.email) {
        tasks.push(
          sendEmail(
            user.email,
            appointment.name,
            "Appointment Cancelled",
            `Hello ${appointment.name},<br/><br/>Your appointment (ID: ${appointment.appointmentId}) scheduled for ${appointment.appointment_date} ${appointment.appointment_time} has been successfully cancelled.<br /><br />Regards,<br />${import.meta.env.VITE_COMPANY_NAME}`
          )
        );
      }

      if (hmo?.email) {
        tasks.push(
          sendEmail(
            hmo.email,
            hmo.name || hmo.hmoName || "HMO",
            "Appointment Cancelled",
            `Hello ${hmo.name || hmo.hmoName || "HMO"},<br/><br/>Appointment (ID: ${appointment.appointmentId}) scheduled for ${appointment.appointment_date} ${appointment.appointment_time} has been cancelled by the user.<br /><br />Regards,<br />${import.meta.env.VITE_COMPANY_NAME}`
          )
        );
      }

      if (hp?.email) {
        tasks.push(
          sendEmail(
            hp.email,
            hp.name || `${hp.first_name || ""} ${hp.last_name || ""}`.trim() || "Health Provider",
            "Appointment Cancelled",
            `Hello ${hp.name || hp.hpName || "Health Provider"},<br/><br/>Appointment (ID: ${appointment.appointmentId}) scheduled for ${appointment.appointment_date} ${appointment.appointment_time} has been cancelled by the user.<br /><br />Regards,<br />${import.meta.env.VITE_COMPANY_NAME}`
          )
        );
      }

      await Promise.all(tasks);

      notifyUpdate("Appointment cancelled", "success");
      Swal.fire({
        title: "Cancelled!",
        text: "Your appointment has been cancelled.",
        icon: "success",
        confirmButtonColor: "#0d6efd",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      notifyUpdate("Failed to cancel appointment.", "error");
      Swal.fire({
        title: "Error",
        text: "Failed to cancel appointment. Please try again.",
        icon: "error",
        confirmButtonColor: "#0d6efd",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Reschedule handler (user reschedules) ----
  const handleReschedule = async () => {
    if (!appointment) return;

    // prerequisites
    if (appointment.hmo_approved !== "Pending" || appointment.hp_approved !== "Pending") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Reschedule",
        text: "You can only reschedule while both HMO and HP approvals are still pending.",
      });
      return;
    }

    if (!newDate || !newTime) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select both a date and a time for the new appointment.",
      });
      return;
    }

    const newDateTime = getAppointmentDateTime(newDate, newTime);
    if (!newDateTime || newDateTime <= new Date()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Date/Time",
        text: "Please choose a future date and time.",
      });
      return;
    }

    setActionLoading(true);
    try {
      const appointmentRef = doc(db, "appointments", appointment.id);

      await updateDoc(appointmentRef, {
        appointment_date: newDate,
        appointment_time: newTime,
        // optionally track reschedule metadata:
        last_rescheduled_at: serverTimestamp(),
      });

      // Notify + email HMO and HP and also notify user (confirmation)
      const tasks = [];

      if (user) {
        tasks.push(
          createNotification({
            userId: user.id,
            title: "Appointment Rescheduled",
            message: `Your appointment (ID: ${appointment.appointmentId}) has been rescheduled to ${newDate} ${newTime}.`,
            type: "success",
            link: "/appointments",
          })
        );
      }

      if (hmo) {
        tasks.push(
          createNotification({
            userId: hmo.id,
            title: `Appointment Rescheduled for ${appointment.name}`,
            message: `Appointment (ID: ${appointment.appointmentId}) has been rescheduled by the user to ${newDate} ${newTime}.`,
            type: "info",
            link: `/hmo/appointments/${appointment.id}`,
          })
        );
      }

      if (hp) {
        tasks.push(
          createNotification({
            userId: hp.id,
            title: `Appointment Rescheduled for ${appointment.name}`,
            message: `Appointment (ID: ${appointment.appointmentId}) has been rescheduled by the user to ${newDate} ${newTime}.`,
            type: "info",
            link: `/hp/appointments/${appointment.id}`,
          })
        );
      }

      // Emails
      if (user?.email) {
        tasks.push(
          sendEmail(
            user.email,
            appointment.name,
            "Appointment Rescheduled",
            `Hello ${appointment.name},<br/><br/>Your appointment (ID: ${appointment.appointmentId}) has been rescheduled to ${newDate} ${newTime}.<br /><br />Regards,<br />${import.meta.env.VITE_COMPANY_NAME}`
          )
        );
      }

      if (hmo?.email) {
        tasks.push(
          sendEmail(
            hmo.email,
            hmo.name || hmo.hmoName || "HMO",
            "Appointment Rescheduled",
            `Hello ${hmo.name || hmo.hmoName || "HMO"},<br/><br/>Appointment (ID: ${appointment.appointmentId}) has been rescheduled by the user to ${newDate} ${newTime}.<br /><br />Regards,<br />${import.meta.env.VITE_COMPANY_NAME}`
          )
        );
      }

      if (hp?.email) {
        tasks.push(
          sendEmail(
            hp.email,
            hp.name || `${hp.first_name || ""} ${hp.last_name || ""}`.trim() || "Health Provider",
            "Appointment Rescheduled",
            `Hello ${hp.name || hp.hpName || "Health Provider"},<br/><br/>Appointment (ID: ${appointment.appointmentId}) has been rescheduled by the user to ${newDate} ${newTime}.<br /><br />Regards,<br />${import.meta.env.VITE_COMPANY_NAME}`
          )
        );
      }

      await Promise.all(tasks);

      // Clear inputs; onSnapshot will update `appointment` anyway
      setNewDate("");
      setNewTime("");

      notifyUpdate("Appointment rescheduled", "success");
      Swal.fire({
        icon: "success",
        title: "Rescheduled!",
        text: "Appointment rescheduled successfully.",
      });
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      notifyUpdate("Failed to reschedule appointment.", "error");
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to reschedule appointment.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!appointment) return <p>Loading appointment...</p>;
  if (!user) return <p>Loading user info...</p>;
  if (appointment.hmofirebaseUid && !hmo) return <p>Loading hmo info...</p>;
  if (!hp) return <p>Loading hp info...</p>;



  return (
    <div className="container db-content-wrapper">
      <UserHeader page_title={`${appointment.name} | Appointment Details`} />
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
        {/* left & right columns, details etc. (unchanged UI) */}
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
            <span style={{ color: appointment.query ? "red" : "green", fontWeight: appointment.query ? "bold" : "normal" }}>
              {appointment.query ? "Yes" : "No"}
            </span>
            <br />

            {appointment.outOfPocket !== "Yes" && hmo && (
              <>
                <b>Claim Date:</b>{" "}
                {appointment.claimDate ? formatFirestoreTimestamp(appointment.claimDate) : "N/A"}
                <br />
                <b>HMO Paid:</b>{" "}
                <span style={{ color: appointment.paid ? "green" : "red", fontWeight: "normal" }}>
                  {appointment.paid ? "Yes" : "No"}
                </span>
                <br />
              </>
            )}

            {!appointment.cancelled_at && appointmentDateTime > now && (
              <>
                <br />
                <button onClick={handleCancel} disabled={actionLoading} className="tb-btn style-five font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition py-2">
                  {actionLoading ? "Processing..." : "Cancel Appointment"}
                </button>
              </>
            )}

            {appointment.cancelled_at && (
              <p className="text-danger fw-bold">
                Cancelled by User on{" "}
                {new Date(
                  appointment.cancelled_at.seconds
                    ? appointment.cancelled_at.seconds * 1000
                    : appointment.cancelled_at
                ).toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            )}

            {appointment.hmo_approved === "Pending" && appointment.hp_approved === "Pending" && !appointment.cancelled_at && appointmentDateTime > now && (
              <div className="mt-3">
                <h4 className="fs-17 fw-extrabold text-title mb-15">Reschedule Appointment</h4>

                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="form-control mb-2" />
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="form-control mb-2" />

                <button onClick={handleReschedule} disabled={actionLoading} className="tb-btn style-one font-secondary fs-14 fw-semibold d-inline-block border-0 text-white round-5 transition">
                  {actionLoading ? "Processing..." : "Reschedule"}
                </button>
              </div>
            )}
          </div>
        </div>

        {appointment.outOfPocket !== "Yes" && hmo && (
          <div className="col-xxl-12 col-xl-12">
            <div className="db-content-box bg-white round-10 mb-25">
              <h4 className="fs-17 fw-extrabold text-title mb-15">HMO Details</h4>
              <b>HMO:</b> {hmo.name}<br />
              <b>Status:</b>{" "}
              <span style={{ color: appointment.hmo_approved === "Approved" ? "green" : appointment.hmo_approved === "Rejected" ? "red" : "orange" }}>
                {appointment.hmo_approved}
              </span><br />
            </div>
          </div>
        )}

        <div className="col-xxl-12 col-xl-12">
          <div className="db-content-box bg-white round-10 mb-25">
            <h4 className="fs-17 fw-extrabold text-title mb-15">HP Details</h4>
            <b>HP:</b> {hp.name}<br />
            <b>Status:</b>{" "}
            <span style={{ color: appointment.hp_approved === "Approved" ? "green" : appointment.hp_approved === "Rejected" ? "red" : "orange" }}>
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
  );
}

export default UserAppointmentDetails;