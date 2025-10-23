import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import HpHeader from "./HpHeader";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";


function HpNewClaims() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentHpUid, setcurrentHpUid] = useState("");

//grab user id
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setcurrentHpUid(user.uid);
      
    } else {
      alert("Please login to view your claims.");
    }
  });

  return () => unsubscribe();
}, []);

  // real-time fetch appointments
  useEffect(() => {
    if (!currentHpUid) return;

    const baseQuery = query(
      collection(db, "appointments"),
      where("hpfirebaseUid", "==", currentHpUid),
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
  }, [currentHpUid, searchTerm]);

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





  return (
    <div className="db-content-box bg-white round-10 mb-25">
      <HpHeader page_title={"New Claims"} />
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
                  <Link to={`/hp/hp_appointment_details/${appt.id}`} className="btn btn-xs btn-primary">
                    View
                  </Link>
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

export default HpNewClaims;