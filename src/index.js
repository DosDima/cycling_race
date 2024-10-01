const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let isStart = false;
const startBtn = document.getElementById("btn-start");
const stopBtn = document.getElementById("btn-stop");
const sendBtn = document.getElementById("btn-send");
const indicator = document.getElementById("race-indicator");
const inp = document.getElementById("inp");

const port = new SerialPort({
  path: "COM3",
  baudRate: 115200,
  autoOpen: false,
  dataBits: 8,
  stopBits: 1,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const openPort = () => {
  port.open((err) => {
    if (err) alert(`Failed to open port. Error: ${err}`);
  });
};

const closePort = () => {
  port.close((err) => {
    if (err) alert(`Failed to close port. Error: ${err}`);
  });
};

const getData = () => {
  parser.on("data", (data) => {
    document.querySelector("#data").innerHTML = data;
  });
};

const startRace = () => {
  openPort();
  isStart = true;
  getData();
  indicator.classList.add("indicator_active");
};

const stopRace = () => {
  closePort();
  isStart = false;
  indicator.classList.remove("indicator_active");
};

const sendVal = () => {
  const val = inp.value;

  port.write(val, (err) => {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
    console.log(`message written ${val}`);
  });
};

startBtn.addEventListener("click", startRace);
stopBtn.addEventListener("click", stopRace);
sendBtn.addEventListener("click", sendVal);
