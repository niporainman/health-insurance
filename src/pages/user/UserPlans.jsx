import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import UserHeader from "./UserHeader";

function UserPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "user_plans"),
            where("firebaseUid", "==", user.uid)
          );

          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPlans(data);
        } catch (error) {
          console.error("Error fetching user plans:", error);
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
        <UserHeader page_title={"Your Insurance Plans"} />
        <div className="db-content-wrapper">
          <p>Loading your plans...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader page_title={"Your Insurance Plans"} />
      <div className="db-content-wrapper">
        <div className="row">
          {plans.length === 0 ? (
            <p>No insurance plans found.</p>
          ) : (
            plans.map((plan) => {
              const startDate = plan.startDate?.seconds
                ? new Date(plan.startDate.seconds * 1000)
                : null;
              const endDate = plan.endDate?.seconds
                ? new Date(plan.endDate.seconds * 1000)
                : null;

              const isExpired =
                plan.status !== "Pending" &&
                endDate &&
                endDate < new Date();

              const isPending = plan.status === "Pending";

              return (
                <div className="col-md-4 mb-3" key={plan.id}>
                  <div className="db-single-doctor-stat text-center bg-white round-10 mb-25">
                    <div className="db-stat-icon bg-chard d-flex flex-column justify-content-center align-items-center round-10 mx-auto transition">
                      <img src="/assets/images/heart-shape.svg" alt="Icon" />
                    </div>
                    <h3 className="fs-30 fw-bold text-title">
                      {plan.planName}
                    </h3>
                    <p className="fs-14 text-title">{plan.hmoName}</p>
                    <p className="fs-14 text-title">{plan.hpName}</p>

                    {/* Only show duration and dates if not Pending */}
                    {!isPending && (
                      <p>
                        {plan.duration} Month(s)
                        <br />
                        {startDate
                          ? startDate.toLocaleDateString()
                          : "N/A"}{" "}
                        -{" "}
                        {endDate
                          ? endDate.toLocaleDateString()
                          : "N/A"}
                      </p>
                    )}

                    <span
                      className={`d-inline-block db-taglist fs-13 lh-1 fw-medium round-5 text-white ${
                        isPending
                          ? "bg-danger"
                          : isExpired
                          ? "bg-danger"
                          : "bg_secondary"
                      }`}
                    >
                      {isPending ? "Pending" : isExpired ? "Expired" : plan.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default UserPlans;