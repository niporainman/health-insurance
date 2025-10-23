import { useEffect, useState } from "react";
import { collection, query, where, doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import HmoHeader from "./HmoHeader";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { createNotification, sendEmail } from "../../services/notifications";


function HmoNewClaims() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentHmoUid, setCurrentHmoUid] = useState("");

//grab user id
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setCurrentHmoUid(user.uid);
      
    } else {
      alert("Please login to view your claims.");
    }
  });

  return () => unsubscribe();
}, []);

  // real-time fetch appointments
  useEffect(() => {
    if (!currentHmoUid) return;

    const baseQuery = query(
      collection(db, "appointments"),
      where("hmofirebaseUid", "==", currentHmoUid),
      where("claim", "==", true) // only claimed
    );

    const unsubscribe = onSnapshot(baseQuery, (snapshot) => {
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      data = data.filter((appt) => {
        const claimDate = appt.claimDate?.toDate?.();
        if (!claimDate) return false;

        return (
          (!appt.paid || appt.paid === false) &&
          claimDate >= thirtyDaysAgo &&
          claimDate <= now
        );
      });

      if (searchTerm.trim()) {
        data = data.filter((appt) =>
          appt.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      data.sort(
        (a, b) =>
          new Date(b.appointment_date) - new Date(a.appointment_date)
      );

      setAppointments(data);
    });

    return () => unsubscribe();
  }, [currentHmoUid, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  }) + " " + date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

  // Helper to get user/HP details
  async function getEmail(collectionName, id) {
    if (!id) throw new Error("No ID provided");
    const ref = doc(db, collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists())
      throw new Error(`Document not found in ${collectionName}: ${id}`);
    return snap.data();
  }

const markAsPaid = async (appt) => {
  const result = await Swal.fire({
    title: "Mark as Paid?",
    text: "This action will mark the claim as paid and cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, mark paid",
  });

  if (!result.isConfirmed) return;

  try {
    // update claim
    await updateDoc(doc(db, "appointments", appt.id), {
      paid: true,
      paid_at: new Date(),
    });

    // Notify HP
    if (appt.hpfirebaseUid) {
      await createNotification({
        userId: appt.hpfirebaseUid,
        title: "Claim Paid",
        message: `The claim for patient ${appt.name || "a patient"} (₦${
          appt.amount
        }) has been paid by the HMO.`,
        type: "success",
        link: "/hp/claims",
      });

      // Fetch HP details and email
      try {
        const hp = await getEmail("hps", appt.hpfirebaseUid);
        if (hp?.email) {
          await sendEmail(
            hp.email,
            hp.name || "Health Provider",
            "Claim Paid",
            `Hello ${hp.name || "Health Provider"},<br/>
            The claim for ${appt.Id}, with the patient <b>${appt.name || ""}</b> amounting to 
            <b>₦${parseFloat(appt.amount).toLocaleString()}</b> has been paid by the HMO.<br /><br />
            Regards,<br/>${import.meta.env.VITE_COMPANY_NAME}`
          );
        }
      } catch (err) {
        console.error("Could not fetch HP email:", err);
      }
    }

    Swal.fire({
      title: "Success!",
      text: "The claim has been marked as paid.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("Error updating paid status:", err);
    Swal.fire("Error", "Could not update claim. Try again.", "error");
  }
};

  return (
    <div className="db-content-box bg-white round-10 mb-25">
      <HmoHeader page_title={"New Claims"} />
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

      </div>
    </div>

      <div className="db-table table-responsive">
        <table className="text-nowrap align-middle mb-30">
          <thead>
            <tr>
              <th className="text-title bg-ash fw-semibold fs-13">#</th>
              <th className="text-title bg-ash fw-bold fs-13">Patient Name</th>
              <th className="text-title bg-ash fw-bold fs-13">Enrolle ID</th>
              <th className="text-title fw-bold fs-13">HP</th>
              <th className="text-title fw-bold fs-13">Amount</th>
              <th className="text-title fw-bold fs-13">Claim Date</th>
              <th className="text-title fw-bold fs-13">View</th>
              <th className="text-title fw-bold fs-13">Mark as Paid</th>
             
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-4 fs-14 text-muted">
                  No claims found.
                </td>
              </tr>
            )}
            {appointments.map((appt, index) => (
              <tr key={appt.id}>
                <td className="fs-13 text-para">{index + 1}</td>
                <td className="fs-13 text-para">{appt.name}</td>
                <td className="fs-13 text-para">{appt.enrolleId}</td>
                <td className="fs-13 text-para">{appt.hpName}</td>
                <td className="fs-13 text-para">{appt.amount ? `₦${parseFloat(appt.amount).toLocaleString()}` : '—'}</td>
                <td className="fs-13 text-para">{formatDate(appt.claimDate)}</td>
                <td className="fs-13 text-para">
                  <Link to={`/hmo/hmo_appointment_details/${appt.id}`} className="btn btn-xs btn-primary">
                    View
                  </Link>
                </td>
                 <td className="fs-13 text-para">
                  {!appt.paid ? (
                    <button
                      onClick={() => markAsPaid(appt)}
                      className="btn btn-xs btn-success"
                    >
                      Mark as Paid
                    </button>
                  ) : (
                    <span className="badge bg-success">Paid</span>
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

export default HmoNewClaims;
