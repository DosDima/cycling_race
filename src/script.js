const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const openPopapBtn = document.getElementById("btn_open_popap");
const startRaceBtn = document.getElementById("btn_start_race");
const indicator = document.getElementById("race_indicator");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const popap = document.getElementById("popap");
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
const winName = document.getElementById("win_name");
const winTime = document.getElementById("win_time");
const winPopap = document.getElementById("win_popap");
const winDistance = document.getElementById("win_distance");

let isStart = false;
let time = 0;
let DISTANCE = 0;
let timeMilisec = 0;
let timeSec = 0;
let timeMinutes = 0;
let timerId;
let riders = [];
let stringTime = '00.00.0'

const port = new SerialPort({
  path: "COM4",
  baudRate: 115200,
  autoOpen: false,
  dataBits: 8,
  stopBits: 1,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

class Rider {
  constructor(x, y, width, height, color, name, radius = 17, distance = 0) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name;
    this.radius = radius;
    this.distance = distance;
  }

  init() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(newX) {
    ctx.clearRect(this.x, this.y, this.width, this.height);
    this.x = newX;
    this.distance = newX * this.radius;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const init = () => {
  openPort();
};

const openPort = async () => {
  port.open((err) => {
    if (err) alert(`Failed to open port. Error: ${err}`);
    return false;
  });
  getDataFromPort();
  return true;
};

const closePort = () => {
  port.close((err) => {
    if (err) alert(`Failed to close port. Error: ${err}`);
    return false;
  });
  return true;
};

const getDataFromPort = () => {
  parser.on("data", (data) => {
    indicator.classList.toggle("indicator__active");
    const arr = data.split(":");
    for (let i = 0; i < riders.length; i++) {
      riders[i].update(arr[i]);
    }
  });
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

  winName.innerText = `Победитель: ${riders[0].name}`;
  winTime.innerText = `Время: ${stringTime}`;
  winDistance.innerText = `Дистанция: ${DISTANCE} m.`;

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

  riders.forEach((rider) => {
    if (rider.distance >= DISTANCE) {
      stopRace();
    }
  });
};

const startRace = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  riders[0] = new Rider(10, 0, 50, 50, "red");
  riders[1] = new Rider(10, 100, 50, 50, "red");
  riders.forEach((rider) => rider.init());
  
  DISTANCE = parseInt(inputDistance?.value) || 250;
  
  riders[0].name = inputName1?.value || "rider 1";
  riders[1].name = inputName2?.value || "rider 2";
  
  riders[0].radius = parseInt(inputRad1?.value) || 17;
  riders[1].radius = parseInt(inputRad2?.value) || 17;
  
  tName1.innerText = riders[0].name;
  tName2.innerText = riders[1].name;
  
  isStart = true;
  
  raceTime.innerText = `00:00:0`;
  indicator.classList.add("indicator__active");
  popap.classList.remove("popap__overlay_active");
  
  timerId = setInterval(update, 100);

  sendToPort("1");
};

const openPopapBtnHndler = async () => {
  if (isStart) {
    stopRace();
  } else {
    
    popap.classList.add("popap__overlay_active");
  }
};

winPopap.addEventListener("click", () => {
  winPopap.classList.remove("popap__overlay_active");
});

openPopapBtn.addEventListener("click", openPopapBtnHndler);
startRaceBtn.addEventListener("click", startRace);

window.addEventListener("load", init);
