const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const searchInput = document.getElementById('search');
const suggestionsEl = document.getElementById('suggestions');
const btnLocation = document.getElementById('btn-location');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const currentEl = document.getElementById('current');
const forecastEl = document.getElementById('forecast');
const cityNameEl = document.getElementById('city-name');

const WMO = {
  0: ['Céu limpo', '☀️'],
  1: ['Predominantemente limpo', '🌤️'],
  2: ['Parcialmente nublado', '⛅'],
  3: ['Nublado', '☁️'],
  45: ['Nevoeiro', '🌫️'],
  48: ['Nevoeiro com geada', '🌫️'],
  51: ['Garoa fraca', '🌦️'],
  53: ['Garoa', '🌦️'],
  55: ['Garoa forte', '🌦️'],
  56: ['Garoa congelante fraca', '🌦️'],
  57: ['Garoa congelante forte', '🌦️'],
  61: ['Chuva fraca', '🌧️'],
  63: ['Chuva moderada', '🌧️'],
  65: ['Chuva forte', '🌧️'],
  66: ['Chuva congelante fraca', '🌧️'],
  67: ['Chuva congelante forte', '🌧️'],
  71: ['Neve fraca', '❄️'],
  73: ['Neve moderada', '❄️'],
  75: ['Neve forte', '❄️'],
  77: ['Grãos de neve', '❄️'],
  80: ['Pancadas de chuva fracas', '🌧️'],
  81: ['Pancadas de chuva moderadas', '🌧️'],
  82: ['Pancadas de chuva fortes', '⛈️'],
  85: ['Pancadas de neve fracas', '❄️'],
  86: ['Pancadas de neve fortes', '❄️'],
  95: ['Tempestade', '⛈️'],
  96: ['Tempestade com granizo fraco', '⛈️'],
  99: ['Tempestade com granizo forte', '⛈️'],
};

const NIGHT_ICONS = {
  0: '🌙',
  1: '🌙',
  2: '🌙☁️',
};

function resolveIcon(code, isDay) {
  const [desc, icon] = WMO[code] || ['Desconhecido', '❓'];
  const nightIcon = !isDay && NIGHT_ICONS[code] ? NIGHT_ICONS[code] : icon;
  return [desc, nightIcon];
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();
  if (q.length < 3) {
    suggestionsEl.classList.add('hidden');
    return;
  }
  debounceTimer = setTimeout(() => buscarCidade(q), 300);
});

searchInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (!q) return;
    await buscarCidade(q);
    const first = suggestionsEl.querySelector('li');
    if (first) first.click();
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-bar')) suggestionsEl.classList.add('hidden');
});

async function buscarCidade(q) {
  try {
    const data = await fetchJSON(
      `${GEOCODING_URL}?name=${encodeURIComponent(q)}&count=6&language=pt&format=json`
    );
    renderSuggestions(data.results || []);
  } catch (err) {
    console.error(err);
  }
}

function renderSuggestions(results) {
  suggestionsEl.innerHTML = '';
  if (!results.length) {
    suggestionsEl.classList.add('hidden');
    return;
  }
  results.forEach((r) => {
    const region = [r.admin1, r.country].filter(Boolean).join(', ');
    const label = `${r.name}${region ? ` — ${region}` : ''}`;
    const li = document.createElement('li');
    li.textContent = label;
    li.setAttribute('role', 'option');
    li.addEventListener('click', () => {
      searchInput.value = r.name;
      suggestionsEl.classList.add('hidden');
      carregarPrevisao(r.latitude, r.longitude, label);
    });
    suggestionsEl.appendChild(li);
  });
  suggestionsEl.classList.remove('hidden');
}

async function carregarPrevisao(lat, lon, label) {
  showLoading();
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      timezone: 'auto',
      forecast_days: 16,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
      hourly: 'temperature_2m,weather_code,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    });
    const data = await fetchJSON(`${FORECAST_URL}?${params}`);
    renderCurrent(data, label);
    renderHourly(data);
    renderDaily(data);
    currentEl.classList.remove('hidden');
    forecastEl.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showError('Não foi possível carregar a previsão. Tente novamente.');
  } finally {
    hideLoading();
  }
}

function renderCurrent(data, label) {
  const c = data.current;
  cityNameEl.textContent = label || `Lat ${data.latitude}, Lon ${data.longitude}`;
  const [desc, icon] = resolveIcon(c.weather_code, c.is_day === 1);
  document.getElementById('icon').textContent = icon;
  document.getElementById('temp').textContent = `${Math.round(c.temperature_2m)}°C`;
  document.getElementById('condition').textContent = desc;
  document.getElementById('feels').textContent = `${Math.round(c.apparent_temperature)}°C`;
  document.getElementById('humidity').textContent = `${c.relative_humidity_2m}%`;
  document.getElementById('wind').textContent = `${c.wind_speed_10m} km/h`;
}

function renderHourly(data) {
  const container = document.getElementById('hourly');
  container.innerHTML = '';
  const times = data.hourly.time;
  const limit = Math.min(times.length, 24);
  for (let i = 0; i < limit; i++) {
    const [desc, icon] = resolveIcon(data.hourly.weather_code[i], data.hourly.is_day[i] === 1);
    const div = document.createElement('div');
    div.className = 'hour';
    div.title = desc;
    div.innerHTML = `<span class="h-time">${times[i].slice(11, 16)}</span>
      <span class="h-icon">${icon}</span>
      <span class="h-temp">${Math.round(data.hourly.temperature_2m[i])}°C</span>`;
    container.appendChild(div);
  }
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function renderDaily(data) {
  const container = document.getElementById('daily');
  container.innerHTML = '';
  data.daily.time.slice(0, 15).forEach((date, i) => {
    const [desc, icon] = WMO[data.daily.weather_code[i]] || ['', '❓'];
    const div = document.createElement('div');
    div.className = 'day';
    div.innerHTML = `<span class="d-date">${formatDate(date)}</span>
      <span class="d-icon">${icon}</span>
      <span class="d-desc">${desc}</span>
      <span class="d-temp">${Math.round(data.daily.temperature_2m_min[i])}° / ${Math.round(data.daily.temperature_2m_max[i])}°</span>`;
    container.appendChild(div);
  });
}

function switchTab(name) {
  const hourlyTab = document.getElementById('tab-hourly');
  const dailyTab = document.getElementById('tab-daily');
  hourlyTab.classList.toggle('active', name === 'hourly');
  dailyTab.classList.toggle('active', name === 'daily');
  document.getElementById('hourly').classList.toggle('hidden', name !== 'hourly');
  document.getElementById('daily').classList.toggle('hidden', name !== 'daily');
}

document.getElementById('tab-hourly').addEventListener('click', () => switchTab('hourly'));
document.getElementById('tab-daily').addEventListener('click', () => switchTab('daily'));

btnLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocalização não é suportada neste navegador.');
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    (pos) => carregarPrevisao(pos.coords.latitude, pos.coords.longitude, 'Sua localização'),
    (err) => {
      hideLoading();
      const msgs = {
        1: 'Permissão negada. Busque uma cidade pelo nome.',
        2: 'Localização indisponível no momento.',
        3: 'Tempo esgotado para obter a localização.',
      };
      showError(msgs[err.code] || 'Não foi possível obter sua localização.');
    },
    { timeout: 10000 }
  );
});

function showLoading() {
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  currentEl.classList.add('hidden');
  forecastEl.classList.add('hidden');
}

function hideLoading() {
  loadingEl.classList.add('hidden');
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
  loadingEl.classList.add('hidden');
}
