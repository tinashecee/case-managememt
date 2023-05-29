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
const fs = require("fs");
const puppeteer = require('puppeteer');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');

const _ = require('lodash');
// enable files upload


const HTML_TEMPLATE = require("./mail-template.js");
const SENDMAIL = require("./mailer.js") 



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
        cookie: {secure: false },
        resave:true,
        saveUninitialized:true,
    })
);
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(morgan('dev'));
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
let scrapping_results = []
let current_task
let current_vendor
let budgetLineItems



app.post('/upload-case', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            
            //Use the mv() method to place the file in the upload directory (i.e. "uploads")
            avatar.mv('./public/uploads/' + avatar.name);
            let errors =[]
            let message=[]
            let query = req.query.id
            pool.query(
                `SELECT * FROM cases WHERE case_id = $1`,
                [query],
                (err, results) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});;
                        
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
                                errors.push({message: err});;
                                
                            }
                            pool.query( `SELECT * FROM case_status`,
                            [],
                            (err, results2) => {
                                if(err){
                                    console.log(err)
                                    errors.push({message: err});;
                                    
                                }
                            let directory_name = "./public/uploads";
                            let filenames = fs.readdirSync(directory_name);
                              
                            console.log("\nFilenames in directory:");
                            filenames.forEach((file) => {
                                console.log("File:", file);
                            });
                          
                            res.render('case_view',{layout:'./layouts/case_view_layout',user:nam,errors:errors,data:results.rows, dataA:results1.rows,id:query, files:filenames,case_status:results2.rows,id:query})
                        
                        })
                        }
                    )
                }
            )
            
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
app.post('/upload-contract', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            
            //Use the mv() method to place the file in the upload directory (i.e. "uploads")
            avatar.mv('./public/uploads1/' + avatar.name);
            let query = req.query.id
            let errors =[]
            let message=[]
            pool.query(
                `SELECT * FROM contracts WHERE contract_id = $1`,
                [query],
                (err, results) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});;
                        
                    }
                    let dollarUS = Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD", 
                    });
                    pool.query( `SELECT * FROM contract_status`,
                        [],
                        (err, results2) => {
                            if(err){
                                console.log(err)
                                errors.push({message: err});;
                                
                            }
                    let directory_name = "./public/uploads1";
                            let filenames = fs.readdirSync(directory_name);
                              
                            console.log("\nFilenames in directory:");
                            filenames.forEach((file) => {
                                console.log("File:", file);
                            });
                         
                     res.render('contract_view',{layout:'./layouts/contract_view_layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,id:query,files:filenames,contract_status:results2.rows,id:query})
                        })
                }
            )
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
    
  app.get('/display-message', (req, res) => {
      res.render("display-message",{layout:'./layouts/index-layout'});
  });
