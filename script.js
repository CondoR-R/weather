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
    this.#getAdress(location);

    let promise = new Promise((resolve, reject) => resolve(1));
    promise.then(this.#getWeather(location)).then(() => {
      setTimeout(() => {
        document.querySelector(".loading").classList.add("hidden");

        const contentBox = document.querySelector(".content-box");
        contentBox.classList.remove("hidden");
        contentBox.classList.add("content-box-animation");

        setTimeout(this.#animations, 500);
      }, 500);
    });
  }

  #animations() {
    const upElements = document.querySelectorAll(".offset-up");
    upElements.forEach((element) => {
      element.classList.add("up-to-down");
      element.classList.remove("offset-up");
    });

    const leftElements = document.querySelectorAll(".offset-left");
    leftElements.forEach((element) => {
      element.classList.add("left-to-right");
      element.classList.remove("offset-left");
    });

    const rightElements = document.querySelectorAll(".offset-right");
    rightElements.forEach((element) => {
      element.classList.add("right-to-left");
      element.classList.remove("offset-right");
    });

    const appearanceElements = document.querySelectorAll(".offset-appearance");
    appearanceElements.forEach((element) => {
      element.classList.add("appearance");
      element.classList.remove("offset-appearance");
    });
  }

  // получение координат пользователя через встроенный API
  #getCoords() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.#showApp.bind(this), () =>
        alert("Вы не предоставили доступ к своей геопозиции ")
      );
    } else alert("Упс, но походу ваш браузер не поддерживает геопозицию...");
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
        this.#getCurrentTimeIndex(data.hourly.time);
        this.#getCurrentTemperature(data.hourly.temperature_2m);
        this.#getApparentTemperature(data.hourly.apparent_temperature);
        this.#showMinAndMaxTemperature(
          data.hourly.temperature_2m.slice(
            this.#currentIndex,
            this.#currentIndex + 23
          )
        );
        this.#showCurrentPrecipitation(data.hourly);
        this.#getHourlyForecast(data.hourly);
        this.#getWeeklyForecast(data.hourly);
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

    return [minTemperature, maxTemperature];
  }

  // вывод максимальной и минимальной температуры за сутки
  #showMinAndMaxTemperature(dayTemperature) {
    const [min, max] = this.#getMinAndMaxTemperature(dayTemperature);
    document.querySelector("#max-temperature").textContent = max;
    document.querySelector("#min-temperature").textContent = min;
  }

  // получение информации об осадках сейчас
  #getCurrentPrecipitation(weather) {
    if (weather.snowfall[this.#currentIndex]) return "Снег 🌨️";
    else if (weather.showers[this.#currentIndex]) return "Ливень ⛈️";
    else if (weather.rain[this.#currentIndex]) return "Дождь 🌧️";
    else return "Без осадков 🌤️";
  }

  // вывод текущих осадков на экран
  #showCurrentPrecipitation(weather) {
    const currentPrecipitation = this.#getCurrentPrecipitation(weather);
    document.querySelector("#current-precipitation").textContent =
      currentPrecipitation;
  }

  // получение почасового прогноза
  #getHourlyForecast(weather) {
    for (let i = this.#currentIndex; i < this.#currentIndex + 24; i++) {
      const temperature = weather.temperature_2m[i],
        precipitation = this.#getCurrentPrecipitation(weather),
        time = weather.time[i].slice(-5);
      this.#showHourlyForecast(temperature, precipitation, time);
    }
  }

  #showHourlyForecast(temperature, precipitation, time) {
    const html = `<div class="hourly-forecast__cell">
                    <p class="hourly-forecast__p hourly-forecast__temperature">
                      <span class="span hourly-temperature">${temperature}</span>
                      <span class="span">ºC</span>
                    </p>
                    <p class="hourly-forecast__p hourly-forecast__precipitation">
                      <span class="span hourly-precipitation">${precipitation}</span>
                    </p>
                    <p class="hourly-forecast__p hourly-forecast__time">
                      <span class="span hourly-time">${time}</span>
                    </p>
                  </div>`;
    document
      .querySelector(".hourly-forecast")
      .insertAdjacentHTML("beforeend", html);
  }

  // прогноз на неделю
  #getWeeklyForecast(weather) {
    for (let i = 1; i < 7; i++) {
      const day = this.#getDay(weather.time[i * 24]),
        precipitation = this.#getPrecipitation(i, weather),
        [minTemperature, maxTemperature] = this.#getMinAndMaxTemperature(
          weather.temperature_2m.slice(i * 24, i * 24 + 23)
        );

      this.#showWeeklyForecats(
        day,
        precipitation,
        minTemperature,
        maxTemperature
      );
    }
  }

  #showWeeklyForecats(day, precipitation, minTemperature, maxTemperature) {
    const html = `<div class="weekly-forecast__cell">
                    <p class="weekly-forecast__day">${day}</p>
                    <p class="weekly-forecast__precipitation">${precipitation}</p>
                    <p class="weekly-forecast__temperature">
                      <span class="span weekly-forecast__max-temperature">${Math.round(
                        maxTemperature
                      )}ºC</span>
                      /
                      <span class="span weekly-forecast__min-temperature">${Math.round(
                        minTemperature
                      )}ºC</span>
                    </p>
                  </div>`;
    document
      .querySelector(".weekly-forecast__box")
      .insertAdjacentHTML("beforeend", html);
  }

  #getDay(date) {
    const day = new Date(date);
    const weekDay = this.#getWeekDay(day.getDay()),
      dayNum = day.getDate(),
      month = this.#getMonthWord(day.getMonth());

    return `${weekDay}, ${dayNum} ${month}`;
  }

  #getMonthWord(index) {
    const month = [
      "янв.",
      "фев.",
      "марта",
      "апр.",
      "мая",
      "июня",
      "июля",
      "авг.",
      "сен.",
      "окт.",
      "нояб.",
      "дек.",
    ];

    return month[index];
  }

  #getWeekDay(index) {
    const weekDays = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];

    return weekDays[index];
  }

  #getPrecipitation(index, weather) {
    for (let i = index * 24; i < (index + 1) * 24; i++) {
      if (weather.snowfall[i]) return "Снег 🌨️";
      else if (weather.showers[i]) return "Ливень ⛈️";
      else if (weather.rain[i]) return "Дождь 🌧️";
    }
    return "Без осадков 🌤️";
  }

  // получение обратного геокодирования от API
  #getAdress(position) {
    const { latitude, longitude } = position.coords;
    const url =
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
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

    document.querySelector("#city").textContent = city;
  }
}

const app = new App();
