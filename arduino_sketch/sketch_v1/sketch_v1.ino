void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("A");
  delay(100);
  Serial.println("B");
  delay(100);
  Serial.println("C");
  digitalWrite(13, LOW);
  delay(1000);
}