import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import UserHeader from "./UserHeader";
import { format } from "date-fns";

function UserHome() {
  const [stats, setStats] = useState({ plans: 0, appointments: 0, convos: 0 });
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [activePlansCount, setActivePlansCount] = useState(0);
  const [activePlans, setActivePlans] = useState([]);
  const [recentConvo, setRecentConvo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | User Dashboard";

    let unsubPlans = null;
    let unsubAppointments = null;
    let unsubActivePlans = null;
    let unsubConvos = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // cleanup old listeners if user changes
      if (unsubPlans) unsubPlans();
      if (unsubAppointments) unsubAppointments();
      if (unsubActivePlans) unsubActivePlans();
      if (unsubConvos) unsubConvos();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // User plans (all)
        const plansQ = query(
          collection(db, "user_plans"),
          where("firebaseUid", "==", user.uid)
        );
        unsubPlans = onSnapshot(plansQ, (snap) => {
          setStats((prev) => ({
            ...prev,
            plans: snap.size,
          }));
        });

        // Appointments
        const apptQ = query(
          collection(db, "appointments"),
          where("firebaseUid", "==", user.uid),
          orderBy("appointment_date", "asc")
        );
        unsubAppointments = onSnapshot(apptQ, (snap) => {
          const now = new Date();
          const upcoming = [];

          snap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.appointment_date && data.appointment_time) {
              const apptDateTime = new Date(
                `${data.appointment_date}T${data.appointment_time}:00`
              );
              if (apptDateTime > now) {
                upcoming.push({ id: doc.id, ...data, apptDateTime });
              }
            }
          });

          upcoming.sort((a, b) => a.apptDateTime - b.apptDateTime);

          setStats((prev) => ({
            ...prev,
            appointments: snap.size,
          }));

          setUpcomingAppointment(upcoming.length > 0 ? upcoming[0] : null);
        });

        // Active plans only (Approved & not expired)
        const activePlansQ = query(
          collection(db, "user_plans"),
          where("firebaseUid", "==", user.uid),
          where("status", "==", "Approved")
        );
        unsubActivePlans = onSnapshot(activePlansQ, (snap) => {
          const now = new Date();
          const validPlans = snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((plan) => plan.endDate && plan.endDate.toDate() > now);

          setActivePlansCount(validPlans.length);
          setActivePlans(validPlans);
        });

        // Recent convo
        const convoQ = query(
          collection(db, "talk_to_doctors"),
          where("firebaseUid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        unsubConvos = onSnapshot(convoQ, (snap) => {
          if (!snap.empty) {
            setRecentConvo({ id: snap.docs[0].id, ...snap.docs[0].data() });
          } else {
            setRecentConvo(null);
          }
          setStats((prev) => ({
            ...prev,
            convos: snap.size,
          }));
        });
      } catch (error) {
        console.error("Error loading user dashboard:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubPlans) unsubPlans();
      if (unsubAppointments) unsubAppointments();
      if (unsubActivePlans) unsubActivePlans();
      if (unsubConvos) unsubConvos();
    };
  }, []);


  if (loading) {
    return (
      <>
        <UserHeader page_title={"Dashboard"} />
        <div className="db-content-wrapper">
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader page_title={"Dashboard"} />

      <div className="db-box-wrapper style-one">
        <div className="db-content-box bg-white round-10 mb-25 pb-xxl-10">
          <div className="db-content-box-header d-flex flex-wrap align-items-center justify-content-between mb-25">
            <h4 className="fs-17 fw-extrabold text-title mb-0 w-75">Your Account at a Glance</h4>
          </div>

          {/* 🔹 Stats Row */}
          <div className="row">
            <Link to="user_plans" className="col-sm-4">
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

            <Link to="user_appointments" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{stats.appointments}</h3>
                    <span className="text-title fs-14">Appointments</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="talk_to_doctor_convos" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-user-doctor"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{stats.convos}</h3>
                    <span className="text-title fs-14">Conversations</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 🔹 Upcoming Appointment */}
          <div className="db-content-box bg-ash round-10 mb-20 p-3">
            <h5 className="fw-bold text-title"> <i className="fa-solid fa-calendar-check"></i> Upcoming Appointments</h5>
           {upcomingAppointment ? (
              <p>
                With <b>{upcomingAppointment.hpName}</b> on{" "}
                {upcomingAppointment.apptDateTime
                  ? format(upcomingAppointment.apptDateTime, "d MMM yyyy, h:mm a")
                  : "N/A"}
              </p>
            ) : (
              <p>No upcoming appointments</p>
            )}


          </div>

          {/*Active Plan */}
          <div className="db-content-box bg-ash round-10 mb-20 p-3">
            <h5 className="fw-bold text-title"> <i className="fa-solid fa-shield-heart"></i> Active Health Plan</h5>
            {activePlansCount ? (
              <p>
               {activePlans[0]?.planName} with <b>{activePlans[0]?.hmoName}</b> <br />
                Ends on{" "}
                {activePlans[0]?.endDate
                  ? format(activePlans[0].endDate.toDate(), "d MMM yyyy")
                  : "N/A"}

              </p>
            ) : (
              <p>You have no active plan</p>
            )}
          </div>

          {/*Recent Conversation */}
          <div className="db-content-box bg-ash round-10 mb-20 p-3">
            <h5 className="fw-bold text-title"><i className="fa-solid fa-user-doctor"></i> Recent Conversation</h5>
            {recentConvo ? (
              <p>
                Complaint: <b>{recentConvo.healthComplaint}</b> <br />
                With Doctor {recentConvo.doctor} <br />
                Date:{" "}
                {recentConvo.createdAt?.toDate
                  ? format(recentConvo.createdAt.toDate(), "d MMM yyyy, h:mm a")
                  : "N/A"}
              </p>
            ) : (
              <p>No conversations yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserHome;