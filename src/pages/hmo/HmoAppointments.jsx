import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import HmoHeader from "./HmoHeader";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { createNotification, sendEmail } from "../../services/notifications";

function HmoAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentHmoUid, setCurrentHmoUid] = useState("");
  const [loading, setLoading] = useState({ id: null, action: null });
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentHmoUid(user.uid);
      } else {
        alert("Please login to view your appointments.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to appointments in real-time
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!currentHmoUid) return;

    const baseQuery = collection(db, "appointments");
    const filters = [where("hmofirebaseUid", "==", currentHmoUid)];

    if (statusFilter === "Pending") {
      filters.push(where("hmo_approved", "in", ["", null, "Pending"]));
    } else if (statusFilter === "Approved" || statusFilter === "Rejected") {
      filters.push(where("hmo_approved", "==", statusFilter));
    }

    let q;
    if (searchTerm.trim()) {
      filters.push(
        orderBy("hmofirebaseUid"),
        orderBy("name_lower"),
        where("name_lower", ">=", searchTerm.toLowerCase()),
        where("name_lower", "<=", searchTerm.toLowerCase() + "\uf8ff")
      );
      q = query(baseQuery, ...filters);
    } else {
      q = query(baseQuery, ...filters, orderBy("appointment_date", "desc"));
    }

    // Cleanup previous subscription if exists
    if (unsubscribeRef.current) unsubscribeRef.current();

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(data);
      },
      (err) => {
        console.error("Error fetching appointments:", err);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => unsubscribe();
  }, [currentHmoUid, statusFilter, searchTerm]);


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Helper to get user/HP details
  async function getEmail(collectionName, id) {
    if (!id) throw new Error("No ID provided");
    const ref = doc(db, collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists())
      throw new Error(`Document not found in ${collectionName}: ${id}`);
    return snap.data();
  }

  const handleApprove = async (id) => {
     setLoading({ id, action: "approve" });
    try {
      const appointmentRef = doc(db, "appointments", id);
      const snapshot = await getDoc(appointmentRef);

      if (!snapshot.exists()) throw new Error("Appointment not found");

      const appointment = snapshot.data();

      const user = await getEmail("users", appointment.firebaseUid);
      const hp = await getEmail("hps", appointment.hpfirebaseUid);

      await updateDoc(appointmentRef, { hmo_approved: "Approved" });

      if (user) {
        await createNotification({
          userId: appointment.firebaseUid,
          title: "Appointment Approved",
          message: `Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by your HMO.`,
          type: "success",
          link: "/appointments",
        });
      }

      if (hp) {
        await createNotification({
          userId: appointment.hpfirebaseUid,
          title: "Appointment Approved",
          message: `The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HMO.`,
          type: "success",
          link: "/hp/appointments",
        });
      }

      if (user?.email) {
        await sendEmail(
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
        );
      }

      if (hp?.email) {
        await sendEmail(
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
        );
      }
    } catch (error) {
      console.error("Error approving appointment:", error);
      alert("Failed to approve appointment.");
    } finally {
     setLoading({ id: null, action: null });
    }
  };

  const handleReject = async (id) => {
    setLoading({ id, action: "reject" });
    try {
      const appointmentRef = doc(db, "appointments", id);
      const snapshot = await getDoc(appointmentRef);

      if (!snapshot.exists()) throw new Error("Appointment not found");

      const appointment = snapshot.data();

      const user = await getEmail("users", appointment.firebaseUid);
      const hp = await getEmail("hps", appointment.hpfirebaseUid);

      await updateDoc(appointmentRef, { hmo_approved: "Rejected" });

      if (user) {
        await createNotification({
          userId: appointment.firebaseUid,
          title: "Appointment Rejected",
          message: `Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HMO.`,
          type: "error",
          link: "/appointments",
        });
      }

      if (hp) {
        await createNotification({
          userId: appointment.hpfirebaseUid,
          title: "Appointment Rejected",
          message: `The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HMO.`,
          type: "error",
          link: "/hp/appointments",
        });
      }

      if (user?.email) {
        await sendEmail(
          user.email,
          appointment.name,
          "Your Appointment Has Been Rejected",
          `Hello ${appointment.name}, <br /><br />Unfortunately, your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HMO. <br /><br />Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        );
      }

      if (hp?.email) {
        await sendEmail(
          hp.email,
          appointment.hpName,
          "Appointment Rejected",
          `Hello ${appointment.hpName}, <br /><br />The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HMO. <br /><br />Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        );
      }
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert("Failed to reject appointment.");
    } finally {
      setLoading({ id: null, action: null });
    }
  };

  return (
    <div className="db-content-box bg-white round-10 mb-25">
      <HmoHeader page_title={"Your Appointments"} />
    <div className="form-wrapper style-two mb-20">
      <div className="row mb-20">
        <div className="col-xxl-4 col-xl-4 col-md-4">
          <div className="form-group mb-15">
             <label htmlFor='' className="fs-13 d-block fw-medium text-title mb-8">Search</label>
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              className="fs-13 w-100 ht-40 bg-transparent round-5 text-para="
              placeholder="Patient name..."
              style={{ border: "1px solid grey" }}
            />
          </div>
        </div>

        <div className="col-xxl-4 col-xl-4 col-md-4">
          <div className="form-group mb-15">
            <label htmlFor='' className="fs-13 d-block fw-medium text-title mb-8">Filter</label>
            <select
              className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

      </div>
    </div>

      <div className="db-table table-responsive">
        <table className="text-nowrap align-middle mb-30">
          <thead>
            <tr>
              <th className="text-title bg-ash fw-semibold fs-13">#</th>
              <th className="text-title bg-ash fw-bold fs-13">Patient Name</th>
              <th className="text-title fw-bold fs-13">Date</th>
              <th className="text-title fw-bold fs-13">Time</th>
              <th className="text-title fw-bold fs-13">Complaint</th>
              <th className="text-title fw-bold fs-13">HP Status</th>
              <th className="text-title fw-bold fs-13">HMO Status</th>
              <th className="text-title fw-bold fs-13">View</th>
              <th className="text-title fw-bold fs-13">Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-4 fs-14 text-muted">
                  No appointments found.
                </td>
              </tr>
            )}
            {appointments.map((appt, index) => (
              <tr key={appt.id}>
                <td className="fs-13 text-para">{index + 1}</td>
                <td className="fs-13 text-para">{appt.name}</td>
                <td className="fs-13 text-para">{appt.appointment_date}</td>
                <td className="fs-13 text-para">{appt.appointment_time || "—"}</td>
                <td className="fs-13 text-para">{appt.patient_complaint?.substring(0, 20)}...</td>
                <td>
                <span className={`fs-13 lh-1 px-2 py-1 rounded-2 fw-semibold ${
                  appt.hp_approved === "Approved"
                    ? "bg-success text-white"
                    : appt.hp_approved === "Pending"
                    ? "bg-warning text-dark"
                    : appt.hp_approved === "Rejected"
                    ? "bg-danger text-white"
                    : "bg-secondary text-white"
                }`}>
                  {appt.hp_approved}
                </span>
                </td>
                <td>
                <span className={`fs-13 lh-1 px-2 py-1 rounded-2 fw-semibold ${
                  appt.hmo_approved === "Approved"
                    ? "bg-success text-white"
                    : appt.hmo_approved === "Pending"
                    ? "bg-warning text-dark"
                    : appt.hmo_approved === "Rejected"
                    ? "bg-danger text-white"
                    : "bg-secondary text-white"
                }`}>
                  {appt.hmo_approved}
                </span>
                </td>
                <td className="fs-13 text-para">
                  <Link to={`/hmo/hmo_appointment_details/${appt.id}`} className="btn btn-xs btn-primary">
                    View
                  </Link>
                </td>

                <td className="fs-13 text-para action-cell">
                  {appt.hp_approved === "Approved" && (
                    <>
                      {loading.id === appt.id ? (
                        // Loading state
                        loading.action === "approve" ? (
                          <button
                            className="btn btn-xs btn-success btn-approve"
                            disabled
                          >
                            Approving...
                          </button>
                        ) : (
                          <button
                            className="btn btn-xs btn-danger btn-reject"
                            disabled
                          >
                            Rejecting...
                          </button>
                        )
                      ) : (
                        // Normal state
                        <>
                          {appt.hmo_approved !== "Approved" && (
                            <button
                              onClick={() => handleApprove(appt.id)}
                              className="btn btn-xs btn-success btn-approve"
                            >
                              Approve
                            </button>
                          )}

                          {appt.hmo_approved === "Approved" && (
                            <button
                              onClick={() => handleReject(appt.id)}
                              className="btn btn-xs btn-danger btn-reject"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </td>

               
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination could be added here if needed */}
      </div>
    </div>
  );
}

export default HmoAppointments;
