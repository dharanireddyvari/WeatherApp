// Replace with your OpenWeather API Key
const apiKey = "921109b982b3e5b962b73d13f73e9e64";

// ----------------- Section Navigation -----------------
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");

  // Clear inputs for Search and Compare when navigating
  if (sectionId === "searchSection") {
    document.getElementById("cityInput").value = "";
    document.getElementById("countryInput").value = "";
    document.getElementById("weatherDisplay").innerHTML = "";
  }
  if (sectionId === "compareSection") {
    document.getElementById("city1").value = "";
    document.getElementById("country1").value = "";
    document.getElementById("city2").value = "";
    document.getElementById("country2").value = "";
    document.getElementById("compareDisplay").innerHTML = "";
  }
}

// ----------------- Helper: Fetch Weather -----------------
async function fetchWeather(input, country) {
  if (!country) throw new Error("Country code is required");

  let url;
  input = input.trim();
  country = country.trim();

  if (/^\d+$/.test(input)) {
    url = `https://api.openweathermap.org/data/2.5/weather?zip=${input},${country}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${input},${country}`;
  }
  url += `&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  return res.json();
}

// ----------------- Search -----------------
document.getElementById("searchBtn")?.addEventListener("click", async () => {
  const cityOrZip = document.getElementById("cityInput").value;
  const country = document.getElementById("countryInput").value;
  const display = document.getElementById("weatherDisplay");

  if (!cityOrZip || !country) {
    display.innerHTML = "<p>City and Country code are required.</p>";
    return;
  }

  try {
    const data = await fetchWeather(cityOrZip, country);

    if (data.cod !== 200) {
      display.innerHTML = `<p>❌ ${data.message}</p>`;
      return;
    }

    display.innerHTML = `
      <h3>${data.name}, ${data.sys.country}</h3>
      <p>🌡️ Temp: ${data.main.temp}°C</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌥️ ${data.weather[0].description}</p>
    `;
  } catch {
    display.innerHTML = `<p>Error fetching data.</p>`;
  }
});

// ----------------- Compare -----------------
document.getElementById("compareBtn")?.addEventListener("click", async () => {
  const city1 = document.getElementById("city1").value.trim();
  const country1 = document.getElementById("country1").value.trim();
  const city2 = document.getElementById("city2").value.trim();
  const country2 = document.getElementById("country2").value.trim();
  const display = document.getElementById("compareDisplay");

  if (!city1 || !city2 || !country1 || !country2) {
    display.innerHTML = "<p>All fields are required.</p>";
    return;
  }

  if (city1.toLowerCase() === city2.toLowerCase() && country1.toLowerCase() === country2.toLowerCase()) {
    display.innerHTML = "<p>❌ Cannot compare the same place twice!</p>";
    return;
  }

  try {
    const [data1, data2] = await Promise.all([
      fetchWeather(city1, country1),
      fetchWeather(city2, country2)
    ]);

    if (data1.cod !== 200 || data2.cod !== 200) {
      display.innerHTML = "<p>❌ One or both places not found.</p>";
      return;
    }

    display.innerHTML = `
      <div>
        <h3>${data1.name}, ${data1.sys.country}</h3>
        <p>🌡️ Temp: ${data1.main.temp}°C</p>
        <p>💧 Humidity: ${data1.main.humidity}%</p>
        <p>🌥️ ${data1.weather[0].description}</p>
      </div>
      <hr>
      <div>
        <h3>${data2.name}, ${data2.sys.country}</h3>
        <p>🌡️ Temp: ${data2.main.temp}°C</p>
        <p>💧 Humidity: ${data2.main.humidity}%</p>
        <p>🌥️ ${data2.weather[0].description}</p>
      </div>
    `;
  } catch {
    display.innerHTML = "<p>Error fetching data.</p>";
  }
});

// ----------------- Favorites -----------------
document.getElementById("saveBtn")?.addEventListener("click", () => {
  const city = document.getElementById("favCity").value.trim();
  const country = document.getElementById("favCountry").value.trim();
  if (!city || !country) return alert("City and Country code required");

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.push({ city, country });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
  document.getElementById("favCity").value = "";
  document.getElementById("favCountry").value = "";
});

// ----------------- Load Favorites -----------------
function loadFavorites() {
  const list = document.getElementById("favoritesList");
  list.innerHTML = "";
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.forEach((fav, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${fav.city}, ${fav.country} 
      <button class="deleteBtn" onclick="deleteFavorite(${index})">Delete</button>`;
    list.appendChild(li);
  });
}

function deleteFavorite(index) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}

loadFavorites();
