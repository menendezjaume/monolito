const express = require('express');
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
