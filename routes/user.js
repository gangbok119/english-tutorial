const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');

const router = express.Router();

// 회원가입 라우터
router.post('/join', async (req,res) => {
    try {
        const exUser = await db.User.findOne({
            where:{
                userId:req.body.userId
            }
        });
        if (exUser) {
            return res.status(403).json('이미 사용중인 아이디입니다.');
        };
        const hashedpassword = await bcrypt.hash(req.body.password,12);
        const newUser = await db.User.create({
            userId:req.body.userId,
            nickname:req.body.nickname,
            password:hashedpassword
        });
        return res.status(200).json(newUser);
    } catch (e) {
        console.error(e);
    };
});

// 로그인 라우터
router.post('login',(req,res) => {

});


module.exports = router;