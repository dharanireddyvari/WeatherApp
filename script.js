const apiKey = '921109b982b3e5b962b73d13f73e9e64'; // Replace with your OpenWeatherMap API key

// List of valid ISO 3166 country codes
const validCountryCodes = ["AF","AL","DZ","US","IN","GB","FR","JP","CN","CA","DE","BR","RU","AU","ZA","NG","EG","MX","IT","ES","KR","SE","CH","NL","BE","AR","PK","SA","TR","ID","VN","TH","MY","SG","PH","LK","BD","KE","TZ","UA","PL","NO","FI","DK","IE","PT","CZ","HU","RO","GR","IL","NZ","CO","CL","PE","VE","UY","EC","ZA","NG","EG"]; 
// (you can expand this list as needed)

// ---------- Helper: Validate country code ----------
function validateCountryCode(code) {
    if(!code) return true; // optional
    code = code.toUpperCase();
    if(code.length !== 2 || !validCountryCodes.includes(code)) {
        alert("Invalid country code. Use 2-letter ISO code like IN, US, GB.");
        return false;
    }
    return true;
}

// ---------- Fetch Weather Function ----------
async function getWeather(input, displayId, input2=null, country2=null) {
    const display = document.getElementById(displayId);
    display.innerHTML = 'Loading...';

    try {
        let url1 = '';
        const country = input.country || input.countryCode || '';
        const value = input.value || input;
        
        if(!validateCountryCode(country)) { display.innerHTML = ''; return; }

        // Detect numeric ZIP/postal code
        if(/^\d+$/.test(value)) {
            if(!country) { alert("Enter country code for ZIP search"); display.innerHTML=''; return; }
            url1 = `https://api.openweathermap.org/data/2.5/weather?zip=${value},${country}&units=metric&appid=${apiKey}`;
        } else {
            url1 = `https://api.openweathermap.org/data/2.5/weather?q=${value}${country ? ','+country : ''}&units=metric&appid=${apiKey}`;
        }

        const res1 = await fetch(url1);
        const data1 = await res1.json();
        if(data1.cod !== 200) { display.innerHTML = `"${value}" not found`; return; }

        if(input2) {
            const countryB = country2 || '';
            if(!validateCountryCode(countryB)) { display.innerHTML = ''; return; }

            let url2 = '';
            if(/^\d+$/.test(input2)) {
                if(!countryB) { alert("Enter country code for ZIP search"); display.innerHTML=''; return; }
                url2 = `https://api.openweathermap.org/data/2.5/weather?zip=${input2},${countryB}&units=metric&appid=${apiKey}`;
            } else {
                url2 = `https://api.openweathermap.org/data/2.5/weather?q=${input2}${countryB ? ','+countryB : ''}&units=metric&appid=${apiKey}`;
            }

            const res2 = await fetch(url2);
            const data2 = await res2.json();
            if(data2.cod !== 200) { display.innerHTML = `"${input2}" not found`; return; }

            display.innerHTML = `
                <div style="display:flex; justify-content:space-around; margin-top:20px;">
                    <div>
                        <h3>${data1.name}</h3>
                        <p>Temp: ${data1.main.temp}°C</p>
                        <p>Humidity: ${data1.main.humidity}%</p>
                        <p>${data1.weather[0].description}</p>
                    </div>
                    <div>
                        <h3>${data2.name}</h3>
                        <p>Temp: ${data2.main.temp}°C</p>
                        <p>Humidity: ${data2.main.humidity}%</p>
                        <p>${data2.weather[0].description}</p>
                    </div>
                </div>
            `;
        } else {
            display.innerHTML = `
                <h3>${data1.name}</h3>
                <p>Temp: ${data1.main.temp}°C</p>
                <p>Humidity: ${data1.main.humidity}%</p>
                <p>${data1.weather[0].description}</p>
            `;
        }

    } catch(error) {
        display.innerHTML = 'Error fetching data';
        console.error(error);
    }
}

// ---------- Search Single Place ----------
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    const country = document.getElementById('countryInput').value.trim().toUpperCase();
    if(!city) { alert('Enter a place'); return; }

    getWeather({value: city, countryCode: country}, 'weatherDisplay');
});

// ---------- Compare Two Places ----------
document.getElementById('compareBtn').addEventListener('click', () => {
    const city1 = document.getElementById('city1').value.trim();
    const country1 = document.getElementById('country1').value.trim().toUpperCase();
    const city2 = document.getElementById('city2').value.trim();
    const country2 = document.getElementById('country2').value.trim().toUpperCase();

    if(!city1 || !city2) { alert('Enter both places'); return; }

    getWeather({value: city1, countryCode: country1}, 'compareDisplay', city2, country2);
});

// ---------- Save Favorite Place ----------
document.getElementById('saveBtn').addEventListener('click', () => {
    const city = document.getElementById('favCity').value.trim();
    const country = document.getElementById('favCountry').value.trim().toUpperCase();
    if(!city) { alert('Enter a place to save'); return; }

    if(!validateCountryCode(country)) return;

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const place = city + (country ? `,${country}` : '');
    if(!favorites.includes(place)) {
        favorites.push(place);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
        alert(`${place} added to favorites`);
    } else {
        alert(`${place} already in favorites`);
    }
});

// ---------- Display Favorites ----------
function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const list = document.getElementById('favoritesList');
    list.innerHTML = '';
    favorites.forEach(place => {
        const li = document.createElement('li');
        li.textContent = place;
        list.appendChild(li);
    });
}

// Load favorites on page load
displayFavorites();
