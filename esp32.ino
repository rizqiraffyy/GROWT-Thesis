#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/* ==================== WIFI ==================== */
const char* WIFI_SSID     = "dc";
const char* WIFI_PASSWORD = "password";

/* ==================== API ===================== */
const char* API_URL     = "https://growt-farm.vercel.app/api/iot/weights";
const char* IOT_API_KEY = "growt_9uB7pF23LzQ0dN5sX1kA3vZc8Yh4";

/* ==================== DEVICE (ESP1) ==================== */
String DEVICE_SERIAL     = "SN-1769434254-A-SEED-0231";   // tampil di OLED (4 digit terakhir)
String RFID_VALID        = "RF-1769434254-A-SEED-0005";   // valid + milik owner device
String RFID_NOTFOUND     = "RF-NOT-FOUND-0000";           // sengaja tidak ada
String RFID_OTHER_OWNER  = "63BE1501";                    // exist tapi bukan milik device owner (C18)

/* ==================== OLED 128x64 ==================== */
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int I2C_SDA = 16;
const int I2C_SCL = 17;
const uint8_t OLED_ADDR = 0x3C;
bool oledReady = false;

/* ==================== LOAD TEST ==================== */
const uint32_t SEND_INTERVAL_MS = 200;

enum CaseId { C1 = 1, C3 = 3, C5 = 5, C7 = 7, C12 = 12, C17 = 17, C18 = 18 };

struct CasePlan {
  CaseId id;
  uint32_t total;
  const char* label;
};

CasePlan plans[] = {
  { C1,  2000, "C1  VALID" },
  { C3,   200, "C3  RFIDNF" },
  { C5,   200, "C5  W_INV" },
  { C7,   200, "C7  TS_INV" },
  { C12,  200, "C12 NOKEY" },
  { C17,  200, "C17 BADJS" },
  { C18,  200, "C18 OWNR" },
};
const uint8_t PLAN_COUNT = sizeof(plans) / sizeof(plans[0]);

uint8_t planIndex = 0;
uint32_t iterInCase = 0;

uint32_t okCase = 0, failCase = 0;
uint32_t okAll = 0, failAll = 0;

unsigned long lastSendAt = 0;

/* ==================== RESULT TYPES ==================== */
struct PostResult {
  int httpCode;
  bool ok;
  uint32_t latencyMs;
  String reqShort;
  String resp;
  const char* tag;

  // flags untuk OLED (biar ketahuan input yg dipakai)
  String keyFlag;     // KEY:OK / KEY:MISS / KEY:BAD
  String rfFlag;      // RF:VAL / RF:NF / RF:OWN / RF:EMP
  String wFlag;       // W:OK / W:0 / W:NEG / W:STR / W:INV
  String tsFlag;      // TS:-- / TS:INV / TS:OK
};

/* ==================== UTIL ==================== */
String pad4(uint32_t n) {
  char b[8];
  snprintf(b, sizeof(b), "%04lu", (unsigned long)n);
  return String(b);
}

String shorten(const String& s, uint8_t maxLen) {
  if ((int)s.length() <= (int)maxLen) return s;
  return s.substring(0, maxLen - 3) + "...";
}

String sn4(const String& sn) {
  if (sn.length() >= 4) return sn.substring(sn.length() - 4);
  return sn;
}

/* OLED helper: 8 baris (kita pakai 7, sisa aman) */
void oledLines8(const String& l1,
                const String& l2 = "",
                const String& l3 = "",
                const String& l4 = "",
                const String& l5 = "",
                const String& l6 = "",
                const String& l7 = "",
                const String& l8 = "") {
  if (!oledReady) return;

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);

  display.println(l1);
  if (l2.length()) display.println(l2);
  if (l3.length()) display.println(l3);
  if (l4.length()) display.println(l4);
  if (l5.length()) display.println(l5);
  if (l6.length()) display.println(l6);
  if (l7.length()) display.println(l7);
  if (l8.length()) display.println(l8);

  display.display();
}

float dummyWeightValid() {
  int r = random(250, 400);
  return r / 10.0f;
}

