bool isRace = false;

int pin_A = A0;

char PC_COMMAND = 0;

unsigned long A = 0;
int read_A = 0;
int old_A = 0;

unsigned long B = 100;
unsigned long C = 200;
unsigned long D = 300;

unsigned long time;
unsigned long timeFromtart;
unsigned long delayTime = 100;

void startRace() {
  isRace = true;
  digitalWrite(13, HIGH);
}

void stopRace() {
  isRace = false;
  A = 0;
  B = 0;
  C = 0;
  D = 0;
  digitalWrite(13, LOW);
}

void getCommandFromSerial() {
  if (Serial.available() > 0) {
    PC_COMMAND = Serial.read();

    if (PC_COMMAND == '1') {
      startRace();
    }
    if (PC_COMMAND == '0') {
      stopRace();
    }
  }
}

void sendDataToSerial() {
  if (Serial.availableForWrite() > 0) {
    Serial.print(A);
    Serial.print(":");
    Serial.print(B);
    Serial.print(":");
    Serial.print(C);
    Serial.print(":");
    Serial.print(D);
    Serial.println();
  }
}

void checkA() {
  old_A = read_A;
  read_A = analogRead(pin_A);
  if ((read_A - old_A) > 900) A++;
}

void setup() {
  Serial.begin(115200);
  pinMode(13, OUTPUT);
  pinMode(pin_A, INPUT);
}

void loop() {
  getCommandFromSerial();


  if (isRace == true) {
    checkA();
    timeFromtart = millis();
    if (timeFromtart - time > delayTime) {
      sendDataToSerial();
      time = timeFromtart;
    }
  }
}
