const express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    bodyParser = require('body-parser'),
    app = express(),
    cookieParser = require('cookie-parser'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    path = require('path'),
    crypto = require('crypto'),
    md5 = require('md5'),
    sha256 = require('sha256'),
    multer  = require('multer'),
    storage = multer.diskStorage({
        destination: './public/memes_bl/',
        filename: function(req, file, cb){
            db.collection('memes_bl').find().toArray((err, docs) => {
                if (err)
                    console.log(err);
                cb(null, (docs.length).toString() + path.extname(file.originalname));
            });
        }
    });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('./public'));
app.use(cookieParser('cookies_bl_mf'));
/*MongoClient.set('useNewUrlParser', true);
MongoClient.set('useFindAndModify', false);
MongoClient.set('useCreateIndex', true);
MongoClient.set('useUnifiedTopology', true);*/

/////////////////////////////////////////////////////////////////////////////////////
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
/////////////////////////////////////////////////////////////////////////////////////

function isSigned(login, pswd){
    db.collection('moders_bl').find().toArray((err, docs) => {
        if (!err){
            for (let i = 0; i < docs.length; i++){
                if (docs[i].login == login){
                    if(docs[i].password == pswd){
                        return true;
                    }
                    return res.render('moder_panel/blVerification', {
                        iL: false,
                        iP: true
                    });
                }
                return res.render('moder_panel/blVerification', {
                    iL: true,
                    iP: false
                });
            }
        }
        return res.send('Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href="mailto:support@dira.com">support@dira.com</a>');
    });
}

let url = "mongodb://localhost:27017/";

let db;

let upload = multer({
    storage: storage
}).single('meme_file');



app.get("/test", (req, res) => {
    res.render("test");
});

app.get("/ya_moder_bl", (req, res) => {
    res.render("moder_panel/blVerification", {
        iL: false,
        iP: false
    });
});

app.post("/ya_moder_bl/blVerif", (req, res) => {
    let login = req.body.login_bl;
    let pswd = req.body.pswd_bl;
    db.collection('moders_bl').find().toArray((err, docs) => {
        if (!err){
            for (let i = 0; i < docs.length; i++){
                if (docs[i].login == login){
                    if(docs[i].password == sha256(md5((pswd)))){
                        const cookieConfig = {
                            httpOnly: true, // to disable accessing cookie via client side js
                            //secure: true, // to force https (if you use it)
                            maxAge: 1000000000, // ttl in ms (remove this option and cookie will die when browser is closed)
                            signed: false // if you use the secret with cookieParser
                        };
                        // there is many other params you can find here https://www.npmjs.com/package/cookie#options-1  
                        res.cookie('login', login, cookieConfig);
                        res.cookie('pswd', sha256(md5((pswd))).toString(), cookieConfig);
                        return res.redirect('/ya_moder_bl/panel');
                    }
                    return res.render('moder_panel/blVerification', {
                        iL: false,
                        iP: true
                    });
                }
                return res.render('moder_panel/blVerification', {
                    iL: true,
                    iP: false
                });
            }
        }
        return res.send('Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href="mailto:support@dira.com">support@dira.com</a>');
    });
});

app.get('/ya_moder_bl/panel', (req, res) => {
    let login = req.cookies['login'],
        pswd = req.cookies['pswd'];
    if (!login || !pswd)
        return res.render('moder_panel/blVerification', {
            iL: true,
            iP: true
        });
    isSigned(login, pswd);
    let query = {moder: login};
    db.collection('memes_bl').find(query).toArray((err, docs) => {
        if (!err){
            return res.render('moder_panel/panel', {
                data: docs
            });
        }
    });
});

app.get('/ya_moder_bl/panel/post/:id', (req, res) => {
    let login = req.cookies['login'],
        pswd = req.cookies['pswd'];
    let id = parseInt(req.params.id);
    if (!login || !pswd)
        return res.render('moder_panel/blVerification', {
            iL: true,
            iP: true
        });
    isSigned(login, pswd);
    let query = {id: id};
    db.collection('memes_bl').find(query).toArray((err, docs) => {
        if (!err) {
            return res.render("moder_panel/post_edit", {
                data: docs[0]
            });
        }
        return res.send('Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href="mailto:support@dira.com">support@dira.com</a>');
    });
});

