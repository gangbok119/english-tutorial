const express = require('express');
const db = require('../models');
const ejs = require('ejs');
const fs = require('fs');
const router = express.Router();

// Word read All
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



// Word create
router.post('/create', async (req, res) => {
    try {
        fs.readFile('../insertNewWord.html', 'utf-8', (data) => {
            const newWord = db.Word.create({
                eng: req.body.eng,
                kor: req.body.kor,
            });
            res.send(data, { data: newWord })
        })


    } catch (e) {
        console.error(e);
    }
});


// Word delete
router.delete('/delete/:id', async (req, res) => {
    try {
        db.Word.delete({
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
        fs.readFile('../modify.html', 'utf-8', (data) => {
            const exWord = db.Word.findOne({
                where: {
                    id: req.params.id
                }
            });
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
        db.Word.update({
            eng:req.body.eng,
            kor:req.body.kor,
            where:{
                id:req.params.id
            }
        });
        res.redirect('/');
    } catch (e) {
        console.error(e);
    }
});



module.exports = router;