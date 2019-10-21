const express = require('express');
const db = require('../models');
const ejs = require('ejs');
const fs = require('fs');
const router = express.Router();

// Word read All -v 
router.get('/', async (req, res) => {
    try {
        const word = await db.Word.findAll();
        fs.readFile('wordList.html', 'utf-8', (err,data) => {
            res.send(ejs.render(data, {
                data: word
            }))
           
        })
    } catch (e) {
        console.error(e);
    }
});

// word create get
router.get('/create', async (req,res) => {
    try {
        fs.readFile('insertNewWord.html','utf-8', (error,data) =>{
            res.send(data);
        });
    } catch(e) {
        console.error(e)
    }
});

// Word create
router.post('/create', async (req, res) => {
    try {
        const newWord = await db.Word.create({
            eng: req.body.eng,
            kor: req.body.kor,
        });
        res.redirect('/');


    } catch (e) {
        console.error(e);
    }
});


// Word delete - v
router.get('/delete/:id', async (req, res) => {
    try {
        db.Word.destroy({
            where: {
                id: req.params.id
            }
        });
        res.redirect('/');
    } catch (e) {
        console.error(e);
    }
});

// Word update
router.get('/update/:id', async (req, res) => {
    try {
        const exWord = await db.Word.findOne({
            where: {
                id: req.params.id
            }
        });
        fs.readFile('modify.html', 'utf-8', (err,data) => {
            
            res.send(ejs.render(data, {
                data: exWord
            }))
        })


    } catch (e) {
        console.error(e);
    }
});

// Word update
router.post('/update/:id', async (req, res) => {
    try {
        console.log(req.body.eng)
        console.log(req.params.id)
        db.Word.update({
            eng:req.body.eng,
            kor:req.body.kor},
            {where:{
                id:req.params.id
            }}
        );
        res.redirect('/');
    } catch (e) {
        console.error(e);
    }
});



module.exports = router;