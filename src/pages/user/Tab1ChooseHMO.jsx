import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../services/firebase";

const Tab1ChooseHMO = ({ onHmoSelected }) => {
  const [hmos, setHmos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedHmo, setSelectedHmo] = useState(null);

  useEffect(() => {
    const fetchHmos = async () => {
      const querySnapshot = await getDocs(collection(db, 'hmos'));
      const hmoList = [];
      querySnapshot.forEach((doc) => {
        hmoList.push({ id: doc.id, ...doc.data() });
      });
      setHmos(hmoList);
    };

    fetchHmos();
  }, []);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = hmos.filter((hmo) =>
        hmo.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [inputValue, hmos]);

  const handleSelect = (hmo) => {
    setInputValue(hmo.name);
    setSelectedHmo(hmo);
    setSuggestions([]);
    onHmoSelected(hmo); // send it to parent component (for tab 2 use)
  };

  return (
    <>
    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15 position-relative">
        <label htmlFor="hmoName" className="fs-13 d-block fw-medium text-title mb-8">
          HMO Name
        </label>
        <input
          type="text"
          id="hmoName"
          className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
          placeholder="Type HMO Name"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSelectedHmo(null);
          }}
        />
        {suggestions.length > 0 && (
          <ul className="autocomplete-suggestions position-absolute bg-white p-2 shadow-sm rounded w-100" style={{ zIndex: 999 }}>
            {suggestions.map((hmo) => (
              <div
                key={hmo.id}
                onClick={() => handleSelect(hmo)}
                className="p-2 hover:bg-light cursor-pointer"
              >
                {hmo.name}
              </div>
            ))}
          </ul>
        )}
        {!selectedHmo && inputValue && (
          <p className="text-danger mt-2 fs-12">Please select a valid HMO from the list</p>
        )}
      </div>
    </div>
    
  </>
  );
};

export default Tab1ChooseHMO;
