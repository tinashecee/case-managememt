const express = require('express');
//const exphbs = require('express-handlebars');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require("./dbConfig");
const session = require('cookie-session');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const initializePassport = require('./passportConfig');
const genFunc = require('connect-pg-simple');

const PostgresqlStore = genFunc(session);
const sessionStore = new PostgresqlStore({
  conString: 'postgres://ctcheuka:jXsapD5U8blt@ep-rapid-lake-643093.us-east-2.aws.neon.tech/neondb',
});
const moment = require("moment");
const app = express();
initializePassport(passport);
const PORT = process.env.PORT || 8080
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
app.use(cookieParser('NotSoSecret'));
app.use(
    session({
        secret:'secret',
        cookie: {secure: true, maxAge: 60000 },
        resave:false,
        saveUninitialized:false,
        store: sessionStore
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next)=>{
    res.locals.moment = moment;
    next();
  });
app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});
let authed = false;
let nam = '';
let array = []
let array1 = []
let array2 = []
let array3 = []
let errors =[];
app.get('/a', (req, res) => {
    req.flash('success', 'Welcome!!');
    res.redirect('/display-message');
  });
    
  app.get('/display-message', (req, res) => {
      res.render("display-message",{layout:'./layouts/index-layout'});
  });
app.get('', checkNotAuthenticated, async (req,res) => {
    
    res.render('index',{layout:'./layouts/index-layout',authed:authed,user:nam,})
});
app.get('/assistant',checkNotAuthenticated, async (req,res) => {
    
    res.render('assistant',{layout:'./layouts/assistant-layout'})
});
app.get('/budget', checkNotAuthenticated, async (req,res) => {
    
    res.render('budget',{layout:'./layouts/budget-layout'})
});
app.get('/calender', checkNotAuthenticated, async (req,res) => {
    
    res.render('calender',{layout:'./layouts/calender-layout'})
});
app.get('/cases', checkNotAuthenticated, async (req,res) => {
    pool.query(
        `SELECT * FROM cases`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
             array3 = results.rows
             res.render('cases',{layout:'./layouts/lawfirms-layout',data:array3})
        }
    )
   
});
app.get('/compliance', checkNotAuthenticated, async (req,res) => {
    
    res.render('compliance',{layout:'./layouts/compliance-layout'})
});
app.get('/contracts', checkNotAuthenticated, async (req,res) => {
    pool.query(
        `SELECT * FROM contracts`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            });
           // dollarUS.format(currentUser.account_balance)
             array2 = results.rows
             res.render('contracts',{layout:'./layouts/contracts-layout',data:array2,dollarUS:dollarUS})
        }
    )
    
});
app.get('/lawfir_cases', checkNotAuthenticated, async (req,res) => {
    
    res.render('lawfir_cases',{layout:'./layouts/lawfir-cases-layout'})
});
app.get('/lawfirm_contracts', checkNotAuthenticated, async (req,res) => {
    
    res.render('lawfirm_contracts',{layout:'./layouts/lawfirm-contracts-layout'})
});
app.get('/lawfirm_tasks', checkNotAuthenticated, async (req,res) => {
    
    res.render('lawfirm_tasks',{layout:'./layouts/lawfirm-tasks-layout'})
});
app.get('/lawfirmcontacts', checkNotAuthenticated, async (req,res) => {
    
    res.render('lawfirmcontacts',{layout:'./layouts/lawfirmcontacts-layout'})
});
app.get('/lawfirmnotes', checkNotAuthenticated, async (req,res) => {
    
    res.render('lawfirmnotes',{layout:'./layouts/lawfirmnotes-layout'})
});

