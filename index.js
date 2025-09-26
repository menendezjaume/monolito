const express = require('express')
const cookieParser = require('cookie-parser')
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
    console.log(req.body);

    if (user == "admin" && password == "1234") {
        console.log("usuario y contraseña correcta")
        res.cookie("user", user); // options - js no secure si
        res.redirect("home");
    } else {
        res.status(401).redirect("login")
    }
})

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
