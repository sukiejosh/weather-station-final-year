#include <ArduinoJson.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_BMP085.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "DHT.h"

#define LED0 12
#define LED1 14 
#define DSPIN 23
#define DHTPIN 4
#define DHTTYPE DHT22
#define LOGTIMER 300000
#define DEBOUNCE_TIME 15
#define RAIN_PIN 18
#define WINDSPD_PIN 19
#define RXD2 16
#define TXD2 17

unsigned long cms, pms;
int anemometerCounter = 0;
int rainCounter = 0;
unsigned long last_micros_rg;
unsigned long last_micros_an;
const char *WiFi_ssid = "unilorinweatherstation";
const char *WiFi_password = "24680246";
const char *serverName = "https://weather-data-2.fly.dev/weather/64b411d8829834e03c49fa40?token=MQ1X82mjve";
float longitude = 0, latitude = 0;

StaticJsonDocument<1024> doc;
Adafruit_BMP085 bmp;
DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
OneWire oneWire(DSPIN);
DallasTemperature dsSensor(&oneWire);

float getRain() {
  float rain = 0.2794 * rainCounter;

  rainCounter = 0;
  return (rain);
}

float getSpeed() {
  float spd = 0.6667 * anemometerCounter / (LOGTIMER / 1000);

  anemometerCounter = 0;
  return (spd);
}

bool readLocation(float& latitude, float& longitude) {
  unsigned long c, p;
  
  c = millis();
  p = c;

  while (c - p <= 10000) {
    while (gpsSerial.available() > 0) {
      if (gps.encode(gpsSerial.read())) {
        if (gps.location.isValid()) {
          // Get latitude and longitude
          latitude = gps.location.lat();
          longitude = gps.location.lng();

          return true;
        } 
      }
    }
    c = millis();
  }
  return false;
}

void readData()
{
  readLocation(latitude, longitude);
  dsSensor.requestTemperatures();
  doc["temp"] = dsSensor.getTempCByIndex(0);
  doc["humidity"] = dht.readHumidity();
  doc["pressure"] = bmp.readPressure();
  doc["rainfall"] = getRain();
  doc["windspeed"] = getSpeed();
  doc["lat"] = latitude;
  doc["long"] = longitude;
}

void postData()
{
  unsigned long cms, pms;
  int httpResponse;
  String json;
  HTTPClient http;
  
  cms = millis();
  pms = cms;
  
  while (cms - pms <= 5000) {
    if (WiFi.status() == WL_CONNECTED) {
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");
      serializeJson(doc, json);
      httpResponse = http.POST(json);
      digitalWrite(LED1, HIGH);
      delay(200);
      digitalWrite(LED1, LOW);
      delay(200);
      http.end();
      break;
    }
    cms = millis();
  }
}

//interrupt service routines
void IRAM_ATTR countRain()
{
  if((long)(micros() - last_micros_rg) >= DEBOUNCE_TIME * 1000)
  {
    rainCounter++;
    last_micros_rg = micros();
  }
}

void IRAM_ATTR countAnemometer()
{
  if((long)(micros() - last_micros_an) >= DEBOUNCE_TIME * 1000)
  {
    anemometerCounter++;
    last_micros_an = micros();
  }
}

void setup()
{
  pinMode(LED0, OUTPUT);
  pinMode(LED1, OUTPUT);
  pinMode(RAIN_PIN, INPUT_PULLUP);
  pinMode(WINDSPD_PIN, INPUT_PULLUP);
  attachInterrupt(RAIN_PIN, countRain, FALLING);
  attachInterrupt(WINDSPD_PIN, countAnemometer, FALLING);
  digitalWrite(LED0, HIGH);
  digitalWrite(LED1, HIGH);
  bmp.begin();
  dht.begin();
  dsSensor.begin(); 
  gpsSerial.begin(9600, SERIAL_8N1, RXD2, TXD2);
  WiFi.begin(WiFi_ssid, WiFi_password);
  while (WiFi.status() != WL_CONNECTED)
    delay(1000);

  digitalWrite(LED1, LOW);
  pms = millis();
  readData();
  postData();
}

void loop()
{
  cms = millis();
  if (cms - pms >= LOGTIMER) {
    readData();
    postData();
    
    pms = cms;
  }
}
