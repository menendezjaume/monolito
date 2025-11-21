const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const JWT_SECRET = 'patata-secreta';

function verifyToken(req, res, next) {
    // capturamos el token del header Authorization
    const authHeader = req.headers['authorization'];
    // el token está en el formato "Bearer <token>"
    // por lo que hay que partir el string con split
    const token = authHeader && authHeader.split(' ')[1];
    // si no hay token, devolver error 401
    if (!token) {
        return res.sendStatus(401);
    }
    // verificamos el token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        // inyectamos el usuario en la request
        req.user = user;
        next();
    });
}

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
                'SELECT id FROM users WHERE username = $1',
                [username],
            );
            if (userResult.rows.length === 0) {
                console.log(
                    `User "${username}" does not exist. Cannot create post.`,
                );
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
        await createPost(
            1,
            Picsum.url(),
            'Este es el contenido del primer post.',
            'pepe',
        );
        // create another post
        await createPost(
            2,
            Picsum.url(),
            'Este es el contenido del segundo post.',
            'pepe',
        );
        // create a third post
        await createPost(
            3,
            Picsum.url(),
            'Este es el contenido del tercer post.',
            'pepe',
        );
    } catch (error) {
        console.error('Error initializing database', error);
    }
}

app.post('/login', (req, res) => {
    console.log('Login endpoint');
    const { username, password } = req.body;

    pool.query('SELECT * FROM users WHERE username = $1', [username])
        .then(async (result) => {
            // si la longitud de result.rows es 0, el usuario no existe
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            // si la contraseña no coincide, devolver error
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            // generamos el token JWT
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' },
            );
            // lo devolvemos al cliente
            res.json({ token });
        })
        .catch((error) => {
            console.error('Error during login', error);
            res.status(500).json({ message: 'Internal server error' });
        });
});

app.get('/profile', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected profile route', user: req.user });
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
