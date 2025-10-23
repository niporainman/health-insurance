import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import UserHeader from "./UserHeader";
import { Link } from "react-router-dom";

function UserAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAuth;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "appointments"),
          where("firebaseUid", "==", user.uid)
        );

        // Real-time listener
        const unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Sort by datetime
            data.sort((a, b) => {
              const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
              const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
              return dateA - dateB;
            });

            setAppointments(data);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching appointments:", error);
            setLoading(false);
          }
        );

        // cleanup Firestore listener when user logs out or component unmounts
        return () => unsubscribeSnapshot();
      } else {
        setAppointments([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  if (loading) {
    return (
      <>
        <UserHeader page_title={"Your Appointments"} />
        <div className="db-content-wrapper">
          <p>Loading your appointments...</p>
        </div>
      </>
    );
  }

  function formatAppointment(dateString, timeString) {
    if (!dateString || !timeString) return "";

    const combined = `${dateString}T${timeString}`;
    const date = new Date(combined);

    return date.toLocaleString("en-US", {
      weekday: "short", // Mon, Tue...
      year: "numeric",
      month: "long", // January, February...
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <UserHeader page_title={"Your Appointments"} />
      <div className="db-content-wrapper">
        <div className="row">
          <div className="col-12">
            <div className="db-content-box bg-ash round-10 mb-25">
              <div className="db-table style-two table-responsive">
                <table className="table text-nowrap align-middle mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Patient Name</th>
                      <th>Complaint</th>
                      <th>Date</th>
                      <th>HMO Status</th>
                      <th>HP Status</th>
                      <th>View Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-3">
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      appointments.map((appointment, index) => (
                        <tr key={appointment.id}>
                          <td>
                            <span className="fs-13 lh-1 text-para">
                              {index + 1}
                            </span>
                          </td>
                          <td>
                            <span className="fs-13">{appointment.name}</span>
                          </td>
                          <td className="truncate_text">
                            <span
                              title={appointment.patient_complaint}
                              className="fs-13 text_primary"
                            >
                              {appointment.patient_complaint}
                            </span>
                          </td>
                          <td>
                            <span className="fs-13 lh-1 text-para">
                              {formatAppointment(
                                appointment.appointment_date,
                                appointment.appointment_time
                              )}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`fs-13 lh-1 px-2 py-1 rounded-2 fw-semibold ${
                                appointment.hmo_approved === "Approved"
                                  ? "bg-success text-white"
                                  : appointment.hmo_approved === "Pending"
                                  ? "bg-warning text-dark"
                                  : appointment.hmo_approved === "Rejected"
                                  ? "bg-danger text-white"
                                  : "bg-secondary text-white"
                              }`}
                            >
                              {appointment.hmo_approved}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`fs-13 lh-1 px-2 py-1 rounded-2 fw-semibold ${
                                appointment.hp_approved === "Approved"
                                  ? "bg-success text-white"
                                  : appointment.hp_approved === "Pending"
                                  ? "bg-warning text-dark"
                                  : appointment.hp_approved === "Rejected"
                                  ? "bg-danger text-white"
                                  : "bg-secondary text-white"
                              }`}
                            >
                              {appointment.hp_approved}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/user/user_appointment_details/${appointment.id}`}
                            >
                              <button className="tb-btn style-three border-0 round-5 transition">
                                <img
                                  src="/assets/images/briefcase-blue.svg"
                                  alt="Icon"
                                />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserAppointments;