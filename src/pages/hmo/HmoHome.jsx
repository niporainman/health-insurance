import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import HmoHeader from "./HmoHeader";
import { format } from "date-fns";

function HmoHome() {
   const [stats, setStats] = useState({ plans: 0, appointments: 0 });
  const [upcomingAppointment, setUpcomingAppointment] = useState([]);
  const [activePlansCount, setActivePlansCount] = useState(0);
  const [activePlans, setActivePlans] = useState([]);
  const [claims, setClaims] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | HMO Dashboard";

    let unsubPlans = null;
    let unsubAppointments = null;
    let unsubActivePlans = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // cleanup previous listeners if user changes
      if (unsubPlans) unsubPlans();
      if (unsubAppointments) unsubAppointments();
      if (unsubActivePlans) unsubActivePlans();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Plans listener (all plans for stats)
        const plansQ = query(
          collection(db, "plans"),
          where("firebaseUid", "==", user.uid)
        );
        unsubPlans = onSnapshot(plansQ, (snap) => {
          setStats((prev) => ({
            ...prev,
            plans: snap.size,
          }));
        });

        // Appointments listener
        const apptQ = query(
          collection(db, "appointments"),
          where("hmofirebaseUid", "==", user.uid),
          where("hp_approved", "==", "Approved"),
          orderBy("appointment_date", "asc")
        );
        unsubAppointments = onSnapshot(apptQ, (snap) => {
          const now = new Date();

          const upcoming = [];
          let claimCount = 0;

          snap.docs.forEach((doc) => {
            const data = doc.data();

            if (data.appointment_date && data.appointment_time) {
              const apptDateTime = new Date(
                `${data.appointment_date}T${data.appointment_time}:00`
              );

              // claims
              if (data.claim && !data.paid) {
                claimCount++;
              }

              if (apptDateTime >= now) {
                upcoming.push({ id: doc.id, ...data, apptDateTime });
              }
            }
          });

          setStats((prev) => ({
            ...prev,
            appointments: upcoming.length,
          }));

          setClaims(claimCount);

          // sort & keep top 5
          upcoming.sort((a, b) => a.apptDateTime - b.apptDateTime);
          setUpcomingAppointment(upcoming.slice(0, 5));
        });

        // Active Plans listener
        const activePlansQ = query(
          collection(db, "plans"),
          where("firebaseUid", "==", user.uid),
          where("active", "==", true),
          where("deleted", "==", false)
        );
        unsubActivePlans = onSnapshot(activePlansQ, (snap) => {
          setActivePlansCount(snap.size);
          setActivePlans(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubPlans) unsubPlans();
      if (unsubAppointments) unsubAppointments();
      if (unsubActivePlans) unsubActivePlans();
    };
  }, []);

  if (loading) {
    return (
      <>
        <HmoHeader page_title={"Dashboard"} />
        <div className="db-content-wrapper">
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HmoHeader page_title={"Dashboard"} />

      <div className="db-box-wrapper style-one">
        <div className="db-content-box bg-white round-10 mb-25 pb-xxl-10">
          <div className="db-content-box-header d-flex flex-wrap align-items-center justify-content-between mb-25">
            <h4 className="fs-17 fw-extrabold text-title mb-0 w-75">Your Account at a Glance</h4>
          </div>

          {/*Stats Row */}
          <div className="row">
            <Link to="hmo_plans" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-shield-heart"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{activePlansCount}</h3>
                    <span className="text-title fs-14">Active Health Plans</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="hmo_appointments" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{stats.appointments}</h3>
                    <span className="text-title fs-14">Pending Appointments</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="new_claims" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-money-check-dollar"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{claims}</h3>
                    <span className="text-title fs-14">Pending Claims</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/*Upcoming Appointment */}
          <div className="db-content-box bg-ash round-10 mb-20 p-3">
            <h5 className="fw-bold text-title"> <i className="fa-solid fa-calendar-check"></i> Pending Appointments</h5>
          {upcomingAppointment.length > 0 ? (
          <div>
            {upcomingAppointment.map((appt) => (
              <p key={appt.id}>
                With <b>{appt.name}</b> on{" "}
                {appt.apptDateTime
                  ? format(appt.apptDateTime, "d MMM yyyy, h:mm a")
                  : "N/A"}
                <Link
                  to={`/hmo/hmo_appointment_details/${appt.id}`}
                  className="btn btn-xs btn-success mx-3"
                >
                  View
                </Link>
                <hr />
              </p>
            ))}
          </div>
        ) : (
          <p>No upcoming appointments</p>
        )}



          </div>

          {/*Active Plan */}
          <div className="db-content-box bg-ash round-10 mb-20 p-3">
            <h5 className="fw-bold text-title"> <i className="fa-solid fa-shield-heart"></i> Health Plans</h5>
           {activePlans.length > 0 ? (
            <div>
              {activePlans.slice(0, 5).map(plan => (
                <p key={plan.id}>
                  {plan.plan_name} – {plan.active ? "Active" : "Inactive"}
                  <Link
                    to={`/hmo/hmo_plan_details/${plan.id}`}
                    className="btn btn-xs btn-success mx-3"
                  >
                    View
                  </Link>
                  <hr />
                </p>
              ))}
            </div>
          ) : (
            <p>No active plans</p>
          )}

          </div>

         
        </div>
      </div>
    </>
  );
}

export default HmoHome;