app.post('/ya_moder_bl/panel/post/', (req, res) => {
    let login = req.cookies['login'],
        pswd = req.cookies['pswd'];
    if (!login || !pswd)
        return res.render('moder_panel/blVerification', {
            iL: true,
            iP: true
        });
    isSigned(login, pswd);
    let tags = req.body.tags_mod || req.body.tags_orig;
    tags = tags.toLowerCase().replace(new RegExp(", ",'g'), ",").replace(new RegExp(" ",'g'), "_");
    if (req.body.upload) {
        let n;
        db.collection('memes').find().toArray((err, docs) => {
            if (err){
                res.sendStatus(500);
                return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");;
            }
            n = docs.slice(-1)[0].id + 1;
            let toLoad = {
                _id: ObjectID(n),
                id: n,
                name: n.toString() + '.' + req.body.name.split('.').slice(-1)[0],
                tags: tags,
                date: req.body.date,
                moder: req.body.moder
            };
            //return res.send(toLoad.name);
            db.collection('memes').insertOne(toLoad, (err, result) => {
                if (err){
                    res.sendStatus(500);
                    return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");;
                }
            });
            db.collection('memes_bl').deleteOne({name: req.body.name}, (err, obj) => {
                if (err){
                    res.sendStatus(500);
                    return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");;
                }
            });
            fs.rename('./public/memes_bl/' + req.body.name, './public/memes/' + toLoad.name, (err) => {
                if (err){
                    console.log(err);
                    res.sendStatus(500);
                    return res.send('Ошибка при загрузке мема');
                }
            });
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'amoral.hole@gmail.com',
                    pass: 'dira_tvoey_mamashi'
                }
            });
            let mailOptions = {
                from: 'amoral.hole@gmail.com',
                to: req.body.email,
                subject: 'Подтверждение мема',
                text: 'Ваш мем был одобрен модератором ' + req.body.moder
            };
            return res.redirect('/');
        });

    }
    else if (req.body.save) {
        ///////////////return console.log('upload');
        db.collection('memes_bl').find({name: req.body.name}).toArray((err, docs) => {
            if (err){
                res.sendStatus(500);
                return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");;
            }
            if (tags != docs[0].tags_mod){
                if (req.body.tags_modifications == "")
                    return res.redirect('/ya_moder_bl/panel/post/');
                db.collection('memes_bl').updateOne({name: req.body.name}, { $set: {tags_mod: tags}}, (err1, result) => {
                    if (err1){
                        res.sendStatus(500);
                        return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");
                    }
                    return res.redirect('/ya_moder_bl/panel');
                });
            }
        });
    }
    else if (req.body.delete) {
        ///////////////return console.log('upload');
        db.collection('memes_bl').find({name: req.body.name}).toArray((err, docs) => {
            if (err){
                res.sendStatus(500);
                return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");;
            }
            if (req.body.tags_modifications == "")
                return res.redirect('/ya_moder_bl/panel/post/');
            db.collection('memes_bl').deleteOne({name: req.body.name}, (err, obj) => {
                if (err){
                    res.sendStatus(500);
                    return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");;
                }
            });
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'amoral.hole@gmail.com',
                    pass: 'dira_tvoey_mamashi'
                }
            });
            let mailOptions = {
                from: 'amoral.hole@gmail.com',
                to: req.body.email,
                subject: 'Подтверждение мема',
                text: 'Модератор ' + req.body.moder + " счел ваш мем неподходящим по следующим причинам: " + req.body.tags_modifications
            };
        });
    }
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/contacts", (req, res) => {
    res.render("contacts");
});

app.get("/policy", (req, res) => {
    res.render("policy");
});

