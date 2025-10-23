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
import HpHeader from "./HpHeader";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { createNotification, sendEmail } from "../../services/notifications";

function HpAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentHpUid, setCurrentHpUid] = useState("");
  const [loading, setLoading] = useState({ id: null, action: null });
  const [statusFilter, setStatusFilter] = useState("");
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentHpUid(user.uid);
      } else {
        alert("Please login to view your appointments.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to appointments in real-time
  useEffect(() => {
    if (!currentHpUid) return;

    const baseQuery = collection(db, "appointments");
    const filters = [where("hpfirebaseUid", "==", currentHpUid)];

    if (statusFilter === "Pending") {
      filters.push(where("hp_approved", "in", ["", null, "Pending"]));
    } else if (statusFilter === "Approved" || statusFilter === "Rejected") {
      filters.push(where("hp_approved", "==", statusFilter));
    }

    let q;
    if (searchTerm.trim()) {
      filters.push(
        orderBy("hpfirebaseUid"),
        orderBy("name_lower"),
        where("name_lower", ">=", searchTerm.toLowerCase()),
        where("name_lower", "<=", searchTerm.toLowerCase() + "\uf8ff")
      );
      q = query(baseQuery, ...filters);
    } else {
      q = query(baseQuery, ...filters, orderBy("appointment_date", "desc"));
    }

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
      (err) => console.error("Error fetching appointments:", err)
    );

    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe();
  }, [currentHpUid, statusFilter, searchTerm]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  // Helper to fetch doc from a collection
  async function getDocData(collectionName, id) {
    if (!id) return null;
    const ref = doc(db, collectionName, id);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  const handleApprove = async (id) => {
    setLoading({ id, action: "approve" });
    try {
      const appointmentRef = doc(db, "appointments", id);
      const snapshot = await getDoc(appointmentRef);
      if (!snapshot.exists()) throw new Error("Appointment not found");

      const appointment = snapshot.data();
      const user = await getDocData("users", appointment.firebaseUid);
      const hmo = await getDocData("hmos", appointment.hmofirebaseUid);

      await updateDoc(appointmentRef, { hp_approved: "Approved" });

      // Notify User
      if (user) {
        await createNotification({
          userId: appointment.firebaseUid,
          title: "Appointment Approved",
          message: `Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HP.`,
          type: "success",
          link: "/appointments",
        });
      }

      // Notify HMO
      if (hmo) {
        await createNotification({
          userId: appointment.hmofirebaseUid,
          title: "Appointment Approved by HP",
          message: `The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HP.`,
          type: "success",
          link: "/hmo/appointments",
        });
      }

      // Send Emails
      if (user?.email) {
        await sendEmail(
          user.email,
          appointment.name,
          "Your Appointment Has Been Approved",
          `Hello ${appointment.name},<br/>Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HP.<br/><br/>Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        );
      }

      if (hmo?.email) {
        await sendEmail(
          hmo.email,
          appointment.hmoName,
          "Appointment Approved by HP",
          `Hello ${appointment.hmoName},<br/><br/>The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been approved by the HP.<br/><br/>Regards, ${
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

      // Prevent rejection if HMO already approved
      if (appointment.hmo_approved === "Approved") {
        alert("This appointment has already been approved by the HMO and cannot be rejected.");
        return;
      }

      const user = await getDocData("users", appointment.firebaseUid);
      const hmo = await getDocData("hmos", appointment.hmofirebaseUid);

      await updateDoc(appointmentRef, { hp_approved: "Rejected" });

      if (user) {
        await createNotification({
          userId: appointment.firebaseUid,
          title: "Appointment Rejected",
          message: `Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HP.`,
          type: "error",
          link: "/appointments",
        });
      }

      if (hmo) {
        await createNotification({
          userId: appointment.hmofirebaseUid,
          title: "Appointment Rejected by HP",
          message: `The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HP.`,
          type: "error",
          link: "/hmo/appointments",
        });
      }

      if (user?.email) {
        await sendEmail(
          user.email,
          appointment.name,
          "Your Appointment Has Been Rejected",
          `Hello ${appointment.name},<br/>Your appointment with ${
            appointment.hpName || "your health provider"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HP.<br/><br/>Regards, ${
            import.meta.env.VITE_COMPANY_NAME
          }`
        );
      }

      if (hmo?.email) {
        await sendEmail(
          hmo.email,
          appointment.hmoName,
          "Appointment Rejected by HP",
          `Hello ${appointment.hmoName},<br/><br/>The appointment with ${
            appointment.name || "the user"
          } on ${appointment.appointment_date} ${
            appointment.appointment_time
          } has been rejected by the HP.<br/><br/>Regards, ${
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
      <HpHeader page_title={"Your Appointments"} />
      {/* Search & Filter */}
      <div className="form-wrapper style-two mb-20">
        <div className="row mb-20">
          <div className="col-xxl-4 col-xl-4 col-md-4">
            <div className="form-group mb-15">
              <label className="fs-13 d-block fw-medium text-title mb-8">Search</label>
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
                placeholder="Patient name..."
                style={{ border: "1px solid grey" }}
              />
            </div>
          </div>
          <div className="col-xxl-4 col-xl-4 col-md-4">
            <div className="form-group mb-15">
              <label className="fs-13 d-block fw-medium text-title mb-8">Filter</label>
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

      {/* Table */}
      <div className="db-table table-responsive">
        <table className="text-nowrap align-middle mb-30">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Complaint</th>
              <th>HP Status</th>
              <th>HMO Status</th>
              <th>View</th>
              <th>Action</th>
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
                <td>{index + 1}</td>
                <td>{appt.name}</td>
                <td>{appt.appointment_date}</td>
                <td>{appt.appointment_time || "—"}</td>
                <td>{appt.patient_complaint?.substring(0, 20)}...</td>
                <td>
                  <span className={`badge ${
                    appt.hp_approved === "Approved" ? "bg-success" :
                    appt.hp_approved === "Rejected" ? "bg-danger" :
                    appt.hp_approved === "Pending" ? "bg-warning" :
                    "bg-secondary"
                  }`}>
                    {appt.hp_approved || "Pending"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    appt.hmo_approved === "Approved" ? "bg-success" :
                    appt.hmo_approved === "Rejected" ? "bg-danger" :
                    appt.hmo_approved === "Pending" ? "bg-warning" :
                    "bg-secondary"
                  }`}>
                    {appt.hmo_approved || "Pending"}
                  </span>
                </td>
                <td>
                  <Link to={`/hp/hp_appointment_details/${appt.id}`} className="btn btn-xs btn-primary">
                    View
                  </Link>
                </td>
                <td>
                  {loading.id === appt.id ? (
                    <button className={`btn btn-xs ${loading.action === "approve" ? "btn-success" : "btn-danger"}`} disabled>
                      {loading.action === "approve" ? "Approving..." : "Rejecting..."}
                    </button>
                  ) : (
                    <>
                      {appt.hp_approved !== "Approved" && (
                        <button
                          onClick={() => handleApprove(appt.id)}
                          className="btn btn-xs btn-success"
                        >
                          Approve
                        </button>
                      )}
                      {appt.hp_approved === "Approved" && appt.hmo_approved !== "Approved" && (
                        <button
                          onClick={() => handleReject(appt.id)}
                          className="btn btn-xs btn-danger"
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HpAppointments;