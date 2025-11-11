const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
// picsum-photos
const { Picsum } = require('picsum-photos');

const app = express();
const port = 3000;

// importar la configuración de la base de datos
require('dotenv').config();

const pool = new Pool({
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
app.use(cors());

async function initDb() {
    try {
        await pool.connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
    try {
        // create users table if not exists
        await pool.query(
            `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL
    )`,
        );
        console.log('Users table created or already exists');
        // create posts table if not exists
        pool.query(
            `CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(255),
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
    )`,
        );
        console.log('Posts table created or already exists');
        // create default user function
        const createUser = async (username, password, role) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
            `INSERT INTO users (username, password, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (username) DO NOTHING`,
            [username, hashedPassword, role],
            );
            console.log(`Default user "${username}" created or already exists`);
        };
        await createUser('pepe', 'pepe', 'user');
        createUser('admin', 'admin', 'admin');
        // create post by user "pepe" if not exists
        const createPost = async (id, imageUrl, content, username) => {
            const userResult = await pool.query(
                `SELECT id FROM users WHERE username = $1`,
                [username],
            );
            if (userResult.rows.length === 0) {
                console.log(`User "${username}" does not exist. Cannot create post.`);
                return;
            }
            const userId = userResult.rows[0].id;
            await pool.query(
            `INSERT INTO posts (id, image_url, content, user_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO NOTHING`,
            [id, imageUrl, content, userId],
            );
            console.log('Post created or already exists');
        };
        // create a post
        await createPost(1, Picsum.url(), 'Este es el contenido del primer post.', 'pepe');
        // create another post
        await createPost(2, Picsum.url(), 'Este es el contenido del segundo post.', 'pepe');
        // create a third post
        await createPost(3, Picsum.url(), 'Este es el contenido del tercer post.', 'pepe');
    } catch (error) {
        console.error('Error initializing database', error);
    }
}

app.get('/', (req, res) => {
    // sql
    res.render('index', {
        title: 'Mi super página',
    });
});

const isAdmin = (req, res, next) => {
    if (req.cookies && req.cookies.user && req.cookies.role == 'admin') {
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

// register
app.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register',
    });
});

app.post('/register', async (req, res) => {
    const { user, password } = req.body; // cliente
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        [user, hashedPassword, 'user'],
    );
    res.redirect('/login');
});

// gestion de la vista
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
    });
});

// gestion de los parámetros post
app.post('/login', async (req, res) => {
    const { user, password } = req.body; // cliente
    console.log('Login attempt');
    console.log('user', user);
    console.log('password', password);

    const resultado = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [user],
    );
    const userdb = resultado.rows[0];

    if (!userdb) {
        console.log('usuario no existe');
        return res.status(401).redirect('login');
    }

    console.log('usuario existe');
    console.log('userdb.username', userdb.username);
    console.log('userdb.password', userdb.password);
    console.log('userdb.role', userdb.role);

    const validPassword = await bcrypt.compare(password, userdb.password);

    if (validPassword) {
        console.log('usuario y contraseña correcta');
        res.cookie('user', user); // options - js no secure si
        res.cookie('role', userdb.role); // options - js no secure si
        console.log('redirect to ', userdb.role);
        res.redirect(userdb.role);
    } else {
        console.log('contraseña incorrecta');
        res.status(401).redirect('login');
    }
});

app.get('/admin', isAdmin, (req, res) => {
    // leeriamos el usuario de la cookie
    // consulta en bbdd del usuario
    // se lo enviamos por parametro al render
    res.render('admin', {
        user: req.cookies.user,
        title: 'Zona admin privada',
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

// public get posts
app.get('/posts', async (req, res) => {
    const resultado = await pool.query(
        `SELECT posts.id, posts.image_url, posts.content, users.username
        FROM posts
        JOIN users ON posts.user_id = users.id`,
    );
    const posts = resultado.rows;
    res.json(posts);
});

initDb();

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
