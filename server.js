const express= require("express");
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app= express();
const winston = require('winston');
const jwt = require('jsonwebtoken')
const JWTstrategy = require("passport-jwt").Strategy;
const authToken = require("./token.json");
const bcrypt = require('bcrypt');
const fs = require("fs");

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculate-service' },
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  const users = [];

  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
    
  }

  app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
  }));

  app.use(express.static(__dirname+'/public'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));


app.use(passport.session());

//First point of contact - hashes the password and and stores the json in token file
app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      email: req.body.username,
      password: hashedPassword
    })
    let token = jwt.sign({ name: users }, "TOP_SECRET");
    fs.writeFile(
      "token.json",
      JSON.stringify({ Authorization: `Bearer ${token}` }),
      (err) => {
        if (err) throw err; 
      }
    );
    res.redirect(307,'/login')
  } catch {
    res.redirect('/')
  }
})
//Second check point - Authenticates with JWT
app.post('/login', passport.authenticate('jwt', {
  successRedirect: '/Calculator',
  failureRedirect: '/'
}));


function getJwtToken() {
  console.log("in getJwt");
  console.log(authToken)
  return authToken.Authorization?.substring(7); 
}

passport.use(
  new JWTstrategy(
    {
      secretOrKey: "TOP_SECRET",
      jwtFromRequest: getJwtToken,
    },

    async (authToken, done) => {
      console.log("token: ", authToken);

      if (authToken?.user?.email == "tokenerror") {
        let testError = new Error(
          "token error"
        );
        return done(testError, false);
      }

      if (authToken?.user?.email == "emptytoken") {
        return done(null, false);
      }
      if (authToken.name[0].email === users[0]?.email) {
        return done(null, { username: authToken.name[0].email});
            } else {
        return done(null, false, { message: 'Incorrect username or password.' });
            }
          
    }
  )
  
);

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  done(null, { username: username });
});

//Third point of contact - routing to next page to acces the apis
app.get('/Calculator',isAuthentication, function (req, res) {
  res.send(`
  <h1>Simple calculator</h1>
  <p>For addition</p><a href="/add?n1=10&n2=20">Click here</a>
  <p>For Subtraction</p><a href="/sub?n1=10&n2=20">Click here</a>
  <p>For Multiplication</p><a href="/multiply?n1=10&n2=20">Click here</a>
  <p>For Division</p><a href="/division?n1=10&n2=20">Click here</a>
 `);
});

function isAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}



//APIS

const add= (n1,n2) => {
    return n1+n2;
}
const sub= (n1,n2) => {
  return n1-n2;
}
const mul= (n1,n2) => {
  return n1*n2;
}
const div= (n1,n2) => {
  return n1/n2;
}
app.get("/add", (req,res)=>{
    try{
    const n1= parseFloat(req.query.n1);
    const n2=parseFloat(req.query.n2);
    if(isNaN(n1)) {
        logger.error("n1 is incorrectly defined");
        throw new Error("n1 incorrectly defined");
    }
    if(isNaN(n2)) {
        logger.error("n2 is incorrectly defined");
        throw new Error("n2 incorrectly defined");
    }
    
    if (n1 === NaN || n2 === NaN) {
        console.log()
        throw new Error("Parsing Error");
    }
    logger.info('Parameters '+n1+' and '+n2+' received for addition');
    const result = add(n1,n2);
    res.status(200).json({statuscocde:200, data: result }); 
    } catch(error) { 
        console.error(error)
        res.status(500).json({statuscocde:500, msg: error.toString() })
      }
});
app.get("/sub", (req,res)=>{
  try{
  const n1= parseFloat(req.query.n1);
  const n2=parseFloat(req.query.n2);
  if(isNaN(n1)) {
      logger.error("n1 is incorrectly defined");
      throw new Error("n1 incorrectly defined");
  }
  if(isNaN(n2)) {
      logger.error("n2 is incorrectly defined");
      throw new Error("n2 incorrectly defined");
  }
  
  if (n1 === NaN || n2 === NaN) {
      console.log()
      throw new Error("Parsing Error");
  }
  logger.info('Parameters '+n1+' and '+n2+' received for subtraction');
  const result = sub(n1,n2);
  res.status(200).json({statuscocde:200, data: result }); 
  } catch(error) { 
      console.error(error)
      res.status(500).json({statuscocde:500, msg: error.toString() })
    }
});
app.get("/multiply", (req,res)=>{
  try{
  const n1= parseFloat(req.query.n1);
  const n2=parseFloat(req.query.n2);
  if(isNaN(n1)) {
      logger.error("n1 is incorrectly defined");
      throw new Error("n1 incorrectly defined");
  }
  if(isNaN(n2)) {
      logger.error("n2 is incorrectly defined");
      throw new Error("n2 incorrectly defined");
  }
  
  if (n1 === NaN || n2 === NaN) {
      console.log()
      throw new Error("Parsing Error");
  }
  logger.info('Parameters '+n1+' and '+n2+' received for multiply');
  const result = mul(n1,n2);
  res.status(200).json({statuscocde:200, data: result }); 
  } catch(error) { 
      console.error(error)
      res.status(500).json({statuscocde:500, msg: error.toString() })
    }
});
app.get("/division", (req,res)=>{
  try{
  const n1= parseFloat(req.query.n1);
  const n2=parseFloat(req.query.n2);
  if(isNaN(n1)) {
      logger.error("n1 is incorrectly defined");
      throw new Error("n1 incorrectly defined");
  }
  if(isNaN(n2)) {
      logger.error("n2 is incorrectly defined");
      throw new Error("n2 incorrectly defined");
  }
  if(n2 == 0)
  {
    logger.error("n2 is Zero");
      throw new Error("Zero division error");
  }
  
  if (n1 === NaN || n2 === NaN) {
      console.log()
      throw new Error("Parsing Error");
  }
  logger.info('Parameters '+n1+' and '+n2+' received for division');
  const result = div(n1,n2);
  res.status(200).json({statuscocde:200, data: result }); 
  } catch(error) { 
      console.error(error)
      res.status(500).json({statuscocde:500, msg: error.toString() })
    }
});

app.get('/', function (req, res) {
  res.render('index.html');
});


const port=3040;
app.listen(port,()=> {
    console.log("hello i'm listening to port " +port);
})