app.get('',checkNotAuthenticated,  async (req,res) => {
    let errors = []
    pool.query(
        `SELECT * FROM tasks`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});
                
            }
            pool.query(
                `SELECT * FROM cases`,
                [],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});
                        
                    }
                    pool.query(
                        `SELECT * FROM contracts`,
                        [],
                        (err, result2) => {
                            if(err){
                                console.log(err)
                                errors.push({message: err});
                                
                            }        
                            pool.query(
                                `SELECT *
                                FROM contracts
                                WHERE end_date < CURRENT_DATE + INTERVAL '1 month'`,
                                [],
                                (err, result3) => {
                                    if(err){
                                        console.log(err)
                                        errors.push({message: err});
                                        
                                    }
                                    let dollarUS = Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD", 
                                    });
                                    pool.query(
                                        `SELECT * FROM users`,
                                        [],
                                        (err, results4) => {
                                            if(err){
                                                console.log(err)
                                                errors.push({message: err});
                                                
                                            }
                                    console.log(result3.rows)
             array1 = results.rows
           
             res.render('index',{layout:'./layouts/index-layout',dollarUS:dollarUS, expiring_contracts:result3.rows, contracts_length:result2.rows.length ,cases_length:results1.rows.length, tasks:results.rows,authed:authed,user:nam,users:results4.rows})
                })
            })
            })
            })
        }
    )
    
});
app.get('/assistant', async (req,res) => {
    
    res.render('assistant',{layout:'./layouts/assistant-layout'})
});
app.get('/budget',checkNotAuthenticated, async (req,res) => {
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM budget`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});
                
            }
             pool.query(
                `SELECT * FROM budget_items`,
                [],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});
                        
                    }
                     budgetLineItems = results1.rows
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
                    const page = parseInt(req.query.page) || 1; // Current page number
                    const limit = 10; // Number of items per page
                    const startIndex = (page - 1) * limit;
                    const endIndex = page * limit;
                    const reso = results1.rows.slice(startIndex, endIndex);
                   
                     res.render('budget',{layout:'./layouts/budget-layout',user:nam,errors:errors,budget_statement:budget_statement,data:results.rows, data1:reso,page, dollarUS:dollarUS,total_expenditure:total_expenditure,expenditure_left:expenditure_left, current_balance:current_balance})
                }
            )
        }
    )
});
app.get('/calender',  async (req,res) => {
    
    res.render('calender',{layout:'./layouts/calender-layout'})
});
app.get('/cases',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM cases`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
             array3 = results.rows
             pool.query(
                `SELECT name FROM law_firms`,
                [],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});;
                        
                    }
                    pool.query(
                        `SELECT * FROM department`,
                        [],
                        (err, results2) => {
                            if(err){
                                console.log(err)
                                errors.push({message: err});;
                                
                            }
                            pool.query( `SELECT * FROM users`,
                            [],
                            (err, results3) => {
                                if(err){
                                    console.log(err)
                                    errors.push({message: err});;
                                    
                                }
                                pool.query( `SELECT * FROM case_status`,
                                [],
                                (err, results4) => {
                                    if(err){
                                        console.log(err)
                                        errors.push({message: err});;
                                        
                                    }
                     results.rows
                     console.log( results.rows)
                     
                     const page = parseInt(req.query.page) || 1; // Current page number
                    const limit = 10; // Number of items per page
                    const startIndex = (page - 1) * limit;
                    const endIndex = page * limit;
                    const reso = results.rows.slice(startIndex, endIndex);
                   
                     res.render('cases',{layout:'./layouts/lawfirms-layout',user:nam,errors:errors,data:reso,page, dataA:results1.rows,dataB:results2.rows,users:results3.rows,case_status:results4.rows})
                            })
                        })
                        })
                }
            )
        }
    )
   
});
app.post('/survey_elems',  async (req,res) => {
   res.send({compliance_survey_questions:compliance_survey_questions})
})
app.get('/compliance',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM compliance_results`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            compliance_data=results.rows
            pool.query( `SELECT * FROM department`,
            [],
            (err, results3) => {
                if(err){
                    console.log(err)
                    errors.push({message: err});;
                    
                    
                }
               
            res.render('compliance',{layout:'./layouts/compliance-layout',user:nam,errors:errors,compliance_results:results.rows,dataB:results3.rows})
            })
        }
    )
    
    
});
app.get('/compliance-survey',  async (req,res) => {
    
    res.render('compliance_survey',{layout:'./layouts/compliance-survey-layout',compliance_survey_questions:compliance_survey_questions})
});
app.get('/contract_view',checkNotAuthenticated,  async (req,res) => {
    let query = req.query.id
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM contracts WHERE contract_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
            pool.query( `SELECT * FROM contract_status`,
                [],
                (err, results2) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});;
                        
                    }
            let directory_name = "./public/uploads1";
                    let filenames = fs.readdirSync(directory_name);
                      
                    console.log("\nFilenames in directory:");
                    filenames.forEach((file) => {
                        console.log("File:", file);
                    });
                 
             res.render('contract_view',{layout:'./layouts/contract_view_layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,id:query,files:filenames,contract_status:results2.rows,id:query})
                })
        }
    )
});
app.get('/case_view',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    let query = req.query.id
    pool.query(
        `SELECT * FROM cases WHERE case_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
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
                        errors.push({message: err});;
                        
                    }
                    pool.query( `SELECT * FROM case_status`,
                    [],
                    (err, results2) => {
                        if(err){
                            console.log(err)
                            errors.push({message: err});;
                            
                        }
                    let directory_name = "./public/uploads";
                    let filenames = fs.readdirSync(directory_name);
                      
                    console.log("\nFilenames in directory:");
                    filenames.forEach((file) => {
                        console.log("File:", file);
                    });
                  
                    res.render('case_view',{layout:'./layouts/case_view_layout',user:nam,errors:errors,data:results.rows, dataA:results1.rows,id:query, files:filenames,case_status:results2.rows,id:query})
                
                })
                }
            )
        }
    )
   
});
app.get('/contracts',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM contracts`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
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
                    errors.push({message: err});;
                    
                }
                let dollarUS = Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                });
                pool.query( `SELECT * FROM contract_status`,
                [],
                (err, results2) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});;
                        
                        
                    }
                    pool.query( `SELECT * FROM department`,
                    [],
                    (err, results3) => {
                        if(err){
                            console.log(err)
                            errors.push({message: err});;
                            
                            
                        }
                 const page = parseInt(req.query.page) || 1; // Current page number
                 const limit = 10; // Number of items per page
                 const startIndex = (page - 10) * limit;
                 const endIndex = page * limit;
                 const reso = results.rows.slice(startIndex, endIndex);
                
                 res.render('contracts',{layout:'./layouts/contracts-layout',user:nam,errors:errors,data:reso,page,dollarUS:dollarUS,vendors:results1.rows,contract_status:results2.rows,dataB:results3.rows})
                    })
                })
            }
        )
        }
    )
    
});
app.post('/user-roles',  async (req,res) => {
   
})
app.get('/lawfirm_cases',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
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
                        errors.push({message: err});;
                        
                    }
                   
                    res.render('lawfir_cases',{layout:'./layouts/lawfir-cases-layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,cases:results1.rows,law_firm_id:query})

                    
                }
            )
                    }
    )
    
});
app.get('/lawfirm_contracts',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    let query = req.query.id
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
           
            res.render('lawfirm_contracts',{layout:'./layouts/lawfirm-contracts-layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_tasks',checkNotAuthenticated, async (req,res) => {
    let query = req.query.id
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
          
            res.render('lawfirm_contracts',{layout:'./layouts/lawfirm-contracts-layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_contacts',checkNotAuthenticated,  async (req,res) => {
    let query = req.query.id
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
          
            res.render('lawfirmcontacts',{layout:'./layouts/lawfirm-contacts-layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_notes',checkNotAuthenticated,  async (req,res) => {
    let query = req.query.id
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
           
            res.render('lawfirmnotes',{layout:'./layouts/lawfirm-notes-layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});

app.get('/lawfirms',checkNotAuthenticated, async (req,res) => {
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM law_firms`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
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
             
             res.render('lawfirms',{layout:'./layouts/lawfirms-layout',user:nam,errors:errors,data:array, active:active, not_active:not_active})
            }
        }
    )
   
   
});
app.get('/lawfirm_statement',checkNotAuthenticated,  async (req,res) => {
    let query = req.query.id
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
           
            res.render('lawfirmstatement',{layout:'./layouts/lawfirm-statement-layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/lawfirm_view',checkNotAuthenticated, async (req,res) => {
    let query = req.query.id
    let errors =[]
    let message=[]
    pool.query(
        
        `SELECT * FROM law_firms WHERE law_firm_id = $1`,
        [query],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            let dollarUS = Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", 
            });
        
            res.render('lawfirmview',{layout:'./layouts/lawfirm-view-layout',user:nam,errors:errors,data:results.rows,dollarUS:dollarUS,law_firm_id:query})
        }
    )
});
app.get('/learn',checkNotAuthenticated,  async (req,res) => {
    
    res.render('learn',{layout:'./layouts/learn-layout'})
});
app.get('/resources',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    res.render('resources',{layout:'./layouts/resources-layout',user:nam,errors:errors})
});
app.post('/resources-gazettes', async (req,res) => {
    
  let year = req.body.year
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
 console.log(year)
  await page.goto(`https://zimlii.org/gazettes/${year}`);

  // Wait for the gazette items to load
  await page.waitForSelector('li');

  // Extract the gazette titles and links
  const gazetteList = await page.$$eval('li', (liElements) => {
    return liElements.filter((element) => element.innerText.trim().startsWith('Zimbabwe')).map((li) => {
      const titleElement = li.querySelector('a');
      return {
        title: titleElement.innerText.trim(),
        link: titleElement.href
      };
    });
  });

  // Print the gazette titles and links
  gazetteList.forEach((gazette) => {
    console.log('Title:', gazette.title);
    console.log('Link:', gazette.link);
    console.log('----------------------');
  });
   scrapping_results = gazetteList
  await browser.close();
  res.redirect("/resources-gazettes")
});
app.post('/resources-cases-and-judgements', async (req,res) => {
    
    let court = req.body.court
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
   console.log(court)
    
  
    // Navigating to the target website
    await page.goto(`https://zimlii.org/judgments/${court}`);

    await page.waitForSelector('table');

    const judgments = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'));
      rows.shift(); // Remove header row

      return rows.map(row => {
        const linkElement = row.querySelector('td:nth-child(1) a');

        const title = linkElement ? linkElement.textContent.trim() : '';
        const link = linkElement ? linkElement.getAttribute('href') : '';

        return { title, link };
      });
    });

    console.log(judgments);

    await browser.close();
    scrapping_results = judgments
    // Closing the browser
    await browser.close();
    res.redirect("/resources-cases-and-judgements")
  });
