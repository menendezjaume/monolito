const express = require('express')
const cookieParser = require('cookie-parser');

// base de datos
const Database = require('better-sqlite3');
const db = new Database('./database.sqlite'); // crea el archivo si no existe
// para las contraseñas
const bcrypt = require('bcrypt');

const app = express()
const port = 3000

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    // sql
    res.render('index', { title: "Mi super página", name: "Nombre" });

})

isAdmin = (req, res, next) => {
    if (req.cookies && req.cookies.user){
        return next();
    }
    res.redirect("/login");
}

isAuth = (req, res, next) => {
    if (req.cookies && req.cookies.user){
        return next();
    }
    res.redirect("/login");
}

// gestion de la vista
app.get('/login',  (req, res, next) => {
    res.render('login');
})

// gestion de los parámetros post
app.post('/login', (req, res) => {
    const { user, password } = req.body;

    try {
        // Buscar el usuario en la base de datos
        const row = db.prepare('SELECT * FROM users WHERE username = ?').get(user);

        if (!row) {
            console.log("Usuario no encontrado");
            return res.status(401).redirect("login");
        }

        // Comparar contraseña introducida con la guardada (hash bcrypt)
        const passwordMatch = bcrypt.compareSync(password, row.password);

        if (passwordMatch) {
            console.log(`Usuario ${row.username} autenticado correctamente (rol: ${row.role})`);
            res.cookie("user", row.username, { httpOnly: true });
            res.cookie("role", row.role, { httpOnly: true });
            return res.redirect("home");
        } else {
            console.log("Contraseña incorrecta");
            return res.status(401).redirect("login");
        }

    } catch (err) {
        console.error("Error en login:", err.message);
        return res.status(500).send("Error interno del servidor");
    }
});

app.get("/home", isAuth, (req, res) => {
    // leeriamos el usuario de la cookie
    // consulta en bbdd del usuario
    // se lo enviamos por parametro al render
    res.render("home")
})

app.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.redirect("login");
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
