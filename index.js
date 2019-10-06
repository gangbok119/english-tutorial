// require
const express = require('express');
const express_session = require('express-session');
const morgan = require('morgan');
const cookie_parser = require('cookie-parser');

// 서버 실행
const app = express();

// 미들웨어 세팅
app.use(morgan('dev'));
app.use(cookie_parser());
app.use(express_session());
app.use(express.json());


// 에러 처리

// 포트 열기
app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`);
  });