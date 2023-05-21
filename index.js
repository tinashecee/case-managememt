const express = require('express');
//const exphbs = require('express-handlebars');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require("./dbConfig");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const initializePassport = require('./passportConfig');
const csvwriter = require('csv-writer');
//const genFunc = require('connect-pg-simple');

//const PostgresqlStore = genFunc(session);
/*const sessionStore = new PostgresqlStore({
  conString: 'postgres://ctcheuka:jXsapD5U8blt@ep-rapid-lake-643093.us-east-2.aws.neon.tech/neondb',
});*/
const HTML_TEMPLATE = require("./mail-template.js");
const SENDMAIL = require("./mailer.js") 
const message = "Hi there, you were emailed me through nodemailer"


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
        saveUninitialized:false
        //store: sessionStore
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
let contact_person_count = 1;
let line_budget_count = 1;
let compliance_count = 1;
let budget_balance = 0;
let budget_amount = 0
let budget_id = '';
let expenditure_budget_id = ''
let expenditure_budget = ''
let expenditure_actual = ''
let total_expenditure = 0
let expenditure_left = 0
let current_balance = 0
let budget_statement  = []
let compliance_department = ''
let compliance_contact_name = ''
let compliance_contact_email = ''
let compliance_survey_questions = []
let compliance_data = []
app.get('/a', (req, res) => {
    req.flash('success', 'Welcome!!');
    res.redirect('/display-message');
  });
    
  app.get('/display-message', (req, res) => {
      res.render("display-message",{layout:'./layouts/index-layout'});
  });
