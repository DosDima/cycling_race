const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const startBtn = document.getElementById("btn-start");
const startRaceBtn = document.getElementById("btn-start-race");
const indicator = document.getElementById("race-indicator");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const popap = document.getElementById("popap");
const raceTime = document.getElementById("race_time");

let isStart = false;
const ryders = [];

const port = new SerialPort({
  path: "COM4",
  baudRate: 115200,
  autoOpen: false,
  dataBits: 8,
  stopBits: 1,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

class Rider {
  constructor(x, y, width, height, color) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  init() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(newX) {
    ctx.clearRect(this.x, this.y, this.width, this.height);
    this.x = newX;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const initRyders = () => {
  ryders.push(new Rider(10, 0, 50, 50, "red"));
  ryders.push(new Rider(10, 100, 50, 50, "red"));
  ryders.forEach((rider) => rider.init());
};

const updateRiders = (data) => {
  for (let i = 0; i < ryders.length; i++) {
    ryders[i].update(data[i]);
  }
};

const openPort = () => {
  port.open((err) => {
    if (err) alert(`Failed to open port. Error: ${err}`);
    return false;
  });
  return true;
};

const closePort = () => {
  port.close((err) => {
    if (err) alert(`Failed to close port. Error: ${err}`);
    return false;
  });
  return true;
};

const startBtnHndler = () => popap.classList.add("popap__overlay_active");

const startRace = () => {
  const isOpen = openPort();
  if (!isOpen) return;
  isStart = true;
  raceTime.innerText = `00:00:00`;

  sendToPort("1");
  getDataFromPort();

  indicator.classList.add("indicator__active");
  popap.classList.remove("popap__overlay_active");
};

const stopRace = () => {
  isStart = false;
  sendToPort("0");
  const isClose = closePort();
  if (!isClose) return;
  indicator.classList.remove("indicator__active");
};

const getDataFromPort = () => {
  parser.on("data", (data) => {
    const ridersData = data.split(":");
    updateRiders(ridersData);
  });
};

const sendToPort = (val) => {
  port.write(val, (err) => {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
  });
};

startBtn.addEventListener("click", startBtnHndler);
startRaceBtn.addEventListener("click", startRace);
window.addEventListener("load", initRyders);