app.get('/lawfirms', checkNotAuthenticated, async (req,res) => {
    
    pool.query(
        `SELECT * FROM law_firms`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }else{
             array = results.rows
             let active = 0
             let not_active = 0
             array.forEach(e=>{
                if(e.status== 'true' || e.status == true){
                   active += 1
                }else{
                    not_active += 1
                }
             })
             console.log(array)
             res.render('lawfirms',{layout:'./layouts/lawfirms-layout',data:array, active:active, not_active:not_active})
            }
        }
    )
   
   
});
app.get('/lawfirmstatement', checkNotAuthenticated, async (req,res) => {
    
    res.render('lawfirmstatement',{layout:'./layouts/lawfirmstatement-layout'})
});
app.get('/lawfirmview', checkNotAuthenticated, async (req,res) => {
    
    res.render('lawfirmview',{layout:'./layouts/lawfirmview-layout'})
});
app.get('/learn', checkNotAuthenticated, async (req,res) => {
    
    res.render('learn',{layout:'./layouts/learn-layout'})
});
app.get('/resources', checkNotAuthenticated, async (req,res) => {
    
    res.render('resources',{layout:'./layouts/resources-layout'})
});

app.get('/tasks', checkNotAuthenticated, async (req,res) => {
    pool.query(
        `SELECT * FROM tasks`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
           
            
             array1 = results.rows
             console.log(results.rows)
             res.render('tasks',{layout:'./layouts/tasks-layout',data:results.rows})
          
        }
    )
 
    
});
app.get('/vendors', checkNotAuthenticated, async (req,res) => {
    pool.query(
        `SELECT * FROM vendors`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            
             array1 = results.rows
             res.render('vendors',{layout:'./layouts/vendors-layout',data:array1})
          
        }
    )
    
});

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        authed=true;
        return next();
    }
    authed=false;
    res.redirect("/login");
}
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        authed=true;
        return res.redirect(" ");
    }
    next();
    
    
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
app.post('/add-lawfirm', (req, res)=>{
    console.log(req.body)
    let law_firm = req.body.law_firm
    let address = req.body.address
    let vat_number = req.body.vat_number
    let contact_person = req.body.contact_person
    let phone_number = req.body.phone_number
    let website = req.body.website
    let email = req.body.email
    let groups = req.body.group
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
        `INSERT INTO law_firms (name, address, phone_number, contact_person, status, groups, date_created, email, vat_number, website)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [law_firm, address, phone_number, contact_person, true, groups, date_created, email, vat_number, website], 
        (err, results) => {
            if(err){
                throw err;
            }
            req.flash('success_msg','You have successfully added a law firm');
            res.redirect('/lawfirms');
        }
    )
});
app.post('/change-lawfirm-status', (req, res)=>{
    console.log(req.body)
    let active_status = req.body.active_status
    let law_firm_id = req.body.law_firm_id
    console.log(active_status,law_firm_id)
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE law_firms SET status = $1 WHERE law_firm_id = $2',
        [active_status,law_firm_id], 
        (err, results) => {
            if(err){
                throw err;
            }
            console.log(results)
            req.flash('success_msg','You have successfully updated status of law firm');
            res.redirect('/lawfirms');
        }
    )
});
app.post('/add-case', (req, res)=>{
    console.log(req.body)
    let department = req.body.department
    let description = req.body.description
    let start_date = req.body.start_date
    let end_date = req.body.deadline
    let notes = req.body.comments
    let case_name = req.body.case_name
    let law_firm = req.body.law_firm
    let tag = req.body.tag
    let staff_members = req.body.status
    let progress = req.body.progress
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
        `INSERT INTO cases (description, start_date, end_date, notes, department, case_name, law_firm, tag, staff_members, progress)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [description, start_date, end_date, notes, department, case_name, law_firm, tag, staff_members, progress], 
        (err, results) => {
            if(err){
                throw err;
            }
            req.flash('success_msg','You have successfully added a law firm');
            res.redirect('/cases');
        }
    )
});
app.post('/add-contract', (req, res)=>{
    console.log(req.body)
    
    let description = req.body.contract_description
    let start_date = req.body.start_date
    let end_date = req.body.end_date
    let contract_name = req.body.contract_name
    let vendor = req.body.vendor
    let department = req.body.department
    let payment_cycle = req.body.signedStatus1
    let payment_terms = req.body.payment_terms
    let status = req.body.signed_status
    let contract_value = req.body.contract_value
    let notes = req.body.description1
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
        `INSERT INTO contracts (  name, description, start_date, end_date, notes,  vendor, department, payment_cycle, payment_terms, status, contract_value)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [  contract_name, description, start_date, end_date, notes, vendor, department, 
            payment_cycle, payment_terms, status, contract_value], 
        (err, results) => {
            if(err){
                throw err;
            }
            console.log(results.row);
            req.flash('success_msg','You have successfully added a contract');
            res.redirect('/contracts');
        }
    )
});
app.post('/add-vendor', (req, res)=>{
    console.log(req.body)
    let contact_person = req.body.contactPerson
    let phone_number = req.body.phoneNumber
    let company_name = req.body.vendorName
    let physical_address = req.body.address
    let vat_number = req.body.vatNumber
    let email = req.body.email
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
        `INSERT INTO vendors ( phone_number, contact_person, company_name,vat_number, physical_address, date_created, status, email)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [ phone_number, contact_person, company_name, vat_number, physical_address, date_created, 'false', email], 
        (err, results) => {
            if(err){
                throw err;
            }
            console.log(results.row);
            req.flash('success_msg','You have successfully added a vendor');
            res.redirect('/vendors');
        }
    )
});
app.post('/add-tasks', (req, res)=>{
    console.log(req.body)
    let task_name = req.body.taskName
    let start_date = req.body.startDate
    let due_date = req.body.dueDate
    let priority = req.body.priority
    let frequency = req.body.frequency
    let assigness = req.body.assiigness
    let task_description = req.body.taskDescription
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
        `INSERT INTO tasks (name, start_date, due_date, priority, frequency, assigned_to, description, date_created, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [task_name, start_date, due_date, priority, frequency, assigness, task_description, date_created, 'ACTIVE'], 
        (err, results) => {
            if(err){
                throw err;
            }
            req.flash('success_msg','You have successfully added a task');
            res.redirect('/tasks');
        }
    )
});
app.get('/users/logout', (req,res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        authed =false;
    usrId=''
    nam=''
    req.flash('success', 'Your logged out');
    res.redirect('/login');
      });
    
});
app.get('/login',checkAuthenticated, (req,res) => {
   
    res.render('login',{layout:'./layouts/login-layout',authed:authed,user:nam, errors:errors});
});
app.get('/users/logout', (req,res) => {
    req.logOut();
    authed =false;
    usrId=''
    nam=''
    req.flash('success_msg', 'You logged out');
    res.redirect('/login');
});
app.post('/users/register', async (req,res) => {
    errors = []
    let { name, email, password,  password2 } = req.body;
    console.log({name, email, password, password2 });

    
    if(!name || !email ||  !password || !password2){
         errors.push({message: "Please enter all fields"});
    }
    if(password.length<6){
        errors.push({message: "Password must be at least 6 characters long"});
   }
   if(password != password2 ){
    errors.push({message: "Passwords do not match"});
   }
   
   if(errors.length >0 ){
       console.log(errors)
    res.render("login",{layout:'./layouts/login-layout',authed:authed,user:nam,errors:errors});
   }else{ 
       let hashedPassword = await bcrypt.hash(password, 10);

       pool.query(
           `SELECT * FROM users
           WHERE email = $1`,
           [email],
           (err, results) => {
               if(err){
                   throw err;
               }
               console.log(results.rows);
               if(results.rows.length >0){
                errors.push({message: `Email: ${email} is already registered`});
                res.render("register",{errors});
              }else{
                  pool.query(
                      `INSERT INTO users (name, email, password, role)
                      VALUES ($1, $2, $3, $4)
                      RETURNING id, password`,
                      [name, email, hashedPassword, 'ADMIN'], 
                      (err, results) => {
                          if(err){
                              throw err;
                          }
                          console.log(results.row);
                          req.flash('success_msg','You are now registered. Please log in');
                          res.render('login',{layout:'./layouts/login-layout',authed:authed,user:nam, errors:errors});
                      }
                  )
              }
           }
       )
   }
});
app.post("/users/login", passport.authenticate('local', {
        
    //successRedirect: '/',
    failureRedirect:'/login',
    failureFlash: true
}),(req,res) => {
    usrId = req.user.id;
    nam = (req.user.name).charAt(0).toUpperCase() + (req.user.name).slice(1)
    authed = true
    res.render('index',{layout:'./layouts/index-layout',authed:true,user:nam})}
);
app.listen(PORT, console.log(`Server running on port ${PORT}`));
