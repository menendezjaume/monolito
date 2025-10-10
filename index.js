const express = require('express');
const cookieParser = require('cookie-parser');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// importar la configuración de la base de datos
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    // sql
    res.render('index', {
        title: 'Mi super página',
    });
});

const isAdmin = (req, res, next) => {
    if (
        req.cookies &&
        req.cookies.user &&
        req.cookies.role == 'superinvestigador'
    ) {
        return next();
    }
    // if is user send to user page
    if (req.cookies && req.cookies.user && req.cookies.role == 'user') {
        return res.redirect('/user');
    }
    res.redirect('/login');
};

const isUser = (req, res, next) => {
    if (req.cookies && req.cookies.user && req.cookies.role == 'user') {
        return next();
    }
    // if is admin send to admin page
    if (req.cookies && req.cookies.user && req.cookies.role == 'admin') {
        return res.redirect('/admin');
    }
    res.redirect('/login');
};

// gestion de la vista
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
    });
});

// gestion de los parámetros post
app.post('/login', async (req, res) => {
    const { user, password } = req.body; // cliente

    await client.connect();
    const resultado = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [user],
    );
    const userdb = resultado.rows[0];

    const validPassword = await bcrypt.compare(password, userdb.password);

    if (validPassword) {
        console.log('usuario y contraseña correcta');
        res.cookie('user', user); // options - js no secure si
        res.cookie('role', userdb.role); // options - js no secure si
        console.log('redirect to ', userdb.role);
        res.redirect(userdb.role);
    } else {
        res.status(401).redirect('login');
    }
    await client.end();
});

app.get('/admin', isAdmin, (req, res) => {
    // leeriamos el usuario de la cookie
    // consulta en bbdd del usuario
    // se lo enviamos por parametro al render
    res.render('admin', {
        user: req.cookies.user,
    });
});

app.get('/user', isUser, (req, res) => {
    res.render('user', {
        user: req.cookies.user,
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.clearCookie('role');
    res.redirect('login');
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
