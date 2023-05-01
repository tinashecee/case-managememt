const express = require('express');
//const exphbs = require('express-handlebars');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');
const path = require('path');
const alert = require('alert'); 
const bcrypt = require('bcrypt');
const { pool } = require("./dbConfig");
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const moment = require("moment");
const app = express();
const PORT = process.env.PORT || 8080
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())
app.use(flash());
app.use(
    session({
        secret:'secret',
        resave:false,
        saveUninitialized:false
    })
);
app.use((req, res, next)=>{
    res.locals.moment = moment;
    next();
  });
let authed = false;
let array = []
let array1 = []
let array2 = []
app.get('', (req, res) => {
    
    res.render('index',{layout:'./layouts/index-layout'})
});
app.get('/assistant', (req, res) => {
    
    res.render('assistant',{layout:'./layouts/assistant-layout'})
});
app.get('/budget', (req, res) => {
    
    res.render('budget',{layout:'./layouts/budget-layout'})
});
app.get('/calender', (req, res) => {
    
    res.render('calender',{layout:'./layouts/calender-layout'})
});
app.get('/cases', (req, res) => {
    
    res.render('cases',{layout:'./layouts/cases-layout'})
});
app.get('/compliance', (req, res) => {
    
    res.render('compliance',{layout:'./layouts/compliance-layout'})
});
app.get('/contracts', (req, res) => {
    pool.query(
        `SELECT * FROM contracts`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            console.log(results.rows);
            if(results.rows.length >0){
             array2 = results.rows
           }else{
           }
        }
    )
    console.log(array2)
    res.render('contracts',{layout:'./layouts/contracts-layout',data:array2})
});
app.get('/lawfir_cases', (req, res) => {
    
    res.render('lawfir_cases',{layout:'./layouts/lawfir-cases-layout'})
});
app.get('/lawfirm_contracts', (req, res) => {
    
    res.render('lawfirm_contracts',{layout:'./layouts/lawfirm-contracts-layout'})
});
app.get('/lawfirm_tasks', (req, res) => {
    
    res.render('lawfirm_tasks',{layout:'./layouts/lawfirm-tasks-layout'})
});
app.get('/lawfirmcontacts', (req, res) => {
    
    res.render('lawfirmcontacts',{layout:'./layouts/lawfirmcontacts-layout'})
});
app.get('/lawfirmnotes', (req, res) => {
    
    res.render('lawfirmnotes',{layout:'./layouts/lawfirmnotes-layout'})
});

app.get('/lawfirms', (req, res) => {
    
    pool.query(
        `SELECT * FROM law_firms`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            console.log(results.rows);
            if(results.rows.length >0){
             array = results.rows
           }else{
           }
        }
    )
    console.log(array)
    res.render('lawfirms',{layout:'./layouts/lawfirms-layout',data:array})
});
app.get('/lawfirmstatement', (req, res) => {
    
    res.render('lawfirmstatement',{layout:'./layouts/lawfirmstatement-layout'})
});
app.get('/lawfirmview', (req, res) => {
    
    res.render('lawfirmview',{layout:'./layouts/lawfirmview-layout'})
});
app.get('/learn', (req, res) => {
    
    res.render('learn',{layout:'./layouts/learn-layout'})
});
app.get('/resources', (req, res) => {
    
    res.render('resources',{layout:'./layouts/resources-layout'})
});
app.get('/tasks', (req, res) => {
    
    res.render('tasks',{layout:'./layouts/tasks-layout'})
});
app.get('/vendors', (req, res) => {
    pool.query(
        `SELECT * FROM vendors`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            console.log(results.rows);
            if(results.rows.length >0){
             array1 = results.rows
           }else{
           }
        }
    )
    console.log(array1)
    res.render('vendors',{layout:'./layouts/vendors-layout',data:array1})
});
function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        authed=true;
        return next();
    }
    authed=false;
    res.redirect("/users/login");
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
        [law_firm, address, phone_number, contact_person, 'false', groups, date_created, email, vat_number, website], 
        (err, results) => {
            if(err){
                throw err;
            }
            req.flash('success_msg','You have successfully added a law firm');
            res.redirect('/lawfirms');
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
app.listen(PORT, console.log(`Server running on port ${PORT}`));
