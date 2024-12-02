class App {
  #contentBox = document.querySelector(".content-box");
  #temperatureSpan = document.querySelector("#current-temperature");
  #apparentTemperatureSpan = document.querySelector("#apparent-temperature");
  #citySpan = document.querySelector("#city");

  #currentDate = new Date();
  #currentIndex;
  constructor() {
    this.#getCoords();
  }

  // получение координат пользователя через встроенный API
  #getCoords() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          console.log(location);
          this.#getAdress(location);
          this.#getWeather(location);
        },
        () => alert("Вы не предоставили доступ к своей геопозиции ")
      );
    }
  }

  // Получение данных о погоде из API open-meteo
  // https://open-meteo.com/en/docs#hourly=temperature_2m,apparent_temperature&timezone=auto
  #getWeather(position) {
    const { latitude, longitude } = position.coords;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data.hourly);
        this.#getCurrentTimeIndex(data.hourly.time);
        this.#getCurrentTemperature(data.hourly.temperature_2m);
        this.#getApparentTemperature(data.hourly.apparent_temperature);
      });
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
    this.#temperatureSpan.textContent = currentTemperature;
    // создать метод сборщик со всеми выводами на страницу
    this.#showApp();
  }

  // определение кажущейся текущей температуры
  #getApparentTemperature(apparentTemperatureArray) {
    const apparentTemperature = apparentTemperatureArray[this.#currentIndex];
    this.#showApparentTemperature(apparentTemperature);
  }

  // вывод текущей температуры на экран
  #showApparentTemperature(apparentTemperature) {
    this.#apparentTemperatureSpan.textContent = apparentTemperature;
  }

  // получение обратного геокодирования от API
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
      .then((result) => this.#showCity(result.suggestions[0].value))
      .catch((error) => console.log("error", error));
  }

  // вывод города на экран https://dadata.ru/api/geolocate/
  #showCity(address) {
    const firstIndex = address.indexOf(" "),
      lastIndex = address.indexOf(",");
    const city = address.slice(firstIndex, lastIndex);
    this.#citySpan.textContent = city;
  }

  // отображение интерфейса после загрузки данных
  #showApp() {
    this.#contentBox.classList.remove("hidden");
  }
}

const app = new App();

/** Version 1.4
 * Добавление максимальной и минимальной температуры за сутки
 */