app.get('/resources-results',checkNotAuthenticated,  async (req,res) => {
   
    let keyword;
    let keyword_url;
    let errors =[]
    let message=[]
    console.log(req.query.query)
    if(req.query.query == 'cases_and_judgements'){
        keyword = 'cases and judgements zimbabwe'
    }
    if(req.query.query == 'legislation'){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
      
        // Increase the navigation timeout to 60 seconds (60000 milliseconds)
        await page.setDefaultNavigationTimeout(60000);
      
        try {
          await page.goto('https://zimlii.org/legislation/all');
      
          // Wait for the legislation items to load
          await page.waitForSelector('.content__title');
      
          // Extract the legislation titles and URLs
          const legislationList = await page.$$eval('.content__title', (titleElements) => {
            return titleElements.map((element) => {
              const legislationDiv = element.closest('.content');
              const urlElement = legislationDiv.querySelector('a');
              return {
                title: element.innerText.trim(),
                url: urlElement ? urlElement.getAttribute('href') : ''
              };
            });
          });
      
          // Print the legislation titles and URLs
          legislationList.forEach((legislation) => {
            console.log('Title:', legislation.title);
            console.log('URL:', legislation.url);
            console.log('----------------------');
          });
          res.render('resources_legislature',{layout:'./layouts/resources-results-layout',user:nam,errors:errors,results: legislationList})
        } catch (error) {
          console.error('Error:', error);
        } finally {
          await browser.close();
        }
    
    }
    if(req.query.query == 'gazettes'){
        keyword = 'gazettes zimbabwe'
    }
    if(req.query.query == 'regulations'){
        keyword = 'regulations zimbabwe' 
        const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const baseUrl = 'https://www.veritaszim.net/taxonomy/term/8';
  const totalPages = 5; // Specify the number of pages to scrape

  const legislationList = [];

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageUrl = `${baseUrl}?page=${pageIdx}`;

    await page.goto(pageUrl);

    // Wait for the legislation items to load
    await page.waitForSelector('.node-title');

    // Extract the legislation titles and URLs on the current page
    const legislationOnPage = await page.$$eval('.node-title', (titleElements) => {
      return titleElements.map((element) => {
        const titleLink = element.querySelector('a');
        return {
          title: titleLink.innerText.trim(),
          url: titleLink.href
        };
      });
    });

    legislationList.push(...legislationOnPage);
  }

  await browser.close();

  res.render('resources_legislature',{layout:'./layouts/resources-results-layout',user:nam,errors:errors,results: legislationList})
    } 

   
});
app.post('/resources-search-results',  async (req,res) => {
     let keyword = req.body.search
   //  const keyword = 'legal cases zimbabwe';
//scrapeWebsites(keyword);
      // Launch a headless browser instance
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
    
      // Perform a Google search with the provided keyword
      await page.goto(`https://www.google.com/search?q=${keyword}`);
    
      // Extract the search results
      const searchResults = await page.$$eval('.tF2Cxc', (results) => {
        return results.map((result) => {
          const titleElement = result.querySelector('.DKV0Md');
          const urlElement = result.querySelector('a');
          const url = urlElement ? urlElement.href : '';
          return {
            title: titleElement ? titleElement.innerText : '',
            url: url,
          };
        });
      });
    
      // Print the search results
      searchResults.forEach((result) => {
        console.log(`Title: ${result.title}`);
        console.log(`URL: ${result.url}`);
        console.log('----------------------');
      });
      scrapping_results = searchResults
      // Close the browser instance
      await browser.close();
   res.redirect("/resources-gazettes")
});
app.get('/resources-gazettes',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    res.render('resources_gazettes',{layout:'./layouts/resources-results-layout',user:nam,errors:errors,results: scrapping_results})
});
app.get('/resources-cases-and-judgements',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    res.render('resources_gazettes',{layout:'./layouts/resources-results-layout',user:nam,errors:errors,results: scrapping_results})
});
app.get('/settings/users',checkNotAuthenticated,  async (req,res) => {
    let errors = []
    pool.query(
        `SELECT * FROM users`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
          
             res.render('users',{layout:'./layouts/users-layout',user:nam,errors:errors,data:results.rows,user:nam, errors:errors})
          
        }
    )
   
});
app.get('/tasks',checkNotAuthenticated,  async (req,res) => {
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM tasks`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            pool.query(
                `SELECT * FROM users`,
                [],
                (err, results1) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});;
                        
                    }

                    array1 = results.rows
                    const page = parseInt(req.query.page) || 1; // Current page number
                    const limit = 10; // Number of items per page
                    const startIndex = (page - 1) * limit;
                    const endIndex = page * limit;
                    const reso = results.rows.slice(startIndex, endIndex);
                
                    res.render('tasks',{layout:'./layouts/tasks-layout',user:nam,errors:errors,data:reso,page,users:results1.rows})
                })
            
             
          
        }
    )
 
    
});
app.get('/vendors',checkNotAuthenticated, async (req,res) => {
    let errors =[]
    let message=[]
    pool.query(
        `SELECT * FROM vendors`,
        [],
        (err, results) => {
            if(err){
                console.log(err)
                errors.push({message: err});;
                
            }
            pool.query(
                `SELECT * FROM department`,
                [],
                (err, results2) => {
                    if(err){
                        console.log(err)
                        errors.push({message: err});;
                        
                    }
             const page = parseInt(req.query.page) || 1; // Current page number
                    const limit = 10; // Number of items per page
                    const startIndex = (page - 1) * limit;
                    const endIndex = page * limit;
                    const reso = results.rows.slice(startIndex, endIndex);
                
             res.render('vendors',{layout:'./layouts/vendors-layout',user:nam,errors:errors,data:reso,page,dataB:results2.rows})
                })
          
        }
    )
    
});

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        console.log(req.isAuthenticated())
        authed=true;
        return next();
    }
    console.log(req.isAuthenticated())
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
           errors.push({message: err});;
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
                errors.push({message: err});;
                
            }
          result.rows[0].contacts.push({name:name1,email:email1,position:position1,phone:phone1})
          console.log(result.rows[0].contacts)
          pool.query(
            'UPDATE law_firms SET contacts = $1 WHERE law_firm_id = $2',
           [ result.rows[0].contacts, query], 
           (err, results) => {
               if(err){
                   errors.push({message: err});;
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
                errors.push({message: err});;
            }
            req.flash('success','You have successfully added a law firm');
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
                errors.push({message: err});;
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
                errors.push({message: err});;
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
                errors.push({message: err});;
            }
            res.redirect('/case_view?id='+query);
        }
    )
    
});
app.post('/update-case-description', (req, res)=>{
    let query = req.query.id
    let description = req.body.description
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE cases SET notes = $1 WHERE case_id = $2',
        [description, query], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
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
                errors.push({message: err});;
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
                errors.push({message: err});;
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
                errors.push({message: err});;
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
                errors.push({message: err});;
            }
            res.redirect('/contract_view?id='+query);
        }
    )
    
});
app.post('/update-contract-description', (req, res)=>{
    let query = req.query.id
    let description = req.body.description
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
         'UPDATE contracts SET notes = $1 WHERE contract_id = $2',
        [description, query], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
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
                errors.push({message: err});;
            }
            console.log(results)
            req.flash('success','You have successfully updated status of law firm');
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
                errors.push({message: err});;
            }
            req.flash('success','You have successfully added a case');
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
                errors.push({message: err});;
            }
            req.flash('success','You have successfully added a contract');
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
                errors.push({message: err});;
            }
            console.log(results.row);
            req.flash('success','You have successfully added a vendor');
            res.redirect('/vendors');
        }
    )
});
app.post('/edit-vendor', (req, res)=>{
    console.log(req.body)
    let contact_person = req.body.contactPerson
    let phone_number = req.body.phoneNumber
    let company_name = req.body.vendorName
    let physical_address = req.body.address
    let vat_number = req.body.vatNumber
    let email = req.body.email
    pool.query(
        `UPDATE vendors SET  phone_number = $1, contact_person = $2, company_name = $3, vat_number = $4, physical_address = $5, email = $6 WHERE vendor_id = $7`,
        [ phone_number, contact_person, company_name, vat_number, physical_address, email, current_vendor], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            console.log(results.row);
            req.flash('message','You have successfully updated a vendor');
            res.redirect('/vendors');
        }
    )
});
app.post('/delete-vendor', (req, res)=>{
    console.log(current_vendor)
    pool.query(
        `DELETE from vendors WHERE vendor_id = $1`,
        [current_vendor], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully deleted a vendor');
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
                errors.push({message: err});;
            }
            console.log(results.row);
            req.flash('success','You have successfully added budget');
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
                        errors.push({message: err});;
                    }
                    budget_balance-=req.body[`budget${i}`]
                    console.log(budget_balance,"     ",budget_id)
                    pool.query('UPDATE budget SET balance = $1 WHERE budget_id = $2',
                    [budget_balance, budget_id],
                    (err, result) => {
                        if(err){
                            errors.push({message: err});;
                        }
                        console.log(result)
                    })
                })
                    
                }
            
        }
          
    
    req.flash('success','You have successfully added a line budget item');
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
                errors.push({message: err});;
            }
            req.flash('success','You have successfully edited a budget');
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
               errors.push({message: err});;
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
             errors.push({message: err});;
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
app.post('/edit-task', (req, res)=>{
    console.log(req.body)
    let task_name = req.body.taskName
    let start_date = req.body.startDate
    let due_date = req.body.dueDate
    let priority = req.body.priority
    let frequency = req.body.frequency
    let assigness = req.body.assiigness
    let task_description = req.body.taskDescription
    let statuss = req.body.status
    let yourDate = new Date()
    date_created = formatDate(yourDate)
    pool.query(
        `UPDATE tasks SET name = $1, start_date = $2, due_date = $3, priority = $4, frequency = $5, assigned_to = $6, description = $7, status = $8 WHERE task_id = $9`,
        [task_name, start_date, due_date, priority, frequency, assigness, task_description, statuss,current_task], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully edited task');
            res.redirect('/tasks');
        }
    )
});
app.post('/add-tasks', (req, res)=>{
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
                errors.push({message: err});;
            }
            req.flash('success','You have successfully added a task');
            res.redirect('/tasks');
        }
    )
});
app.post('/delete-task', (req, res)=>{
    
    pool.query(
        `DELETE from tasks WHERE task_id = $1`,
        [current_task], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully deleted a task');
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
                   errors.push({message: err});;
               }
               let yourDate = new Date()
               date_created = formatDate(yourDate)
               if(results.rows[0]){
                
                pool.query(
                    'UPDATE compliance_results SET questions = $1, responses = $2, score = $3, contact_person = $4, contact_email = $5, date_completed = $6 WHERE department = $7',
                   [compliance_survey_questions, {}, 0, compliance_contact_name, compliance_contact_email,date_created,compliance_department], 
                   (err, results) => {
                       if(err){
                           errors.push({message: err});;
                       }
                   }
                )
               }else{
                pool.query(
                    `INSERT INTO compliance_results (department, questions, responses, score, contact_person, contact_email, date_completed)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [compliance_department, compliance_survey_questions, [], 0, compliance_contact_name, compliance_contact_email,date_created], 
                    (err, results1) => {
                        if(err){
                            errors.push({message: err});;
                        }
                    }
                )
               }
            })
            const message = "Email for completing compliance form."
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
    console.log("MESSAGE ID: ", info.messageId);
    req.flash('success','Survey successfully sent via Email');
   res.redirect('/compliance')
      

 });
 
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
app.get('/download3',async (req,res) =>{
    let createCsvWriter = csvwriter.createObjectCsvWriter;

    let usersArray = array
  
    
    const path = 'sample2.csv';
   
    const csvWriter = createCsvWriter({
      path: path,
      header: [{ id:'law_firm_id',title:'ID'},{ id:'name',title:'Name'},{id:'email',title:'Email'},{id:'address',title:'Address'},{id:'phone_number',title:'Phone Number'},{id:'vat_number',title:'VAT Number'},{id:'website',title:'Website'}]});

    try 
    {
         
         csvWriter.writeRecords(usersArray)
         .then(() => {
            res.download(path); 
           
        });
    }
    catch (error) 
    {
      console.log(error);
    }
});
app.get('/download4',async (req,res) =>{
    let createCsvWriter = csvwriter.createObjectCsvWriter;

    let usersArray = budgetLineItems
   
    console.log(budgetLineItems)
    const path = 'sample3.csv';
    const csvWriter = createCsvWriter({
      path: path,
      header: [{ id:'budget_id',title:'ID'},{ id:'budget',title:'Budget'},{id:'actual',title:'Actual'},{id:'variance',title:'Variance'},{id:'start_date',title:'Start Date'},{id:'end_date',title:'End Date'},{id:'budget_name',title:'Budget Name'}]});

    try 
    {
         
         csvWriter.writeRecords(usersArray)
         .then(() => {
            res.download(path); 
           
        });
    }
    catch (error) 
    {
      console.log(error);
    }
});
app.get('/download5',async (req,res) =>{
    let createCsvWriter = csvwriter.createObjectCsvWriter;

    
    let  arrayD = []
    budgetLineItems.forEach(e=>{
        if(e.expenditure.length > 0){ 
        e.expenditure.forEach(f=>{
            arrayD.push(f)
        })
    }
    
    })
    let usersArray = arrayD
    const path = 'sample4.csv';
    const csvWriter = createCsvWriter({
      path: path,
      header: [{ id:'expenditure_date',title:'Expenditure Date'},{ id:'expenditure_desc',title:'Expenditure Description'},{id:'expenditure',title:'Expenditure'},{id:'balance',title:'Balance'}]});

    try 
    {
         
         csvWriter.writeRecords(usersArray)
         .then(() => {
            res.download(path); 
           
        });
    }
    catch (error) 
    {
      console.log(error);
    }
});
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
    let y = boolean_yes_count+"/"+boolean_count
    console.log(y)
    pool.query(
        'UPDATE compliance_results SET responses = $1, date_completed = $2, questions = $3, score = $4 WHERE department = $5',
       [responses, date_created, compliance_survey_questions, y, compliance_department], 
       (err, results) => {
           if(err){
               errors.push({message: err});;
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
    let errors = []
    res.render('login',{layout:'./layouts/login-layout',authed:authed,user:nam, errors:errors});
});
app.get('/forgot-password', (req,res) => {
    let errors = []
    res.render('passwordreset',{layout:'./layouts/login-layout',errors:errors});
});
app.get('/reset-password', (req,res) => {
   let errors = []
    res.render('passwordreset',{layout:'./layouts/login-layout',errors:errors});
});
app.get('/reset-password-email-sent', (req,res) => {
   
    res.render('passwordresetemailsent',{layout:'./layouts/login-layout'});
});
app.get('/set-password', (req,res) => {
    let email= req.query.email
    let user_name = req.query.user_name
    let role = req.query.role 
    let errors = []
    res.render('password',{layout:'./layouts/login-layout',email:email,errors:errors});
});
app.post('/reset-password', async (req,res) => {
    let email = req.body.email
    pool.query(
        'SELECT * FROM users WHERE email = $1',
       [email], 
       (err, results) => {
           if(err){
            errors.push({message: err});
            res.render('passwordreset',{layout:'./layouts/login-layout', errors:errors})
           }
           if(results.rows.length == 0){
            errors.push({message: 'Email is not registered in the system!'});
            res.render('passwordreset',{layout:'./layouts/login-layout', errors:errors})
           }else{
            const message = "Email to reset password of your Nust Case Management System account"
            const options = {
                from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
                to: email, // receiver email
                subject: "Prolegal Case Management System - Account Verification", // Subject line
                text: message,
                html: `<div>
                <p>Hi, <b>${results.rows[0].name}</b>,</p>
                <p>We received a request to reset your password for your Prolegal Case Management account. If you did not request this, please disregard this email.</p>
                <p>To reset your password, please click on the following link:</p>
                <a href="https://case-management.herokuapp.com/set-password?email=${email}">RESET PASSWORD LINK</a>
                <p>This link will only be valid for 24 hours.</p>
                <p>If you are unable to click on the link, please copy and paste it into your browser.</p>
                <p>Once you have clicked on the link, you will be taken to a page where you can enter a new password for your account. Please choose a strong password that is at least 8 characters long and includes a mix of upper and lowercase letters, numbers, and symbols.</p>
                <p>After you have entered your new password, you will be able to log in to your account.</p>
                <p>If you have any questions, please do not hesitate to contact us.</p>
                <p>Thank you,</p>
                <p>Prolegal Team</p>
        </div>`
            }        
            // send mail with defined transport object and mail options
        SENDMAIL(options, (info) => {
        console.log("Email sent successfully");
        req.flash('success','Reset Password email sent');
          console.log("MESSAGE ID: ", info.messageId);
          res.redirect("/reset-password-email-sent")
        });
           }
       }
   )
   

})
app.post('/set-password', async (req,res) => {
    let email = req.query.email
   let password1 = req.body.new_password
   let password2 = req.body.confirm_password
   errors = []
   if(password1 != password2){
    errors.push({message: "Passwords do not match"});
   
    console.log(errors)
 res.render("password",{layout:'./layouts/login-layout',errors:errors});
}
else{
    let hashedPassword = await bcrypt.hash(password1, 10);
    console.log(email)
    pool.query(
        'UPDATE users SET password = $1, activated = $2 WHERE email = $3',
       [hashedPassword, true, email], 
       (err, results) => {
           if(err){
            errors.push({message: err});
        
      res.render("set-password",{layout:'./layouts/login-layout',errors:errors});
     
           }
           req.flash('success','Password setup successfull, you can now login into your account');
           res.redirect('/login');
       }
    )
}

})
app.get('/settings/user-roles',checkNotAuthenticated, (req,res) => {
    let errors=[]
    let message=[]
    pool.query(
        'SELECT * FROM user_roles',
       [], 
       (err, results) => {
           if(err){
               errors.push({message: err});;
           }
           res.render('user-roles',{layout:'./layouts/users-layout',authed:authed,user:nam,errors:errors,data1:results.rows});
       }
    )
    
    
});
app.get('/settings/departments',checkNotAuthenticated, (req,res) => {
   let errors=[]
   let message=[]
    pool.query(
        `SELECT * FROM department`,
        [], 
        (err, results1) => {
            if(err){
                errors.push({message: err});;
            }
            res.render('departments',{layout:'./layouts/users-layout',authed:authed,user:nam,errors:errors,data1:results1.rows});
        }
    );
});
app.get('/settings/case-status',checkNotAuthenticated, (req,res) => {
    let errors=[]
    let message=[]
    pool.query(
        `SELECT * FROM case_status`,
        [], 
        (err, results1) => {
            if(err){
                errors.push({message: err});;
            }
            pool.query(
                `SELECT * FROM contract_status`,
                [], 
                (err, results2) => {
                    if(err){
                        errors.push({message: err});;
                    }
                    res.render('case-status',{layout:'./layouts/users-layout',authed:authed,user:nam,errors:errors,data1:results1.rows,data2:results2.rows});
                }
            );
           
        }
    );
    
});
app.post('/update', async (req, res) => {
 
      const { role, law_firms, cases, contracts, vendors, compliance, legal_resources, settings } = req.body;
  
      // Update query
      const updateQuery = `
        UPDATE user_roles
        SET
          law_firms = $1,
          cases = $2,
          contracts = $3,
          vendors = $4,
          compliance = $5,
          legal_resources = $6,
          settings = $7
        WHERE role = $8
      `;
  
      // Execute the update query
      await pool.query(updateQuery, [
        law_firms,
        cases,
        contracts,
        vendors,
        compliance,
        legal_resources,
        settings,
        role,
      ]);
  
      res.redirect('/settings/user-roles');
    
  });
app.post('/case_status', (req,res) => {
    let case_status_name = req.body.case_status_name
    let description = req.body.description
    pool.query(
        `INSERT INTO case_status (case_status_name, description)
        VALUES ($1, $2)`,
        [case_status_name, description], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully added a Case Status');
            res.redirect('/settings/case-status');
        }
    )
});
app.post('/contract_status', (req,res) => {
    let contract_status_name = req.body.case_status_name
    let description = req.body.description
    pool.query(
        `INSERT INTO contract_status (contract_status_name, description)
        VALUES ($1, $2)`,
        [contract_status_name, description], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully added a Contract Status');
            res.redirect('/settings/case-status');
        }
    )
});
app.post('/department', (req,res) => {
    let department_name = req.body.department_name
    let contact_email = req.body.contact_email
    let contact_person = req.body.contact_person
    pool.query(
        `INSERT INTO department (department_name,contact_person, contact_email)
        VALUES ($1, $2, $3)`,
        [department_name, contact_person, contact_email], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully added a Department');
            res.redirect('/settings/departments');
        }
    )
});
app.post('/new_user', (req,res) => {
    let user_name = req.body.user_name
    let email = req.body.email
    let role = req.body.role
    let errors = []
    let message=[]
    pool.query(
        `INSERT INTO users (email,name,role,activated,archived,password)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [email, user_name, role, false, false,""], 
        (err, results) => {
            if(err){
                    errors.push({message: err});
                   
                    pool.query(
                        `SELECT * FROM users`,
                        [],
                        (err, results) => {
                            if(err){
                                console.log(err)
                                errors.push({message: err});
                                res.render('users',{layout:'./layouts/users-layout',data:results.rows,user:nam,errors:errors,message:messge})
                                
                            }
                           
                          
                        }
                    )

                   
            }
            const message = "Email to activate your Nust Case Management System account"
            const options = {
                from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
                to: email, // receiver email
                subject: "Prolegal Case Management System - Account Verification", // Subject line
                text: message,
                html: `<div>
                <p>Hi <b>${user_name}</b>,</p>
        <p>Your account on the Prolegal Case Management System has been created successfully. To verify your account and set your password, please click on the following link:</p>
        <a href="https://case-management.herokuapp.com/set-password?email=${email}">ACTIVATION LINK</a>
        <p>Once you have clicked on the link, you will be prompted to enter a new password for your account. Please choose a strong password that is at least 8 characters long and includes a mix of upper and lowercase letters, numbers, and symbols.</p>
        <p>After you have entered your new password, you will be able to log in to your account.</p>
        <p>If you have any questions, please do not hesitate to contact us.</p>
        <p>Thank you,</p>
        <p>Prolegal Case Management Team</p>
        </div>`
            }        
            // send mail with defined transport object and mail options
        SENDMAIL(options, (info) => {
        console.log("Email sent successfully");
        req.flash('success','New User has been created and an email sent to them to activate their account');
          console.log("MESSAGE ID: ", info.messageId);
          res.redirect("/settings/users")
        });
        }
    )
  
})
app.get('/delete-department',checkNotAuthenticated, (req,res) => {
    let id = req.query.id
    pool.query(
        `DELETE FROM department WHERE id = $1`,
        [id], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully deleted a Department');
            res.redirect('/settings/departments');
        }
    )
});
app.get('/delete-case-status',checkNotAuthenticated, (req,res) => {
    let id = req.query.id
    pool.query(
        `DELETE FROM case_status WHERE id = $1`,
        [id], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully deleted a Case Status');
            res.redirect('/settings/case-status');
        }
    )
});
app.get('/delete-contract-status',checkNotAuthenticated, (req,res) => {
    let id = req.query.id
    pool.query(
        `DELETE FROM contract_status WHERE id = $1`,
        [id], 
        (err, results) => {
            if(err){
                errors.push({message: err});;
            }
            req.flash('success','You have successfully deleted a Contract Status');
            res.redirect('/settings/case-status');
        }
    )
});
app.get('/users/logout', (req,res) => {
    req.logOut();
    authed =false;
    usrId=''
    nam=''
    req.flash('success', 'You logged out');
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
                   errors.push({message: err});;
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
                              errors.push({message: err});;
                          }
                          console.log(results.row);
                          req.flash('success','You are now registered. Please log in');
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
    console.log(req.isAuthenticated())
    res.redirect('/')

}
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
app.post('/current_task', async (req,res) => { 
    current_task = req.body.task_id
})
app.post('/current_vendor', async (req,res) => { 
    current_vendor = req.body.vendor_id
})
app.post('/budget_statement', async (req,res) => {
    console.log(req.body.data) 
    let id = req.body.data
    pool.query('SELECT * FROM budget_items WHERE budget_id = $1',
       [id], 
       (err, results) => {
           if(err){
               errors.push({message: err});;
           }
           budget_statement = results.rows[0].expenditure
           console.log(budget_statement)
           
        })
    
   
})
app.listen(PORT, console.log(`Server running on port ${PORT}`));
