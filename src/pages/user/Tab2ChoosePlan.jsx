import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "../../services/firebase";

const Tab2ChoosePlan = ({ hmo, onPlanSelected }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    if (!hmo?.hmoId) return;

    const fetchPlans = async () => {
      const q = query(collection(db, 'plans'), where('hmoId', '==', hmo.hmoId));
      const querySnapshot = await getDocs(q);
      const fetchedPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(fetchedPlans);
    };

    fetchPlans();
  }, [hmo]);

  const handlePlanClick = (planId) => {
    setSelectedPlanId(planId);
  };

  const handlePricePointClick = (plan, duration, price) => {
    const selectedPlanWithPricing = {
      ...plan,
      selectedDuration: duration,
      selectedPrice: price,
    };
    onPlanSelected(selectedPlanWithPricing); // move to next tab
  };

  return (
    <div className="row">
      {plans.length === 0 ? (
        <p>No plans found for {hmo.name}</p>
      ) : (
        plans.map((plan) => (
          <div
            key={plan.id}
            className={`col-md-6 mb-3 p-3 round-10 shadow-sm cursor-pointer ${
              selectedPlanId === plan.id ? 'border border-success' : 'border'
            }`}
            onClick={() => handlePlanClick(plan.id)}
          >
            <h5 className="text-title mb-2">{plan.plan_name}</h5>
            <p className="mb-2 text-para">{plan.plan_desc}</p>

            {selectedPlanId === plan.id && (
              <div className="mt-2">
                <h6 className="fw-semibold mb-1">Choose a duration:</h6>
                <div className=" flex-wrap gap-2">
                  {Number(plan.duration1) > 0 && Number(plan.price1) > 0 && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm me-2 mb-2"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent re-triggering card select
                        handlePricePointClick(plan, plan.duration1, plan.price1);
                      }}
                    >
                      {plan.duration1} {'month plan'} <br /> ₦{plan.price1}
                    </button>
                  )}
                  {Number(plan.duration2) > 0 && Number(plan.price2) > 0 && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm me-2 mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePricePointClick(plan, plan.duration2, plan.price2);
                      }}
                    >
                      {plan.duration2} {'month plan'} <br /> ₦{plan.price2}
                    </button>
                  )}
                  {Number(plan.duration3) > 0 && Number(plan.price3) > 0 && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm me-2 mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePricePointClick(plan, plan.duration3, plan.price3);
                      }}
                    >
                      {plan.duration3} {'month plan'} <br /> ₦{plan.price3}
                    </button>
                  )}
                  {Number(plan.duration4) > 0 && Number(plan.price4) > 0 && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm me-2 mb-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePricePointClick(plan, plan.duration4, plan.price4);
                      }}
                    >
                       {plan.duration4} {'month plan'} <br /> ₦{plan.price4}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Tab2ChoosePlan;
