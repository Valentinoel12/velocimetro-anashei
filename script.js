const canvas = document.getElementById("gauge");
const ctx = canvas.getContext("2d");
const valor = document.getElementById("valor");
const input = document.getElementById("velocidad");

function dibujarVelocimetro(speed) {
    const centerX = 200;
    const centerY = 200;
    const radius = 150;

    ctx.clearRect(0, 0, 400, 400);

    // Escala: 0 a 450 (desde 135° a 45°)
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 0.25;

    // Arco blanco (flaps): 0 - 250
    dibujarArco(startAngle, map(250, 0, 450, startAngle, endAngle), "#ffffff", 15);

    // Arco verde (operación normal): 250 - 330
    dibujarArco(map(250, 0, 450, startAngle, endAngle), map(330, 0, 450, startAngle, endAngle), "#00ff00", 15);

    // Arco ámbar (precaución): 330 - 400
    dibujarArco(map(330, 0, 450, startAngle, endAngle), map(400, 0, 450, startAngle, endAngle), "#ffaa00", 15);

    // Arco rojo (velocidad máxima): 400 - 450
    dibujarArco(map(400, 0, 450, startAngle, endAngle), endAngle, "#ff0000", 15);

    // Números
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    for (let i = 0; i <= 450; i += 50) {
        const angle = map(i, 0, 450, startAngle, endAngle);
        const x = centerX + Math.cos(angle) * (radius - 30);
        const y = centerY + Math.sin(angle) * (radius - 30);
        ctx.fillText(i, x, y);
    }

    // Aguja
    const angle = map(speed, 0, 450, startAngle, endAngle);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * (radius - 20), centerY + Math.sin(angle) * (radius - 20));
    ctx.stroke();

    // Centro
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Texto de velocidad
    ctx.font = "bold 24px Arial";
    ctx.fillText(speed + " KIAS", centerX, centerY + 80);
}

function dibujarArco(start, end, color, grosor) {
    ctx.beginPath();
    ctx.arc(200, 200, 150, start, end, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.stroke();
}

function map(value, min1, max1, min2, max2) {
    return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1);
}

input.addEventListener("input", () => {
    const velocidad = parseInt(input.value);
    valor.textContent = velocidad;
    dibujarVelocimetro(velocidad);
});

// Dibuja inicial
dibujarVelocimetro(0);
