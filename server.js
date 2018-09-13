const express = require('express'),
    //MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    app = express(),
    cookies = require('cookies'),
    fs = require('fs'),
    path = require('path'),
    multer  = require('multer'),
    storage = multer.diskStorage({
        destination: './public/memes/',
        filename: function(req, file, cb){
            fs.readFile(__dirname + "/uploaded.txt", (err, data) => {
                if (err){
                    console.log(err);
                }
                else{
                    cb(null, (Number(data) + 1).toString() + path.extname(file.originalname));
                }
            });
        }
    });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('./public'));


let upload = multer({
    storage: storage
}).single('meme_file');



app.get("/", (req, res) => {
    cookie = new cookies(req, res);
    let id = cookie.get('id') || 'id0000000';
    let name = cookie.get('name') || 'unknown unknown';
    let tags = fs.readFile(__dirname + "/public/memes/memes.txt", (err, data) => {
        if (!err) {
            let data1 = data.toString().split("============================");
            res.render("index.ejs", {
                isNotFound: false,
                data: data1
            });
        }
        else{
            console.error(err);
        }
    });
});


app.get("/post/:post", (req, res) => {
    let url = '/memes/' + req.params.post;
    cookie = new cookies(req, res);
    let id = cookie.get('id') || 'id0000000';
    let name = cookie.get('name') || 'unknown unknown';
    let types = ['.jpg', '.png', '.jpeg', '.gif'];
    let tags = fs.readFile(__dirname + "/public/memes/memes.txt", (err, data) => {
        if (!err) {
            let data1 = data.toString().split("============================");
            for (let i = 1; i < data1.length; i++){
                for (let k = 0; k < types.length; k++){
                    if(data1[i].split('\r\n')[1] == req.params.post + types[k])
                    return res.render('post.ejs', {
                        url: '/memes/' + data1[i].split('\r\n')[1],
                        data: {
                            tags: data1[i].split('\n')[2],
                            date: data1[i].split('\n')[3]
                        }
                    });
                }
            }
        }
        else{
            console.error(err);
        }
    });
});

app.post("/upload", (req, res) => {
    cookie = new cookies(req, res);
    let id = cookie.get('id') || 'id0000000',
        name = cookie.get('name') || 'unknown unknown';
    upload(req, res, (err) => {
        if (err) {
            res.render('upload.ejs', {
                isErr: true,
                err_msg: err
            });
        }
        else {
            let tags_input = req.body.tags.toLowerCase();
            let num = fs.readFile(__dirname + "/uploaded.txt", (err, data) => {
                if(err){
                    console.log(err);
                }
                else{
                    fs.writeFileSync(__dirname + "/uploaded.txt", Number(data.toString()) + 1);
                    let now = new Date();
                    let year = now.getFullYear(),
                        month = now.getMonth(),
                        day = now.getDate();
                    let tags = '';
                    if(tags_input.split(', ').length >= 2) {
                        for (let i = 0; i < tags_input.split(', ').length; i++)
                            tags += tags_input.split(', ')[i].replace(' ', '_') + ",";
                        tags = tags.substring(0, tags.length - 1)
                    }
                    else{
                        tags = 'meme,мем'
                    }
                    let toAppend = "\r\n============================\r\n" + req.file.filename + "\r\n" + tags + "\r\n" + day + "-" + month + "-" + year;
                    fs.appendFileSync(__dirname + "/public/memes/memes.txt", toAppend);
                    res.redirect('/');
                }
            });
        }
    });
});

app.get("/upload", (req, res) => {
    cookie = new cookies(req, res);
    let id = cookie.get('id') || 'id0000000';
    let name = cookie.get('name') || 'unknown unknown';
    res.render("upload.ejs", {
        isErr: false
    });
});

app.get('/find/:_query', (req, res) => {
    let query = req.params._query;
    query = query.split('-');
    cookie = new cookies(req, res);
    let id = cookie.get('id') || 'id0000000';
    let name = cookie.get('name') || 'unknown unknown';
    let tags = fs.readFile(__dirname + "/public/memes/memes.txt", (err, data) => {
        if (!err) {
            let data1 = data.toString().split("============================");
            let data_to_send = [];
            for (let i = 1; i < data1.length; i++){
                let tags1 = data1[i].split('\r\n')[2].split(',');
                let g = 0;
                for (let j = 0; j < tags1.length; j++){
                    for (let k = 0; k < query.length; k++){
                        console.log(query[k] + " " + tags1[j]);
                        if (query[k] == tags1[j])
                            g++;
                    }
                }
                if (g)
                    data_to_send.push(data1[i]);
            }
            res.render("found.ejs", {
                isNotFound: false,
                data: data_to_send
            });
        }
        else{
            console.error(err);
        }
    });
});


app.listen(8081, () => console.log('Server was run on 8081'));