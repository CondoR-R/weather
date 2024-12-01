
/** Version 1.2
 * Вывод города на основе координат устройства пользователя
 */

class App {
  #temperatureSpan = document.querySelector("#temperature");
  #temperatureBox = document.querySelector(".temperature-box");
  #currentDate = new Date();
  constructor() {
    this.#getCoords();
  }

  #getCoords() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#getWeather.bind(this),
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
    console.log(formattedCurrentDate);
    console.log(weather);
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
}

const app = new App();
