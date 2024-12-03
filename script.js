class App {
  #currentDate = new Date();
  #currentIndex;
  constructor() {
    this.#startApp();
  }

  #startApp() {
    this.#getCoords();
  }

  // отображение интерфейса после загрузки данных
  #showApp(location) {
    console.log(location);
    this.#getAdress(location);
    let promise = new Promise((resolve, reject) => resolve(1));
    promise.then(this.#getWeather(location)).then(() => {
      setTimeout(() => {
        document.querySelector(".loading").classList.add("hidden");
        document.querySelector(".content-box").classList.remove("hidden");
      }, 500);
    });
  }

  // получение координат пользователя через встроенный API
  #getCoords() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.#showApp.bind(this), () =>
        alert("Вы не предоставили доступ к своей геопозиции ")
      );
    }
  }

  // Получение данных о погоде из API open-meteo
  // https://open-meteo.com/en/docs#hourly=temperature_2m,apparent_temperature&timezone=auto
  #getWeather(position) {
    const { latitude, longitude } = position.coords;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,rain,showers,snowfall&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.#getCurrentTimeIndex(data.hourly.time);
        this.#getCurrentTemperature(data.hourly.temperature_2m);
        this.#getApparentTemperature(data.hourly.apparent_temperature);
        this.#getMinAndMaxTemperature(
          data.hourly.temperature_2m.slice(
            this.#currentIndex,
            this.#currentIndex + 23
          )
        );
        this.#getCurrentPrecipitation(data.hourly);
      });
    return;
  }

  // определение индекса текущего времени
  #getCurrentTimeIndex(timeArray) {
    const formattedCurrentDate = this.#getFormattedDate();
    this.#currentIndex = timeArray.indexOf(formattedCurrentDate);
  }

  // форматирование времени к нужному формату
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

  // определение текущей температуры
  #getCurrentTemperature(temperatureArray) {
    const currentTemperature = temperatureArray[this.#currentIndex];
    this.#showCurrentTemperature(currentTemperature);
  }

  // вывод температуры на страницу
  #showCurrentTemperature(currentTemperature) {
    document.querySelector("#current-temperature").textContent =
      currentTemperature;
  }

  // определение кажущейся текущей температуры
  #getApparentTemperature(apparentTemperatureArray) {
    const apparentTemperature = apparentTemperatureArray[this.#currentIndex];
    this.#showApparentTemperature(apparentTemperature);
  }

  // вывод текущей температуры на экран
  #showApparentTemperature(apparentTemperature) {
    document.querySelector("#apparent-temperature").textContent =
      apparentTemperature;
  }

  // определение минимальной и максимальной температуры за сутки
  #getMinAndMaxTemperature(dayTemperature) {
    const maxTemperature = dayTemperature.reduce(
        (acc, val) => (acc > val ? acc : val),
        dayTemperature[0]
      ),
      minTemperature = dayTemperature.reduce((acc, val) =>
        acc < val ? acc : val
      );
    this.#showMinAndMaxTemperature(minTemperature, maxTemperature);
  }

  // вывод максимальной и минимальной температуры за сутки
  #showMinAndMaxTemperature(min, max) {
    document.querySelector("#max-temperature").textContent = max;
    document.querySelector("#min-temperature").textContent = min;
  }

  // получение информации об осадках сейчас
  #getCurrentPrecipitation(weather) {
    let currentPrecipitation;
    if (weather.rain[this.#currentIndex] !== 0)
      currentPrecipitation = "Дождь 🌧️";
    else if (weather.showers[this.#currentIndex])
      currentPrecipitation = "Ливень ⛈️";
    else if (weather.snowfall[this.#currentIndex])
      currentPrecipitation = "Снег 🌨️";
    else currentPrecipitation = "Без осадков 🌤️";
    this.#showCurrentPrecipitation(currentPrecipitation);
  }

  // вывод текущих осадков на экран
  #showCurrentPrecipitation(currentPrecipitation) {
    document.querySelector("#current-precipitation").textContent =
      currentPrecipitation;
  }

  // получение обратного геокодирования от API
  #getAdress(position) {
    const { latitude, longitude } = position.coords;
    const url =
      "http://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
    const token = tokenDaData;
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
      .then((result) => this.#showCity(result.suggestions[0].value))
      .catch((error) => console.log("error", error));
  }

  // вывод города на экран https://dadata.ru/api/geolocate/
  #showCity(address) {
    const firstIndex = address.indexOf(" "),
      lastIndex = address.indexOf(",");
    const city = address.slice(firstIndex, lastIndex);
    document.querySelector("#city").textContent = city;
  }
}

const app = new App();

/** Идеи что добавить:
 * кружок загрузки пока грузятся данные
 */
