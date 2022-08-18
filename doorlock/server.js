/*    파일명: server.js
      파일설명: 도어락 서버로 실행시 블루투스가 작동됨.
      개발자: 신예나
      개발일: 2020.12. */

const log = require('./log');                 // 로그모듈 불러오기
const bleno = require('@abandonware/bleno');  // bleno 모듈 불러오기

var service = require('./service');           // doorService를 불러오기 위한 service 모듈 불러오기
var nodename = 'APSSWP';                      // Profile명, 도어락 시리얼 넘버

// -------------------- State 설정 함수 --------------------
bleno.on('stateChange', function (state) {
    if (state === 'poweredOn') {
        bleno.startAdvertising(nodename, [service.doorService.uuid]); // deivce name과 device id 를 갖고 Advertising start
        log.print('info', 'stateChange', nodename, 200, 'BLUETOOTH POWERED ON');
    } else {
        bleno.stopAdvertising(); // Advertising을 중단
        log.print('info', 'stateChange', nodename, 200, 'STOP ADVERTISING');
    }
});

// -------------------- Advertising 함수 --------------------
bleno.on('advertisingStart', function (error) {
    if (!error) {
        log.print('info', 'advertisingStart', nodename, 200, 'START ADVERTISING');
        bleno.setServices([service.doorService]); // service를 시작
    }
    else {
      log.print('error', 'advertisingStart', nodename, 702, error);
    }
});

// -------------------- 프로그램 종료 함수 --------------------
function exit() {
    log.print('info', 'exit()', nodename, 200, 'EXIT PROGRAM');
    process.exit();
}

process.on('SIGINT', exit); // ^c 를 누르면 종료
