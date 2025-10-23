import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import HmoHeader from "./HmoHeader";
import { Link } from "react-router-dom";

function HmoPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "plans"),
            where("firebaseUid", "==", user.uid),
            where("deleted", "==", false)
          );

          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          setPlans(data);
        } catch (error) {
          console.error("Error fetching plans:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setPlans([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <HmoHeader page_title={"Your plans"} />
        <div className="db-content-wrapper">
          <p>Loading your plans...</p>
        </div>
      </>
    );
  }

  
  return (
    <>
      <HmoHeader page_title={"Your plans"} />
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
                                      Plan Name
                                  </th>
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      Status
                                  </th>
                                 
                                  <th scope="col" className="text-title bg-white fw-bold fs-13">
                                      View Details
                                  </th>
                              </tr>
                          </thead>
                          <tbody>

                            {plans.length === 0 ? (
                              <tr className="text-center mt-2 p-3"><td>No plans found.</td></tr>
                            ) : (
                              plans.map((plan,index) => {
                            
                                return (
                                

                                      <tr key={plan.id}>
                                          <td><span className="fs-13 lh-1 text-para">{index + 1}</span></td>
                                          <td>
                                              <a href="" className="file-btn d-flex flex-column align-items-center justify-content-center round-5">
                                                  {plan.plan_name}
                                              </a>
                                          </td>
                                         <td>
                                            <span
                                              className={`fs-13 lh-1 px-2 py-1 rounded-2 fw-semibold ${
                                                plan.active ? "bg-success text-white" : "bg-danger text-white"
                                              }`}
                                            >
                                              {plan.active ? "Active" : "Inactive"}
                                            </span>
                                          </td>

                                          <td>
                                             <Link to={`/hmo/hmo_plan_details/${plan.id}`}>
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

export default HmoPlans;