app.get('', async (req,res) => {
    pool.query(
        `SELECT * FROM tasks`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            pool.query(
                `SELECT * FROM cases`,
                [],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        throw err;
                        
                    }
                    pool.query(
                        `SELECT * FROM contracts`,
                        [],
                        (err, result2) => {
                            if(err){
                                console.log(err)
                                throw err;
                                
                            }        
                            pool.query(
                                `SELECT *
                                FROM contracts
                                WHERE end_date < CURRENT_DATE + INTERVAL '1 month'`,
                                [],
                                (err, result3) => {
                                    if(err){
                                        console.log(err)
                                        throw err;
                                        
                                    }
                                    let dollarUS = Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD", 
                                    });
                                     
                                    console.log(result3.rows)
             array1 = results.rows
             res.render('index',{layout:'./layouts/index-layout',dollarUS:dollarUS, expiring_contracts:result3.rows, contracts_length:result2.rows.length ,cases_length:results1.rows.length, tasks:results.rows,authed:authed,user:nam,})
                })
            })
            })
        }
    )
    
});
app.get('/assistant', async (req,res) => {
    
    res.render('assistant',{layout:'./layouts/assistant-layout'})
});
app.get('/budget',  async (req,res) => {
    pool.query(
        `SELECT * FROM budget`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
             pool.query(
                `SELECT * FROM budget_items`,
                [],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        throw err;
                        
                    }
                     results.rows
                     let dollarUS = Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD", 
                    });
                   
                    if(results.rows[0]){
                        budget_balance = results.rows[0].balance
                        budget_amount = results.rows[0].amount
                        budget_id = results.rows[0].budget_id
                    }
                    if(results1.rows[0] && results.rows[0]){
                        results1.rows.forEach(e=>{
                           total_expenditure += parseFloat(e.actual)
                        })
                     let wer =   ( parseFloat(results.rows[0].amount) - total_expenditure)/parseFloat(results.rows[0].amount) * 100
                                          expenditure_left = wer.toFixed(2)
                     current_balance = parseFloat(results.rows[0].amount) - total_expenditure
                     

                    }
                     res.render('budget',{layout:'./layouts/budget-layout',budget_statement:budget_statement,data:results.rows, data1:results1.rows, dollarUS:dollarUS,total_expenditure:total_expenditure,expenditure_left:expenditure_left, current_balance:current_balance})
                }
            )
        }
    )
});
app.get('/calender',  async (req,res) => {
    
    res.render('calender',{layout:'./layouts/calender-layout'})
});
app.get('/cases',  async (req,res) => {
    pool.query(
        `SELECT * FROM cases`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
             array3 = results.rows
             pool.query(
                `SELECT name FROM law_firms`,
                [],
                (err, results) => {
                    if(err){
                        console.log(err)
                        throw err;
                        
                    }
                     results.rows
                     console.log( results.rows)
                     res.render('cases',{layout:'./layouts/lawfirms-layout',data:array3, dataA:results.rows})
                }
            )
        }
    )
   
});
app.post('/survey_elems',  async (req,res) => {
   res.send({compliance_survey_questions:compliance_survey_questions})
})
app.get('/compliance',  async (req,res) => {
    pool.query(
        `SELECT * FROM compliance_results`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            compliance_data=results.rows
            res.render('compliance',{layout:'./layouts/compliance-layout',compliance_results:results.rows})
        }
    )
    
    
});
app.get('/compliance-survey',  async (req,res) => {
    
    res.render('compliance_survey',{layout:'./layouts/compliance-survey-layout',compliance_survey_questions:compliance_survey_questions})
});
app.get('/contract_view',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM contracts WHERE contract_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            console.log(results.rows)
             res.render('contract_view',{layout:'./layouts/contract_view_layout',data:results.rows,dollarUS:dollarUS,id:query})
        }
    )
});
app.get('/case_view',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM cases WHERE case_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            });
            pool.query(
                `SELECT name FROM law_firms`,
                [],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        throw err;
                        
                    }
                     
                    res.render('case_view',{layout:'./layouts/case_view_layout',data:results.rows, dataA:results1.rows,id:query})
                }
            )
        }
    )
   
});
app.get('/contracts',  async (req,res) => {
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
           pool.query(
            `SELECT company_name FROM vendors`,
            [],
            (err, results1) => {
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
                 res.render('contracts',{layout:'./layouts/contracts-layout',data:array2,dollarUS:dollarUS,vendors:results1.rows})
            }
        )
        }
    )
    
});
app.get('/lawfirm_cases',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            pool.query(
                `SELECT * FROM cases WHERE law_firm = $1`,
                [results.rows[0].name],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        throw err;
                        
                    }
                    res.render('lawfir_cases',{layout:'./layouts/lawfir-cases-layout',data:results.rows,dollarUS:dollarUS,cases:results1.rows,law_firm_id:query})

                    
                }
            )
                    }
    )
    
});
app.get('/lawfirm_contracts',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            console.log(results.rows)
            res.render('lawfirm_contracts',{layout:'./layouts/lawfirm-contracts-layout',data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_tasks',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            console.log(results.rows)
            res.render('lawfirm_contracts',{layout:'./layouts/lawfirm-contracts-layout',data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_contacts',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            console.log(results.rows)
            res.render('lawfirmcontacts',{layout:'./layouts/lawfirm-contacts-layout',data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_notes',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            console.log(results.rows)
            res.render('lawfirmnotes',{layout:'./layouts/lawfirm-notes-layout',data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});

app.get('/lawfirms',  async (req,res) => {
    
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
app.get('/lawfirm_statement',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            console.log(results.rows)
            res.render('lawfirmstatement',{layout:'./layouts/lawfirm-statement-layout',data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_view',  async (req,res) => {
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            res.render('lawfirmview',{layout:'./layouts/lawfirm-view-layout',data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/learn',  async (req,res) => {
    
    res.render('learn',{layout:'./layouts/learn-layout'})
});
app.get('/resources',  async (req,res) => {
    
    res.render('resources',{layout:'./layouts/resources-layout'})
});

app.get('/tasks',  async (req,res) => {
    pool.query(
        `SELECT * FROM tasks`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                throw err;
                
            }
           
            
             array1 = results.rows
             res.render('tasks',{layout:'./layouts/tasks-layout',data:results.rows})
          
        }
    )
 
    
});
app.get('/vendors', async (req,res) => {
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
app.post('/update-lawfirm-profile', (req, res)=>{
  let query = req.query.id
  let lawfirm_name = req.body.lawfirm_name
  let email = req.body.email
  let address = req.body.address
  let phone_number = req.body.phone_number
  pool.query(
    'UPDATE law_firms SET name = $1, email = $2, address = $3, phone_number = $4 WHERE law_firm_id = $5',
   [lawfirm_name,email,address,phone_number, query], 
   (err, results) => {
       if(err){
           throw err;
       }
       res.redirect('/lawfirm_view?id='+query);
   }
)

})
app.post('/update-lawfirm-contact', (req, res)=>{
    let query = req.query.id
    let name1 = req.body.name1
    let email1 = req.body.email1
    let position1 = req.body.position1
    let phone1 = req.body.phone1
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, result) => {
            if(err){
                console.log(err)
                throw err;
                
            }
          result.rows[0].contacts.push({name:name1,email:email1,position:position1,phone:phone1})
          console.log(result.rows[0].contacts)
          pool.query(
            'UPDATE law_firms SET contacts = $1 WHERE law_firm_id = $2',
           [ result.rows[0].contacts, query], 
           (err, results) => {
               if(err){
                   throw err;
               }
               res.redirect('/lawfirm_contacts?id='+query);
           }
        )
        })
     
   
  
  })
app.post('/add-lawfirm', (req, res)=>{
   
    let law_firm = req.body.law_firm
    let address = req.body.address
    let vat_number = req.body.vat_number
    let contact_person = req.body.contact_person
    let phone_number = req.body.phone_number
    let website = req.body.website
    let email = req.body.email
    let contacts = []
    for(let i=1;i<contact_person_count+1;i++){
        contacts.push({name:req.body[`name${i}`],email:req.body[`email${i}`],position:req.body[`position${i}`],phone:req.body[`phone${i}`]})
    }
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    console.log(contacts)
    pool.query(
        `INSERT INTO law_firms (name, address, phone_number, contacts, status, groups, date_created, email, vat_number, website)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [law_firm, address, phone_number, contacts, true, "groups", date_created, email, vat_number, website], 
        (err, results) => {
            if(err){
                throw err;
            }
            req.flash('success_msg','You have successfully added a law firm');
            res.redirect('/lawfirms');
        }
    )
});
app.post('/update-lawfirm', (req, res)=>{
    let query = req.query.id
    let law_firm = req.body.law_firm
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE cases SET law_firm = $1 WHERE case_id = $2',
        [law_firm, query], 
        (err, results) => {
            if(err){
                throw err;
            }
            res.redirect('/case_view?id='+query);
        }
    )
})
app.post('/update-case-status', (req, res)=>{
    let query = req.query.id
    let status = req.body.status
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE cases SET status = $1 WHERE case_id = $2',
        [status, query], 
        (err, results) => {
            if(err){
                throw err;
            }
            res.redirect('/case_view?id='+query);
        }
    )
});
app.post('/update-case-startdate', (req, res)=>{
    let query = req.query.id
    let start_date = req.body.start_date
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE cases SET start_date = $1 WHERE case_id = $2',
        [start_date, query], 
        (err, results) => {
            if(err){
                throw err;
            }
            res.redirect('/case_view?id='+query);
        }
    )
    
});

app.post('/update-contract-value', (req, res)=>{
    let query = req.query.id
    let contract_value = req.body.contract_value
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE contracts SET contract_value = $1 WHERE contract_id = $2',
        [contract_value, query], 
        (err, results) => {
            if(err){
                throw err;
            }
            res.redirect('/contract_view?id='+query);
        }
    )
    
});
app.post('/update-contract-duration', (req, res)=>{
    let query = req.query.id
    let start_date = req.body.start_date
    let end_date = req.body.end_date
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE contracts SET start_date = $1, end_date = $2 WHERE contract_id = $3',
        [start_date, end_date, query], 
        (err, results) => {
            if(err){
                throw err;
            }
            res.redirect('/contract_view?id='+query);
        }
    )
    
});
app.post('/update-contract-terms', (req, res)=>{
    let query = req.query.id
    let payment_terms = req.body.payment_terms
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE contracts SET payment_terms = $1 WHERE contract_id = $2',
        [payment_terms, query], 
        (err, results) => {
            if(err){
                throw err;
            }
            res.redirect('/contract_view?id='+query);
        }
    )
    
});
app.post('/update-contract-status', (req, res)=>{
    let query = req.query.id
    let status = req.body.status
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE contracts SET status = $1 WHERE contract_id = $2',
        [status, query], 
        (err, results) => {
            if(err){
                throw err;
            }
            res.redirect('/contract_view?id='+query);
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
    let staff_members = req.body.members
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
app.post('/add-budget', (req, res)=>{
    let amount = req.body.amount
    let start_date = req.body.start_date
    let end_date = req.body.end_date
    let notes = req.body.notes
    
    pool.query(
        `INSERT INTO budget ( amount, start_date, end_date, notes, balance)
        VALUES ($1, $2, $3, $4, $5)`,
        [ amount, start_date, end_date, notes, amount], 
        (err, results) => {
            if(err){
                throw err;
            }
            console.log(results.row);
            req.flash('success_msg','You have successfully added a line budget');
            res.redirect('/budget');
        }
    )
})
app.post('/add-line-budget', (req, res)=>{
    for(let i=1;i<line_budget_count+1;i++){
        console.log(budget_balance- req.body[`budget${i}`])

       if( parseFloat(budget_balance) < parseFloat(req.body[`budget${i}`])){
            console.log("budget not enough")
        }else{
            pool.query(
                `INSERT INTO budget_items (budget_name, budget,variance, actual, expenditure)
                VALUES ($1, $2, $3, $4, $5)`,
                [req.body[`budget_name${i}`],req.body[`budget${i}`],0,0,[]], 
                (err, results) => {
                    if(err){
                        throw err;
                    }
                    budget_balance-=req.body[`budget${i}`]
                    console.log(budget_balance,"     ",budget_id)
                    pool.query('UPDATE budget SET balance = $1 WHERE budget_id = $2',
                    [budget_balance, budget_id],
                    (err, result) => {
                        if(err){
                            throw err;
                        }
                        console.log(result)
                    })
                })
                    
                }
            
        }
          
    
    req.flash('success_msg','You have successfully added a line budget item');
    res.redirect('/budget');
})
app.post('/edit-budget', (req, res)=>{
    let query = req.query.id
    let edit_amount = req.body.edit_amount
    let edit_start_date = req.body.edit_start_date
    let edit_end_date = req.body.edit_end_date
    let edit_notes = req.body.edit_notes
    pool.query(
        'UPDATE budget SET amount = $1, start_date = $2, end_date = $3, notes = $4 WHERE budget_id = $5',
        [edit_amount, edit_start_date, edit_end_date,edit_notes, query],
        (err, results) => {
            if(err){
                throw err;
            }
            req.flash('success_msg','You have successfully edited a budget');
            res.redirect('/budget');
        }
    )
})
app.post('/add-expenditure', (req, res)=>{
    let expenditure = req.body.expenditure
    let expenditure_date = req.body.expenditure_date
    let expenditure_desc = req.body.expenditure_desc
    let a = parseFloat(expenditure_actual) + parseFloat(expenditure)
    let b = parseFloat( expenditure_budget) - a
    expenditure_budget -= parseFloat(expenditure_actual)
    console.log(expenditure_budget_id)
    pool.query(
        'SELECT expenditure FROM budget_items WHERE budget_id = $1',
       [parseFloat(expenditure_budget_id)], 
       (err, results) => {
           if(err){
               throw err;
           }
           let array = results.rows[0].expenditure
           if(array == null){
              array = []
           }
           array.push({expenditure_date:expenditure_date,expenditure_desc:expenditure_desc,expenditure:expenditure,balance:expenditure_budget})
           console.log(array)
   pool.query(
      'UPDATE budget_items SET actual = $1, variance = $2, expenditure = $3 WHERE budget_id = $4',
     [a,b,array,expenditure_budget_id], 
     (err, results) => {
         if(err){
             throw err;
         }
         res.redirect('/budget');
     }
  )
    })
  
  })
  app.post('/expenditure_id', (req, res)=>{
      expenditure_budget_id = req.body.budget_id
      expenditure_actual = req.body.actual
      expenditure_budget =req.body.budget
  })
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
app.post('/compliance-form-part-1', (req, res)=>{
   let a = req.body.department
   compliance_department = a
   console.log(compliance_department)
   
})
app.post('/compliance-form-part-2', (req, res)=>{
    let a = req.body.contact_name
    let b = req.body.contact_email
    compliance_contact_name = a
    compliance_contact_email = b
    console.log(compliance_contact_name,compliance_contact_email)
})
app.post('/compliance-form-part-3', (req, res)=>{
    compliance_survey_questions = []
    for(let i=1;i<compliance_count+1;i++){
        if(req.body[`response${i}`] == 'text_input'){
            let a= {
                "type": "text",
                "name": "question"+i,
                "title": req.body[`question${i}`],
                "isRequired": true,
                "response":""
               }
               compliance_survey_questions.push(a)

        }
        if(req.body[`response${i}`] == 'yes_or_no'){
            let b =  {
                "type": "boolean",
                "name": "question"+i,
                "title": req.body[`question${i}`],
                "isRequired": true,
                "response":""
               }
             let c =  {
                "type": "comment",
                "name": "question"+(i)+"a",
                "visibleIf": `{question${i}} = false`,
                "title": "Reason",
                "isRequired": true,
                "response":""
               }
               compliance_survey_questions.push(b)
               compliance_survey_questions.push(c)
        }    }
        pool.query(
            'SELECT * FROM compliance_results WHERE department = $1',
           [compliance_department], 
           (err, results) => {
               if(err){
                   throw err;
               }
               let yourDate = new Date()
               date_created = formatDate(yourDate)
               if(results.rows[0]){
                
                pool.query(
                    'UPDATE compliance_results SET questions = $1, responses = $2, score = $3, contact_person = $4, contact_email = $5, date_completed = $6 WHERE department = $7',
                   [compliance_survey_questions, {}, 0, compliance_contact_name, compliance_contact_email,date_created,compliance_department], 
                   (err, results) => {
                       if(err){
                           throw err;
                       }
                       res.redirect('/budget');
                   }
                )
               }else{
                pool.query(
                    `INSERT INTO compliance_results (department, questions, responses, score, contact_person, contact_email, date_completed)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [compliance_department, compliance_survey_questions, [], 0, compliance_contact_name, compliance_contact_email,date_created], 
                    (err, results1) => {
                        if(err){
                            throw err;
                        }
                    }
                )
               }
            })
        const options = {
            from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
            to: compliance_contact_email, // receiver email
            subject: "Compliance Survey for the department of "+compliance_department, // Subject line
            text: message,
            html: `<div>Greetings ${compliance_contact_name} , Please  click this link to complete Compliance Form  <br> <h1> http://localhost:8080/compliance-survey </h1> </div>`
        }        
        // send mail with defined transport object and mail options
SENDMAIL(options, (info) => {
    console.log("Email sent successfully");
    req.flash('success','Survey successfully sent via Email');
      console.log("MESSAGE ID: ", info.messageId);

 });
   res.redirect('/compliance')
        console.log(compliance_survey_questions)
})
app.get('/download',async (req,res) =>{
    let createCsvWriter = csvwriter.createObjectCsvWriter;

    let usersArray = []
  
    compliance_data.forEach(e=>{
        let b = {
            department:e.department,
            contact_name:e.contact_name,
            contact_email:e.contact_email,
            score: e.score,
            date_completed: e.date_completed,
            questions: JSON.stringify(e.questions)
        }
        console.log( JSON.stringify(e.questions))
        usersArray.push(b)
      })
    const path = 'sample.csv';
   
    const csvWriter = createCsvWriter({
      path: path,
      header: [{ id:'department',title:'Department'},{ id:'contact_person',title:'Contact Person'},{id:'contact_email',title:'Contact Email'},{id:'score',title:'Score'},{id:'questions',title:'Questions'},{id:'date_completed',title:'Date Completed'}]});

    try 
    {
         
         csvWriter.writeRecords(usersArray)
         .then(() => {res.download(path); 
           
        });
    }
    catch (error) 
    {
      console.log(error);
    }
});
app.get('/download1',async (req,res) =>{
    let createCsvWriter = csvwriter.createObjectCsvWriter;
    const path = 'sample1.csv';
    let questions = []
    compliance_data.forEach(e=>{
        questions.push(e.questions)
      })
      console.log(compliance_data)
      console.log(questions)
    const csvWriter = createCsvWriter({
        path: path,
        header: [{ id:'title',title:'Question'},{ id:'response',title:'Response'}]});
        try 
        {
             
             csvWriter.writeRecords(questions[0])
             .then(() => {res.download(path);
            });
        }
        catch (error) 
        {
          console.log(error);
        }    
})
app.post('/compliance_results',(req,res) =>{
    let responses = req.body.responses
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    boolean_count = 0
    boolean_yes_count = 0
    compliance_survey_questions.forEach(e=>{
        if(e.type == 'boolean'){
            boolean_count += 1
        }
    })
    const keys = Object.keys(responses);
    keys.forEach((key, index) => {
       // console.log(`${key}: ${courses[key]}`);
       if(responses[key] == true) boolean_yes_count += 1
       compliance_survey_questions.forEach(e=>{
        if(e.name == key) e.response = responses[key]
     })
    });
    let y = (boolean_yes_count/boolean_count * 100).toFixed(0)
    console.log(y)
    pool.query(
        'UPDATE compliance_results SET responses = $1, date_completed = $2, questions = $3, score = $4 WHERE department = $5',
       [responses, date_created, compliance_survey_questions, y, compliance_department], 
       (err, results) => {
           if(err){
               throw err;
           }
           res.redirect('/budget');
       }
    )
})
app.get('/users/logout', (req,res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        authed =false;
    usrId=''
    nam=''
    req.flash('success', 'You are logged out');
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
                res.render("login",{layout:'./layouts/login-layout',authed:authed,user:nam, errors:errors});
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
app.post('/update-contact-person-count', async (req,res) => { 
    contact_person_count=req.body.count
})
app.post('/reduce-contact-person-count', async (req,res) => { 
    contact_person_count-=1
})
app.post('/update-line-budget-count', async (req,res) => { 
    line_budget_count=req.body.count
})
app.post('/reduce-line-budget-count', async (req,res) => { 
    line_budget_count-=1
})

app.post('/update-compliance-question-count', async (req,res) => { 
    compliance_count=req.body.count
})
app.post('/reduce-compliance-question-count', async (req,res) => { 
    compliance_count-=1
})
app.post('/budget_statement', async (req,res) => {
    console.log(req.body.data) 
    let id = req.body.data
    pool.query('SELECT * FROM budget_items WHERE budget_id = $1',
       [id], 
       (err, results) => {
           if(err){
               throw err;
           }
           budget_statement = results.rows[0].expenditure
           console.log(budget_statement)
           
        })
    
   
})
app.listen(PORT, console.log(`Server running on port ${PORT}`));