const char* classifyTag(int httpCode, const String& resp) {
  if (httpCode == 201) return "OK";
  if (httpCode == 401) return "AUTH";
  if (httpCode == 403) return "DEVICE";
  if (httpCode >= 500) return "SERVER";

  if (resp.indexOf("Body JSON tidak valid") >= 0) return "JSON";
  if (resp.indexOf("Payload tidak valid") >= 0) return "PAYLOAD";
  if (resp.indexOf("RFID ternak tidak ditemukan") >= 0) return "RFID";
  if (resp.indexOf("RFID bukan milik") >= 0) return "OWNR";
  if (resp.indexOf("Perangkat tidak ditemukan") >= 0) return "DEVICE";

  return "ERR";
}

/* ==================== WIFI ==================== */
bool connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    if (millis() - start > 20000) return false;
  }
  return true;
}

/* ==================== HTTP SEND ==================== */
PostResult sendByCase(CaseId cid) {
  PostResult out;
  out.httpCode = 0;
  out.ok = false;
  out.latencyMs = 0;
  out.reqShort = "";
  out.resp = "";
  out.tag = "ERR";

  // default flags
  out.keyFlag = "KEY:OK";
  out.rfFlag  = "RF:VAL";
  out.wFlag   = "W:OK";
  out.tsFlag  = "TS:--";

  if (WiFi.status() != WL_CONNECTED) return out;

  HTTPClient http;
  http.begin(API_URL);

  http.addHeader("Content-Type", "application/json");

  // Header: missing key untuk C12
  if (cid != C12) {
    http.addHeader("x-growt-iot-key", IOT_API_KEY);
    out.keyFlag = "KEY:OK";
  } else {
    out.keyFlag = "KEY:MISS";
  }

  String body;

  // BAD JSON
  if (cid == C17) {
    body = "INI BUKAN JSON";
    out.reqShort = "REQ:RAW(nonJSON)";
    out.rfFlag = "RF:--";
    out.wFlag  = "W:--";
    out.tsFlag = "TS:--";
  } else {
    StaticJsonDocument<256> doc;

    // device serial selalu ada (untuk semua case yang ada di runner ini)
    doc["device_serial"] = DEVICE_SERIAL;

    // RFID
    if (cid == C3) {
      doc["rfid"] = RFID_NOTFOUND;
      out.rfFlag = "RF:NF";
    } else if (cid == C18) {
      doc["rfid"] = RFID_OTHER_OWNER;
      out.rfFlag = "RF:OWN";
    } else {
      doc["rfid"] = RFID_VALID;
      out.rfFlag = "RF:VAL";
    }

    // WEIGHT
    if (cid == C5) {
      int m = random(0, 3);
      if (m == 0) { doc["weight"] = 0;    out.wFlag = "W:0"; }
      else if (m == 1) { doc["weight"] = -1;   out.wFlag = "W:NEG"; }
      else { doc["weight"] = "abc"; out.wFlag = "W:STR"; }
      out.reqShort = "REQ:W-INV";
    } else {
      doc["weight"] = dummyWeightValid();
      out.wFlag = "W:OK";
    }

    // measured_at invalid
    if (cid == C7) {
      doc["measured_at"] = "not-a-timestamp";
      out.tsFlag = "TS:INV";
      out.reqShort = "REQ:TS-INV";
    } else {
      out.tsFlag = "TS:--";
    }

    serializeJson(doc, body);

    if (cid == C1) out.reqShort = "REQ:VALID";
    else if (cid == C3) out.reqShort = "REQ:RFID-NF";
    else if (cid == C12) out.reqShort = "REQ:NO-KEY";
    else if (cid == C18) out.reqShort = "REQ:NOT-MINE";
  }

  uint32_t t0 = millis();
  int code = http.POST(body);
  uint32_t t1 = millis();

  String resp = http.getString();
  http.end();

  out.httpCode = code;
  out.ok = (code == 201);
  out.latencyMs = (t1 - t0);
  out.resp = resp;
  out.tag = classifyTag(code, resp);

  // Serial log lengkap
  Serial.println("==== POST /iot/weights ====");
  Serial.print("SN      : "); Serial.println(DEVICE_SERIAL);
  Serial.print("Case    : "); Serial.println((int)cid);
  Serial.print("Iter    : "); Serial.println(iterInCase);
  Serial.print("Body    : "); Serial.println(body);
  Serial.print("HTTP    : "); Serial.println(code);
  Serial.print("Latency : "); Serial.print(out.latencyMs); Serial.println(" ms");
  Serial.print("Resp    : "); Serial.println(resp);

  return out;
}

