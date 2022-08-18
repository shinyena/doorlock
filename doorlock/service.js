/*    파일명: service.js
      파일설명: 블루투스 서비스를 정의하고 구현함.
      개발자: 신예나
      개발일: 2020.12. */

const log = require('./log');                 // 로그모듈 불러오기
const bleno = require('@abandonware/bleno');  // bleno 모듈 불러오기
const util = require('util');                 // util 모듈 불러오기

var control = require('./control');           // OpenDoor 함수와 CloseDoor 함수를 불러오기 위한 control 모듈 불러오기

var nodename = 'APSSWP';                       // Profile명, 도어락 시리얼 넘버
var state;

var PrimaryService = bleno.PrimaryService;
var Characteristic = bleno.Characteristic;

// ------------------------- Characteristic 정의 -------------------------
var SwitchCharacteristic = function( ) {
    SwitchCharacteristic.super_.call(this, {
        uuid: 'ff11',
        properties: ['read', 'write'], // service를 read와 write로 설정
        descriptors: [
        new bleno.Descriptor({
            uuid: '2901',
            value: 'Switch'
        })
        ]
    });
};
util.inherits(SwitchCharacteristic, Characteristic);

// ------------------------- Read Request 정의 -------------------------
SwitchCharacteristic.prototype.onReadRequest = (offset, callback, error) => {
    if (!error) {
      log.print('info', 'ReadRequest', nodename, 200, state + ' 전송');
      callback(this.RESULT_SUCCESS, state); // central 기기로 현재 state 전송
    }
    else {
      log.print('error', 'ReadRequest', nodename, 705, error);
    }
};

// ------------------------- Write Request 정의 -------------------------
SwitchCharacteristic.prototype.onWriteRequest =
    (data, offset, withoutResponse, callback, error) => {
      if (!error) {
        if (data=='1') { // central 에서 온 data가 1 이라면 문열림 및 잠금해제
            log.print('info', 'WriteRequest', nodename, 200, data + ' 수신');
            control.OpenDoor();
            state = "open"; // 현재 state를 open으로 설정, Read Request로 전송
        }
        else if (data=='0'){ // central 에서 온 data가 0 이라면 문닫힘 및 잠금설정
            log.print('info', 'WriteRequest', nodename, 200, data + ' 수신');
            control.CloseDoor();
            state = "close"; // 현재 state를 close로 설정, Read Request로 전송
        }
        else {
          log.print('error', 'WriteRequest', nodename, 706, '알 수 없는 요청');
        }
        callback(this.RESULT_SUCCESS); // central 기기로 응답(성공)을 전송
      }
      else {
        log.print('error', 'WriteRequest', nodename, 706, error);
      }
};

// ------------------------- PrimaryService 정의 -------------------------
var doorService = new PrimaryService({
    uuid: 'ff10',
    characteristics: [
        new SwitchCharacteristic()
    ]
});

module.exports.doorService = doorService; // doorService를 모듈로 추출
