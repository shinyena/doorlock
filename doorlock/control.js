/*    파일명: server.js
      파일설명: 도어락을 제어하는 모듈을 정의하고 구현함.
      개발자: 신예나
      개발일: 2020.12. */

const gpio = require('node-wiring-pi'); // wpi핀 제어모듈 불러오기
const log = require('./log');           // 로그모듈 불러오기

var nodename = 'APSSWP';                // Profile명, 도어락 시리얼 넘버

var Piservo =  require('pi-servo');     // 서보모터 제어모듈 불러오기
var SERVO = new Piservo(18);            //servo mottor #12

const RED = 29;   //red led #40
const GREEN = 28; //green led #38
const RELAY = 26; //relay switch #32

// ------------------- 잠금해제 시 초록색 LED 를 켜는 함수 -------------------
const TurnOnGreenLED = function(error) {
    if (!error) {
      gpio.digitalWrite(GREEN, 1); // GREEN LED ON
      log.print('info', 'TurnOnGreenLED', nodename, 200, 'TURN ON GREEN LED');
    }
    else {
      log.print('error', 'TurnOnGreenLED', nodename, 708, error);
    }
}

// ------------------- 잠금설정 시 빨간색 LED 를 켜는 함수 -------------------
const TurnOnRedLED = function(error) {
    if (!error) {
      gpio.digitalWrite(RED, 1); // RED LED ON
      log.print('info', 'TurnOnRedLED', nodename, 200, 'TURN ON RED LED');
    }
    else {
      log.print('error', 'TurnOnRedLED', nodename, 708, error);
    }
}

// ------------------- 잠금해제 완료 후 초록색 LED 를 끄는 함수 -------------------
const TurnOffGreenLED = function(error) {
    if (!error) {
      gpio.digitalWrite(GREEN, 0); // GREEN LED OFF
      log.print('info', 'TurnOffGreenLED', nodename, 200, 'TURN OFF GREEN LED');
    }
    else {
      log.print('error', 'TurnOffGreenLED', nodename, 708, error);
    }
}

// ------------------- 잠금설정 완료 후 빨간색 LED 를 끄는 함수 -------------------
const TurnOffRedLED = function(error) {
    if (!error) {
      gpio.digitalWrite(RED, 0); // RED LED OFF
      log.print('info', 'TurnOffRedLED', nodename, 200, 'TURN OFF RED LED');
    }
    else {
      log.print('error', 'TurnOffRedLED', nodename, 708, error);
    }
}

// ------------------- Relay 스위치에 전기를 0.1초간 공급하는 함수 -------------------
const ActiveRelay = function (error) {
    if (!error) {
      gpio.digitalWrite(RELAY, gpio.HIGH); // RELAY에 전기 공급
      gpio.delay(100);
      gpio.digitalWrite(RELAY, gpio.LOW); // RELAY에 전기 차단
      log.print('info', 'ActiveRelay', nodename, 200, 'ACTIVE RELAY');
    }
    else {
      console.log("Error: ACTIVE RELAY");
      log.print('error', 'ActiveRelay', nodename, 712, error);
    }
}

// ------------------- 서보모터를 시계방향으로 100도 회전하여 문을 여는 함수 -------------------
const OpenServo = function(error) {
    if (!error) {
      SERVO.open();
      SERVO.setDegree(0); // 서보모터 각도 설정
      log.print('info', 'OpenServo', nodename, 200, 'OPEN SERVO');
    }
    else {
      log.print('error', 'OpenServo', nodename, 714, error);
    }
}

// ------------------- 서보모터를 반시계방향으로 100도 회전하여 문을 닫는 함수 -------------------
const CloseServo = function(error) {
    if (!error) {
      SERVO.open();
      SERVO.setDegree(100); // 서보모터 각도 설정
      log.print('info', 'CloseServo', nodename, 200, 'CLOSE SERVO');
    }
    else {
      log.print('error', 'CloseServo', nodename, 714, error);
    }
}

// ------------------- 문열림 및 잠금해제 요청 시 호출되는 함수  -------------------
const OpenDoor = function() {
    setImmediate(TurnOnGreenLED);       // TurnOnGreenLED 함수 즉시 호출
    setTimeout(TurnOffGreenLED, 2000);  // TurnOffGreenLED 함수 2초후 호출
    setImmediate(ActiveRelay);          // ActiveRelay 함수 즉시 호출
    setTimeout(OpenServo, 1000);        // OpenServo 함수 1초후 호출
}

// ------------------- 문닫힘 및 잠금설정 요청 시 호출되는 함수  -------------------
const CloseDoor = function() {
    setImmediate(TurnOnRedLED);       // TurnOnRedLED 함수 즉시 호출
    setTimeout(TurnOffRedLED, 2000);  // TurnOffRedLED 함수 2초후 호출
    setTimeout(ActiveRelay, 1000);    // ActiveRelay 함수 1초후 호출
    setImmediate(CloseServo);         // CloseServo 함수 즉시 호출
}

module.exports.OpenDoor = OpenDoor;     // OpenDoor 함수를 모듈로 추출
module.exports.CloseDoor = CloseDoor;   // CloseDoor 함수를 모듈로 추출

gpio.wiringPiSetup();

gpio.pinMode(RED, gpio.OUTPUT);
gpio.pinMode(GREEN, gpio.OUTPUT);
gpio.pinMode(RELAY, gpio.OUTPUT);
