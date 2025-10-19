const canvas = document.getElementById("velocimetro");
const ctx = canvas.getContext("2d");
const input = document.getElementById("velocidad");
const valor = document.getElementById("valor");

const height = canvas.height;
const width = canvas.width;

// Rangos de color del velocímetro (KIAS)
const rangos = [
    {min: 0, max: 150, color: "#ffffff"},   // Blanco
    {min: 150, max: 330, color: "#00ff00"}, // Verde
    {min: 330, max: 400, color: "#ffaa00"}, // Amarillo
    {min: 400, max: 450, color: "#ff0000"}  // Rojo
];

// Conversión KIAS -> Mach
function kiasToMach(kias) {
    return (kias / 661).toFixed(2);
}

// Convierte velocidad a posición vertical (de abajo hacia arriba)
function mapY(value) {
    const ratio = value / 450;
    return height - (ratio * (height - 20));
}

// Dibuja el velocímetro completo
function dibujarVelocimetro(velocidad) {
    ctx.clearRect(0, 0, width, height);

    // Fondo oscuro
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);

    // Franjas de color
    rangos.forEach(r => {
        const y1 = mapY(r.max);
        const y2 = mapY(r.min);
        ctx.fillStyle = r.color;
        ctx.fillRect(20, y1, 80, y2 - y1);
    });

    // Marco exterior
    ctx.strokeStyle = "#00aaff";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 10, 80, height - 20);

    // Aguja horizontal (indicador)
    const y = mapY(velocidad);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(10, y - 2, 100, 4);

    // Texto velocidad actual
    ctx.fillStyle = "#00ffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(velocidad + " KIAS", width / 2, y - 10);

    // Ventanita Mach
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#00ffaa";
    ctx.fillText("Mach " + kiasToMach(velocidad), width / 2, height - 10);
}

// Evento slider
input.addEventListener("input", () => {
    const v = parseInt(input.value);
    valor.textContent = v;
    dibujarVelocimetro(v);
});

// Inicial
dibujarVelocimetro(0);
