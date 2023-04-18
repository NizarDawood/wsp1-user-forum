const express = require('express');
const router = express.Router();

const { response } = require('express');
const bcrypt = require('bcrypt');
const pool = require('../utils/database.js');
const session = require('express-session');
const promisePool = pool.promise();




router.get('/login', async function (req, res, next) {

    res.render('login.njk', { title: 'Log' });
});

router.get('/forum', async function (req, res, next) {

    if (req.session.login == 1) {
        const [rows] = await promisePool.query("SELECT * FROM nd20forum");
        res.render('forum.njk', { title: 'PostIt', name: req.session.username, rows: rows });
    }
    else {
        return res.status(401).send('Access denied');
    }
});



router.post('/forum', async function (req, res, next) {
    req.body = { logout };


});

router.get('/logout', async function (req, res, next) {

    res.render('logout.njk', { title: 'Logout' });
    req.session.login = 0;
});

router.post('/forum', async function (req, res, next) {
    req.body = { profile };


});

router.get('/profile', async function (req, res, next) {

    res.render('profile.njk', { title: 'profile' });
    req.session.login = 0;
});



router.post('/login', async function (req, res, next) {
    const { username, password } = req.body;


    if (username.length == 0) {
        return res.send('Username is Required')
    }
    if (password.length == 0) {
        return res.send('Password is Required')
    }

    const [user] = await promisePool.query('SELECT * FROM nzduserforum WHERE name = ?', [username]);
   

    bcrypt.compare(password, user[0].password, function (err, result) {
        //logga in eller nåt

        if (result === true) {
            // return res.send('Welcome')
            req.session.username = username;
            req.session.login = 1;
            return res.redirect('/forum');
        }

        else {
            return res.send("Invalid username or password")
        }

    })


});

router.get('/crypt/:password', async function (req, res, next) {
    const password = req.params.password
    bcrypt.hash(password, 10, function (err, hash) {
        return res.json({ hash });

    })
});



router.get('/register', function (req, res, next) {
    res.render('register.njk', { title: 'register' });

});

router.post('/register', async function (req, res, next) {
    const { username, password, passwordConfirmation } = req.body;

    if (username === "") {
        console.log({ username })
        return res.send('Username is Required')

    }
    else if (password.length === 0) {
        return res.send('Password is Required')
    }
    else if (passwordConfirmation.length === 0) {
        return res.send('Password is Required')
    }
    else if (password !== passwordConfirmation) {
        return res.send('Passwords do not match')
    }

    const [user] = await promisePool.query('SELECT name FROM nzduserforum WHERE name = ?', [username]);
    console.log({ user })

    if (user.length > 0) {
        return res.send('Username is already taken')
    } else {
        bcrypt.hash(password, 10, async function (err, hash) {
            const [creatUser] = await promisePool.query('INSERT INTO nzduserforum (name, password) VALUES (?, ?)', [username, hash]);
            res.redirect('/login')
        })
    }
});

router.get('/', async function (req, res, next) {
    const [rows] = await promisePool.query("SELECT * FROM nd20forum");
    res.render('index.njk', {
        rows: rows,
        title: 'PostIt' 
    });
});







router.get('/delete', async function (req, res, next) {
    res.render('delete.njk', {
      title: 'Delete',
      user: req.session.login || 0
    });
  });
  
  router.post('/delete', async function (req, res, next) {
    const { username, password } = req.body; // extract username and password from the request body
    if (!username) {
      return res.send('Username is required'); // validate that username is not empty
    }
    if (!password) {
      return res.send('Password is required'); // validate that password is not empty
    }
    const [user] = await promisePool.query('SELECT * FROM nzduserforum WHERE name = ?', [username]);
    if (!user.length) {
      return res.send('User not found'); // validate that the user exists in the database
    }
    bcrypt.compare(password, user[0].password, function (err, result) {
      if (result === true) {
        promisePool.query('DELETE FROM nzduserforum WHERE name = ?', [username])
          .then(() => {
            req.session.destroy(); // destroy the user session on successful delete
            res.redirect('/');
          })
          .catch((error) => {
            console.error(error);
            res.send('Error deleting user');
          });
      } else {
        res.send('Invalid username or password');
      }
    });
  });
  


router.post('/new', async function (req, res, next) {
    const {author, title, content } = req.body;
    const [rows] = await promisePool.query("INSERT INTO nd20forum (author, title, content) VALUES ( ?, ?, ?)", [author, title, content]);
    res.redirect('/forum');
});
router.get('/new', async function (req, res, next) {
    res.render('new.njk', {
        title: 'Nytt inlägg',
    });
});


module.exports = router;
