import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";
import UserHeader from "./UserHeader";
import { format } from "date-fns";

function UserConversationDetails() {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [user, setUser] = useState(null);


useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch conversations
      const appointmentRef = doc(db, "talk_to_doctors", id);
      const appointmentSnap = await getDoc(appointmentRef);

      if (!appointmentSnap.exists()) {
        alert("Conversations not found.");
        return;
      }

      const appointmentData = appointmentSnap.data();
      setAppointment({ id: appointmentSnap.id, ...appointmentData });

      // Fetch user
      const userId = appointmentData.firebaseUid;
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() });
        }
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Something went wrong while loading the data.");
    }
  };

  fetchData();
}, [id]);

  
if (!appointment) return <p>Loading appointment...</p>;
if (!user) return <p>Loading user info...</p>;

const createdAt = appointment.createdAt?.toDate();

 
  return (
    <div className="container db-content-wrapper">
      <UserHeader page_title={`${appointment.name} | Conversation Details`} />
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
        <h4 className="fs-17 fw-extrabold text-title mb-15">Conversation Details</h4>
        <b>Date:</b> {createdAt ? format(createdAt, "d MMM yyyy, h:mm a") : "—"}<br />
        <b>Patient Complaint:</b> {appointment.healthComplaint}<br />
        <b>Affected Area</b>: {appointment.affectedArea}<br />  
        <b>Severity Level</b>: {appointment.consultationLevel}<br />  
        <b>Doctor</b>: {appointment.doctor}<br />  
        </div>
    </div>
   
</div>

       </div>

  )
}

export default UserConversationDetails