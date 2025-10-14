const canvas = document.getElementById("gauge");
const ctx = canvas.getContext("2d");
const input = document.getElementById("velocidad");
const valor = document.getElementById("valor");

const centerX = 200;
const centerY = 200;
const radius = 150;

function map(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

// Conversion KIAS -> Mach aprox (Mach 1 ~ 661 KIAS a nivel del mar)
function kiasToMach(kias) {
    return (kias / 661).toFixed(2);
}

function dibujarVelocimetro(speed) {
    ctx.clearRect(0, 0, 400, 400);

    // Dibujar círculos de fondo
    dibujarArco(0, Math.PI*2, "#333333", 20); // fondo gris
    dibujarArco(0, map(150, 0, 450, 0, Math.PI*2), "#ffffff", 20); // blanco
    dibujarArco(map(150,0,450,0,Math.PI*2), map(330,0,450,0,Math.PI*2), "#00ff00", 20); // verde
    dibujarArco(map(330,0,450,0,Math.PI*2), map(400,0,450,0,Math.PI*2), "#ffaa00", 20); // amarillo
    dibujarArco(map(400,0,450,0,Math.PI*2), map(450,0,450,0,Math.PI*2), "#ff0000", 20); // rojo

    // Números cada 50 KIAS
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    for(let i=0;i<=450;i+=50){
        const angle = map(i,0,450,0,Math.PI*2) - Math.PI/2;
        const x = centerX + Math.cos(angle)*(radius-30);
        const y = centerY + Math.sin(angle)*(radius-30);
        ctx.fillText(i, x, y);
    }

    // Aguja
    const angle = map(speed,0,450,0,Math.PI*2) - Math.PI/2;
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle)*(radius-40), centerY + Math.sin(angle)*(radius-40));
    ctx.stroke();

    // Centro
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI*2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ventanita Mach
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px Arial";
    const mach = kiasToMach(speed);
    ctx.fillText("Mach: " + mach, centerX, centerY+6);
}

function dibujarArco(start, end, color, grosor){
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, start - Math.PI/2, end - Math.PI/2, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.stroke();
}

input.addEventListener("input", ()=>{
    const velocidad = parseInt(input.value);
    valor.textContent = velocidad;
    dibujarVelocimetro(velocidad);
});

// Inicial
dibujarVelocimetro(0);
