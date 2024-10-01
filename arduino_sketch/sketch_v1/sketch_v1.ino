/*
 * Arduino wiring:
 *
 * Digital pin  Connected to
 * -----------  ------------
 * 2            Sensor 0
 * 3            Sensor 1
 * 4            Sensor 2
 * 5            Sensor 3
 */

int statusLEDPin = 13;
boolean isRace = false;
char val = 0;
char val1 = 0;

void checkSerial() {
  if (Serial.available() > 0) {
    val = Serial.read();
    val1 = val;
    if (val == '1') {
      isRace = true;
      digitalWrite(13, HIGH);
    }
    if (val == '0') {
      digitalWrite(13, LOW);
      isRace = false;
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(13, OUTPUT);
}

void loop() {
  checkSerial();
  Serial.println(val1);
}