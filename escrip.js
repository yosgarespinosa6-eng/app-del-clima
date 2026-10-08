// ==============================================
// 🔑 PON TU CLAVE NUEVA DE OPENWEATHERMAP AQUÍ
// ==============================================
const API_KEY = "e5f1689762026b6a92fecdef6b785b62";
// ⚠️ Si no funciona, genera una clave nueva y ponla arriba

// ELEMENTOS DEL HTML
const formulario = document.getElementById("formulario");
const inputCiudad = document.getElementById("inputCiudad");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");
const btnUbicacion = document.getElementById("btnUbicacion");
const btnTema = document.getElementById("btnTema");
const historialBotones = document.getElementById("historialBotones");
const pronosticoTarjetas = document.getElementById("pronosticoTarjetas");

// BUSCAR CIUDAD
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();
    const ciudad = inputCiudad.value.trim();
    if (ciudad === "") {
        estado.textContent = "Escribe una ciudad.";
        return;
    }
    buscarClima(ciudad);
});

// FUNCIÓN PARA BUSCAR EL CLIMA
async function buscarClima(ciudad) {
    estado.textContent = "🌤️ Consultando el clima...";
    resultado.innerHTML = "";
    pronosticoTarjetas.innerHTML = "";
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${API_KEY}&units=metric&lang=es`;
        console.log("Consultando:", url);
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        console.log("Respuesta de OpenWeatherMap:", datos);
        
        if (!respuesta.ok) {
            throw new Error(datos.message || "Ciudad no encontrada");
        }
        
        mostrarClima(datos);
        guardarHistorial(datos.name);
        buscarPronostico(datos.coord.lat, datos.coord.lon);
        estado.textContent = "";
    } catch (error) {
        console.error("ERROR:", error);
        estado.textContent = "❌ Error: " + error.message;
        resultado.innerHTML = "";
        pronosticoTarjetas.innerHTML = "";
    }
}

// MOSTRAR CLIMA ACTUAL
function mostrarClima(datos) {
    const temperatura = Math.round(datos.main.temp);
    const sensacion = Math.round(datos.main.feels_like);
    const icono = datos.weather[0].icon;
    const descripcion = datos.weather[0].description;
    
    resultado.innerHTML = `
        <div class="tarjeta-clima">
            <h2>📍 ${datos.name}, ${datos.sys.country}</h2>
            <img
                class="icono-clima"
                src="https://openweathermap.org/img/wn/${icono}@2x.png"
                alt="${descripcion}"
            >
            <div class="temperatura">${temperatura}°C</div>
            <p>${descripcion}</p>
            <p>🌡️ Sensación térmica: ${sensacion}°C</p>
            <p>💧 Humedad: ${datos.main.humidity}%</p>
            <p>💨 Viento: ${datos.wind.speed} m/s</p>
            <p>🔽 Presión: ${datos.main.pressure} hPa</p>
        </div>
    `;
}

// BUSCAR PRONÓSTICO
async function buscarPronostico(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        if (!respuesta.ok) {
            throw new Error(datos.message || "Error en pronóstico");
        }
        
        mostrarPronostico(datos);
    } catch (error) {
        console.error("Error del pronóstico:", error);
        pronosticoTarjetas.innerHTML = "<p>❌ No se pudo cargar el pronóstico.</p>";
    }
}

// MOSTRAR PRONÓSTICO DE 5 DÍAS
function mostrarPronostico(datos) {
    pronosticoTarjetas.innerHTML = "";
    const dias = {};
    
    datos.list.forEach(function(item) {
        const fecha = new Date(item.dt * 1000);
        const dia = fecha.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
        if (!dias[dia]) {
            dias[dia] = item;
        }
    });
    
    const listaDias = Object.values(dias).slice(0, 5);
    listaDias.forEach(function(item) {
        const fecha = new Date(item.dt * 1000);
        const dia = fecha.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" });
        const temperatura = Math.round(item.main.temp);
        const icono = item.weather[0].icon;
        const descripcion = item.weather[0].description;
        
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-pronostico";
        tarjeta.innerHTML = `
            <h3>${dia}</h3>
            <img src="https://openweathermap.org/img/wn/${icono}@2x.png" alt="${descripcion}">
            <p>${descripcion}</p>
            <p class="temp">${temperatura}°C</p>
            <p>💧 ${item.main.humidity}%</p>
        `;
        pronosticoTarjetas.appendChild(tarjeta);
    });
}

// GUARDAR HISTORIAL
function guardarHistorial(ciudad) {
    let historial = JSON.parse(localStorage.getItem("historialClima")) || [];
    historial = historial.filter(function(item) {
        return item.toLowerCase() !== ciudad.toLowerCase();
    });
    historial.unshift(ciudad);
    historial = historial.slice(0, 5);
    localStorage.setItem("historialClima", JSON.stringify(historial));
    mostrarHistorial();
}

// MOSTRAR HISTORIAL
function mostrarHistorial() {
    historialBotones.innerHTML = "";
    const historial = JSON.parse(localStorage.getItem("historialClima")) || [];
    historial.forEach(function(ciudad) {
        const boton = document.createElement("button");
        boton.textContent = ciudad;
        boton.addEventListener("click", function() {
            inputCiudad.value = ciudad;
            buscarClima(ciudad);
        });
        historialBotones.appendChild(boton);
    });
}

// BOTÓN DE UBICACIÓN
btnUbicacion.addEventListener("click", function() {
    if (!navigator.geolocation) {
        estado.textContent = "❌ Tu navegador no permite obtener la ubicación.";
        return;
    }
    estado.textContent = "📍 Obteniendo tu ubicación...";
    navigator.geolocation.getCurrentPosition(
        function(posicion) {
            const lat = posicion.coords.latitude;
            const lon = posicion.coords.longitude;
            buscarClimaPorCoordenadas(lat, lon);
        },
        function(error) {
            console.error("Error de ubicación:", error);
            estado.textContent = "❌ No se pudo obtener tu ubicación.";
        }
    );
});

// BUSCAR CLIMA POR COORDENADAS
async function buscarClimaPorCoordenadas(lat, lon) {
    estado.textContent = "📍 Consultando clima de tu ubicación...";
    resultado.innerHTML = "";
    pronosticoTarjetas.innerHTML = "";
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        if (!respuesta.ok) {
            throw new Error(datos.message || "Error al obtener el clima");
        }
        
        mostrarClima(datos);
        guardarHistorial(datos.name);
        buscarPronostico(lat, lon);
        estado.textContent = "";
    } catch (error) {
        console.error("ERROR:", error);
        estado.textContent = "❌ Error: " + error.message;
    }
}

// MODO OSCURO
btnTema.addEventListener("click", function() {
    document.body.classList.toggle("modo-oscuro");
    if (document.body.classList.contains("modo-oscuro")) {
        btnTema.textContent = "☀️ Modo Claro";
        localStorage.setItem("tema", "oscuro");
    } else {
        btnTema.textContent = "🌙 Modo Oscuro";
        localStorage.setItem("tema", "claro");
    }
});

// CARGAR TEMA GUARDADO
function cargarTema() {
    const tema = localStorage.getItem("tema");
    if (tema === "oscuro") {
        document.body.classList.add("modo-oscuro");
        btnTema.textContent = "☀️ Modo Claro";
    }
}

// INICIAR
mostrarHistorial();
cargarTema();