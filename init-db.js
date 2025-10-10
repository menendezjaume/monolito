const { Client } = require('pg');
const bcrypt = require('bcrypt');

// importar la configuración de la base de datos
require('dotenv').config();

const client = new Client({
                                                                                                    host: process
                                                                                                                                                                                                        .env
                                                                                                                                                                                                        .DB_HOST,
                                                                                                    port: process
                                                                                                                                                                                                        .env
                                                                                                                                                                                                        .DB_PORT,
                                                                                                    database: process
                                                                                                                                                                                                        .env
                                                                                                                                                                                                        .DB_NAME,
                                                                                                    user: process
                                                                                                                                                                                                        .env
                                                                                                                                                                                                        .DB_USER,
                                                                                                    password: process
                                                                                                                                                                                                        .env
                                                                                                                                                                                                        .DB_PASSWORD,
});

async function initDB() {
                                                                                                    try {
                                                                                                                                                                                                        await client.connect();
                                                                                                                                                                                                        console.log(
                                                                                                                                                                                                                                                                                                            'Connected to the database',
                                                                                                                                                                                                        );

                                                                                                                                                                                                        // Crear la tabla de usuarios si no existe
                                                                                                                                                                                                        await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL
        )
    `);

                                                                                                                                                                                                        async function createUser(
                                                                                                                                                                                                                                                                                                            username,
                                                                                                                                                                                                                                                                                                            password,
                                                                                                                                                                                                                                                                                                            role,
                                                                                                                                                                                                        ) {
                                                                                                                                                                                                                                                                                                            const hashedPassword =
                                                                                                                                                                                                                                                                                                                                                                                                                await bcrypt.hash(
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    password,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    10,
                                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                            await client.query(
                                                                                                                                                                                                                                                                                                                                                                                                                'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
                                                                                                                                                                                                                                                                                                                                                                                                                [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    username,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    hashedPassword,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    role,
                                                                                                                                                                                                                                                                                                                                                                                                                ],
                                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                        }

                                                                                                                                                                                                        // Crear un usuario admin por defecto
                                                                                                                                                                                                        await createUser(
                                                                                                                                                                                                                                                                                                            'admin',
                                                                                                                                                                                                                                                                                                            'adminpass',
                                                                                                                                                                                                                                                                                                            'admin',
                                                                                                                                                                                                        );

                                                                                                                                                                                                        // lo mismo con un usuario normal
                                                                                                                                                                                                        await createUser(
                                                                                                                                                                                                                                                                                                            'user',
                                                                                                                                                                                                                                                                                                            'userpass',
                                                                                                                                                                                                                                                                                                            'user',
                                                                                                                                                                                                        );

                                                                                                                                                                                                        await client.end();
                                                                                                                                                                                                        console.log(
                                                                                                                                                                                                                                                                                                            'Database initialized successfully',
                                                                                                                                                                                                        );
                                                                                                    } catch (err) {
                                                                                                                                                                                                        console.error(
                                                                                                                                                                                                                                                                                                            'Error initializing the database',
                                                                                                                                                                                                                                                                                                            err,
                                                                                                                                                                                                        );
                                                                                                    }
}

initDB();
