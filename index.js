const apiKey = "ca19fa417b6756fdf6cb8220c5c70811"; // Replace with your OpenWeatherMap API key

function setWeatherBackground(weatherDescription) {
    // Remove all existing weather classes
    document.body.classList.remove('clear-sky', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist');
    
    // Add appropriate weather class
    if (weatherDescription.includes('clear')) {
        document.body.classList.add('clear-sky');
    } else if (weatherDescription.includes('cloud')) {
        document.body.classList.add('clouds');
    } else if (weatherDescription.includes('rain')) {
        document.body.classList.add('rain');
    } else if (weatherDescription.includes('snow')) {
        document.body.classList.add('snow');
    } else if (weatherDescription.includes('thunder')) {
        document.body.classList.add('thunderstorm');
    } else if (weatherDescription.includes('mist') || weatherDescription.includes('fog') || weatherDescription.includes('haze')) {
        document.body.classList.add('mist');
    }
}

function showLoading(weatherResult) {
    weatherResult.style.maxHeight = "200px";
    weatherResult.style.opacity = "1";
    weatherResult.innerHTML = `
        <div class="loading">
            <div></div>
            <div></div>
        </div>
    `;
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

async function getWeather() {
    const weatherResult = document.getElementById("weatherResult");
    const city = document.getElementById("cityInput").value;
    
    if (!city) {
        weatherResult.style.maxHeight = "40px";
        weatherResult.style.opacity = "1";
        weatherResult.innerHTML = `<p class="text-sm text-gray-500">Please enter a city name!</p>`;
        // Reset background to default
        document.body.classList.remove('clear-sky', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist');
        return;
    }

    // Show loading animation
    showLoading(weatherResult);

    try {
        // Get current weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        if (currentData.cod !== 200) {
            weatherResult.style.maxHeight = "40px";
            weatherResult.style.opacity = "1";
            weatherResult.innerHTML = `<p class="text-sm text-red-500">${currentData.message}</p>`;
            // Reset background to default
            document.body.classList.remove('clear-sky', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist');
            return;
        }

        // Set weather-specific background
        setWeatherBackground(currentData.weather[0].description);

        // Format temperature and add weather icon
        const temp = Math.round(currentData.main.temp);
        const feelsLike = Math.round(currentData.main.feels_like);
        const weatherIcon = currentData.weather[0].icon;

        // Process forecast data to get one forecast per day
        const dailyForecasts = forecastData.list.reduce((acc, forecast) => {
            const day = new Date(forecast.dt * 1000).getDate();
            if (!acc[day] || forecast.dt_txt.includes('12:00:00')) {
                acc[day] = forecast;
            }
            return acc;
        }, {});

        // Create forecast HTML
        const forecastHTML = Object.values(dailyForecasts)
            .slice(0, 5) // Get next 5 days
            .map(forecast => {
                const dayTemp = Math.round(forecast.main.temp);
                const dayIcon = forecast.weather[0].icon;
                const dayName = formatDate(forecast.dt);
                return `
                    <div class="forecast-day">
                        <p class="font-medium">${dayName}</p>
                        <img src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="Weather Icon" class="w-8 h-8">
                        <p class="text-sm">${dayTemp}°C</p>
                    </div>
                `;
            })
            .join('');

        weatherResult.innerHTML = `
            <div class="current-weather mb-6">
                <h3 class="text-lg font-semibold mb-2 text-center">${currentData.name}, ${currentData.sys.country}</h3>
                <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="Weather Icon" class="mx-auto mb-2">
                <p class="mb-2 text-2xl font-bold text-center">${temp}°C</p>
                <p class="mb-2 text-center">Feels like: ${feelsLike}°C</p>
                <p class="mb-2 text-center">Weather: ${currentData.weather[0].description}</p>
                <p class="text-center">Humidity: ${currentData.main.humidity}%</p>
            </div>
            <div class="divider mb-4"></div>
            <h4 class="text-md font-semibold mb-3 text-center">5-Day Forecast</h4>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        `;
        
        weatherResult.style.maxHeight = "500px";
        weatherResult.style.opacity = "1";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherResult.style.maxHeight = "40px";
        weatherResult.style.opacity = "1";
        weatherResult.innerHTML = `<p class="text-sm text-red-500">Something went wrong. Try again.</p>`;
        // Reset background to default
        document.body.classList.remove('clear-sky', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist');
    }
}
