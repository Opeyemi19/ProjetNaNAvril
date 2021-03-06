const passport = require('passport');
    //'passport-local' Permet de s authentifier à l'aide d'un nom d'utilisateur et d'un mot de passe 
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db');
const cryptage = require('../lib/bcrypt');

//Pour le Login
passport.use('local.Sign.signin', new LocalStrategy ({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, Password, done) => {

    const rows = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await cryptage.matchPassword(Password, user.password);
        if (validPassword) {
            done(null, user, req.flash('success', 'Welcome  ' + user.username));
        } else {
            done(null, false, req.flash('message','Incorect Password'));
        }
    }
    else{
        return done(null, false, req.flash('message','The Username does not exists'));
    }
}));

//Pour la Creaction de compte 'SignUp'
passport.use('local.Sign.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const { fullname, Email, Lieu_Habitation, statut } = req.body;
    console.log(req.body);
    const newUser = { fullname, username, Email, password, Lieu_Habitation, statut };
    // console.log(newUser);
    //Lors de l'insertion des données de l' users ds la BD on aura un password crypter avec la fction 'encryptPassword'
    newUser.password = await cryptage.encryptPassword(password)

    const result = await db.query('INSERT INTO users SET ?', [newUser]);
    newUser.id = result.insertId;
    return done(null, newUser);
}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => { 
    const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]); 
    done(null, rows[0]);
});