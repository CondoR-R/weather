class App {
  #temperatureSpan = document.querySelector("#temperature");
  #temperatureBox = document.querySelector(".temperature-box");
  #citySpan = document.querySelector(".city");
  #currentDate = new Date();
  constructor() {
    this.#getCoords();
  }

  #getCoords() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          this.#getWeather(location);
          this.#getAdress(location);
        },
        () => alert("Вы не предоставили доступ к своей геопозиции ")
      );
    }
  }

  #getWeather(position) {
    const { latitude, longitude } = position.coords;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain,snowfall&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => this.#getCurrentWeather(data.hourly));
  }

  #getCurrentWeather(weather) {
    const formattedCurrentDate = this.#getFormattedDate();
    // получаем индекс текущего времени и по нему определяем температуру
    const index = weather.time.indexOf(formattedCurrentDate);
    const temperature = weather.temperature_2m[index];
    this.#showWeather(temperature);
  }

  // форматирование даты к нужному формату
  #getFormattedDate() {
    return `${this.#currentDate.getFullYear()}-${
      this.#currentDate.getMonth().toString().length === 1
        ? `0${this.#currentDate.getMonth() + 1}`
        : this.#currentDate.getMonth() + 1
    }-${
      this.#currentDate.getDate().toString().length === 1
        ? "0" + this.#currentDate.getDate()
        : this.#currentDate.getDate()
    }T${
      this.#currentDate.getHours().toString().length === 1
        ? "0" + this.#currentDate.getHours()
        : this.#currentDate.getHours()
    }:00`;
  }

  // вывод данных на страницу
  #showWeather(temp) {
    this.#temperatureSpan.textContent = temp;
    this.#temperatureBox.classList.remove("hidden");
  }

  // получение от API город юзера
  #getAdress(position) {
    const { latitude, longitude } = position.coords;
    const url =
      "http://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
    const token = "99c0507a40d0b615884486440a6470e0359a1929";
    const query = { lat: latitude, lon: longitude };

    const options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Token " + token,
      },
      body: JSON.stringify(query),
    };

    fetch(url, options)
      .then((response) => response.json())
      .then((result) => this.#showAdress(result.suggestions[0].value))
      .catch((error) => console.log("error", error));
  }

  #showAdress(address) {
    const lastIndex = address.indexOf(",");
    const city = address.slice(0, lastIndex);
    this.#citySpan.textContent = city;
  }
}

const app = new App();
