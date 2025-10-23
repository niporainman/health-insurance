import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import UserHeader from "./UserHeader";
import { Link } from "react-router-dom";
import { format } from "date-fns";

function TalkToDoctorConvos() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "talk_to_doctors"),
            where("firebaseUid", "==", user.uid)
          );

          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          setAppointments(data);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setAppointments([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <UserHeader page_title={"Your Conversations"} />
        <div className="db-content-wrapper">
          <p>Loading your conversations...</p>
        </div>
      </>
    );
  }

  
  return (
    <>
      <UserHeader page_title={"Your Conversations"} />
      <div className="db-content-wrapper">
        <div className="row">
            <div className="col-12">
              <div className="db-content-box bg-ash round-10 mb-25">
                  <div className="db-table style-two table-responsive">
                      <table className="table text-nowrap align-middle mb-0">
                          <thead>
                              <tr>
                                  <th scope="col" className="text-title bg-white fw-semibold fs-13">
                                      #
                                  </th>
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      Name
                                  </th>
                                  <th scope="col" className="text-title bg-white whitefw-bold fs-13">
                                      Complaint
                                  </th>
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      Affected Area
                                  </th>
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      Severity Level
                                  </th>
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      Doctor
                                  </th>
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      Date
                                  </th>
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      View Details
                                  </th>
                              </tr>
                          </thead>
                          <tbody>

                            {appointments.length === 0 ? (
                              <tr className="text-center mt-2 p-3"><td>No conversations found.</td></tr>
                            ) : (
                              appointments.map((appointment,index) => {
                                const createdAt = appointment.createdAt?.toDate();
                                return (
                                

                                      <tr key={appointment.id}>
                                          <td><span className="fs-13 lh-1 text-para">{index + 1}</span></td>
                                          <td>
                                              <span className="file-btn d-flex flex-column align-items-center justify-content-center round-5">
                                                  {appointment.name}
                                              </span>
                                          </td>
                                          <td className="truncate_text">
                                              <span title={appointment.healthComplaint} className="fs-13 text_primary"> {appointment.healthComplaint}</span>
                                          </td>
                                          <td>
                                              <span className="fs-13 lh-1 text-para">{appointment.affectedArea}</span>
                                          </td>
                                          <td>
                                              <span className="fs-13 lh-1 text-para">{appointment.consultationLevel}</span>
                                          </td>
                                          <td>
                                              <span className="fs-13 lh-1 text-para">{appointment.doctor}</span>
                                          </td>
                                          <td>
                                              <span className="fs-13 lh-1 text-para">{createdAt ? format(createdAt, "d MMM yyyy, h:mm a") : "—"}</span>
                                          </td>
                                          
                                          <td>
                                             <Link to={`/user/user_conversation_details/${appointment.id}`}>
                                              <button className="tb-btn style-three d-flex flex-column align-items-center justify-content-center border-0 round-5 transition">
                                                <img src="/assets/images/briefcase-blue.svg" alt="Icon"></img>
                                              </button>
                                              </Link>
                                          </td>
                                          
                                      </tr>
                                    
                                
                                );
                              })
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

export default TalkToDoctorConvos;

