import { useEffect, useState } from "react";
import useUrlPosition from "../hooks/useUrlPosition";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Form.module.css";
import Button from "./Button";
import Spinner from "./Spinner";
import Message from "./Message";
import BackButton from "./BackButton";
import DatePicker from "react-datepicker";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const { isLoading, createCity } = useCities();
  const navigate = useNavigate();

  const { lat, lng } = useUrlPosition();
  const [cityName, setCityName] = useState("");
  const [country, SetCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);
  const [emoji, setEmoji] = useState("");

  useEffect(
    function () {
      async function fetchCityData() {
        try {
          setError("");
          setIsGeolocationLoading(true);
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          if (!data.countryCode) {
            throw new Error(
              "That doesn't seems to be a city. Click somewhere else 😉"
            );
          }
          setCityName(data.city || "");
          SetCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setError(err.message);
        } finally {
          setIsGeolocationLoading(false);
        }
      }
      fetchCityData();
    },
    [lat, lng, SetCountry]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: {
        lat,
        lng,
      },
    };
    await createCity(newCity);
    navigate("/app/cities/");
  }

  if (isGeolocationLoading) return <Spinner />;
  if (error) return <Message message={error} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
