const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const openPopapBtn = document.getElementById("btn_open_popap");
const startRaceBtn = document.getElementById("btn_start_race");
const indicator = document.getElementById("race_indicator");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const raceTime = document.getElementById("race_time");
const inputDistance = document.getElementById("distance");
const inputName1 = document.getElementById("rider_1_name");
const inputName2 = document.getElementById("rider_2_name");
const inputRad1 = document.getElementById("rider_1_r");
const inputRad2 = document.getElementById("rider_2_r");
const tName1 = document.getElementById("t_mame_1");
const tName2 = document.getElementById("t_mame_2");
const tDist1 = document.getElementById("t_dist_1");
const tDist2 = document.getElementById("t_dist_2");
const startPopap = document.getElementById("start_popap");
const winPopap = document.getElementById("win_popap");
const winName = document.getElementById("win_name");
const winTime = document.getElementById("win_time");
const winDistance = document.getElementById("win_distance");

let isStart = false;
let time = 0;
let DISTANCE = 0;
let timeMilisec = 0;
let timeSec = 0;
let timeMinutes = 0;
let timerId;
let riders = [];
let stringTime = "00.00.0";
let drowCof = 0;

const port = new SerialPort({
  path: "COM4",
  baudRate: 115200,
  autoOpen: false,
  dataBits: 8,
  stopBits: 1,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

class Rider {
  constructor(x, y, width, height, name, mph, distance, image) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.name = name;
    this.mph = mph;
    this.distance = distance;
    this.image = image;
  }

  update(newX) {
    this.x = newX;
    const img = new Image(this.width, this.height);
    img.src = this.image;
    this.distance = (newX * 2136) / 1000;
    ctx.drawImage(
      img,
      this.distance * drowCof,
      this.y,
      this.width,
      this.height
    );
  }
}

const init = () => {
  openPort();
};

const closePort = () => {
  port.close((err) => {
    if (err) alert(`Failed to close port. Error: ${err}`);
    return false;
  });
  return true;
};

const sendToPort = (val) => {
  port.write(val, (err) => {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
  });
};

const stopRace = () => {
  sendToPort("0");
  isStart = false;
  clearInterval(timerId);

  time = 0;
  timeMilisec = 0;
  timeSec = 0;
  timeMinutes = 0;

  winPopap.classList.add("popap__overlay_active");
  indicator.classList.remove("indicator__active");
};

const update = () => {
  if (!isStart) return;

  time++;
  timeSec += 0.1;
  if (timeSec > 59) {
    timeSec = 0;
    timeMinutes++;
  }
  timeMilisec = time % 10;
  stringTime = `${timeMinutes > 9 ? timeMinutes : `0${timeMinutes}`}:${
    timeSec > 10 ? Math.floor(timeSec) : `0${Math.floor(timeSec)}`
  }:${timeMilisec}`;

  raceTime.innerText = stringTime;
  tDist1.innerText = riders[0].distance;
  tDist2.innerText = riders[1].distance;
};

const startRace = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  DISTANCE = parseInt(inputDistance?.value) || 250;
  drowCof = 1100 / DISTANCE;

  riders[0] = new Rider(
    0,
    40,
    100,
    64,
    inputName1?.value,
    parseInt(inputRad1?.value),
    0,
    "./assets/picture/racer_1.png"
  );
  riders[1] = new Rider(
    0,
    150,
    100,
    64,
    inputName2?.value,
    parseInt(inputRad2?.value),
    0,
    "./assets/picture/racer_2.png"
  );

  timerId = setInterval(update, 100);

  sendToPort("1");

  isStart = true;

  raceTime.innerText = `00:00:0`;
  tName1.innerText = riders[0].name;
  tName2.innerText = riders[1].name;
  indicator.classList.add("indicator__active");
  startPopap.classList.remove("popap__overlay_active");
};

const getDataFromPort = () => {
  parser.on("data", (data) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    indicator.classList.toggle("indicator__active");
    const arr = data.split(":");
    for (let i = 0; i < riders.length; i++) {
      riders[i].update(arr[i]);
      if (riders[i].distance >= DISTANCE) {
        winName.innerText = `Победитель: ${riders[i].name}`;
        winTime.innerText = `Время: ${stringTime}`;
        winDistance.innerText = `Дистанция: ${DISTANCE} m.`;
        stopRace();
      }
    }
    update();
  });
};

const openPort = async () => {
  port.open((err) => {
    if (err) alert(`Failed to open port. Error: ${err}`);
    return false;
  });
  getDataFromPort();
  return true;
};

const openStartPopapBtnHndler = async () => {
  if (isStart) {
    stopRace();
  } else {
    startPopap.classList.add("popap__overlay_active");
  }
};

winPopap.addEventListener("click", () => {
  winPopap.classList.remove("popap__overlay_active");
});

openPopapBtn.addEventListener("click", openStartPopapBtnHndler);
startRaceBtn.addEventListener("click", startRace);

window.addEventListener("load", init);
window.addEventListener("beforeunload", closePort);
