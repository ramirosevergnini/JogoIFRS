const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const vehicleImages = {
    carTaxi: new Image(),
    carVerde: new Image(),
    carVermelho: new Image(),
    motoColorida: new Image(),
    motoVermelha: new Image(),
    motoVermelhaPreta: new Image(),
};

vehicleImages.carTaxi.src = './imagens/carroTaxi.png';
vehicleImages.carVerde.src = './imagens/carroVerde.png';
vehicleImages.carVermelho.src = './imagens/carroVermelho.png';
vehicleImages.motoColorida.src = './imagens/motoColorida.png';
vehicleImages.motoVermelha.src = './imagens/motoVermelha.png';
vehicleImages.motoVermelhaPreta.src = './imagens/motoVermelhaPreta.png';

const frogImages = {
    parado: new Image(),
    andar1: new Image(),
    andar2: new Image()
};
frogImages.parado.src = './imagens/sapoParado.png';
frogImages.andar1.src = './imagens/sapoAndar1.png';
frogImages.andar2.src = './imagens/sapoAndar2.png';

let currentFrogImage = frogImages.parado;
let frogIsMoving = false;
let walkToggle = true;

const frog = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 50,
    width: 45,
    height: 45,
    speed: 20
};

const cars = [];
const carWidth = 70;
const carHeight = 45;

const lanes = [
    { y: 120, speed: 2 },
    { y: 280, speed: -3 },
    { y: 400, speed: 2 },
    { y: 550, speed: -4 },
];

let level = 1; // Nível inicial
const difficultySettings = [
    { carSpawnRate: 0.02, carSpeed: 6 }, // Nível 1
    { carSpawnRate: 0.03, carSpeed: 2 }, // Nível 2
    { carSpawnRate: 0.05, carSpeed: 4 }, // Nível 3
    { carSpawnRate: 0.07, carSpeed: 5 }, // Nível 4
    { carSpawnRate: 0.1, carSpeed: 6 } // Nível 5
];

const logs = [];
const logWidth = 100;
const logHeight = 30;

let isGameOver = false;

function moveFrog(e) {
    frogIsMoving = true; // Sapo começou a se mover

    if (e.key === 'ArrowUp') frog.y -= frog.speed;
    if (e.key === 'ArrowDown') frog.y += frog.speed;
    if (e.key === 'ArrowLeft') frog.x -= frog.speed;
    if (e.key === 'ArrowRight') frog.x += frog.speed;

    // Alterna entre sapoAndar1 e sapoAndar2
    if (walkToggle) {
        currentFrogImage = frogImages.andar1;
    } else {
        currentFrogImage = frogImages.andar2;
    }
    walkToggle = !walkToggle; // Troca o estado do walkToggle
}

window.addEventListener('keyup', () => {
    frogIsMoving = false; // Sapo parou
    currentFrogImage = frogImages.parado; // Volta para a imagem do sapo parado
});

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

const vehicleTypes = [
    vehicleImages.carTaxi,
    vehicleImages.carVerde,
    vehicleImages.carVermelho,
    vehicleImages.motoColorida,
    vehicleImages.motoVermelha,
    vehicleImages.motoVermelhaPreta
];

function addCars() {
    const { carSpawnRate, carSpeed } = difficultySettings[level - 1];

    lanes.forEach(lane => {
        if (Math.random() < carSpawnRate) {
            const randomVehicleImage = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
            cars.push({
                x: lane.speed > 0 ? -carWidth : canvas.width,
                y: lane.y,
                width: carWidth,
                height: carHeight,
                speed: lane.speed * carSpeed, // Ajusta a velocidade dos carros
                image: randomVehicleImage
            });
        }
    });
}

function updateCars() {
    cars.forEach((car, index) => {
        car.x += car.speed;

        if (car.x > canvas.width + carWidth || car.x < -carWidth) {
            cars.splice(index, 1);
        }

        if (checkCollision(car, frog)) {
            isGameOver = true;
        }
    });
}

function updateLogs() {
    logs.forEach((log, index) => {
        log.x += log.speed;

        if (log.x > canvas.width + logWidth || log.x < -logWidth) {
            logs.splice(index, 1);
        }
    });
}

function checkWaterCollision() {
    if (level >= 3) {
        const onLog = logs.some(log => checkCollision(log, frog));
        if (!onLog && frog.y < 300) { // Supondo que o lago é no nível 3 e começa na y = 300
            isGameOver = true;
        }
    }
}

function checkLevelCompletion() {
    if (frog.y < 0) {
        level++;
        frog.y = canvas.height - 50; // Reseta a posição do sapo
        if (level > difficultySettings.length) {
            // Fim do jogo ou outras ações finais
            alert('Parabéns! Você venceu o jogo!');
            window.location.reload();
            return;
        }

        if (level >= 3) {
            startLakes();
        }
    }
}

function startLakes() {
    // Inicializa o lago e troncos
    lanes.forEach(lane => {
        if (lane.y === 300) { // Supondo que o lago é no nível 3
            logs.push({
                x: canvas.width,
                y: lane.y,
                width: logWidth,
                height: logHeight,
                speed: lane.speed
            });
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha as ruas
    lanes.forEach(lane => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, lane.y, canvas.width, carHeight);

        // Desenha as listras amarelas
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(i, lane.y + carHeight / 2 - 2, 20, 4);
        }
    });

    // Desenha os troncos
    if (level >= 3) {
        logs.forEach(log => {
            ctx.fillStyle = 'brown'; // Ou a cor/imagem do tronco
            ctx.fillRect(log.x, log.y, log.width, log.height);
        });
    }

    // Desenha o sapo com a imagem atual
    ctx.drawImage(currentFrogImage, frog.x, frog.y, frog.width, frog.height);

    // Desenha os veículos com a imagem associada
    cars.forEach(car => {
        ctx.drawImage(car.image, car.x, car.y, car.width, car.height);
    });
}

// Loop do jogo
function gameLoop() {
    if (isGameOver) {
        alert('Game Over! Tente novamente.');
        window.location.reload();
        return;
    }

    addCars();
    updateCars();
    if (level >= 3) updateLogs(); // Atualiza troncos no nível 3 e acima
    checkLevelCompletion();
    checkWaterCollision();
    draw();

    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', moveFrog);
gameLoop();
