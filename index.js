const express = require('express')
const cookieParser = require('cookie-parser')
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const app = express()
const port = 3000

const db = new Database('database.sqlite');

app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    // sql
    res.render('index', { title: "Mi super página" });

})

isAdmin = (req, res, next) => {
    if (req.cookies && req.cookies.user && req.cookies.role == "superinvestigador"){
        return next();
    }
    // if is user send to user page
    if (req.cookies && req.cookies.user && req.cookies.role == "user"){
        return res.redirect("/user");
    }   
    res.redirect("/login");
}

isUser = (req, res, next) => {
    if (req.cookies && req.cookies.user && req.cookies.role == "user"){
        return next();
    }
    // if is admin send to admin page
    if (req.cookies && req.cookies.user && req.cookies.role == "admin"){
        return res.redirect("/admin");
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
    res.render('login', { title: "Login" });
})

// gestion de los parámetros post
app.post('/login', async (req, res) => {
    const { user, password } = req.body; // cliente

    const fila = db.prepare('SELECT * FROM users WHERE username = ?')
    const userdb = fila.get(user);

    const validPassword = await bcrypt.compare(password, userdb.password);
    
    if (validPassword) {
        console.log("usuario y contraseña correcta")
        res.cookie("user", user); // options - js no secure si
        res.cookie("role", userdb.role); // options - js no secure si
        res.redirect(userdb.role);
    } else {
        res.status(401).redirect("login");
    }
})

app.get("/admin", isAdmin, (req, res) => {
    // leeriamos el usuario de la cookie
    // consulta en bbdd del usuario
    // se lo enviamos por parametro al render
    res.render("admin", { user: req.cookies.user });
})

app.get("/user", isUser, (req, res) => {
    res.render("user", { user: req.cookies.user });
})

app.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.clearCookie("role");
    res.redirect("login");
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
