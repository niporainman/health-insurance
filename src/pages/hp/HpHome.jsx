import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import HpHeader from "./HpHeader";
import { format } from "date-fns";

function HpHome() {
  const [stats, setStats] = useState({ appointments: 0 });
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = import.meta.env.VITE_COMPANY_NAME + " | HP Dashboard";

    let unsubscribeAuth;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "appointments"),
        where("hpfirebaseUid", "==", user.uid),
        orderBy("appointment_date", "asc")
      );

      // 🔹 Real-time listener
      const unsubscribeSnapshot = onSnapshot(
        q,
        (allAppointmentsSnap) => {
          const now = new Date();
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0
          );
          const todayEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59
          );

          // 🔹 Initialize counters and lists
          let totalAppointments = 0;
          let upcomingAppointments = 0;
          let pendingAppointments = 0;
          let upcomingList = [];
          let todaysList = [];

          allAppointmentsSnap.forEach((doc) => {
            const data = doc.data();
            totalAppointments++;

            if (data.appointment_date && data.appointment_time) {
              const apptDateTime = new Date(
                `${data.appointment_date}T${data.appointment_time}:00`
              );

              // Future appointments
              if (apptDateTime > now) {
                upcomingAppointments++;
                upcomingList.push({ id: doc.id, ...data, apptDateTime });

                if (data.hp_approved === "Pending") {
                  pendingAppointments++;
                }
              }

              // Today’s appointments
              if (apptDateTime >= todayStart && apptDateTime <= todayEnd) {
                todaysList.push({ id: doc.id, ...data, apptDateTime });
              }
            }
          });

          // Sort today’s list by time
          todaysList.sort((a, b) => a.apptDateTime - b.apptDateTime);

          setStats({
            pending: pendingAppointments,
            upcoming: upcomingAppointments,
            total: totalAppointments,
          });

          setTodaysAppointments(todaysList);

          if (upcomingList.length > 0) {
            // take the soonest upcoming
            upcomingList.sort((a, b) => a.apptDateTime - b.apptDateTime);
            setUpcomingAppointment(upcomingList[0]);
          } else {
            setUpcomingAppointment(null);
          }

          setLoading(false);
        },
        (error) => {
          console.error("Error loading dashboard:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  if (loading) {
    return (
      <>
        <HpHeader page_title={"Dashboard"} />
        <div className="db-content-wrapper">
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HpHeader page_title={"Dashboard"} />

      <div className="db-box-wrapper style-one">
        <div className="db-content-box bg-white round-10 mb-25 pb-xxl-10">
          <div className="db-content-box-header d-flex flex-wrap align-items-center justify-content-between mb-25">
            <h4 className="fs-17 fw-extrabold text-title mb-0 w-75">
              Your Account at a Glance
            </h4>
          </div>

          {/* Stats Row */}
          <div className="row">
            <Link to="hp_appointments" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-hourglass-half"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{stats.pending}</h3>
                    <span className="text-title fs-14">
                      Pending Appointments
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="hp_appointments" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-calendar-day"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{stats.upcoming}</h3>
                    <span className="text-title fs-14">
                      Upcoming Appointments
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="hp_appointments" className="col-sm-4">
              <div className="db-activity-card style-two round-10 bg-jordyBlue mb-20">
                <div className="db-activity-stat d-flex flex-wrap align-items-center">
                  <div className="db-activity-icon d-flex flex-column align-items-center justify-content-center bg-white round-10 fs-30">
                    <i className="fa-solid fa-calendar-alt"></i>
                  </div>
                  <div className="db-activity-info">
                    <h3 className="fw-bold text-title">{stats.total}</h3>
                    <span className="text-title fs-14">Total Appointments</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Today’s Appointments */}
          <div className="db-content-box bg-light round-10 mb-20 p-3">
            <h5 className="fw-bold text-title">
              <i className="fa-solid fa-calendar-day"></i> Today’s Appointments
            </h5>

            {todaysAppointments.length > 0 ? (
              <ul className="list-unstyled mt-2">
                {todaysAppointments.map((appt) => (
                  <li key={appt.id} className="mb-2">
                    <strong>{appt.patientName || "Unknown Patient"}</strong> –{" "}
                    {appt.apptDateTime
                      ? format(appt.apptDateTime, "h:mm a")
                      : "N/A"}{" "}
                    ({appt.hp_approved})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No appointments for today</p>
            )}
          </div>

          {/* Upcoming Appointment */}
          <div className="db-content-box bg-ash round-10 mb-20 p-3">
            <h5 className="fw-bold text-title">
              <i className="fa-solid fa-calendar-check"></i> Upcoming
              Appointments
            </h5>
            {upcomingAppointment ? (
              <p>
                on{" "}
                {upcomingAppointment.apptDateTime
                  ? format(
                      upcomingAppointment.apptDateTime,
                      "d MMM yyyy, h:mm a"
                    )
                  : "N/A"}
              </p>
            ) : (
              <p>No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HpHome;