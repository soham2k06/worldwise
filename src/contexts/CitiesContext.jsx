import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const CitiesContext = createContext();
// const BASE_URL = "http://localhost:9000";

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };

    case "cities/loaded":
      return { ...state, cities: action.payload, isLoading: false };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
        cities: [...state.cities, action.payload],
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("unknown action");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});

  const intitCities = [
    {
      cityName: "Surat",
      country: "India",
      emoji: "🇮🇳",
      date: "2023-07-02T09:24:11.863Z",
      notes: "Super 😃",
      position: {
        lat: 21.1702,
        lng: 72.8311,
      },
      id: 38748347,
    },
    {
      cityName: "Madrid",
      country: "Spain",
      emoji: "🇪🇸",
      date: "2027-07-15T08:22:53.976Z",
      notes: "",
      position: {
        lat: 40.46635901755316,
        lng: -3.7133789062500004,
      },
      id: 17806751,
    },
    {
      cityName: "Surat",
      country: "India",
      emoji: "🇮🇳",
      date: "2023-08-25T13:14:14.648Z",
      notes: "good place\n",
      position: {
        lat: "21.22218129956861",
        lng: "72.82905578613283",
      },
      id: 38748348,
    },
  ];

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        dispatch({ type: "cities/loaded", payload: intitCities });
      } catch {
        alert("Error loading data");
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return;

      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
      } catch {
        dispatch({ type: "rejected", payload: "Error loading data" });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      // const res = await fetch(`${BASE_URL}/cities`, {
      //   method: "POST",
      //   body: JSON.stringify(newCity),
      //   headers: { "Content-Type": "application/json" },
      // });
      // const data = await res.json();
      console.log(newCity);
      dispatch({ type: "city/created", payload: newCity });
    } catch {
      dispatch({ type: "rejected", payload: "Error creating city" });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({ type: "rejected", payload: "Error deleting city" });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext is used outside CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