/* ==================== SETUP / LOOP ==================== */
void setup() {
  Serial.begin(115200);
  delay(300);
  randomSeed((uint32_t)esp_random());

  Wire.begin(I2C_SDA, I2C_SCL);
  oledReady = display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);

  oledLines8("ESP1 Runner",
             "SN:" + sn4(DEVICE_SERIAL),
             "OLED: " + String(oledReady ? "OK" : "FAIL"));
  delay(800);

  oledLines8("WiFi connecting...",
             "SN:" + sn4(DEVICE_SERIAL));
  bool ok = connectWifi();

  oledLines8(ok ? "WiFi: OK" : "WiFi: FAIL",
             "SN:" + sn4(DEVICE_SERIAL),
             "Plans: " + String(PLAN_COUNT));
  delay(800);

  // reminder buat ownership case
  if (RFID_OTHER_OWNER.length() > 0) {
    oledLines8("NOTE",
               "Set RFID_OTHER_OWNER",
               "for C18 OWNR",
               "SN:" + sn4(DEVICE_SERIAL));
    delay(1200);
  }
}

void loop() {
  if (planIndex >= PLAN_COUNT) {
    oledLines8("DONE",
               "SN:" + sn4(DEVICE_SERIAL),
               "OK: " + String(okAll),
               "FAIL: " + String(failAll));
    delay(1000);
    return;
  }

  CasePlan& p = plans[planIndex];

  // pindah case jika selesai
  if (iterInCase >= p.total) {
    oledLines8(String(p.label) + " DONE",
               "SN:" + sn4(DEVICE_SERIAL),
               "OK:" + String(okCase) + " FL:" + String(failCase),
               "Next in 2s...");
    delay(2000);

    planIndex++;
    iterInCase = 0;
    okCase = 0;
    failCase = 0;
    lastSendAt = 0;
    return;
  }

  if (WiFi.status() != WL_CONNECTED) {
    oledLines8("WiFi reconnect...",
               "SN:" + sn4(DEVICE_SERIAL));
    connectWifi();
    delay(200);
  }

  unsigned long now = millis();
  if (now - lastSendAt < SEND_INTERVAL_MS) {
    delay(10);
    return;
  }
  lastSendAt = now;

  iterInCase++;

  // layar pre-send
  oledLines8(String(p.label),
             "SN:" + sn4(DEVICE_SERIAL),
             "Iter:" + pad4(iterInCase) + "/" + String(p.total),
             "OK:" + String(okCase) + " FL:" + String(failCase),
             "ALL OK:" + String(okAll) + " FL:" + String(failAll));

  PostResult r = sendByCase(p.id);

  if (r.ok) { okCase++; okAll++; }
  else { failCase++; failAll++; }

  // layar post-send (7 baris + 1 kosong)
  oledLines8(
    String(p.label) + " " + pad4(iterInCase) + "/" + String(p.total),
    "SN:" + sn4(DEVICE_SERIAL) + " " + r.keyFlag,
    r.rfFlag + "  " + r.wFlag,
    r.tsFlag + " RSSI:" + String(WiFi.RSSI()),
    "HTTP:" + String(r.httpCode) + " t:" + String(r.latencyMs) + " " + String(r.tag),
    "OK:" + pad4(okCase) + " FL:" + pad4(failCase),
    "RESP:" + shorten(r.resp, 22),
    "" // baris 8 kosong (cadangan)
  );

  delay(20);
}