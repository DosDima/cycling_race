const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let isStart = false;
const racers = [];

const startBtn = document.getElementById("btn-start");
const stopBtn = document.getElementById("btn-stop");
const indicator = document.getElementById("race-indicator");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const port = new SerialPort({
  path: "COM4",
  baudRate: 115200,
  autoOpen: false,
  dataBits: 8,
  stopBits: 1,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

class Square {
  constructor(x, y, height, width, color) {
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

  update(new_x) {
    ctx.clearRect(this.x, this.y, this.width, this.height);
    this.x = new_x;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const init = () => {
  racers.push(new Square(10, 0, 50, 50, "red"));
  racers.push(new Square(10, 100, 50, 50, "red"));
  racers.push(new Square(10, 200, 50, 50, "red"));
  racers.push(new Square(10, 300, 50, 50, "red"));
  racers.forEach((x) => x.init());
};

const updateRacersData = (data) => {
  for (let i = 0; i < racers.length; i++) {
    racers[i].update(data[i]);
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

const getDataFromSerial = () => {
  parser.on("data", (data) => {
    const racersData = data.split(":");
    updateRacersData(racersData);
  });
};

const startRace = () => {
  const isOpen = openPort();
  if (!isOpen) return;
  isStart = true;
  sendValToPort("1");
  getDataFromSerial();
  indicator.classList.add("indicator__active");
};

const stopRace = () => {
  isStart = false;
  sendValToPort("0");
  const isClose = closePort();
  if (!isClose) return;
  indicator.classList.remove("indicator__active");
};

const sendValToPort = (val) => {
  port.write(val, (err) => {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
    console.log(`message written ${val}`);
  });
};

startBtn.addEventListener("click", startRace);
stopBtn.addEventListener("click", stopRace);

window.addEventListener("load", init);
