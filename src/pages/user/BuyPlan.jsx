import { useState } from 'react';
import Tab1ChooseHMO from './Tab1ChooseHMO';
import Tab2ChoosePlan from './Tab2ChoosePlan';
import Tab3ChooseProvider from './Tab3ChooseProvider';
import Tab4PaySecurely from './Tab4PaySecurely';

const BuyPlan = () => {
  const [currentTab, setCurrentTab] = useState(1);

  const [selectedHmo, setSelectedHmo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleReset = () => {
    setSelectedHmo(null);
    setSelectedPlan(null);
    setSelectedProvider(null);
    setCurrentTab(1);
  };

  return (
    <div className="db-content-box bg-white round-10 mb-25">
      <ul className="nav nav-tabs add-doctor-tablist d-flex mb-20" role="tablist">
        <li className="nav-item">
          <button className={`nav-link ${currentTab === 1 ? 'active' : ''}`} type="button">
            <i className="fa-solid fa-home"></i> Choose an HMO
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${currentTab === 2 ? 'active' : ''}`} type="button">
            <i className="fa-solid fa-book-medical"></i> Choose a Plan
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${currentTab === 3 ? 'active' : ''}`} type="button">
            <i className="fa-solid fa-house-medical-circle-check"></i> Choose a Health Provider
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${currentTab === 4 ? 'active' : ''}`} type="button">
            <i className="fa-solid fa-cart-shopping"></i> Pay Securely
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Tab 1: Choose HMO */}
        {currentTab === 1 && (
          <div className="tab-pane fade show active transition">
            <div className="form-wrapper style-two">
              <div className="row">
                <Tab1ChooseHMO
                  onHmoSelected={(hmo) => {
                    setSelectedHmo(hmo);
                    setCurrentTab(2);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Choose Plan */}
        {currentTab === 2 && selectedHmo && (
          <div className="tab-pane fade show active transition">
            <div className="form-wrapper style-two">
              <div className="row">
                <Tab2ChoosePlan
                  hmo={selectedHmo}
                  onPlanSelected={(plan) => {
                    setSelectedPlan(plan);
                    setCurrentTab(3);
                  }}
                  onStartOver={handleReset}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Choose Provider */}
        {currentTab === 3 && selectedPlan && (
          <div className="tab-pane fade show active transition">
            <div className="form-wrapper style-two">
              <div className="row">
                <Tab3ChooseProvider
                  onProviderSelected={(provider) => {
                    setSelectedProvider(provider);
                    setCurrentTab(4);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Pay */}
        {currentTab === 4 && selectedProvider && (
          <div className="tab-pane fade show active transition">
            <div className="form-wrapper style-two">
              <div className="row">
                <Tab4PaySecurely
                  hmo={selectedHmo}
                  plan={selectedPlan}
                  provider={selectedProvider}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Start Over Button */}
      {currentTab > 1 && (
        <div className="mt-4 justify-content-end">
          <button
            onClick={handleReset}
            type='button'
            className="btn btn-danger btn-sm"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyPlan;
