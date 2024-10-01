const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const btnClose = document.getElementById("btn-close");
const btnData = document.getElementById("btn-data");

const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
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
    if (err) {
      alert("Failed to open port.");
    } else {
      alert("PORT is OPEN!");
    }
  });
};

const getData = () => {
  if (!port.isOpen) openPort();

  parser.on("data", (data) => {
    document.querySelector("#data").innerHTML = data;
  });
};

btnClose.addEventListener("click", closePort);
btnData.addEventListener("click", getData);
