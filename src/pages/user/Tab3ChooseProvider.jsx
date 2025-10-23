import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../services/firebase";

const Tab3ChooseProvider = ({ onProviderSelected }) => {
  const [providers, setProviders] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const querySnapshot = await getDocs(collection(db, 'hps'));
      const providerList = [];
      querySnapshot.forEach((doc) => {
        providerList.push({ id: doc.id, ...doc.data() });
      });
      setProviders(providerList);
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = providers.filter((hp) =>
        hp.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [inputValue, providers]);

  const handleSelect = (hp) => {
    setInputValue(hp.name);
    setSelectedProvider(hp);
    setSuggestions([]);
    onProviderSelected(hp); // pass to parent
  };

  return (
    <div className="col-xxl-3 col-xl-4 col-md-6">
      <div className="form-group mb-15 position-relative">
        <label htmlFor="hpName" className="fs-13 d-block fw-medium text-title mb-8">
          Health Provider Name
        </label>
        <input
          type="text"
          id="hpName"
          className="fs-13 w-100 ht-40 bg-transparent round-5 text-para"
          placeholder="Type Health Provider Name"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSelectedProvider(null);
          }}
        />
        {suggestions.length > 0 && (
          <ul className="autocomplete-suggestions position-absolute bg-white p-2 shadow-sm rounded w-100" style={{ zIndex: 999 }}>
            {suggestions.map((hp) => (
              <div
                key={hp.id}
                onClick={() => handleSelect(hp)}
                className="p-2 hover:bg-light cursor-pointer"
              >
                {hp.name}
              </div>
            ))}
          </ul>
        )}
        {!selectedProvider && inputValue && (
          <p className="text-danger mt-2 fs-12">Please select a valid health provider</p>
        )}
      </div>
    </div>
  );
};

export default Tab3ChooseProvider;