app.get("/post/:post", (req, res) => {
    let url = '/memes/' + req.params.post;
    let types = ['.jpg', '.png', '.jpeg', '.gif'];
    db.collection('memes').find().toArray((err, docs) => {
        if (!err) {
            for (let i = 0; i < docs.length; i++) {
                for (let k = 0; k < types.length; k++) {
                    if (docs[i].name == req.params.post + types[k])
                        return res.render('post.ejs', {
                            url: '/memes/' + docs[i].name,
                            data: {
                                tags: docs[i].tags,
                                date: docs[i].date
                            }
                        });
                }
            }
        }
        return console.error(err);
    });
});

app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.render('upload.ejs', {
                isErr: true,
                err_msg: err
            });
        }
        let tags_input = req.body.tags.toLowerCase().replace(new RegExp(", ",'g'), ",").replace(new RegExp(" ",'g'), "_");
        tags_input = (tags_input == '') ? 'мем' : tags_input;
        let moders;
        let numbs;
        db.collection('moders_bl').find().toArray((err1, docs) => {
            if (!err1) {
                moders = docs;
            }
            else{
                res.sendStatus(500);
                return res.send("Ух, чет к базе не могу КХЕ подсоединиться! Попробуйте позже или сообщите о проблеме по почте: <a href='mailto:support@dira.com'>support@dira.com</a>");;
            }
        });
        let toLoad;
        db.collection('memes_bl').find().toArray((err1, docs) => {
            if (err){
                res.sendStatus(500);
                return res.render('upload.ejs', {
                    isErr: true,
                    err_msg: err1
                });
            }
            numbs = docs.length;
            let now = new Date();
            let year = now.getFullYear(),
                month = now.getMonth(),
                day = now.getDate();
            toLoad = {
                _id: ObjectID(numbs + 1),
                id: numbs + 1,
                name: req.file.filename,
                email: req.body.email_for_ans,
                tags_orig: tags_input,
                tags_mod: "",
                moder: moders[Math.floor(Math.random() * moders.length)].login,
                date: day + '-' + month + '-' + year
            };
            db.collection('memes_bl').insertOne(toLoad, (err2, result) => {
                if (err2){
                    res.sendStatus(500);
                    return res.render('upload.ejs', {
                        isErr: true,
                        err_msg: err2
                    });
                }
                return res.redirect('/');
            });
        });
    });
});

app.get("/upload", (req, res) => {
    res.render("upload.ejs", {
        isErr: false
    });
});

app.get('/find/:_query', (req, res) => {
    let query = req.params._query;
    query = query.split('-');
    let data1 = [];
    db.collection('memes').find().toArray((err, docs) => {
        if (err){
            res.sendStatus(500);
            return res.render("index.ejs", {
                isNotFound: true,
                err_msg: err
            });
        }
        for (let i = 0; i < docs.length; i++){
            let tags = docs[i].tags.split(",");
            for (let j = 0; j < tags.length; j++){
                for (let k = 0; k < query.length; k++){
                    if (tags[j] == query[k]){
                        data1.push(docs[i]);
                    }
                }
            }
        }
        return res.render('found.ejs', {
            isNotFound: false,
            data: data1
        });
    });
});

app.get('/test', (req, res) => {
    res.render('test.ejs');
});


app.post('/report/meme', (req, res) => {

});

app.post('/report/tags', (req, res) => {

});

app.get(/\/.*/, (req, res) => {
    if (req.path != "/")
        return res.redirect("/");
    db.collection('memes').find().toArray((err, docs) => {
        if (err){
            res.sendStatus(500);
            return res.render("index.ejs", {
                isNotFound: true,
                err_msg: err
            });
        }
        return res.render('index.ejs', {
            isNotFound: false,
            data: docs/*,
            n: 0*/
        });
    });
});

MongoClient.connect(url, {
    'useNewUrlParser': true,
    'useUnifiedTopology': true
}, (err, database) => {
    if (err)
        return console.log(err);
    db = database.db('memes');
    app.listen(8081, () => console.log('Server was run on 8081'));
});
