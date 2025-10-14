const canvas = document.getElementById("gauge");
const ctx = canvas.getContext("2d");
const input = document.getElementById("velocidad");
const valor = document.getElementById("valor");

const centerX = 200;
const centerY = 200;
const radius = 150;

// Rangos de color del velocímetro (KIAS)
const rangos = [
    {min: 0, max: 150, color: "#ffffff"},    // Blanco
    {min: 150, max: 330, color: "#00ff00"},  // Verde
    {min: 330, max: 400, color: "#ffaa00"},  // Amarillo
    {min: 400, max: 450, color: "#ff0000"}   // Rojo
];

// Conversión aproximada KIAS -> Mach
function kiasToMach(kias) {
    return (kias / 661).toFixed(2);
}

// Mapear 0-450 KIAS a ángulo 0-2π
function mapAngle(value) {
    return (value / 450) * 2 * Math.PI;
}

// Dibujar arco de velocímetro
function dibujarArco(start, end, color, grosor){
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, start - Math.PI/2, end - Math.PI/2, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.stroke();
}

// Dibujar velocímetro completo
function dibujarVelocimetro(speed) {
    ctx.clearRect(0, 0, 400, 400);

    // Fondo gris
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2*Math.PI);
    ctx.fillStyle = "#222";
    ctx.fill();

    // Dibujar arcos de colores
    rangos.forEach(r => {
        let start = mapAngle(r.min);
        let end = mapAngle(r.max);
        dibujarArco(start, end, r.color, 20);
    });

    // Dibujar números cada 50 KIAS
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    for(let i=0;i<=450;i+=50){
        let angle = mapAngle(i) - Math.PI/2;
        let x = centerX + Math.cos(angle)*(radius-30);
        let y = centerY + Math.sin(angle)*(radius-30);
        ctx.fillText(i, x, y);
    }

    // Aguja
    let angleNeedle = mapAngle(speed) - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angleNeedle)*(radius-40), centerY + Math.sin(angleNeedle)*(radius-40));
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Centro
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2*Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ventanita Mach
    ctx.fillStyle = "#00ffff";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Mach: " + kiasToMach(speed), centerX, centerY+6);
}

// Evento slider
input.addEventListener("input", ()=>{
    let v = parseInt(input.value);
    valor.textContent = v;
    dibujarVelocimetro(v);
});

// Inicial
dibujarVelocimetro(0);
