const express = require("express");
//const exphbs = require('express-handlebars');
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool } = require("./dbConfig");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const initializePassport = require("./passportConfig");
const fs = require("fs");
const puppeteer = require("puppeteer");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const Excel = require("exceljs");
const PDFGenerator = require("pdfkit");
const morgan = require("morgan");
const CronJob = require("cron").CronJob;
("use strict");
const SENDMAIL = require("./mailer.js");
const moment = require("moment");
const SENDCONTRACTEXPIRY = require("./contract-expiry-email.js");
const SENDTASKEMAIL = require("./task-email.js");
const SENDCASEEMAIL = require("./case-email.js");
const app = express();
initializePassport(passport);
const PORT = process.env.PORT || 8080;
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser("NotSoSecret"));

//Configure redis client
app.use(
  session({
    secret: "secret$%^134",
    resave: true,
    saveUninitialized: false,
    cookie: {
      // Only set to true if you are using HTTPS.
      // Secure Set-Cookie attribute.
      secure: false,
      // Only set to true if you are using HTTPS.
      httpOnly: false,
      // Session max age in milliseconds. (1 min)
      // Calculates the Expires Set-Cookie attribute
      maxAge: 60 * 60 * 1000,
    },
  })
);
app.use(
  fileUpload({
    createParentPath: true,
  })
);

//add other middleware
app.use(cors());
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.moment = moment;
  next();
});
app.use(function (req, res, next) {
  res.locals.message = req.flash();
  next();
});
let authed = false;

let array = [];
let array1 = [];
let array2 = [];
let array3 = [];
let errors = [];
let contact_person_count = 1;
let line_budget_count = 1;
let compliance_count = 1;
let budget_balance = 0;
let budget_amount = 0;
let budget_id = "";
let expenditure_budget_id = "";
let expenditure_budget = "";
let expenditure_actual = "";
let total_expenditure = 0;
let expenditure_left = 0;
let current_balance = 0;
let budget_statement = [];
let compliance_department = "";
let compliance_contact_name = "";
let compliance_contact_email = "";
let compliance_filter_department = "All";
let compliance_survey_questions = [];
let compliance_data = [];
let compliance_array = [];
let scrapping_results = [];
let budgetLineItems;
let user_role = "";
let export_compliance_id = "";
let my_ts = [];
const InvoiceGenerator = require("./pdf-generator");
const InvoiceGenerator1 = require("./pdf-generator1");
const InvoiceGenerator2 = require("./pdf-generator2");
const InvoiceGenerator3 = require("./pdf-generator3");
const InvoiceGenerator4 = require("./pdf-generator4");
const InvoiceGenerator5 = require("./pdf-generator5");
const InvoiceGenerator6 = require("./pdf-generator6");
const InvoiceGenerator7 = require("./pdf-generator7");
const InvoiceGenerator8 = require("./pdf-generator8");
//cron job
if (process.env.NODE_APP_INSTANCE === "0") {
  const job = new CronJob(
    "0 8 * * *",
    function () {
      pool.query(
        `SELECT *
            FROM contracts
            WHERE end_date = CURRENT_DATE + INTERVAL '3 month'`,
        [],
        (err, results1) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          pool.query(
            `SELECT *
                    FROM users`,
            [],
            (err, results2) => {
              if (err) {
                console.log(err);
                errors.push({ message: err });
              }
              results2.rows.forEach((e) => {
                SENDCONTRACTEXPIRY(
                  e.email,
                  results1.rows[0].name,
                  3,
                  e.name,
                  results1.rows[0].vendor,
                  results1.rows[0].end_date,
                  results1.rows[0].notes,
                  results1.rows[0].contract_value
                );
              });
            }
          );
        }
      );
      pool.query(
        `SELECT *
                FROM contracts
                WHERE end_date = CURRENT_DATE + INTERVAL '2 month'`,
        [],
        (err, results1) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          pool.query(
            `SELECT *
                        FROM users`,
            [],
            (err, results2) => {
              if (err) {
                console.log(err);
                errors.push({ message: err });
              }
              results2.rows.forEach((e) => {
                SENDCONTRACTEXPIRY(
                  e.email,
                  results1.rows[0].name,
                  2,
                  e.name,
                  results1.rows[0].vendor,
                  results1.rows[0].end_date,
                  results1.rows[0].notes,
                  results1.rows[0].contract_value
                );
              });
            }
          );
        }
      );
      pool.query(
        `SELECT *
                    FROM contracts
                    WHERE end_date = CURRENT_DATE + INTERVAL '1 month'`,
        [],
        (err, results1) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          pool.query(
            `SELECT *
                            FROM users`,
            [],
            (err, results2) => {
              if (err) {
                console.log(err);
                errors.push({ message: err });
              }
              results2.rows.forEach((e) => {
                SENDCONTRACTEXPIRY(
                  e.email,
                  results1.rows[0].name,
                  1,
                  e.name,
                  results1.rows[0].vendor,
                  results1.rows[0].end_date,
                  results1.rows[0].notes,
                  results1.rows[0].contract_value
                );
              });
            }
          );
        }
      );
    },
    null,
    true,
    "Etc/UTC"
  );
  job.start();
}
function sendEmail(a, b, c, d, e, f) {
  pool.query(`SELECT * FROM users WHERE name = $1`, [a], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }

    SENDTASKEMAIL(results.rows[0].email, a, b, c, d, e, f);
  });
}
function sendEmail1(a, b, c, d, e, f) {
  pool.query(`SELECT * FROM users WHERE name = $1`, [a], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }

    SENDCASEEMAIL(email, a, b, c, d, e, f);
  });
}
app.post("/upload-case", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of  the input field (i.e. "avatar") to retrieve the uploaded file
      let avatar = req.files.avatar;

      //Use the mv() method to place the file in the upload directory (i.e. "uploads")
      avatar.mv("./public/uploads/" + avatar.name);
      let errors = [];
      let message = [];
      let query = req.query.id;
      let attachments = [];
      pool.query(
        "SELECT * FROM cases WHERE case_id = $1",
        [query],
        (err, resulto) => {
          if (err) {
            errors.push({ message: err });
          }
          if (resulto.rows[0].attachments == null) {
            attachments = [];
          } else {
            attachments = resulto.rows[0].attachments;
          }

          attachments.push(avatar.name);

          pool.query(
            "UPDATE cases SET attachments = $1 WHERE case_id = $2",
            [attachments, query],
            (err, results) => {
              if (err) {
                errors.push({ message: err });
              }
            }
          );
        }
      );

      pool.query(
        `SELECT * FROM cases WHERE case_id = $1`,
        [query],
        (err, results) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          let dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          });
          pool.query(`SELECT name FROM law_firms`, [], (err, results1) => {
            if (err) {
              console.log(err);
              errors.push({ message: err });
            }
            pool.query(`SELECT * FROM case_status`, [], (err, results2) => {
              if (err) {
                console.log(err);
                errors.push({ message: err });
              }
              attachments.forEach((file) => {
                //  console.log("File:", file);
              });
              req.flash("success", "You have successfully added a file");
              res.redirect("/case_view?id=" + query);
            });
          });
        }
      );
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
app.post("/upload-contract", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let avatar = req.files.avatar;

      //Use the mv() method to place the file in the upload directory (i.e. "uploads")
      avatar.mv("./public/uploads1/" + avatar.name);
      let query = req.query.id;
      let errors = [];
      let attachments = [];
      // console.log(query)

      pool.query(
        "SELECT * FROM contracts WHERE contract_id = $1",
        [query],
        (err, resulto) => {
          if (err) {
            errors.push({ message: err });
          }
          if (resulto.rows[0].attachments == null) {
            attachments = [];
          } else {
            attachments = resulto.rows[0].attachments;
          }

          attachments.push(avatar.name);

          pool.query(
            "UPDATE contracts SET attachments = $1 WHERE contract_id = $2",
            [attachments, query],
            (err, results) => {
              if (err) {
                errors.push({ message: err });
              }
            }
          );
        }
      );
      pool.query(
        `SELECT * FROM contracts WHERE contract_id = $1`,
        [query],
        (err, results) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          let dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          });
          pool.query(`SELECT * FROM contract_status`, [], (err, results2) => {
            if (err) {
              console.log(err);
              errors.push({ message: err });
            }

            req.flash("success", "You have successfully added a file");
            res.redirect("/contract_view?id=" + query);
          });
        }
      );
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
app.post("/contract-renewal-email", async (req, res) => {
  let department = req.query.department;
  let expiry = formatDate(req.query.expiry_date);
  let contract_name = req.query.contract_name;
  let desc = req.query.desc;
  let contract_value = req.query.contract_value;
  pool.query(
    `SELECT *
        FROM department WHERE department_name = $1`,
    [department],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let email = results.rows[0].contact_email;
      let name = results.rows[0].contact_person;
      const message = "Expiring Contract Alert";
      const options = {
        from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
        to: email, // receiver email
        subject: `A contract is about to expire on ${expiry} !`, // Subject line
        text: message,
        html: `<p>Hi ${name},</p>
        <p>This is a reminder that the contract  ${contract_name} is about to expire on ${expiry}.</p>
        <p>Please review the contract details below:</p>
        <ul>
        <li>Contract Name: ${contract_name}</li>
        <li>Contract Description: ${desc}</li>
        <li>Contract Value: $ ${contract_value}</li>
        <li>Expiry Date: ${expiry}</li>
        </ul>
        <p>Please contact us if you have any questions or need to renew the contract.</p>
        <p>Thank you,</p>
        <p>Prolegal Team</p>`,
      };
      // send mail with defined transport object and mail options
      SENDMAIL(options, (info) => {
        req.flash("success", "You have successfully sent a renewal email");
        res.redirect("/");
      });
    }
  );
});
app.post("/delete-contract-file", async (req, res) => {
  const path = "./public/uploads1/" + req.query.path;
  const query = req.query.id;

  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    let errors = [];
    let attachments = [];

    pool.query(
      "SELECT * FROM contracts WHERE contract_id = $1",
      [query],
      (err, resulto) => {
        if (err) {
          errors.push({ message: err });
        }
        if (resulto.rows[0].attachments == null) {
          attachments = [];
        } else {
          attachments = resulto.rows[0].attachments;
        }

        let count = 0;
        attachments.forEach((e) => {
          if (e == req.query.path) {
            attachments.splice(count, 1);
          }
          count += 1;
        });

        pool.query(
          "UPDATE contracts SET attachments = $1 WHERE contract_id = $2",
          [attachments, query],
          (err, results) => {
            if (err) {
              errors.push({ message: err });
            }
          }
        );
      }
    );
    pool.query(
      `SELECT * FROM contracts WHERE contract_id = $1`,
      [query],
      (err, results) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        let dollarUS = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });
        pool.query(`SELECT * FROM contract_status`, [], (err, results2) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }

          req.flash("success", "You have successfully deleted a file");
          res.redirect("/contract_view?id=" + query);
        });
      }
    );
  });
});
app.post("/delete-case-file", async (req, res) => {
  const path = "./public/uploads/" + req.query.path;
  const query = req.query.id;

  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    let errors = [];
    let message = [];
    let query = req.query.id;
    let attachments = [];
    pool.query(
      "SELECT * FROM cases WHERE case_id = $1",
      [query],
      (err, resulto) => {
        if (err) {
          errors.push({ message: err });
        }
        if (resulto.rows[0].attachments == null) {
          attachments = [];
        } else {
          attachments = resulto.rows[0].attachments;
        }

        let count = 0;
        attachments.forEach((e) => {
          if (e == req.query.path) {
            attachments.splice(count, 1);
          }
          count += 1;
        });

        pool.query(
          "UPDATE cases SET attachments = $1 WHERE case_id = $2",
          [attachments, query],
          (err, results) => {
            if (err) {
              errors.push({ message: err });
            }
          }
        );
      }
    );

    pool.query(
      `SELECT * FROM cases WHERE case_id = $1`,
      [query],
      (err, results) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        let dollarUS = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });
        pool.query(`SELECT name FROM law_firms`, [], (err, results1) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          pool.query(`SELECT * FROM case_status`, [], (err, results2) => {
            if (err) {
              console.log(err);
              errors.push({ message: err });
            }
            //  console.log("\nFilenames in directory:");
            attachments.forEach((file) => {
              //     console.log("File:", file);
            });
            req.flash("success", "You have successfully deleted a file");
            res.redirect("/case_view?id=" + query);
          });
        });
      }
    );
  });
});
app.post("/delete-case", async (req, res) => {
  let id = req.query.id;
  pool.query("DELETE FROM cases WHERE case_id = $1", [id], (err, resulto) => {
    if (err) {
      errors.push({ message: err });
      console.log(err);
    }
    req.flash("success", "You have successfully deleted a case");
    res.redirect("/cases");
  });
});
app.post("/delete-contract", async (req, res) => {
  let id = req.query.id;
  pool.query(
    "DELETE FROM contracts WHERE contract_id = $1",
    [id],
    (err, resulto) => {
      if (err) {
        errors.push({ message: err });
        console.log(err);
      }
      req.flash("success", "You have successfully deleted a contract");
      res.redirect("/contracts");
    }
  );
});
app.post("/delete-lawfirm", async (req, res) => {
  let id = req.query.id;
  pool.query(
    "DELETE FROM law_firms WHERE law_firm_id = $1",
    [id],
    (err, resulto) => {
      if (err) {
        errors.push({ message: err });
        console.log(err);
      }
      req.flash("success", "You have successfully deleted a law firm");
      res.redirect("/lawfirms");
    }
  );
});
app.post("/upload-document", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let avatar = req.files.avatar;

      //Use the mv() method to place the file in the upload directory (i.e. "uploads")
      avatar.mv("./public/uploads4/" + avatar.name);
      let query = req.query.id;
      let errors = [];
      let docs = [];
      // console.log(query)

      pool.query(
        "SELECT * FROM documents WHERE document_id = $1",
        [query],
        (err, resulto) => {
          if (err) {
            errors.push({ message: err });
          }
          if (resulto.rows[0].docs == null || resulto.rows[0].docs == []) {
            docs = [];
          } else {
            docs = resulto.rows[0].docs;
          }

          docs.push(avatar.name);
          pool.query(
            "UPDATE documents SET docs = $1 WHERE document_id = $2",
            [docs, query],
            (err, resultis) => {
              if (err) {
                errors.push({ message: err });
                console.log(err);
              }
              console.log(resultis);

              req.flash("success", "You have successfully added a file");
              res.redirect("/documents-view?id=" + query);
            }
          );
        }
      );
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
app.post("/delete-document-file", async (req, res) => {
  const path = "./public/uploads4/" + req.query.path;
  const query = req.query.id;

  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    let errors = [];
    let docs = [];

    pool.query(
      "SELECT * FROM documents WHERE document_id = $1",
      [query],
      (err, resulto) => {
        if (err) {
          errors.push({ message: err });
          console.log(err);
        }
        if (resulto.rows[0].docs == null) {
          docs = [];
        } else {
          docs = resulto.rows[0].docs;
        }

        let count = 0;
        docs.forEach((e) => {
          if (e == req.query.path) {
            docs.splice(count, 1);
          }
          count += 1;
        });

        pool.query(
          "UPDATE documents SET docs = $1 WHERE document_id = $2",
          [docs, query],
          (err, results) => {
            if (err) {
              errors.push({ message: err });
            }
          }
        );
      }
    );
    pool.query(
      `SELECT * FROM docs WHERE document_id = $1`,
      [query],
      (err, results) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }

        req.flash("success", "You have successfully deleted a file");
        res.redirect("/documents-view?id=" + query);
      }
    );
  });
});
app.get("/display-message", (req, res) => {
  res.render("display-message", { layout: "./layouts/index-layout" });
});
app.get("", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  pool.query(`SELECT * FROM tasks`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }
    let tasks = [];
    results.rows.forEach((e) => {
      if (e.status == "ACTIVE") tasks.push(e);
    });
    pool.query(`SELECT * FROM cases`, [], (err, results1) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      pool.query(`SELECT * FROM contracts`, [], (err, result2) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        pool.query(
          `SELECT *
                                FROM contracts
                                WHERE end_date < CURRENT_DATE + INTERVAL '3 month' AND status != 'Completed'`,
          [],
          (err, result3) => {
            if (err) {
              console.log(err);
              errors.push({ message: err });
            }

            let dollarUS = Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            });
            pool.query(`SELECT * FROM users`, [], (err, results4) => {
              if (err) {
                console.log(err);
                errors.push({ message: err });
              }
              results4.rows.forEach((e) => {
                if (e.name.toLowerCase() == req.session.user.toLowerCase()) {
                  user_role = e.role;
                }
              });
              array1 = results.rows;
              pool.query(`SELECT * FROM timesheets`, [], (err, results5) => {
                if (err) {
                  console.log(err);
                  errors.push({ message: err });
                }
                pool.query(`SELECT * FROM events`, [], (err, results7) => {
                  if (err) {
                    console.log(err);
                    errors.push({ message: err });
                  }
                  let _all_timesheets = results5.rows;
                  pool.query(
                    `SELECT * FROM timesheets WHERE timesheet_owner = $1`,
                    [req.session.user],
                    (err, results6) => {
                      if (err) {
                        console.log(err);
                        errors.push({ message: err });
                      }
                      function compare(a, b) {
                        if (a.start_date > b.start_date) {
                          return -1;
                        }
                        if (a.start_date < b.start_date) {
                          return 1;
                        }
                        return 0;
                      }
                      let _my_timesheets = results6.rows;
                      my_ts = results6.rows;
                      const page = parseInt(req.query.page) || 1; // Current page number
                      const limit = 10; // Number of items per page
                      const startIndex = (page - 1) * limit;
                      const endIndex = page * limit;
                      const all_timesheets = _all_timesheets
                        .sort(compare)
                        .slice(startIndex, endIndex);
                      const page1 = parseInt(req.query.page1) || 1; // Current page number
                      const startIndex1 = (page1 - 1) * limit;
                      const endIndex1 = page1 * limit;
                      const my_timesheets = _my_timesheets
                        .sort(compare)
                        .slice(startIndex1, endIndex1);
                      res.render("index", {
                        layout: "./layouts/index-layout",
                        all_timesheets,
                        my_timesheets,
                        page,
                        page1,
                        errors,
                        user_role,
                        dollarUS: dollarUS,
                        expiring_contracts: result3.rows,
                        contracts_length: result2.rows.length,
                        contracts: result2.rows,
                        contract_expiring_length: result3.rows.length,
                        cases_length: results1.rows.length,
                        cases: results1.rows,
                        tasks,
                        events: results7.rows,
                        authed: authed,
                        user: req.session.user,
                        users: results4.rows,
                      });
                    }
                  );
                });
              });
            });
          }
        );
      });
    });
  });
});
app.post("/fetch-events", async (req, res) => {
  pool.query(`SELECT * FROM events`, [], (err, results7) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }
    let data = results7.rows;
    res.send({ events: data });
  });
});
// Add an event
app.post("/addEvent", async (req, res) => {
  const { occasion, venue, attendees, invited_count, year, month, day } =
    req.body.event;
  console.log(occasion, venue, attendees, invited_count, year, month, day);

  if (attendees.length > 0) {
    let emails = [];
    pool.query(`SELECT * FROM users`, [], (err, results4) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let count = 0;
      results4.rows.forEach((e) => {
        if (e.name == attendees[count]) {
          emails.push(e.email);
        }
        count += 1;
      });
      emails.forEach((e) => {
        const message = "New Event";
        const options = {
          from: "Prolegal <mochonam19@gmail.com>", // sender address
          to: e, // receiver email
          subject:
            occasion +
            " on " +
            invited_count +
            " " +
            day +
            "" +
            month +
            "" +
            year, // Subject line
          text: message,
          html: `<h2>New Event</h2>
        <p>Dear User,</p>
        <p>A new event has been created and you have been added to the attendees:</p>
        <ul>
            <li><strong>Event Name:</strong> ${occasion}</li>
            <li><strong>Venue:</strong> ${venue}</li>
            <li><strong>Time:</strong> ${invited_count}</li>
            <li><strong>Date:</strong> ${day}-${month}-${year}</li>
        </ul>
        <p>Please log in to the system to view.</p>
        <p>Thank you,</p>
        <p>Prolegal Team<br>`,
        };
        // send mail with defined transport object and mail options
        SENDMAIL(options, (info) => {});
      });

      try {
        pool.query(
          "INSERT INTO events (occasion, venue, attendees, invited_count, year, month, day) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [occasion, venue, attendees, invited_count, year, month, day],
          (err, results) => {
            if (err) {
              errors.push({ message: err });
              console.log(err);
            }
            req.flash("success", "You have successfully added an event");
            res.redirect("/");
          }
        );
      } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).send("Internal Server Error");
      }
    });
  }
});

// Delete an event
app.post("/deleteEvent", async (req, res) => {
  const eventId = req.body.id;
  console.log(eventId);

  pool.query(
    `DELETE from events WHERE occasion = $1`,
    [eventId],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully deleted a event");
      res.redirect("/");
    }
  );
});
app.get("/assistant", async (req, res) => {
  res.render("assistant", { layout: "./layouts/assistant-layout" });
});
app.get("/budget", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  pool.query(`SELECT * FROM budget`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }
    pool.query(`SELECT * FROM budget_items`, [], (err, results1) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      budgetLineItems = results1.rows;
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      if (results.rows[0]) {
        budget_balance = results.rows[0].balance;
        budget_amount = results.rows[0].amount;
        budget_id = results.rows[0].budget_id;
      }
      total_expenditure = 0;
      if (results1.rows[0] && results.rows[0]) {
        results1.rows.forEach((e) => {
          total_expenditure += parseFloat(e.actual);
        });
        let wer =
          ((parseFloat(results.rows[0].amount) - total_expenditure) /
            parseFloat(results.rows[0].amount)) *
          100;
        expenditure_left = wer.toFixed(2);
      }
      if (results.rows[0]) {
        current_balance =
          parseFloat(results.rows[0].amount) - total_expenditure;
        console.log(parseFloat(results.rows[0].amount));
      }
      function compare(a, b) {
        if (a.budget > b.budget) {
          return -1;
        }
        if (a.budget < b.budget) {
          return 1;
        }
        return 0;
      }
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = 10; // Number of items per page
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const reso = results1.rows.sort(compare).slice(startIndex, endIndex);

      res.render("budget", {
        layout: "./layouts/budget-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        budget_statement: budget_statement,
        data: results.rows,
        data1: reso,
        page,
        dollarUS: dollarUS,
        total_expenditure: total_expenditure,
        expenditure_left: expenditure_left,
        current_balance: current_balance,
      });
    });
  });
});
app.get("/calender", async (req, res) => {
  res.render("calender", { layout: "./layouts/calender-layout" });
});
app.get("/cases", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  pool.query(`SELECT * FROM cases`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
      return res.render("cases", {
        layout: "./layouts/cases-layout",
        user_role,
        errors,
      });
    }
    array3 = results.rows;
    pool.query(`SELECT name FROM law_firms`, [], (err, results1) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
        return res.render("cases", {
          layout: "./layouts/cases-layout",
          user_role,
          errors,
        });
      }
      pool.query(`SELECT * FROM department`, [], (err, results2) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
          return res.render("cases", {
            layout: "./layouts/cases-layout",
            user_role,
            errors,
          });
        }
        pool.query(`SELECT * FROM users`, [], (err, results3) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
            return res.render("cases", {
              layout: "./layouts/cases-layout",
              user_role,
              errors,
            });
          }
          pool.query(`SELECT * FROM case_status`, [], (err, results4) => {
            if (err) {
              console.log(err);
              errors.push({ message: err });
              return res.render("cases", {
                layout: "./layouts/cases-layout",
                user_role,
                errors,
              });
            }

            function compare(a, b) {
              if (a.end_date > b.end_date) {
                return -1;
              }
              if (a.end_date < b.end_date) {
                return 1;
              }
            }
            const page = parseInt(req.query.page) || 1; // Current page number
            const limit = 10; // Number of items per page
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const reso = results.rows.sort(compare).slice(startIndex, endIndex);

            res.render("cases", {
              layout: "./layouts/cases-layout",
              user_role,
              unfilteredRows: results.rows,
              user: req.session.user,
              errors: errors,
              cases: results.rows,
              data: reso,
              page,
              totalItems: results.rows.length,
              totalPages: Math.ceil(results.rows.length / limit),
              dataA: results1.rows,
              dataB: results2.rows,
              users: results3.rows,
              case_status: results4.rows,
              total_cases: results.rows,
            });
          });
        });
      });
    });
  });
});
app.post("/survey_elems", async (req, res) => {
  res.send({ compliance_survey_questions: compliance_survey_questions });
});
app.get("/compliance", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  let compliance_results = [];
  pool.query(`SELECT * FROM compliance_results`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }

    if (results) {
      compliance_data = results.rows;
      compliance_results = results.rows;
    }
    pool.query(`SELECT * FROM department`, [], (err, results3) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      console.log(compliance_data);
      res.render("compliance", {
        layout: "./layouts/compliance-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        compliance_results: compliance_results,
        dataB: results3.rows,
        compliance_array,
      });
    });
  });
});
app.post("/filter-compliance", (req, res) => {
  let errors = [];
  let message = [];
  let compliance_results = [];
  pool.query(`SELECT * FROM compliance_results`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }

    if (results) {
      compliance_data = [];
      let dep = req.body.department;
      let start = req.body.start_date;
      let end = req.body.end_date;
      compliance_filter_department = dep;
      results.rows.forEach((e) => {
        if (e.department == dep) {
          if (
            moment(e.date_completed).format("Do MMMM, YYYY") >=
            moment(start).format("Do MMMM, YYYY")
          ) {
            console.log(
              moment(e.date_completed).format("Do MMMM, YYYY") +
                ">" +
                moment(start).format("Do MMMM, YYYY") +
                "|" +
                moment(e.date_completed).format("Do MMMM, YYYY") +
                "<" +
                moment(end).format("Do MMMM, YYYY"),
              e.department,
              dep
            );
            compliance_data.push(e);
            compliance_results.push(e);
          }
        }
        if (dep == "All") {
          if (
            moment(e.date_completed).format("Do MMMM, YYYY") >=
            moment(start).format("Do MMMM, YYYY")
          ) {
            compliance_data.push(e);
            compliance_results.push(e);
          }
        }
      });
    }
    pool.query(`SELECT * FROM department`, [], (err, results3) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      res.render("compliance", {
        layout: "./layouts/compliance-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        compliance_results: compliance_results,
        dataB: results3.rows,
      });
    });
  });
});
app.get("/compliance-survey", async (req, res) => {
  let id = req.query.id;
  res.render("compliance_survey", {
    layout: "./layouts/compliance-survey-layout",
    user_role,
    compliance_survey_questions: compliance_survey_questions,
    id,
  });
});
app.get("/contract_view", checkNotAuthenticated, async (req, res) => {
  let query = req.query.id;
  let errors = [];
  let message = [];
  pool.query(
    `SELECT * FROM contracts WHERE contract_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      pool.query(`SELECT * FROM contract_status`, [], (err, results2) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }

        res.render("contract_view", {
          layout: "./layouts/contract_view_layout",
          user_role,
          user: req.session.user,
          errors: errors,
          data: results.rows,
          dollarUS: dollarUS,
          id: query,
          contract_status: results2.rows,
          id: query,
        });
      });
    }
  );
});
app.get("/case_view", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  let query = req.query.id;
  pool.query(
    `SELECT * FROM cases WHERE case_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      pool.query(`SELECT name FROM law_firms`, [], (err, results1) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        pool.query(`SELECT * FROM case_status`, [], (err, results2) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          let directory_name = "./public/uploads";
          let filenames = fs.readdirSync(directory_name);

          pool.query(`SELECT * FROM users`, [], (err, results3) => {
            if (err) {
              console.log(err);
              errors.push({ message: err });
              return res.render("cases", {
                layout: "./layouts/cases-layout",
                user_role,
                errors,
              });
            }

            res.render("case_view", {
              layout: "./layouts/case_view_layout",
              user_role,
              user: req.session.user,
              errors: errors,
              data: results.rows,
              dataA: results1.rows,
              id: query,
              case_status: results2.rows,
              id: query,
              users: results3.rows,
            });
          });
        });
      });
    }
  );
});
app.get("/contracts", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  pool.query(`SELECT * FROM contracts`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }
    let dollarUS = Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    // dollarUS.format(currentUser.account_balance)
    pool.query(`SELECT company_name FROM vendors`, [], (err, results1) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      pool.query(`SELECT * FROM contract_status`, [], (err, results2) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        pool.query(`SELECT * FROM department`, [], (err, results3) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          function compare(a, b) {
            if (a.end_date > b.end_date) {
              return -1;
            }
            if (a.end_date < b.end_date) {
              return 1;
            }
          }
          const page = parseInt(req.query.page) || 1; // Current page number
          const limit = 10; // Number of items per page
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const reso = results.rows.sort(compare).slice(startIndex, endIndex);

          res.render("contracts", {
            layout: "./layouts/contracts-layout",
            user_role,
            user: req.session.user,
            errors: errors,
            contracts: results.rows,
            data: reso,
            page,
            dollarUS: dollarUS,
            vendors: results1.rows,
            contract_status: results2.rows,
            dataB: results3.rows,
            total_contracts: results.rows,
          });
        });
      });
    });
  });
});
app.post("/user-roles", async (req, res) => {});
app.get("/lawfirm_cases", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  let query = req.query.id;
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      pool.query(
        `SELECT * FROM cases WHERE law_firm = $1`,
        [results.rows[0].name],
        (err, results1) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }

          res.render("lawfir_cases", {
            layout: "./layouts/lawfir-cases-layout",
            user_role,
            user: req.session.user,
            errors: errors,
            data: results.rows,
            dollarUS: dollarUS,
            cases: results1.rows,
            law_firm_id: query,
          });
        }
      );
    }
  );
});
app.get("/lawfirm_contracts", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  let query = req.query.id;
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      res.render("lawfirm_contracts", {
        layout: "./layouts/lawfirm-contracts-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        data: results.rows,
        dollarUS: dollarUS,
        law_firm_id: query,
      });
    }
  );
});
app.get("/lawfirm_tasks", checkNotAuthenticated, async (req, res) => {
  let query = req.query.id;
  let errors = [];
  let message = [];
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      res.render("lawfirm_contracts", {
        layout: "./layouts/lawfirm-contracts-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        data: results.rows,
        dollarUS: dollarUS,
        law_firm_id: query,
      });
    }
  );
});
app.get("/lawfirm_contacts", checkNotAuthenticated, async (req, res) => {
  let query = req.query.id;
  let errors = [];
  let message = [];
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      res.render("lawfirmcontacts", {
        layout: "./layouts/lawfirm-contacts-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        data: results.rows,
        dollarUS: dollarUS,
        law_firm_id: query,
      });
    }
  );
});
app.get("/lawfirm_notes", checkNotAuthenticated, async (req, res) => {
  let query = req.query.id;
  let errors = [];
  let message = [];
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      res.render("lawfirmnotes", {
        layout: "./layouts/lawfirm-notes-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        data: results.rows,
        dollarUS: dollarUS,
        law_firm_id: query,
      });
    }
  );
});

app.get("/lawfirms", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  pool.query(`SELECT * FROM law_firms`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    } else {
      array = results.rows;
      let active = 0;
      let not_active = 0;
      array.forEach((e) => {
        if (e.status == "true" || e.status == true) {
          active += 1;
        } else {
          not_active += 1;
        }
      });
      function compare(a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      }

      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = 10; // Number of items per page
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const reso = results.rows.sort(compare).slice(startIndex, endIndex);

      res.render("lawfirms", {
        layout: "./layouts/lawfirms-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        lawfirms: results.rows,
        data: reso,
        page,
        active: active,
        not_active: not_active,
        total_lawfirms: results.rows,
      });
    }
  });
});
app.get("/lawfirm_statement", checkNotAuthenticated, async (req, res) => {
  let query = req.query.id;
  let errors = [];
  let message = [];
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      res.render("lawfirmstatement", {
        layout: "./layouts/lawfirm-statement-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        data: results.rows,
        dollarUS: dollarUS,
        law_firm_id: query,
      });
    }
  );
});
app.get("/lawfirm_view", checkNotAuthenticated, async (req, res) => {
  let query = req.query.id;
  let errors = [];
  let message = [];
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      res.render("lawfirmview", {
        layout: "./layouts/lawfirm-view-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        data: results.rows,
        dollarUS: dollarUS,
        law_firm_id: query,
      });
    }
  );
});

app.get("/documents", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];

  pool.query(`SELECT * FROM documents`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }

    pool.query(`SELECT * FROM users`, [], (err, results2) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      pool.query(`SELECT * FROM department`, [], (err, results3) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        pool.query(`SELECT * FROM cases`, [], (err, results4) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }
          function compare(a, b) {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
          }
          const page = parseInt(req.query.page) || 1; // Current page number
          const limit = 10; // Number of items per page
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const reso = results.rows.sort(compare).slice(startIndex, endIndex);

          res.render("documents", {
            layout: "./layouts/document-layout",
            user_role,
            user: req.session.user,
            errors: errors,
            documents: results.rows,
            data: reso,
            page,
            dataB: results3.rows,
            users: results2.rows,
            total_documents: results.rows,
            cases: results4.rows,
          });
        });
      });
    });
  });
});
app.get("/documents-view", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  let query = req.query.id;
  pool.query(
    `SELECT * FROM documents WHERE document_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      pool.query(`SELECT * FROM users`, [], (err, results1) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        pool.query(`SELECT * FROM department`, [], (err, results2) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
          }

          pool.query(`SELECT * FROM cases`, [], (err, results4) => {
            if (err) {
              console.log(err);
              errors.push({ message: err });
            }
            res.render("document_viewer", {
              layout: "./layouts/document-viewer-layout",
              user_role,
              user: req.session.user,
              errors: errors,
              data: results.rows,
              dataB: results2.rows,
              id: query,
              id: query,
              users: results1.rows,
              cases: results4.rows,
            });
          });
        });
      });
    }
  );
});
app.post("/add-document", async (req, res) => {
  let name = req.body.document_name;
  let department = req.body.department;
  let members = req.body.members;
  let description = req.body.comments;
  let cas = req.body.case_name;
  console.log(department);
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    `INSERT INTO documents (name, department, assigned_to, description, date_created,docs, case_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [name, department, members, description, date_created, [], cas],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
        console.log(err);
      }
      req.flash("success", "You have successfully added a document");
      res.redirect("/documents");
    }
  );
});
app.get("/learn", checkNotAuthenticated, async (req, res) => {
  res.render("learn", { layout: "./layouts/learn-layout" });
});
app.get("/resources", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  res.render("resources", {
    layout: "./layouts/resources-layout",
    user_role,
    user: req.session.user,
    errors: errors,
  });
});
app.post("/add-timesheet", async (req, res) => {
  let task_name = req.body.taskName;
  let start_date = req.body.fromDateTime;
  let end_date = req.body.toDateTime;
  let contract_name = req.body.contract_name;
  let case_name = req.body.case_name;
  let timesheet_owner = req.session.user;
  let task_description = req.body.taskDescription;
  console.log(start_date);
  console.log(end_date);
  pool.query(
    `INSERT INTO timesheets (task_name, timesheet_owner, start_date, end_date, contract_name, case_name , task_description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      task_name,
      timesheet_owner,
      start_date,
      end_date,
      contract_name,
      case_name,
      task_description,
    ],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully added a timesheet");
      res.redirect("/");
    }
  );
});
app.post("/edit-timesheet", async (req, res) => {
  let task_name = req.body.taskName;
  let start_date = req.body.fromDateTime;
  let end_date = req.body.toDateTime;
  let contract_name = req.body.contract_name;
  let case_name = req.body.case_name;
  let task_description = req.body.taskDescription;
  let id = req.query.id;
  pool.query(
    "UPDATE timesheets SET task_name = $1,  start_date = $2, end_date = $3, contract_name = $4, case_name = $5 , task_description = $6  WHERE timesheet_id = $7",
    [
      task_name,
      start_date,
      end_date,
      contract_name,
      case_name,
      task_description,
      id,
    ],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
        console.log(err);
      }
      req.flash("success", "You have successfully added a timesheet");
      res.redirect("/");
    }
  );
});
app.post("/delete-timesheet", (req, res) => {
  pool.query(
    `DELETE from timesheets WHERE timesheet_id = $1`,
    [req.query.id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully deleted a timesheet");
      res.redirect("/");
    }
  );
});
app.post("/delete-compliance", (req, res) => {
  pool.query(
    `DELETE from compliance_results WHERE id = $1`,
    [req.query.id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully deleted a compliance run");
      res.redirect("/compliance");
    }
  );
});
app.post("/add-fee-note", async (req, res) => {
  //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
  let avatar = req.files.avatar;
  let desc = req.body.desc;
  let amount = req.body.amount;
  let fee_date = req.body.fee_date;
  //Use the mv() method to place the file in the upload directory (i.e. "uploads")
  avatar.mv("./public/uploads2/" + avatar.name);
  let errors = [];
  let query = req.query.id;
  let fee_notes = [];
  pool.query(
    "SELECT * FROM law_firms WHERE law_firm_id = $1",
    [query],
    (err, resulto) => {
      if (err) {
        errors.push({ message: err });
      }
      if (resulto.rows[0].fee_notes == null) {
        fee_notes = [];
      } else {
        fee_notes = resulto.rows[0].fee_notes;
      }
      let erykah = {
        description: desc,
        amount: amount,
        fee_date: fee_date,
        file: avatar.name,
      };
      fee_notes.push(erykah);

      pool.query(
        "UPDATE law_firms SET fee_notes = $1 WHERE law_firm_id = $2",
        [fee_notes, query],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
        }
      );
    }
  );
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      req.flash("success", "You have successfully added a fee note");
      res.redirect("/lawfirm_notes?id=" + query);
    }
  );
});
app.post("/delete-fee-note", async (req, res) => {
  const path = "./public/uploads2/" + req.query.path;
  const query = req.query.id;

  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    let errors = [];
    let fee_notes = [];

    pool.query(
      "SELECT * FROM law_firms WHERE law_firm_id = $1",
      [query],
      (err, resulto) => {
        if (err) {
          errors.push({ message: err });
        }
        if (resulto.rows[0].fee_notes == null) {
          fee_notes = [];
        } else {
          fee_notes = resulto.rows[0].fee_notes;
        }

        let count = 0;
        fee_notes.forEach((e) => {
          if (e.file == req.query.path) {
            fee_notes.splice(count, 1);
          }
          count += 1;
        });

        pool.query(
          "UPDATE law_firms SET fee_notes = $1 WHERE law_firm_id = $2",
          [fee_notes, query],
          (err, results) => {
            if (err) {
              errors.push({ message: err });
            }
          }
        );
      }
    );
    pool.query(
      `SELECT * FROM law_firms WHERE law_firm_id = $1`,
      [query],
      (err, results) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        let dollarUS = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });
        req.flash("success", "You have successfully deleted a fee note");
        res.redirect("/lawfirm_notes?id=" + query);
      }
    );
  });
});
app.post("/add-statement", async (req, res) => {
  //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file

  let fee_name = req.body.fee_name;
  let amount = req.body.amount;
  let pay_date = req.body.pay_date;
  let errors = [];
  let query = req.query.id;
  let statements = [];
  let balance = 0;
  pool.query(
    "SELECT * FROM law_firms WHERE law_firm_id = $1",
    [query],
    (err, resulto) => {
      if (err) {
        errors.push({ message: err });
      }
      if (resulto.rows[0].statements == null) {
        statements = [];
        resulto.rows[0].fee_notes.forEach((e) => {
          if (e.description == fee_name) {
            balance = e.amount;
            console.log(e.balance);
          }
        });
      } else {
        statements = resulto.rows[0].statements;
        statements.forEach((e) => {
          if (e.description == fee_name) {
            balance = e.balance;
            console.log(e.balance);
          }
        });
      }

      console.log(balance, amount);
      let erykah = {
        description: fee_name,
        amount: amount,
        pay_date: pay_date,
        balance: balance - amount,
      };
      statements.push(erykah);

      pool.query(
        "UPDATE law_firms SET statements = $1 WHERE law_firm_id = $2",
        [statements, query],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
        }
      );
    }
  );
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, results) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      req.flash("success", "You have successfully added a statement");
      res.redirect("/lawfirm_statement?id=" + query);
    }
  );
});
app.post("/delete-statement", async (req, res) => {
  const path = "./public/uploads2/" + req.query.path;
  const query = req.query.id;

  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    let errors = [];
    let fee_notes = [];

    pool.query(
      "SELECT * FROM law_firms WHERE law_firm_id = $1",
      [query],
      (err, resulto) => {
        if (err) {
          errors.push({ message: err });
        }
        if (resulto.rows[0].fee_notes == null) {
          fee_notes = [];
        } else {
          fee_notes = resulto.rows[0].fee_notes;
        }

        let count = 0;
        fee_notes.forEach((e) => {
          if (e.file == req.query.path) {
            fee_notes.splice(count, 1);
          }
          count += 1;
        });

        pool.query(
          "UPDATE law_firms SET fee_notes = $1 WHERE law_firm_id = $2",
          [fee_notes, query],
          (err, results) => {
            if (err) {
              errors.push({ message: err });
            }
          }
        );
      }
    );
    pool.query(
      `SELECT * FROM law_firms WHERE law_firm_id = $1`,
      [query],
      (err, results) => {
        if (err) {
          console.log(err);
          errors.push({ message: err });
        }
        let dollarUS = Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });
        req.flash("success", "You have successfully deleted a fee note");
        res.redirect("/lawfirm_notes?id=" + query);
      }
    );
  });
});
app.post("/resources-gazettes", async (req, res) => {
  let year = req.body.year;
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  //console.log(year)
  await page.goto(`https://zimlii.org/gazettes/${year}`);

  // Wait for the gazette items to load
  await page.waitForSelector("li");

  // Extract the gazette titles and links
  const gazetteList = await page.$$eval("li", (liElements) => {
    return liElements
      .filter((element) => element.innerText.trim().startsWith("Zimbabwe"))
      .map((li) => {
        const titleElement = li.querySelector("a");
        return {
          title: titleElement.innerText.trim(),
          link: titleElement.href,
        };
      });
  });

  // Print the gazette titles and links
  gazetteList.forEach((gazette) => {
    // console.log('Title:', gazette.title);
    //  console.log('Link:', gazette.link);
    //  console.log('----------------------');
  });
  scrapping_results = gazetteList;
  await browser.close();
  res.redirect("/resources-gazettes");
});
app.post("/resources-cases-and-judgements", async (req, res) => {
  let court = req.body.court;
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  //console.log(court)

  // Navigating to the target website
  await page.goto(`https://zimlii.org/judgments/${court}`);

  await page.waitForSelector("table");

  const judgments = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tr"));
    rows.shift(); // Remove header row

    return rows.map((row) => {
      const linkElement = row.querySelector("td:nth-child(1) a");

      const title = linkElement ? linkElement.textContent.trim() : "";
      const link = linkElement ? linkElement.getAttribute("href") : "";

      return { title, link };
    });
  });

  //console.log(judgments);

  await browser.close();
  scrapping_results = judgments;
  // Closing the browser
  await browser.close();
  res.redirect("/resources-cases-and-judgements");
});
app.get("/resources-results", checkNotAuthenticated, async (req, res) => {
  let keyword;
  let keyword_url;
  let errors = [];
  let message = [];
  //console.log(req.query.query)
  if (req.query.query == "cases_and_judgements") {
    keyword = "cases and judgements zimbabwe";
  }
  if (req.query.query == "legislation") {
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    // Increase the navigation timeout to 60 seconds (60000 milliseconds)
    await page.setDefaultNavigationTimeout(60000);

    try {
      await page.goto("https://zimlii.org/legislation/all");

      // Wait for the legislation items to load
      await page.waitForSelector(".content__title");

      // Extract the legislation titles and URLs
      const legislationList = await page.$$eval(
        ".content__title",
        (titleElements) => {
          return titleElements.map((element) => {
            const legislationDiv = element.closest(".content");
            const urlElement = legislationDiv.querySelector("a");
            return {
              title: element.innerText.trim(),
              url: urlElement ? urlElement.getAttribute("href") : "",
            };
          });
        }
      );

      // Print the legislation titles and URLs
      legislationList.forEach((legislation) => {
        // console.log('Title:', legislation.title);
        // console.log('URL:', legislation.url);
        // console.log('----------------------');
      });
      res.render("resources_legislature", {
        layout: "./layouts/resources-results-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        results: legislationList,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      await browser.close();
    }
  }
  if (req.query.query == "gazettes") {
    keyword = "gazettes zimbabwe";
  }
  if (req.query.query == "regulations") {
    keyword = "regulations zimbabwe";
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const baseUrl = "https://www.veritaszim.net/taxonomy/term/8";
    const totalPages = 5; // Specify the number of pages to scrape

    const legislationList = [];

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const pageUrl = `${baseUrl}?page=${pageIdx}`;

      await page.goto(pageUrl);

      // Wait for the legislation items to load
      await page.waitForSelector(".node-title");

      // Extract the legislation titles and URLs on the current page
      const legislationOnPage = await page.$$eval(
        ".node-title",
        (titleElements) => {
          return titleElements.map((element) => {
            const titleLink = element.querySelector("a");
            return {
              title: titleLink.innerText.trim(),
              url: titleLink.href,
            };
          });
        }
      );

      legislationList.push(...legislationOnPage);
    }

    await browser.close();

    res.render("resources_legislature", {
      layout: "./layouts/resources-results-layout",
      user_role,
      user: req.session.user,
      errors: errors,
      results: legislationList,
    });
  }
});
app.post("/resources-search-results", async (req, res) => {
  let keyword = req.body.search;
  //  const keyword = 'legal cases zimbabwe';
  //scrapeWebsites(keyword);
  // Launch a headless browser instance
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // Perform a Google search with the provided keyword
  await page.goto(`https://www.google.com/search?q=${keyword}`);

  // Extract the search results
  const searchResults = await page.$$eval(".tF2Cxc", (results) => {
    return results.map((result) => {
      const titleElement = result.querySelector(".DKV0Md");
      const urlElement = result.querySelector("a");
      const url = urlElement ? urlElement.href : "";
      return {
        title: titleElement ? titleElement.innerText : "",
        url: url,
      };
    });
  });

  // Print the search results
  searchResults.forEach((result) => {
    // console.log(`Title: ${result.title}`);
    // console.log(`URL: ${result.url}`);
    //  console.log('----------------------');
  });
  scrapping_results = searchResults;
  // Close the browser instance
  await browser.close();
  res.redirect("/resources-gazettes");
});
app.get("/resources-gazettes", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  res.render("resources_gazettes", {
    layout: "./layouts/resources-results-layout",
    user_role,
    user: req.session.user,
    errors: errors,
    results: scrapping_results,
  });
});
app.get(
  "/resources-cases-and-judgements",
  checkNotAuthenticated,
  async (req, res) => {
    let errors = [];
    let message = [];
    res.render("resources_gazettes", {
      layout: "./layouts/resources-results-layout",
      user_role,
      user: req.session.user,
      errors: errors,
      results: scrapping_results,
    });
  }
);
app.get("/settings/users", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  pool.query(`SELECT * FROM users`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }

    res.render("users", {
      layout: "./layouts/users-layout",
      user_role,
      user: req.session.user,
      errors: errors,
      data: results.rows,
      errors: errors,
    });
  });
});
app.get("/tasks", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  task_owner = req.session.user;
  pool.query(`SELECT * FROM tasks`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }
    pool.query(`SELECT * FROM users`, [], (err, results1) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }

      array1 = results.rows;
      let completed = 0;
      let active = 0;
      results.rows.forEach((e) => {
        if (e.status == "ACTIVE") {
          active += 1;
        }
        if (e.status == "COMPLETED") {
          completed += 1;
        }
      });
      function compare(a, b) {
        if (a.due_date > b.due_date) {
          return -1;
        }
        if (a.due_date < b.due_date) {
          return 1;
        }
      }
      let active_tasks = [];
      let completed_tasks = [];
      results.rows.forEach((e) => {
        if (e.status == "ACTIVE") {
          active_tasks.push(e);
        }
        if (e.status == "COMPLETED") {
          completed_tasks.push(e);
        }
      });

      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = 10; // Number of items per page
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const reso = active_tasks.sort(compare).slice(startIndex, endIndex);
      const page1 = parseInt(req.query.page1) || 1; // Current page number
      const startIndex1 = (page1 - 1) * limit;
      const endIndex1 = page1 * limit;
      const reso1 = completed_tasks.sort(compare).slice(startIndex1, endIndex1);

      res.render("tasks", {
        layout: "./layouts/tasks-layout",
        user_role,
        active,
        completed,
        user: req.session.user,
        errors: errors,
        data: reso,
        data1: reso1,
        page,
        page1,
        users: results1.rows,
      });
    });
  });
});
app.get("/vendors", checkNotAuthenticated, async (req, res) => {
  let errors = [];
  let message = [];
  pool.query(`SELECT * FROM vendors`, [], (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }
    pool.query(`SELECT * FROM department`, [], (err, results2) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      function compare(a, b) {
        if (a.company_name < b.company_name) {
          return -1;
        }
        if (a.company_name > b.company_name) {
          return 1;
        }
        return 0;
      }
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = 10; // Number of items per page
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const reso = results.rows.sort(compare).slice(startIndex, endIndex);

      res.render("vendors", {
        layout: "./layouts/vendors-layout",
        user_role,
        user: req.session.user,
        errors: errors,
        vendors: results.rows,
        data: reso,
        page,
        dataB: results2.rows,
        total_vendors: results.rows,
      });
    });
  });
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.isAuthenticated());
    authed = true;
    return next();
  }
  console.log(req.isAuthenticated());
  authed = false;
  res.redirect("/login");
}
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    authed = true;
    return res.redirect(" ");
  }
  next();
}
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}
app.post("/update-lawfirm-profile", (req, res) => {
  let query = req.query.id;
  let lawfirm_name = req.body.lawfirm_name;
  let email = req.body.email;
  let address = req.body.address;
  let phone_number = req.body.phone_number;
  pool.query(
    "UPDATE law_firms SET name = $1, email = $2, address = $3, phone_number = $4 WHERE law_firm_id = $5",
    [lawfirm_name, email, address, phone_number, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated lawfirm");
      res.redirect("/lawfirm_view?id=" + query);
    }
  );
});
app.post("/update-lawfirm-contact", (req, res) => {
  let query = req.query.id;
  let name1 = req.body.name1;
  let email1 = req.body.email1;
  let position1 = req.body.position1;
  let phone1 = req.body.phone1;
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, result) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      result.rows[0].contacts.push({
        name: name1,
        email: email1,
        position: position1,
        phone: phone1,
      });
      // console.log(result.rows[0].contacts)
      pool.query(
        "UPDATE law_firms SET contacts = $1 WHERE law_firm_id = $2",
        [result.rows[0].contacts, query],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
          req.flash("success", "You have successfully updated lawfirm");
          res.redirect("/lawfirm_contacts?id=" + query);
        }
      );
    }
  );
});
app.post("/delete-lawfirm-contact", (req, res) => {
  let query = req.query.law_firm_id;
  let a = req.query.name;
  let array = [];
  pool.query(
    `SELECT * FROM law_firms WHERE law_firm_id = $1`,
    [query],
    (err, result) => {
      if (err) {
        console.log(err);
        errors.push({ message: err });
      }
      array = result.rows[0].contacts;
      // console.log(result.rows[0].contacts)
      let count = 0;
      array.forEach((e) => {
        if (e.name == a) {
          array.splice(count, 1);
        }
        count += 1;
      });
      pool.query(
        "UPDATE law_firms SET contacts = $1 WHERE law_firm_id = $2",
        [array, query],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
          req.flash("success", "You have successfully updated lawfirm");
          res.redirect("/lawfirm_contacts?id=" + query);
        }
      );
    }
  );
});
app.post("/add-lawfirm", (req, res) => {
  let law_firm = req.body.law_firm;
  let address = req.body.address;
  let vat_number = req.body.vat_number;
  let contact_person = req.body.contact_person;
  let phone_number = req.body.phone_number;
  let website = req.body.website;
  let email = req.body.email;
  let contacts = [];
  for (let i = 1; i < contact_person_count + 1; i++) {
    contacts.push({
      name: req.body[`name${i}`],
      email: req.body[`email${i}`],
      position: req.body[`position${i}`],
      phone: req.body[`phone${i}`],
    });
  }
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  //console.log(contacts)
  pool.query(
    `INSERT INTO law_firms (name, address, phone_number, contacts, status, groups, date_created, email, vat_number, website)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      law_firm,
      address,
      phone_number,
      contacts,
      true,
      "groups",
      date_created,
      email,
      vat_number,
      website,
    ],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully added a law firm");
      res.redirect("/lawfirms");
    }
  );
});
app.post("/update-lawfirm", (req, res) => {
  let query = req.query.id;
  let law_firm = req.body.law_firm;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE cases SET law_firm = $1 WHERE case_id = $2",
    [law_firm, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated Law firm");
      res.redirect("/case_view?id=" + query);
    }
  );
});
app.post("/update-case-status", (req, res) => {
  let query = req.query.id;
  let status = req.body.status;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE cases SET status = $1 WHERE case_id = $2",
    [status, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated status of  Cases");
      res.redirect("/case_view?id=" + query);
    }
  );
});
app.post("/update-case-startdate", (req, res) => {
  let query = req.query.id;
  let start_date = req.body.start_date;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE cases SET start_date = $1 WHERE case_id = $2",
    [start_date, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash(
        "success",
        "You have successfully updated start start date of Case"
      );
      res.redirect("/case_view?id=" + query);
    }
  );
});
app.post("/update-case-members", (req, res) => {
  let query = req.query.id;
  let staff_members = req.body.staff_members;
  pool.query(
    "UPDATE cases SET staff_members = $1 WHERE case_id = $2",
    [staff_members, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      pool.query(
        "SELECT * FROM cases  WHERE case_id = $1",
        [query],
        (err, results1) => {
          if (err) {
            errors.push({ message: err });
          }
          sendEmail1(
            staff_members,
            results1.rows[0].case_name,
            results1.rows[0].notes,
            results1.rows[0].start_date,
            results1.rows[0].end_date,
            req.session.user
          );
          req.flash("success", "You have successfully updated case members");
          res.redirect("/case_view?id=" + query);
        }
      );
    }
  );
});
app.post("/update-case-description", (req, res) => {
  let query = req.query.id;
  let description = req.body.description;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE cases SET notes = $1 WHERE case_id = $2",
    [description, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash(
        "success",
        "You have successfully updated description of  Cases"
      );
      res.redirect("/case_view?id=" + query);
    }
  );
});
app.post("/update-case-updates", (req, res) => {
  let query = req.query.id;
  let description = req.body.description;
  let comments = req.body.comments;
  let date_created = req.body.case_update_date;

  let array = [];
  pool.query(
    "SELECT * FROM cases WHERE case_id = $1",
    [query],
    (err, results1) => {
      if (err) {
        errors.push({ message: err });
      }
      if (results1.rows[0].updates == null) {
        array = [];
      } else {
        array = results1.rows[0].updates;
      }
      array.push({
        desc: description,
        comms: comments,
        updated_on: date_created,
      });
      pool.query(
        "UPDATE cases SET updates = $1 WHERE case_id = $2",
        [array, query],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
          req.flash("success", "You have successfully updated Case");
          res.redirect("/case_view?id=" + query);
        }
      );
    }
  );
});
app.post("/update-contract-value", (req, res) => {
  let query = req.query.id;
  let contract_value = req.body.contract_value;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE contracts SET contract_value = $1 WHERE contract_id = $2",
    [contract_value, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated case contract value");
      res.redirect("/contract_view?id=" + query);
    }
  );
});
app.post("/update-contract-duration", (req, res) => {
  let query = req.query.id;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE contracts SET start_date = $1, end_date = $2 WHERE contract_id = $3",
    [start_date, end_date, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated contract duration");
      res.redirect("/contract_view?id=" + query);
    }
  );
});
app.post("/update-contract-terms", (req, res) => {
  let query = req.query.id;
  let payment_terms = req.body.payment_terms;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE contracts SET payment_terms = $1 WHERE contract_id = $2",
    [payment_terms, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated contract terms");
      res.redirect("/contract_view?id=" + query);
    }
  );
});
app.post("/update-contract-status", (req, res) => {
  let query = req.query.id;
  let status = req.body.status;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE contracts SET status = $1 WHERE contract_id = $2",
    [status, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated contract status");
      res.redirect("/contract_view?id=" + query);
    }
  );
});
app.post("/update-contract-description", (req, res) => {
  let query = req.query.id;
  let description = req.body.description;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE contracts SET notes = $1 WHERE contract_id = $2",
    [description, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash(
        "success",
        "You have successfully updated contract description"
      );
      res.redirect("/contract_view?id=" + query);
    }
  );
});
app.post("/change-lawfirm-status", (req, res) => {
  //console.log(req.body)
  let active_status = req.body.active_status;
  let law_firm_id = req.body.law_firm_id;
  // console.log(active_status,law_firm_id)
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE law_firms SET status = $1 WHERE law_firm_id = $2",
    [active_status, law_firm_id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      // console.log(results)
      req.flash("success", "You have successfully updated status of law firm");
      res.redirect("/lawfirms");
    }
  );
});
app.post("/update-document-assignee", (req, res) => {
  let query = req.query.id;
  let assigned_to = req.body.members;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE documents SET assigned_to = $1 WHERE document_id = $2",
    [assigned_to, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated assignee");
      res.redirect("/documents-view?id=" + query);
    }
  );
});
app.post("/update-document-department", (req, res) => {
  let query = req.query.id;
  let department = req.body.department;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE documents SET department = $1 WHERE document_id = $2",
    [department, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated department");
      res.redirect("/documents-view?id=" + query);
    }
  );
});
app.post("/update-document-case", (req, res) => {
  let query = req.query.id;
  let cas = req.body.case_name;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE documents SET case_name = $1 WHERE document_id = $2",
    [cas, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated case");
      res.redirect("/documents-view?id=" + query);
    }
  );
});
app.post("/update-document-description", (req, res) => {
  let query = req.query.id;
  let description = req.body.description;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE documents SET description = $1 WHERE document_id = $2",
    [description, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated description");
      res.redirect("/documents-view?id=" + query);
    }
  );
});
app.post("/update-document-name", (req, res) => {
  let query = req.query.id;
  let name = req.body.document_name;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    "UPDATE documents SET name = $1 WHERE document_id = $2",
    [name, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated name");
      res.redirect("/documents-view?id=" + query);
    }
  );
});
app.post("/add-case", (req, res) => {
  // console.log(req.body)
  let department = req.body.department;
  let start_date = req.body.start_date;
  // let end_date = req.body.deadline
  let notes = req.body.comments;
  let case_name = req.body.case_name;
  let status = req.body.status;
  let law_firm = req.body.law_firm;
  let staff_members = req.body.members;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    `INSERT INTO cases (start_date,  notes, department, case_name, law_firm,  staff_members,attachments,status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      start_date,
      notes,
      department,
      case_name,
      law_firm,
      staff_members,
      [],
      status,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      pool.query(
        "SELECT * FROM cases  WHERE case_name = $1",
        [case_name],
        (err, results1) => {
          if (err) {
            console.log(err);
          }
          sendEmail1(
            staff_members,
            results1.rows[0].case_name,
            results1.rows[0].notes,
            results1.rows[0].start_date,
            results1.rows[0].end_date,
            req.session.user
          );
          req.flash("success", "You have successfully added a case");
          res.redirect("/cases");
        }
      );
    }
  );
});
app.post("/add-contract", (req, res) => {
  //console.log(req.body)

  let description = req.body.contract_description;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let contract_name = req.body.contract_name;
  let vendor = req.body.vendor;
  let department = req.body.department;
  let payment_cycle;
  let currency = req.body.currency;
  let payment_terms = req.body.payment_terms;
  let status = req.body.signed_status;
  let contract_value = req.body.contract_value + 0;
  let notes = req.body.description1;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  if (req.body.signedStatus1 == "Other") {
    payment_cycle = req.body.otherOption;
  } else {
    payment_cycle = req.body.signedStatus1;
  }
  pool.query(
    `INSERT INTO contracts (  name, description, start_date, end_date,  notes,  vendor, department, payment_cycle, payment_terms, status, currency, contract_value,attachments)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      contract_name,
      description,
      start_date,
      end_date,
      notes,
      vendor,
      department,
      payment_cycle,
      payment_terms,
      status,
      currency,
      contract_value,
      [],
    ],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      console.log(results);
      req.flash("success", "You have successfully added a contract");
      res.redirect("/contracts");
    }
  );
});
app.post("/edit-expenditure", (req, res) => {
  let id = req.query.id;
  let expe = req.query.expenditure_desc;
  let expenditure = req.body.expenditure;
  let expenditure_date = req.body.expenditure_date;
  let expenditure_desc = req.body.expenditure_desc;
  let expenditureArray = [];
  let actual = 0;
  pool.query(
    "SELECT * from budget_items WHERE budget_id = $1",
    [id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      expenditureArray = results.rows[0].expenditure;
      budgeted = results.rows[0].budget;
      console.log();
      let count = 0;
      expenditureArray.forEach((elem) => {
        // console.log(elem.expenditure_desc,expe)

        if (elem.expenditure_desc == expe) {
          expenditureArray[count] = {
            expenditure: expenditure,
            expenditure_desc: expenditure_desc,
            expenditure_date: expenditure_date,
            balance: parseFloat(elem.expenditure) + elem.balance - expenditure,
          };
        }
        count += 1;
      });
      // console.log(expenditureArray)
      let totalExp = 0;
      expenditureArray.forEach((el) => {
        totalExp += parseFloat(el.expenditure);
      });
      pool.query(
        "UPDATE budget_items SET expenditure = $1, actual = $2, variance = $3  WHERE budget_id = $4",
        [expenditureArray, totalExp, budgeted - totalExp, id],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }

          req.flash("success", "You have successfully edited Expenditure");
          res.redirect("/budget");
        }
      );
    }
  );
});
app.post("/add-vendor", (req, res) => {
  //console.log(req.body)
  let contact_person = req.body.contactPerson;
  let phone_number = req.body.phoneNumber;
  let company_name = req.body.vendorName;
  let physical_address = req.body.address;
  let vat_number = req.body.vatNumber;
  let email = req.body.email;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    `INSERT INTO vendors ( phone_number, contact_person, company_name,vat_number, physical_address, date_created, status, email)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      phone_number,
      contact_person,
      company_name,
      vat_number,
      physical_address,
      date_created,
      "false",
      email,
    ],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
        console.log(err);
      }
      // console.log(results.row);
      req.flash("success", "You have successfully added a vendor");
      res.redirect("/vendors");
    }
  );
});
app.post("/edit-vendor", (req, res) => {
  // console.log(req.body)
  let id = req.query.id;
  let contact_person = req.body.contactPerson;
  let phone_number = req.body.phoneNumber;
  let company_name = req.body.vendorName;
  let physical_address = req.body.address;
  let vat_number = req.body.vatNumber;
  let email = req.body.email;
  pool.query(
    `UPDATE vendors SET  phone_number = $1, contact_person = $2, company_name = $3, vat_number = $4, physical_address = $5, email = $6 WHERE vendor_id = $7`,
    [
      phone_number,
      contact_person,
      company_name,
      vat_number,
      physical_address,
      email,
      id,
    ],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      // console.log(results.row);
      req.flash("message", "You have successfully updated a vendor");
      res.redirect("/vendors");
    }
  );
});
app.post("/delete-vendor", (req, res) => {
  //console.log(current_vendor)
  pool.query(
    `DELETE from vendors WHERE vendor_id = $1`,
    [req.query.id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully deleted a vendor");
      res.redirect("/vendors");
    }
  );
});
app.post("/delete-budget-item-expenses", (req, res) => {
  let id = req.query.budget_id;
  let expenditure_desc = req.query.expenditure_desc;
  let expenditureArray = [];
  pool.query(
    "SELECT * from budget_items WHERE budget_id = $1",
    [id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      expenditureArray = results.rows[0].expenditure;

      let count = 0;
      let totalExp = 0;
      let budgeted = results.rows[0].budget;
      expenditureArray.forEach((elem) => {
        if (elem.expenditure_desc == expenditure_desc) {
          expenditureArray.splice(count, 1);
        } else {
          totalExp += parseFloat(elem.expenditure);
        }
        count += 1;
      });
      // console.log(expenditureArray)

      pool.query(
        "UPDATE budget_items SET expenditure = $1, actual = $2, variance = $3 WHERE budget_id = $4",
        [expenditureArray, totalExp, budgeted - totalExp, id],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
          req.flash("success", "You have successfully deleted Expenditure");
          res.redirect("/budget");
        }
      );
    }
  );
});
app.post("/delete-budget-item", (req, res) => {
  let id = req.query.id;
  let budget = req.query.budget;
  //console.log(id,budget)
  pool.query(
    "DELETE from budget_items WHERE budget_id = $1",
    [id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      pool.query(
        "UPDATE budget SET balance = $1 WHERE budget_id = $2",
        [budget_balance + budget, id],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
          req.flash(
            "success",
            "You have successfully deleted a budget line item"
          );
          res.redirect("/budget");
        }
      );
    }
  );
});
app.post("/edit-budget-item", (req, res) => {
  let id = req.query.budget_id;
  let budget = req.body.budget;
  console.log(id, budget);

  pool.query(
    "UPDATE budget_items SET budget = $1 WHERE budget_id = $2",
    [budget, id],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      console.log(results);
      req.flash("success", "You have successfully updated a budget line item");
      res.redirect("/budget");
    }
  );
});
app.post("/add-budget", (req, res) => {
  let amount = req.body.amount;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let notes = req.body.notes;

  pool.query(
    `INSERT INTO budget ( amount, start_date, end_date, notes, balance)
        VALUES ($1, $2, $3, $4, $5)`,
    [amount, start_date, end_date, notes, amount],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      // console.log(results.row);
      req.flash("success", "You have successfully added budget");
      res.redirect("/budget");
    }
  );
});
app.post("/add-line-budget", (req, res) => {
  for (let i = 1; i < line_budget_count + 1; i++) {
    //console.log(budget_balance- req.body[`budget${i}`])

    pool.query(
      `INSERT INTO budget_items (budget_name, budget,variance, actual, expenditure)
                VALUES ($1, $2, $3, $4, $5)`,
      [
        req.body[`budget_name${i}`],
        req.body[`budget${i}`],
        req.body[`budget${i}`],
        0,
        [],
      ],
      (err, results) => {
        if (err) {
          errors.push({ message: err });
        }
        budget_balance -= req.body[`budget${i}`];
        // console.log(budget_balance,"     ",budget_id)
        pool.query(
          "UPDATE budget SET balance = $1 WHERE budget_id = $2",
          [budget_balance, budget_id],
          (err, result) => {
            if (err) {
              errors.push({ message: err });
              console.log(err);
            }
            //   console.log(result)
          }
        );
      }
    );
  }

  req.flash("success", "You have successfully added a line budget item");
  res.redirect("/budget");
});
app.post("/edit-budget", (req, res) => {
  let query = req.query.id;
  let edit_amount = req.body.edit_amount;
  let edit_start_date = req.body.edit_start_date;
  let edit_end_date = req.body.edit_end_date;
  let edit_notes = req.body.edit_notes;
  pool.query(
    "UPDATE budget SET amount = $1, start_date = $2, end_date = $3, notes = $4 WHERE budget_id = $5",
    [edit_amount, edit_start_date, edit_end_date, edit_notes, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully edited a budget");
      res.redirect("/budget");
    }
  );
});
app.post("/add-expenditure", (req, res) => {
  let expenditure = req.body.expenditure;
  let expenditure_date = req.body.expenditure_date;
  let expenditure_desc = req.body.expenditure_desc;
  let a = parseFloat(expenditure);
  let b = parseFloat(expenditure_budget) - a;
  expenditure_budget -= parseFloat(expenditure_actual);
  //console.log(expenditure_budget_id)
  pool.query(
    "SELECT * FROM budget_items WHERE budget_id = $1",
    [parseFloat(expenditure_budget_id)],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      let array = results.rows[0].expenditure;
      let budgeted = results.rows[0].budget;
      if (array == null) {
        array = [];
      }
      let totalExp = 0;
      array.push({
        expenditure_date: expenditure_date,
        expenditure_desc: expenditure_desc,
        expenditure: expenditure,
        balance: expenditure_budget,
      });
      array.forEach((el) => {
        totalExp += parseFloat(el.expenditure);
      });
      // console.log(totalExp)
      pool.query(
        "UPDATE budget_items SET actual = $1, variance = $2, expenditure = $3 WHERE budget_id = $4",
        [totalExp, budgeted - totalExp, array, expenditure_budget_id],
        (err, results) => {
          if (err) {
            errors.push({ message: err });
          }
          req.flash("success", "You have successfully added expense");
          res.redirect("/budget");
        }
      );
    }
  );
});
app.post("/expenditure_id", (req, res) => {
  expenditure_budget_id = req.body.budget_id;
  expenditure_actual = req.body.actual;
  expenditure_budget = req.body.budget;
});
app.post("/add-tasks", (req, res) => {
  let task_name = req.body.taskName;
  let start_date = req.body.startDate;
  let due_date = req.body.dueDate;
  let priority = req.body.priority;
  let frequency = req.body.frequency;
  let assigness = req.body.assiigness;
  let task_description = req.body.taskDescription;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    `INSERT INTO tasks (name, start_date, due_date, priority, frequency, assigned_to, description, date_created, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      task_name,
      start_date,
      due_date,
      priority,
      frequency,
      assigness,
      task_description,
      date_created,
      "ACTIVE",
    ],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      sendEmail(
        assigness,
        task_name,
        task_description,
        due_date,
        req.session.user,
        priority
      );
      req.flash("success", "You have successfully added a task");
      res.redirect("/tasks");
    }
  );
});
app.post("/edit-task", (req, res) => {
  let statuss = req.body.status;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  pool.query(
    `UPDATE tasks SET  status = $1 WHERE task_id = $2`,
    [statuss, req.query.id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
        console.log(err);
      }

      req.flash("success", "You have successfully edited task");
      res.redirect("/tasks");
    }
  );
});
app.post("/edit-task-status", (req, res) => {
  console.log(req.body.id);
  let status = req.body.status;
  let id = req.body.id;
  pool.query(
    `UPDATE tasks SET status = $1 WHERE task_id = $2`,
    [status, id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully edited task");
      res.redirect("/tasks");
    }
  );
});

app.post("/delete-task", (req, res) => {
  pool.query(
    `DELETE from tasks WHERE task_id = $1`,
    [req.query.id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully deleted a task");
      res.redirect("/tasks");
    }
  );
});

app.post("/compliance-form-part-1", (req, res) => {
  let a = req.body.department;
  compliance_department = a;
  //console.log(compliance_department)
});
app.post("/compliance-form-part-2", (req, res) => {
  let a = req.body.contact_name;
  let b = req.body.contact_email;
  compliance_contact_name = a;
  compliance_contact_email = b;
  // console.log(compliance_contact_name,compliance_contact_email)
});
app.post("/compliance-form-part-3", (req, res) => {
  compliance_survey_questions = [];

  for (let i = 1; i < compliance_count + 1; i++) {
    if (req.body[`response${i}`] == "text_input") {
      let a = {
        type: "text",
        name: "question" + i,
        title: req.body[`question${i}`],
        isRequired: true,
        response: "",
      };
      compliance_survey_questions.push(a);
    }
    if (req.body[`response${i}`] == "yes_or_no") {
      let b = {
        type: "boolean",
        name: "question" + i,
        title: req.body[`question${i}`],
        isRequired: true,
        response: "",
      };
      let c = {
        type: "comment",
        name: "question" + i + "a",
        visibleIf: `{question${i}} = false`,
        title: "Reason",
        isRequired: true,
        response: "",
      };
      compliance_survey_questions.push(b);
      compliance_survey_questions.push(c);
    }
  }
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  let id;
  pool.query(
    `INSERT INTO compliance_results (department, questions, responses, score, contact_person, contact_email, date_completed, comment)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      compliance_department,
      compliance_survey_questions,
      [],
      0,
      compliance_contact_name,
      compliance_contact_email,
      date_created,
      "",
    ],
    (err, results1) => {
      if (err) {
        errors.push({ message: err });
      }
      console.log(results1.rows[0].id);
      const message = "Email for completing compliance form.";
      const options = {
        from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
        to: compliance_contact_email, // receiver email
        subject:
          "Compliance Survey for the department of " + compliance_department, // Subject line
        text: message,
        html: `
       
      
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN""http://www.w3.org/TR/REC-html40/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
<link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800' rel='stylesheet' type='text/css'>
<base target="_blank">
<title>Gravity Email Template</title>
<style type="text/css">

body *{font-family: 'Open Sans', Arial, sans-serif }

div, p, a, li, td { -webkit-text-size-adjust:none; }

*{-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}
td{word-break: break-word;}
a{word-break: break-word; text-decoration: none; color: inherit;}

body .ReadMsgBody
{width: 100%; background-color: #ffffff;}
body .ExternalClass
{width: 100%; background-color: #ffffff;}
body{width: 100%; height: 100%; background-color: #ffffff; margin:0; padding:0; -webkit-font-smoothing: antialiased;}
html{ background-color:#ffffff; width: 100%;}   

body p {padding: 0!important; margin-top: 0!important; margin-right: 0!important; margin-bottom: 0!important; margin-left: 0!important; }
body img {user-drag: none; -moz-user-select: none; -webkit-user-drag: none;}
body .hover:hover {opacity:0.85;filter:alpha(opacity=85);}
body td img:hover {opacity:0.85;filter:alpha(opacity=85);}
body .underline:hover {text-decoration: underline!important;}
body .hoverGreen img {opacity: 1;transition: opacity .40s ease-in-out;-moz-transition: opacity .40s ease-in-out;-webkit-transition: opacity .40s ease-in-out;}
body .hoverGreen img:hover {opacity:0.1;filter:alpha(opacity=10)transition: opacity .40s ease-in-out;-moz-transition: opacity .40s ease-in-out;-webkit-transition: opacity .40s ease-in-out;}
body .jump:hover {opacity:0.75; filter:alpha(opacity=75); padding-top: 10px!important;}
body a.rotator img {-webkit-transition: all 1s ease-in-out;-moz-transition: all 1s ease-in-out; -o-transition: all 1s ease-in-out; -ms-transition: all 1s ease-in-out; }
body a.rotator img:hover { -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); -o-transform: rotate(360deg);-ms-transform: rotate(360deg); }

body #logo img {width: 125px; height: auto;}
body .logo125 img {width: 125px; height: auto;}
body #icon12 img {width: 12px; height: auto;}
body .icon75 img {width: 75px; height: auto;}
body .icon24 img {width: 24px; height: auto;}
body .icon36 img {width: 36px; height: auto;}
body .icon40 img {width: 40px; height: auto;}
body .image280 img {width: 280px; height: auto;}
body .image245 img {width: 245px; height: auto;}
body .image200 img {width: 200px; height: auto;}
body .image275 img {width: 275px; height: auto;}
body .image250 img {width: 250px; height: auto;}
body .image230 img {width: 230px; height: auto;}
body .image600 img {width: 600px; height: auto;}
body .image135 img {width: 135px; height: auto; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px;}
body .avatar72 img {width: 72px; height: auto; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px;}
</style>

<style type="text/css">@media only screen and (max-width: 640px){
		body body{width:auto!important;}
		body table[class=full] {width: 100%!important; clear: both; }
		body table[class=mobile] {width: 100%!important; padding-left: 20px; padding-right: 20px; clear: both; }
		body table[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
		body td[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
		body *[class=erase] {display: none;}
		body *[class=buttonScale] {float: none!important; text-align: center!important; display: inline-block!important; clear: both;}
		body .image600 img {width: 100%!important;}
		body td[class=image230] {width: 230!important; text-align: center!important; clear: both; }
		body .image298 img {width: 100%!important;}
		table[class=image110] {text-align:center; float:none; width:70%!important;}
		body td[class=pad30] {padding-left: 25px!important; padding-right: 25px!important; text-align: center!important; clear: both; }
		body td[class=image298] img {width: 100%!important; text-align: center!important; clear: both; }
		body .h30 {width: 100%!important; height: 30px!important;}
		body .h15 {width: 100%!important; height: 15px!important;}
		body table[class=sponsor] {text-align:center; float:none; width:80%!important;}
		body .w10 {width: 8%!important; height: 10px!important;}
		body .pad20 {padding-left: 20px!important; padding-right: 20px!important;}
		body .h65 {width: 100%; height: 65px!important;}
}</style>

<style type="text/css">@media only screen and (max-width: 479px){
		body body{width:auto!important;}
		body table[class=full] {width: 100%!important; clear: both; }
		body table[class=mobile] {width: 100%!important; padding-left: 20px; padding-right: 20px; clear: both; }
		body table[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
		body td[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
		body *[class=erase] {display: none;}
		body *[class=buttonScale] {float: none!important; text-align: center!important; display: inline-block!important; clear: both;}
		body .eraseMob {display: none!important;}
		body .font44 {font-size: 36px!important; line-height: 40px!important;}
		body .image600 img {width: 100%!important;}
		body td[class=image230] {width: 230!important; text-align: center!important; clear: both; }
		body .image298 img {width: 100%!important;}
		body .image280 img {width: 100%!important; text-align: center!important; clear: both; }
		body .image275 img {width: 100%!important; text-align: center!important; clear: both; }
		body table[class=image110] {text-align:center; float:none; width:100%!important;}
		body td[class=pad30] {padding-left: 25px!important; padding-right: 25px!important; text-align: center!important; clear: both; }
		body .break {display: block!important;}
		body table[class=mcenter] {text-align:center; vertical-align:middle; clear:both!important; float:none; margin: 0px!important;}
		body .h30 {width: 100%!important; height: 30px!important;}
		body .h15 {width: 100%!important; height: 15px!important;}
		body table[class=sponsor] {text-align:center; float:none; width:100%!important;}
		body .w10 {width: 8%!important; height: 10px!important;}
		body .pad20 {padding-left: 20px!important; padding-right: 20px!important;}
		body .h65 {width: 100%; height: 65px!important;}
}</style>

</head>
<body style='margin: 0; padding: 0;'>

<table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full" bgcolor="#f6f6f6" style="background-color: rgb(246, 246, 246);">
	<tbody><tr>
		<td width="100%" valign="top" align="center">
		
			
			<table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="mobile">
				<tbody><tr>
					<td align="center">
					
						
						<table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
							<tbody><tr>
								<td width="100%" height="65"></td>
							</tr>
						</tbody></table>
						
						
						<table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
							<tbody><tr>
								<td width="100%" align="center">
								
									<!-- Image 250px - 2 -->
									<table width="250" border="0" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; text-align: center;" class="fullCenter">
										<tbody><tr>
											<td width="100%" align="center" class="image250">
												<a href="#" style="text-decoration: none;">
													<img src="images/165931700114952OzM2aJcQ.png" editable="true" width="250" alt="" border="0" class="hover toModifyImage" >
												</a>
											</td>
										</tr>
									</tbody></table>
									
									<table width="1" border="0" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="full">
										<tbody><tr>
											<td width="100%" height="65" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
										</tr>
									</tbody></table> 
									
									<!-- Text Right -->
									<table width="310" border="0" cellpadding="0" cellspacing="0" align="right" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="fullCenter">
										<tbody><tr>
											<td valign="middle" width="100%" style="text-align: left; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 22px; color: #27272b; line-height: 28px; font-weight: 700;" class="fullCenter">
												Compliance Survey
											</td>
										</tr>
										<tr>
											<td width="100%" height="25"></td>
										</tr>
										<tr>
											<td valign="middle" width="100%" style="text-align: left; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 14px; color: #828282; line-height: 22px; font-weight: 400;" class="fullCenter">
												<span style="color: rgb(0, 0, 0);" >Dear ${compliance_contact_name},</span></p><p><br><span style="color: rgb(0, 0, 0);" >A compliance survey for your department, ${compliance_department}, has been created. This survey is designed to assess your department's compliance with Relevant Regulations or Standards.</span></p><p><br><span style="color: rgb(0, 0, 0);" >Please click on the following link to access the survey form.</span></p><p><br><span style="color: rgb(0, 0, 0);" >Regards,&nbsp;</span></p><p><br><span style="color: rgb(0, 0, 0);" >Legal Department</span>
											</td>
										</tr>
										<tr>
											<td width="100%" height="35"></td>
										</tr>
										<!-- Button Left, Scale Center -->
										<tr>
											<td class="buttonScale" width="auto" align="left">
												
												<table border="0" cellpadding="0" cellspacing="0" align="left" class="buttonScale">
													<tbody><tr>
														<td width="auto" align="center" height="37" bgcolor="#27272b" style="border-top-left-radius: 25px; border-top-right-radius: 25px; border-bottom-right-radius: 25px; border-bottom-left-radius: 25px; padding-left: 20px; padding-right: 20px; font-weight: 600; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; color: #ffffff; text-transform: uppercase; background-color: #27272b; font-size: 12px;">
															<multiline><a href="http://localhost:8080/compliance-survey?id=${results1.rows[0].id}" style="color: #ffffff; font-size: 12px; text-decoration: none; line-height: 34px; width: 100%;">complete survey</a></multiline>
														</td>
													</tr>
												</tbody></table>
											
											</td>
										</tr>
										<!-- Button Left, Scale Center -->
									</tbody></table>
									
								</td>
							</tr>
						</tbody></table>
						
						
						<table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
							<tbody><tr>
								<td width="100%" height="65"></td>
							</tr>
						</tbody></table>
						
					</td>
				</tr>
			</tbody></table>
		
		</td>
	</tr>
<!--—EndModule--></tbody></table><table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full" bgcolor="#27272b" style="background-color: rgb(39, 39, 43);">
	<tbody><tr>
	  <td width="100%" valign="top" align="center"> 
	      
	      <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="mobile">
	        <tbody><tr>
	          <td width="100%" align="center">
	            
	            <table width="100%" border="0" cellpadding="0" cellspacing="0" align="left" style="text-align: center;" class="fullCenter">
	            <tbody><tr>
	              <td width="100%" height="25"></td>
	            </tr>
	              <tr>
	                <td width="100%" style="text-align: center; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 12px; color: #ffffff; font-weight: 400;" class="fullCenter">
	                	© 2023 All rights Reserved - ProLegal Legal Management System | Powered by Soxfort Solutions&nbsp;
	                  </td>
	              </tr>
	              <tr>
	              <td width="100%" height="24"></td>
	            </tr>
	            <tr>
	              <td width="100%" height="1" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
	            </tr>
	            </tbody></table></td>
	        </tr>
	      </tbody></table>
	      
	    </td>
	</tr>
<!--—EndModule--></tbody></table>`,
      };
      // send mail with defined transport object and mail options
      SENDMAIL(options, (info) => {
        //console.log("Email sent successfully");
        //console.log("MESSAGE ID: ", info.messageId);
        req.flash("success", "Survey successfully sent via Email");
        res.redirect("/compliance");
      });
    }
  );
});
app.get("/download", async (req, res) => {
  let usersArray = [];

  compliance_data.forEach((e) => {
    let b = {
      department: e.department,
      contact_person: e.contact_person,
      contact_email: e.contact_email,
      score: e.score,
      date_completed: e.date_completed,
      questions: JSON.stringify(e.questions),
    };
    //console.log( JSON.stringify(e.questions))
    usersArray.push(b);
  });
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  let bliData = {
    items: usersArray,
    department: compliance_filter_department,
    date_created: date_created,
  };
  if (req.query.export_type == "pdf") {
    const ig = new InvoiceGenerator6(bliData);
    ig.generate();
    setTimeout(function () {
      res.download("ComplianceSurveyReport.pdf");
    }, 2500);
  } else {
    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    workbook.creator = req.session.user;
    workbook.lastModifiedBy = req.session.user;
    workbook.created = yourDate;
    const worksheet = workbook.addWorksheet("Compliance Data", {
      headerFooter: {
        oddFooter: "Page &P of &N",
        oddHeader: "Compliance Data",
      },
      properties: { tabColor: { argb: "FFC0000" } },
    });

    // Define columns in the worksheet, these columns are identified using a key.
    worksheet.columns = [
      { header: "Department", key: "department", width: 20 },
      { header: "Contact Person", key: "contact_person", width: 20 },
      { header: "Contact Email", key: "contact_email", width: 20 },
      { header: "Score", key: "score", width: 20 },
      { header: "Date Completed", key: "date_completed", width: 20 },
    ];
    worksheet.autoFilter = "A1:D1";

    // Process each row for beautification
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3b7197" },
            bgColor: { argb: "FF0000FF" },
          };
        }
        // Set border of each cell
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          name: "Arial Black",
          color: { argb: "000000" },
          family: 2,
          size: 8,
        };
        cell.alignment = { wrapText: true, indent: 1 };
      });
      //Commit the changed row to the stream
      row.commit();
    });
    // Add rows from database to worksheet
    worksheet.addRows(usersArray);

    // write to a new buffer
    await workbook.xlsx.writeFile("ComplianceData.xlsx").then(() => {
      res.download("ComplianceData.xlsx");
    });
  }
});
app.get("/download1", async (req, res) => {
  let questions = [];
  console.log(export_compliance_id);
  compliance_data.forEach((e) => {
    if (e.id == export_compliance_id) {
      questions = e.questions;
    }
  });
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  let bliData = {
    items: questions,
    date_created: date_created,
  };
  if (req.query.export_type == "pdf") {
    const ig = new InvoiceGenerator5(bliData);
    ig.generate();
    setTimeout(function () {
      res.download("ComplianceReport.pdf");
    }, 2500);
  } else {
    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    workbook.creator = req.session.user;
    workbook.lastModifiedBy = req.session.user;
    workbook.created = yourDate;
    const worksheet = workbook.addWorksheet("Compliance Responses", {
      headerFooter: {
        oddFooter: "Page &P of &N",
        oddHeader: "Compliance Responses",
      },
      properties: { tabColor: { argb: "FFC0000" } },
    });
    // Define columns in the worksheet, these columns are identified using a key.
    worksheet.columns = [
      { header: "Question", key: "title", width: 20 },
      { header: "Response", key: "response", width: 20 },
    ];

    // Add rows from database to worksheet
    worksheet.addRows(questions[0]);
    // Add autofilter on each column
    worksheet.autoFilter = "A1:D1";

    // Process each row for beautification
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3b7197" },
            bgColor: { argb: "FF0000FF" },
          };
        }
        // Set border of each cell
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          name: "Arial Black",
          color: { argb: "000000" },
          family: 2,
          size: 8,
        };
        cell.alignment = { wrapText: true, indent: 1 };
      });
      //Commit the changed row to the stream
      row.commit();
    });
    // write to a new buffer
    await workbook.xlsx.writeFile("ComplianceQuestions.xlsx").then(() => {
      res.download("ComplianceQuestions.xlsx");
    });
  }
});
app.get("/download3", async (req, res) => {
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  let bliData = {
    items: array,
    date_created: date_created,
  };
  if (req.query.export_type == "pdf") {
    const ig = new InvoiceGenerator4(bliData);
    ig.generate();
    setTimeout(function () {
      res.download("LawfirmsReport.pdf");
    }, 2500);
  } else {
    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    workbook.creator = req.session.user;
    workbook.lastModifiedBy = req.session.user;
    workbook.created = yourDate;
    const worksheet = workbook.addWorksheet("Lawfirms", {
      headerFooter: {
        oddFooter: "Page &P of &N",
        oddHeader: "law Firms Report",
      },
      properties: { tabColor: { argb: "FFC0000" } },
    });
    // Define columns in the worksheet, these columns are identified using a key.
    worksheet.columns = [
      { header: "ID", key: "law_firm_id", width: 5 },
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 20 },
      { header: "Address", key: "address", width: 20 },
      { header: "Status", key: "status", width: 10 },
      { header: "Date Added", key: "date_created", width: 10 },
      { header: "Phone Number", key: "phone_number", width: 20 },
      { header: "Vat Number", key: "vat_number", width: 15 },
      { header: "Website", key: "website", width: 25 },
      { header: "Contacts", key: "contacts", width: 20 },
      { header: "Statements", key: "statements", width: 15 },
      { header: "Fee Notes", key: "fee_notes", width: 25 },
    ];

    // Add rows from database to worksheet
    for (const row of array) {
      let a = {
        law_firm_id: row.law_firm_id,
        name: row.name,
        address: row.address,
        phone_number: row.phone_number,
        status: row.status,
        groups: row.groups,
        date_created: row.date_created,
        email: row.email,
        vat_number: row.vat_number,
        website: row.website,
        contacts:
          row.contacts == null
            ? ""
            : Object.keys(row.contacts)
                .map(function (k) {
                  return row.contacts[k];
                })
                .join(","),
        statements:
          row.statements == null
            ? ""
            : Object.keys(row.statements)
                .map(function (k) {
                  return row.statements[k];
                })
                .join(","),
        fee_notes:
          row.fee_notes == null
            ? ""
            : Object.keys(row.fee_notes)
                .map(function (k) {
                  return row.fee_notes[k];
                })
                .join(","),
      };
      worksheet.addRow(a);
      console.log(a);
    }
    worksheet.addRows(array);
    // Add autofilter on each column
    worksheet.autoFilter = "A1:D1";

    // Process each row for beautification
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3b7197" },
            bgColor: { argb: "FF0000FF" },
          };
        }
        // Set border of each cell
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          name: "Arial Black",
          color: { argb: "000000" },
          family: 2,
          size: 8,
        };
        cell.alignment = { wrapText: true, indent: 1 };
      });
      //Commit the changed row to the stream
      row.commit();
    });
    // write to a new buffer
    await workbook.xlsx.writeFile("LawFirms.xlsx").then(() => {
      res.download("LawFirms.xlsx");
    });
  }
});
app.get("/download4", async (req, res) => {
  let data = budgetLineItems;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  let bliData = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    items: data,
    date_created: date_created,
  };
  if (req.query.export_type == "pdf") {
    const ig = new InvoiceGenerator3(bliData);
    ig.generate();
    setTimeout(function () {
      res.download("BudgetItemsReport.pdf");
    }, 2500);
  } else {
    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    workbook.creator = req.session.user;
    workbook.lastModifiedBy = req.session.user;
    workbook.created = yourDate;
    const worksheet = workbook.addWorksheet("Budget Items", {
      headerFooter: {
        oddFooter: "Page &P of &N",
        oddHeader: "Budget Items Report",
      },
      properties: { tabColor: { argb: "FFC0000" } },
    });
    // Define columns in the worksheet, these columns are identified using a key.
    worksheet.columns = [
      { header: "ID", key: "budget_id", width: 5 },
      { header: "Budget", key: "budget", width: 20 },
      { header: "Actual", key: "actual", width: 20 },
      { header: "Variance", key: "variance", width: 20 },
      { header: "Status", key: "status", width: 10 },
      { header: "Start Date", key: "start_date", width: 10 },
      { header: "End Date", key: "end_date", width: 20 },
      { header: "Budget Name", key: "budget_name", width: 15 },
    ];

    // Add rows from database to worksheet
    worksheet.addRows(data);
    // Add autofilter on each column
    worksheet.autoFilter = "A1:D1";

    // Process each row for beautification
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3b7197" },
            bgColor: { argb: "FF0000FF" },
          };
        }
        // Set border of each cell
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          name: "Arial Black",
          color: { argb: "000000" },
          family: 2,
          size: 8,
        };
        cell.alignment = { wrapText: true, indent: 1 };
      });
      //Commit the changed row to the stream
      row.commit();
    });
    // write to a new buffer
    await workbook.xlsx.writeFile("BudgetItems.xlsx").then(() => {
      res.download("BudgetItems.xlsx");
    });
  }
});
app.get("/download5", async (req, res) => {
  let arrayD = [];
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  balance = 0;
  budgetLineItems.forEach((e) => {
    if (e.expenditure.length > 0) {
      e.expenditure.forEach((f) => {
        if (
          moment(f.expenditure_date).format("Do MMMM, YYYY") >=
          req.query.expenditure_date
        ) {
          let g = {
            expenditure_date: f.expenditure_date,
            expenditure_desc: f.expenditure_desc,
            expenditure: f.expenditure,
            balance: (balance += parseFloat(f.expenditure)),
          };
          arrayD.push(g);
        }
      });
    }
  });
  let expenditureData = {
    expenditure_date: req.query.expenditure_date,
    items: arrayD,
    date_created: date_created,
  };
  if (req.query.export_type == "pdf") {
    const ig = new InvoiceGenerator2(expenditureData);
    ig.generate();
    setTimeout(function () {
      res.download("BudgetExpenditureReport.pdf");
    }, 2500);
  } else {
    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    workbook.creator = req.session.user;
    workbook.lastModifiedBy = req.session.user;
    workbook.created = yourDate;
    const worksheet = workbook.addWorksheet("Budget Expenditure", {
      headerFooter: {
        oddFooter: "Page &P of &N",
        oddHeader: "Budget Expenditure",
      },
      properties: { tabColor: { argb: "FFC0000" } },
    });
    // Define columns in the worksheet, these columns are identified using a key.
    worksheet.columns = [
      { header: "Expenditure Date", key: "expenditure_date", width: 20 },
      { header: "Expenditure Description", key: "expenditure_desc", width: 20 },
      { header: "Expenditure", key: "expenditure", width: 20 },
      { header: "Balance", key: "balance", width: 20 },
    ];

    // Add rows from database to worksheet
    worksheet.addRows(arrayD);
    // Add autofilter on each column
    worksheet.autoFilter = "A1:D1";

    // Process each row for beautification
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3b7197" },
            bgColor: { argb: "FF0000FF" },
          };
        }
        // Set border of each cell
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          name: "Arial Black",
          color: { argb: "000000" },
          family: 2,
          size: 8,
        };
        cell.alignment = { wrapText: true, indent: 1 };
      });
      //Commit the changed row to the stream
      row.commit();
    });
    // write to a new buffer
    await workbook.xlsx.writeFile("BudgetExpenditure.xlsx").then(() => {
      res.download("BudgetExpenditure.xlsx");
    });
  }
});
app.get("/downloadTimesheet", async (req, res) => {
  let arrayD = [];
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  balance = 0;
  my_ts.forEach((e) => {
    console.log(
      Date(e.start_date),
      Date(req.query.start_date),
      e.end_date,
      Date(req.query.end_date)
    );
    // if(moment(e.start_date).format('Do MMMM, YYYY') >= moment(req.query.start_date).format('Do MMMM, YYYY') && moment(e.end_date).format('Do MMMM, YYYY') <= moment(req.query.end_date).format('Do MMMM, YYYY')){
    if (
      Date(e.start_date) >= Date(req.query.start_date) &&
      Date(e.end_date) <= Date(req.query.end_date)
    ) {
      arrayD.push(e);
    }
  });

  let timesheetData = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    items: arrayD,
    date_created: date_created,
  };
  if (req.query.export_type == "pdf") {
    const ig = new InvoiceGenerator8(timesheetData);
    ig.generate();
    setTimeout(function () {
      res.download("MyTimesheetsReport.pdf");
    }, 2500);
  } else {
    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    workbook.creator = req.session.user;
    workbook.lastModifiedBy = req.session.user;
    workbook.created = yourDate;
    const worksheet = workbook.addWorksheet("My Timesheet", {
      headerFooter: { oddFooter: "Page &P of &N", oddHeader: "My Timesheet" },
      properties: { tabColor: { argb: "FFC0000" } },
    });
    // Define columns in the worksheet, these columns are identified using a key.
    worksheet.columns = [
      { header: "Owner", key: "timesheet_owner", width: 20 },
      { header: "Task Name", key: "task_name", width: 40 },
      { header: "Task Description", key: "task_description", width: 50 },
      { header: "Case", key: "case_name", width: 30 },
      { header: "Contract", key: "contract_name", width: 30 },
      { header: "Start Date", key: "start_date", width: 25 },
      { header: "End Date", key: "end_date", width: 25 },
    ];

    // Add rows from database to worksheet
    worksheet.addRows(arrayD);
    // Add autofilter on each column
    worksheet.autoFilter = "A1:D1";

    // Process each row for beautification
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3b7197" },
            bgColor: { argb: "FF0000FF" },
          };
        }
        // Set border of each cell
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          name: "Arial Black",
          color: { argb: "000000" },
          family: 2,
          size: 8,
        };
        cell.alignment = { wrapText: true, indent: 1 };
      });
      //Commit the changed row to the stream
      row.commit();
    });
    // write to a new buffer
    await workbook.xlsx.writeFile("MyTimesheets.xlsx").then(() => {
      res.download("MyTimesheets.xlsx");
    });
  }
});
app.get("/download6", async (req, res) => {
  pool.query("SELECT * FROM contracts", [], async (err, results) => {
    if (err) {
      errors.push({ message: err });
    }

    let data = [];

    results.rows.forEach((e) => {
      if (
        moment(e.end_date).format("Do MMMM, YYYY") <= req.query.end_date &&
        e.status.toLowerCase() == req.query.status.toLowerCase()
      ) {
        data.push(e);
      }
    });
    console.log(data);
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    let contractData = {
      end_date: req.query.end_date,
      status: req.query.status,
      items: data,
      date_created: date_created,
    };
    if (req.query.export_type == "pdf") {
      const ig = new InvoiceGenerator1(contractData);
      ig.generate();
      setTimeout(function () {
        res.download("ContractsReport.pdf");
      }, 2500);
    } else {
      // Create Excel workbook and worksheet
      const workbook = new Excel.Workbook();
      let yourDate = new Date();
      date_created = formatDate(yourDate);
      workbook.creator = req.session.user;
      workbook.lastModifiedBy = req.session.user;
      workbook.created = yourDate;
      const worksheet = workbook.addWorksheet("Contracts", {
        headerFooter: { oddFooter: "Page &P of &N", oddHeader: "Contracts" },
        properties: { tabColor: { argb: "FFC0000" } },
      });
      // Define columns in the worksheet, these columns are identified using a key.
      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Description", key: "notes", width: 20 },
        { header: "End Date", key: "end_date", width: 20 },
        { header: "Vendor", key: "vendor", width: 20 },
        { header: "Department", key: "department", width: 20 },
        { header: "Payment Cycle", key: "payment_cycle", width: 20 },
        { header: "Payment Type", key: "payment_type", width: 20 },
        { header: "Status", key: "status", width: 20 },
        { header: "Contract Value", key: "contract_value", width: 20 },
      ];

      // Add rows from database to worksheet
      worksheet.addRows(data);
      // Add autofilter on each column
      worksheet.autoFilter = "A1:D1";

      // Process each row for beautification
      worksheet.eachRow(function (row, rowNumber) {
        row.eachCell((cell, colNumber) => {
          if (rowNumber == 1) {
            // First set the background of header row
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "3b7197" },
              bgColor: { argb: "FF0000FF" },
            };
          }
          // Set border of each cell
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.font = {
            name: "Arial Black",
            color: { argb: "000000" },
            family: 2,
            size: 8,
          };
          cell.alignment = { wrapText: true, indent: 1 };
        });
        //Commit the changed row to the stream
        row.commit();
      });
      // write to a new buffer
      await workbook.xlsx.writeFile("Contracts.xlsx").then(() => {
        res.download("Contracts.xlsx");
      });
    }
  });
});

app.get("/download7", async (req, res) => {
  let data = [];
  array3.forEach((e) => {
    if (
      moment(e.start_date).format("Do MMMM, YYYY") >= req.query.start_date &&
      moment(e.end_date).format("Do MMMM, YYYY") <= req.query.end_date &&
      e.status.toLowerCase() == req.query.status.toLocaleLowerCase()
    ) {
      data.push(e);
    }
  });
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  let caseData = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    status: req.query.status,
    items: data,
    date_created: date_created,
  };
  if (req.query.export_type == "pdf") {
    const ig = new InvoiceGenerator(caseData);
    ig.generate();
    setTimeout(function () {
      res.download("CasesReport.pdf");
    }, 2500);
  } else {
    let usersArray = data;

    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    let yourDate = new Date();
    date_created = formatDate(yourDate);
    workbook.creator = req.session.user;
    workbook.lastModifiedBy = req.session.user;
    workbook.created = yourDate;
    const worksheet = workbook.addWorksheet("Cases Data", {
      headerFooter: { oddFooter: "Page &P of &N", oddHeader: "Cases Data" },
      properties: { tabColor: { argb: "FFC0000" } },
    });

    // Define columns in the worksheet, these columns are identified using a key.
    worksheet.columns = [
      { header: "Case ID", key: "case_id", width: 10 },
      { header: "Case Name", key: "case_name", width: 40 },
      { header: "Status", key: "status", width: 20 },
      { header: "Date Started", key: "start_date", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Assigned To", key: "staff_members", width: 20 },
      { header: "Deadline", key: "end_date", width: 20 },
    ];
    worksheet.autoFilter = "A1:D1";

    // Process each row for beautification
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3b7197" },
            bgColor: { argb: "FF0000FF" },
          };
        }
        // Set border of each cell
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.font = {
          name: "Arial Black",
          color: { argb: "000000" },
          family: 2,
          size: 8,
        };
        cell.alignment = { wrapText: true, indent: 1 };
      });
      //Commit the changed row to the stream
      row.commit();
    });
    // Add rows from database to worksheet
    worksheet.addRows(usersArray);

    // write to a new buffer
    await workbook.xlsx.writeFile("CasesData.xlsx").then(() => {
      res.download("CasesData.xlsx");
    });
  }
});
app.get("/download8", async (req, res) => {
  pool.query(`SELECT * FROM vendors`, [], async (err, results) => {
    if (err) {
      console.log(err);
      errors.push({ message: err });
    }

    let data = results.rows;

    let yourDate = new Date();
    date_created = formatDate(yourDate);
    let vendorData = {
      items: data,
      date_created: date_created,
    };
    if (req.query.export_type == "pdf") {
      const ig = new InvoiceGenerator7(vendorData);
      ig.generate();
      setTimeout(function () {
        res.download("VendorsReport.pdf");
      }, 2500);
    } else {
      let usersArray = data;

      // Create Excel workbook and worksheet
      const workbook = new Excel.Workbook();
      let yourDate = new Date();
      date_created = formatDate(yourDate);
      workbook.creator = req.session.user;
      workbook.lastModifiedBy = req.session.user;
      workbook.created = yourDate;
      const worksheet = workbook.addWorksheet("Vendors Data", {
        headerFooter: { oddFooter: "Page &P of &N", oddHeader: "Cases Data" },
        properties: { tabColor: { argb: "FFC0000" } },
      });

      // Define columns in the worksheet, these columns are identified using a key.
      worksheet.columns = [
        { header: "Vendor ID", key: "vendor_id", width: 10 },
        { header: "Vendor Name", key: "company_name", width: 40 },
        { header: "Address", key: "physical_address", width: 50 },
        { header: "Phone", key: "phone_number", width: 20 },
        { header: "Contact Person", key: "contact_person", width: 30 },
        { header: "Email", key: "email", width: 40 },
        { header: "VAT Number", key: "vat_number", width: 20 },
      ];
      worksheet.autoFilter = "A1:D1";

      // Process each row for beautification
      worksheet.eachRow(function (row, rowNumber) {
        row.eachCell((cell, colNumber) => {
          if (rowNumber == 1) {
            // First set the background of header row
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "3b7197" },
              bgColor: { argb: "FF0000FF" },
            };
          }
          // Set border of each cell
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.font = {
            name: "Arial Black",
            color: { argb: "000000" },
            family: 2,
            size: 8,
          };
          cell.alignment = { wrapText: true, indent: 1 };
        });
        //Commit the changed row to the stream
        row.commit();
      });
      // Add rows from database to worksheet
      worksheet.addRows(usersArray);

      // write to a new buffer
      await workbook.xlsx.writeFile("VendorsData.xlsx").then(() => {
        res.download("VendorsData.xlsx");
      });
    }
  });
});
app.post("/update-compliance-comment", (req, res) => {
  let query = req.query.id;
  let comment = req.body.description;
  pool.query(
    "UPDATE compliance_results SET comment = $1 WHERE id = $2",
    [comment, query],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash(
        "success",
        "You have successfully added a comment on compliance"
      );
      res.redirect("/compliance");
    }
  );
});
app.post("/compliance_results", (req, res) => {
  let responses = req.body.responses;
  let id = req.body.id;
  let yourDate = new Date();
  date_created = formatDate(yourDate);
  boolean_count = 0;
  boolean_yes_count = 0;
  compliance_survey_questions.forEach((e) => {
    if (e.type == "boolean") {
      boolean_count += 1;
    }
  });
  const keys = Object.keys(responses);
  keys.forEach((key, index) => {
    // console.log(`${key}: ${courses[key]}`);
    if (responses[key] == true) {
      boolean_yes_count += 1;
      responses[key] = "yes";
    }
    if (responses[key] == false) {
      responses[key] = "no";
    }
    let count = 0;
    compliance_survey_questions.forEach((e) => {
      console.log(e.name, key);
      if (e.name == key)
        compliance_survey_questions[count].response = responses[key];
      count += 1;
    });
  });
  let y = boolean_yes_count + "/" + boolean_count;
  pool.query(
    "UPDATE compliance_results SET responses = $1, date_completed = $2, questions = $3, score = $4 WHERE id = $5",
    [responses, date_created, compliance_survey_questions, y, id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
        console.log(err);
      }
      const message = "Survey Completed";
      const options = {
        from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
        to: "mochonam19@gmail.com", // receiver email
        subject: " A survey has been submitted by " + compliance_department, // Subject line
        text: message,
        html: `<h1>Compliance Run for ${compliance_department} Completed</h1>
        <p>This is a system generated email to inform you that the compliance run for the ${compliance_department} department has been completed on <strong>${date_created}</strong>. You can now login to the <strong>ProLegal Case Management Platform</strong> to view the results of the compliance check.</p>
        
        <p>Once you have logged in, you can view the results of the compliance check by clicking on the "Compliance" tab.</p>
        <p>Thank you,</p>
        <p>Prolegal Team</p>
        `,
      };
      // send mail with defined transport object and mail options
      SENDMAIL(options, (info) => {});
      res.redirect("/compliance");
    }
  );
});
app.get("/users/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    authed = false;
    usrId = "";
    nam = "";
    req.flash("success", "You are logged out");
    res.redirect("/login");
  });
});
app.get("/login", checkAuthenticated, (req, res) => {
  let errors = [];
  res.render("login", {
    layout: "./layouts/login-layout",
    user_role,
    authed: authed,
    user: req.session.user,
    errors: errors,
  });
});
app.get("/forgot-password", (req, res) => {
  let errors = [];
  res.render("passwordreset", {
    layout: "./layouts/login-layout",
    user_role,
    errors: errors,
  });
});
app.get("/reset-password", (req, res) => {
  let errors = [];
  res.render("passwordreset", {
    layout: "./layouts/login-layout",
    user_role,
    errors: errors,
  });
});
app.get("/reset-password-email-sent", (req, res) => {
  res.render("passwordresetemailsent", { layout: "./layouts/login-layout" });
});
app.get("/set-password", (req, res) => {
  let email = req.query.email;
  let user_name = req.query.user_name;
  let role = req.query.role;
  let errors = [];
  res.render("password", {
    layout: "./layouts/login-layout",
    user_role,
    email: email,
    errors: errors,
  });
});
app.post("/reset-password", async (req, res) => {
  let email = req.body.email;
  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
        res.render("passwordreset", {
          layout: "./layouts/login-layout",
          user_role,
          errors: errors,
        });
      }
      if (results.rows.length == 0) {
        errors.push({ message: "Email is not registered in the system!" });
        res.render("passwordreset", {
          layout: "./layouts/login-layout",
          user_role,
          errors: errors,
        });
      } else {
        const message =
          "Email to reset password of your Case Management System account";
        const options = {
          from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
          to: email, // receiver email
          subject: "Prolegal Case Management System - Account Verification", // Subject line
          text: message,
          html: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN""http://www.w3.org/TR/REC-html40/loose.dtd">
          <html>
          <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
          <link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800' rel='stylesheet' type='text/css'>
          <base target="_blank">
          <title>Gravity Email Template</title>
          <style type="text/css">
          
          body *{font-family: 'Open Sans', Arial, sans-serif }
          
          div, p, a, li, td { -webkit-text-size-adjust:none; }
          
          *{-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}
          td{word-break: break-word;}
          a{word-break: break-word; text-decoration: none; color: inherit;}
          
          body .ReadMsgBody
          {width: 100%; background-color: #ffffff;}
          body .ExternalClass
          {width: 100%; background-color: #ffffff;}
          body{width: 100%; height: 100%; background-color: #ffffff; margin:0; padding:0; -webkit-font-smoothing: antialiased;}
          html{ background-color:#ffffff; width: 100%;}   
          
          body p {padding: 0!important; margin-top: 0!important; margin-right: 0!important; margin-bottom: 0!important; margin-left: 0!important; }
          body img {user-drag: none; -moz-user-select: none; -webkit-user-drag: none;}
          body .hover:hover {opacity:0.85;filter:alpha(opacity=85);}
          body td img:hover {opacity:0.85;filter:alpha(opacity=85);}
          body .underline:hover {text-decoration: underline!important;}
          body .hoverGreen img {opacity: 1;transition: opacity .40s ease-in-out;-moz-transition: opacity .40s ease-in-out;-webkit-transition: opacity .40s ease-in-out;}
          body .hoverGreen img:hover {opacity:0.1;filter:alpha(opacity=10)transition: opacity .40s ease-in-out;-moz-transition: opacity .40s ease-in-out;-webkit-transition: opacity .40s ease-in-out;}
          body .jump:hover {opacity:0.75; filter:alpha(opacity=75); padding-top: 10px!important;}
          body a.rotator img {-webkit-transition: all 1s ease-in-out;-moz-transition: all 1s ease-in-out; -o-transition: all 1s ease-in-out; -ms-transition: all 1s ease-in-out; }
          body a.rotator img:hover { -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); -o-transform: rotate(360deg);-ms-transform: rotate(360deg); }
          
          body #logo img {width: 125px; height: auto;}
          body .logo125 img {width: 125px; height: auto;}
          body #icon12 img {width: 12px; height: auto;}
          body .icon75 img {width: 75px; height: auto;}
          body .icon24 img {width: 24px; height: auto;}
          body .icon36 img {width: 36px; height: auto;}
          body .icon40 img {width: 40px; height: auto;}
          body .image280 img {width: 280px; height: auto;}
          body .image245 img {width: 245px; height: auto;}
          body .image200 img {width: 200px; height: auto;}
          body .image275 img {width: 275px; height: auto;}
          body .image250 img {width: 250px; height: auto;}
          body .image230 img {width: 230px; height: auto;}
          body .image600 img {width: 600px; height: auto;}
          body .image135 img {width: 135px; height: auto; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px;}
          body .avatar72 img {width: 72px; height: auto; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px;}
          </style>
          
          <style type="text/css">@media only screen and (max-width: 640px){
              body body{width:auto!important;}
              body table[class=full] {width: 100%!important; clear: both; }
              body table[class=mobile] {width: 100%!important; padding-left: 20px; padding-right: 20px; clear: both; }
              body table[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
              body td[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
              body *[class=erase] {display: none;}
              body *[class=buttonScale] {float: none!important; text-align: center!important; display: inline-block!important; clear: both;}
              body .image600 img {width: 100%!important;}
              body td[class=image230] {width: 230!important; text-align: center!important; clear: both; }
              body .image298 img {width: 100%!important;}
              table[class=image110] {text-align:center; float:none; width:70%!important;}
              body td[class=pad30] {padding-left: 25px!important; padding-right: 25px!important; text-align: center!important; clear: both; }
              body td[class=image298] img {width: 100%!important; text-align: center!important; clear: both; }
              body .h30 {width: 100%!important; height: 30px!important;}
              body .h15 {width: 100%!important; height: 15px!important;}
              body table[class=sponsor] {text-align:center; float:none; width:80%!important;}
              body .w10 {width: 8%!important; height: 10px!important;}
              body .pad20 {padding-left: 20px!important; padding-right: 20px!important;}
              body .h65 {width: 100%; height: 65px!important;}
          }</style>
          
          <style type="text/css">@media only screen and (max-width: 479px){
              body body{width:auto!important;}
              body table[class=full] {width: 100%!important; clear: both; }
              body table[class=mobile] {width: 100%!important; padding-left: 20px; padding-right: 20px; clear: both; }
              body table[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
              body td[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
              body *[class=erase] {display: none;}
              body *[class=buttonScale] {float: none!important; text-align: center!important; display: inline-block!important; clear: both;}
              body .eraseMob {display: none!important;}
              body .font44 {font-size: 36px!important; line-height: 40px!important;}
              body .image600 img {width: 100%!important;}
              body td[class=image230] {width: 230!important; text-align: center!important; clear: both; }
              body .image298 img {width: 100%!important;}
              body .image280 img {width: 100%!important; text-align: center!important; clear: both; }
              body .image275 img {width: 100%!important; text-align: center!important; clear: both; }
              body table[class=image110] {text-align:center; float:none; width:100%!important;}
              body td[class=pad30] {padding-left: 25px!important; padding-right: 25px!important; text-align: center!important; clear: both; }
              body .break {display: block!important;}
              body table[class=mcenter] {text-align:center; vertical-align:middle; clear:both!important; float:none; margin: 0px!important;}
              body .h30 {width: 100%!important; height: 30px!important;}
              body .h15 {width: 100%!important; height: 15px!important;}
              body table[class=sponsor] {text-align:center; float:none; width:100%!important;}
              body .w10 {width: 8%!important; height: 10px!important;}
              body .pad20 {padding-left: 20px!important; padding-right: 20px!important;}
              body .h65 {width: 100%; height: 65px!important;}
          }</style>
          
          </head>
          <body style='margin: 0; padding: 0;'>
          
          <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full" bgcolor="#f6f6f6" style="background-color: rgb(246, 246, 246);">
            <tbody><tr>
              <td width="100%" valign="top" align="center">
              
                
                <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="mobile">
                  <tbody><tr>
                    <td align="center">
                    
                      
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
                        <tbody><tr>
                          <td width="100%" height="65"></td>
                        </tr>
                      </tbody></table>
                      
                      
                      <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
                        <tbody><tr>
                          <td width="100%" align="center">
                          
                            <!-- Image 250px - 2 -->
                            <table width="250" border="0" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; text-align: center;" class="fullCenter">
                              <tbody><tr>
                                <td width="100%" align="center" class="image250">
                                  <a href="#" style="text-decoration: none;">
                                    <img src="images/165931700114952OzM2aJcQ.png" editable="true" width="250" alt="" border="0" class="hover toModifyImage" >
                                  </a>
                                </td>
                              </tr>
                            </tbody></table>
                            
                            <table width="1" border="0" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="full">
                              <tbody><tr>
                                <td width="100%" height="65" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                              </tr>
                            </tbody></table> 
                            
                            <!-- Text Right -->
                            <table width="310" border="0" cellpadding="0" cellspacing="0" align="right" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="fullCenter">
                              <tbody><tr>
                                <td valign="middle" width="100%" style="text-align: left; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 22px; color: #27272b; line-height: 28px; font-weight: 700;" class="fullCenter">
                                  Prolegal Case Management System - Account Verification
                                </td>
                              </tr>
                              <tr>
                                <td width="100%" height="25"></td>
                              </tr>
                              <tr>
                                <td valign="middle" width="100%" style="text-align: left; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 14px; color: #828282; line-height: 22px; font-weight: 400;" class="fullCenter">
                                  <span style="color: rgb(0, 0, 0);" >Dear ${results.rows[0].name},</span></p><p><br><span style="color: rgb(0, 0, 0);" >  <p>We received a request to reset your password for your Prolegal Case Management account. If you did not request this, please disregard this email.</p>
                                    <p>To reset your password, please click on the following link:</p>
                                    <a href="https://prolegal-02d79a24b17b.herokuapp.com/set-password?email=${email}">RESET PASSWORD LINK</a>
                                    <p>This link will only be valid for 24 hours.</p>
                                    <p>If you are unable to click on the link, please copy and paste it into your browser.</p>
                                    <p>Once you have clicked on the link, you will be taken to a page where you can enter a new password for your account. Please choose a strong password that is at least 8 characters long and includes a mix of upper and lowercase letters, numbers, and symbols.</p>
                                    <p>After you have entered your new password, you will be able to log in to your account.</p>
                                    <p>If you have any questions, please do not hesitate to contact us.</p>
                                    <p>Thank you,</p>
                                    <p>Prolegal Team</p></span>
                                </td>
                              </tr>
                              <tr>
                                <td width="100%" height="35"></td>
                              </tr>
                              <!-- Button Left, Scale Center -->
                              <tr>
                                <td class="buttonScale" width="auto" align="left">
                                  
                                  <table border="0" cellpadding="0" cellspacing="0" align="left" class="buttonScale">
                                    <tbody><tr>
                                      <td width="auto" align="center" height="37" bgcolor="#27272b" style="border-top-left-radius: 25px; border-top-right-radius: 25px; border-bottom-right-radius: 25px; border-bottom-left-radius: 25px; padding-left: 20px; padding-right: 20px; font-weight: 600; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; color: #ffffff; text-transform: uppercase; background-color: #27272b; font-size: 12px;">
                                        <multiline><a href="https://prolegal-02d79a24b17b.herokuapp.com/compliance-survey?id=${results1.rows[0].id}" style="color: #ffffff; font-size: 12px; text-decoration: none; line-height: 34px; width: 100%;">complete survey</a></multiline>
                                      </td>
                                    </tr>
                                  </tbody></table>
                                
                                </td>
                              </tr>
                              <!-- Button Left, Scale Center -->
                            </tbody></table>
                            
                          </td>
                        </tr>
                      </tbody></table>
                      
                      
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
                        <tbody><tr>
                          <td width="100%" height="65"></td>
                        </tr>
                      </tbody></table>
                      
                    </td>
                  </tr>
                </tbody></table>
              
              </td>
            </tr>
          <!--—EndModule--></tbody></table><table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full" bgcolor="#27272b" style="background-color: rgb(39, 39, 43);">
            <tbody><tr>
              <td width="100%" valign="top" align="center"> 
                  
                  <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="mobile">
                    <tbody><tr>
                      <td width="100%" align="center">
                        
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" align="left" style="text-align: center;" class="fullCenter">
                        <tbody><tr>
                          <td width="100%" height="25"></td>
                        </tr>
                          <tr>
                            <td width="100%" style="text-align: center; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 12px; color: #ffffff; font-weight: 400;" class="fullCenter">
                              © 2023 All rights Reserved - ProLegal Legal Management System | Powered by Soxfort Solutions&nbsp;
                              </td>
                          </tr>
                          <tr>
                          <td width="100%" height="24"></td>
                        </tr>
                        <tr>
                          <td width="100%" height="1" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                        </tr>
                        </tbody></table></td>
                    </tr>
                  </tbody></table>
                  
                </td>
            </tr>
          <!--—EndModule--></tbody></table>`,
        };
        // send mail with defined transport object and mail options
        SENDMAIL(options, (info) => {
          //console.log("Email sent successfully");
          req.flash("success", "Reset Password email sent");
          //   console.log("MESSAGE ID: ", info.messageId);
          res.redirect("/reset-password-email-sent");
        });
      }
    }
  );
});
app.post("/set-password", async (req, res) => {
  let email = req.query.email;
  let password1 = req.body.new_password;
  let password2 = req.body.confirm_password;
  errors = [];
  if (password1 != password2) {
    errors.push({ message: "Passwords do not match" });

    console.log(errors);
    res.render("password", {
      layout: "./layouts/login-layout",
      user_role,
      errors: errors,
    });
  } else {
    let hashedPassword = await bcrypt.hash(password1, 10);
    //console.log(email)
    pool.query(
      "UPDATE users SET password = $1, activated = $2 WHERE email = $3",
      [hashedPassword, true, email],
      (err, results) => {
        if (err) {
          errors.push({ message: err });

          res.render("set-password", {
            layout: "./layouts/login-layout",
            user_role,
            errors: errors,
          });
        }
        req.flash(
          "success",
          "Password setup successfull, you can now login into your account"
        );
        res.redirect("/login");
      }
    );
  }
});
app.get("/settings/user-roles", checkNotAuthenticated, (req, res) => {
  let errors = [];
  let message = [];
  pool.query("SELECT * FROM user_roles", [], (err, results) => {
    if (err) {
      errors.push({ message: err });
    }
    res.render("user-roles", {
      layout: "./layouts/users-layout",
      user_role,
      authed: authed,
      user: req.session.user,
      errors: errors,
      data1: results.rows,
    });
  });
});
app.get("/settings/departments", checkNotAuthenticated, (req, res) => {
  let errors = [];
  let message = [];
  pool.query(`SELECT * FROM department`, [], (err, results1) => {
    if (err) {
      errors.push({ message: err });
    }
    res.render("departments", {
      layout: "./layouts/users-layout",
      user_role,
      authed: authed,
      user: req.session.user,
      errors: errors,
      data1: results1.rows,
    });
  });
});
app.get("/settings/case-status", checkNotAuthenticated, (req, res) => {
  let errors = [];
  let message = [];
  pool.query(`SELECT * FROM case_status`, [], (err, results1) => {
    if (err) {
      errors.push({ message: err });
    }
    pool.query(`SELECT * FROM contract_status`, [], (err, results2) => {
      if (err) {
        errors.push({ message: err });
      }
      res.render("case-status", {
        layout: "./layouts/users-layout",
        user_role,
        authed: authed,
        user: req.session.user,
        errors: errors,
        data1: results1.rows,
        data2: results2.rows,
      });
    });
  });
});
app.post("/update", async (req, res) => {
  const {
    role,
    law_firms,
    cases,
    contracts,
    vendors,
    compliance,
    legal_resources,
    settings,
  } = req.body;

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

  res.redirect("/settings/user-roles");
});
app.post("/case_status", (req, res) => {
  let case_status_name = req.body.case_status_name;
  let description = req.body.description;
  pool.query(
    `INSERT INTO case_status (case_status_name, description)
        VALUES ($1, $2)`,
    [case_status_name, description],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully added a Case Status");
      res.redirect("/settings/case-status");
    }
  );
});
app.post("/contract_status", (req, res) => {
  let contract_status_name = req.body.case_status_name;
  let description = req.body.description;
  pool.query(
    `INSERT INTO contract_status (contract_status_name, description)
        VALUES ($1, $2)`,
    [contract_status_name, description],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully added a Contract Status");
      res.redirect("/settings/case-status");
    }
  );
});
app.post("/department", (req, res) => {
  let department_name = req.body.department_name;
  let contact_email = req.body.contact_email;
  let contact_person = req.body.contact_person;
  pool.query(
    `INSERT INTO department (department_name,contact_person, contact_email)
        VALUES ($1, $2, $3)`,
    [department_name, contact_person, contact_email],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully added a Department");
      res.redirect("/settings/departments");
    }
  );
});
app.post("/edit-department", (req, res) => {
  let id = req.query.id;
  let department_name = req.body.department_name;
  let contact_email = req.body.contact_email;
  let contact_person = req.body.contact_person;
  console.log(department_name, contact_person, contact_email, id);
  pool.query(
    "UPDATE department SET department_name = $1, contact_person = $2, contact_email = $3 WHERE id = $4",
    [department_name, contact_person, contact_email, id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully updated a Department");
      res.redirect("/settings/departments");
    }
  );
});
app.post("/edit-user", (req, res) => {
  let user_name = req.body.user_name;
  let email = req.body.email;
  let role = req.body.role;
  let activated;
  if (req.body.activated == "true") {
    activated = true;
  } else {
    activated = false;
  }
  pool.query(
    "UPDATE users SET name = $1, email = $2, role = $3, activated = $4 WHERE id = $5",
    [user_name, email, role, activated, req.query.id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully edited a User");
      res.redirect("/settings/users");
    }
  );
});
app.post("/new_user", (req, res) => {
  let user_name = req.body.user_name;
  let email = req.body.email;
  let role = req.body.role;
  let errors = [];
  let message = [];
  pool.query(
    `INSERT INTO users (email,name,role,activated,archived,password)
        VALUES ($1, $2, $3, $4, $5, $6)`,
    [email, user_name, role, false, false, ""],
    (err, results) => {
      if (err) {
        errors.push({ message: err });

        pool.query(`SELECT * FROM users`, [], (err, results) => {
          if (err) {
            console.log(err);
            errors.push({ message: err });
            res.render("users", {
              layout: "./layouts/users-layout",
              user_role,
              data: results.rows,
              user: req.session.user,
              errors: errors,
              message: messge,
            });
          }
        });
      }
      const message = "Email to activate your Case Management System account";
      const options = {
        from: "CASE MANAGEMENT SYSTEM <mochonam19@gmail.com>", // sender address
        to: email, // receiver email
        subject: "Prolegal Case Management System - Account Verification", // Subject line
        text: message,
        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN""http://www.w3.org/TR/REC-html40/loose.dtd">
        <html>
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
        <link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800' rel='stylesheet' type='text/css'>
        <base target="_blank">
        <title>Gravity Email Template</title>
        <style type="text/css">
        
        body *{font-family: 'Open Sans', Arial, sans-serif }
        
        div, p, a, li, td { -webkit-text-size-adjust:none; }
        
        *{-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}
        td{word-break: break-word;}
        a{word-break: break-word; text-decoration: none; color: inherit;}
        
        body .ReadMsgBody
        {width: 100%; background-color: #ffffff;}
        body .ExternalClass
        {width: 100%; background-color: #ffffff;}
        body{width: 100%; height: 100%; background-color: #ffffff; margin:0; padding:0; -webkit-font-smoothing: antialiased;}
        html{ background-color:#ffffff; width: 100%;}   
        
        body p {padding: 0!important; margin-top: 0!important; margin-right: 0!important; margin-bottom: 0!important; margin-left: 0!important; }
        body img {user-drag: none; -moz-user-select: none; -webkit-user-drag: none;}
        body .hover:hover {opacity:0.85;filter:alpha(opacity=85);}
        body td img:hover {opacity:0.85;filter:alpha(opacity=85);}
        body .underline:hover {text-decoration: underline!important;}
        body .hoverGreen img {opacity: 1;transition: opacity .40s ease-in-out;-moz-transition: opacity .40s ease-in-out;-webkit-transition: opacity .40s ease-in-out;}
        body .hoverGreen img:hover {opacity:0.1;filter:alpha(opacity=10)transition: opacity .40s ease-in-out;-moz-transition: opacity .40s ease-in-out;-webkit-transition: opacity .40s ease-in-out;}
        body .jump:hover {opacity:0.75; filter:alpha(opacity=75); padding-top: 10px!important;}
        body a.rotator img {-webkit-transition: all 1s ease-in-out;-moz-transition: all 1s ease-in-out; -o-transition: all 1s ease-in-out; -ms-transition: all 1s ease-in-out; }
        body a.rotator img:hover { -webkit-transform: rotate(360deg); -moz-transform: rotate(360deg); -o-transform: rotate(360deg);-ms-transform: rotate(360deg); }
        
        body #logo img {width: 125px; height: auto;}
        body .logo125 img {width: 125px; height: auto;}
        body #icon12 img {width: 12px; height: auto;}
        body .icon75 img {width: 75px; height: auto;}
        body .icon24 img {width: 24px; height: auto;}
        body .icon36 img {width: 36px; height: auto;}
        body .icon40 img {width: 40px; height: auto;}
        body .image280 img {width: 280px; height: auto;}
        body .image245 img {width: 245px; height: auto;}
        body .image200 img {width: 200px; height: auto;}
        body .image275 img {width: 275px; height: auto;}
        body .image250 img {width: 250px; height: auto;}
        body .image230 img {width: 230px; height: auto;}
        body .image600 img {width: 600px; height: auto;}
        body .image135 img {width: 135px; height: auto; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px;}
        body .avatar72 img {width: 72px; height: auto; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px;}
        </style>
        
        <style type="text/css">@media only screen and (max-width: 640px){
            body body{width:auto!important;}
            body table[class=full] {width: 100%!important; clear: both; }
            body table[class=mobile] {width: 100%!important; padding-left: 20px; padding-right: 20px; clear: both; }
            body table[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
            body td[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
            body *[class=erase] {display: none;}
            body *[class=buttonScale] {float: none!important; text-align: center!important; display: inline-block!important; clear: both;}
            body .image600 img {width: 100%!important;}
            body td[class=image230] {width: 230!important; text-align: center!important; clear: both; }
            body .image298 img {width: 100%!important;}
            table[class=image110] {text-align:center; float:none; width:70%!important;}
            body td[class=pad30] {padding-left: 25px!important; padding-right: 25px!important; text-align: center!important; clear: both; }
            body td[class=image298] img {width: 100%!important; text-align: center!important; clear: both; }
            body .h30 {width: 100%!important; height: 30px!important;}
            body .h15 {width: 100%!important; height: 15px!important;}
            body table[class=sponsor] {text-align:center; float:none; width:80%!important;}
            body .w10 {width: 8%!important; height: 10px!important;}
            body .pad20 {padding-left: 20px!important; padding-right: 20px!important;}
            body .h65 {width: 100%; height: 65px!important;}
        }</style>
        
        <style type="text/css">@media only screen and (max-width: 479px){
            body body{width:auto!important;}
            body table[class=full] {width: 100%!important; clear: both; }
            body table[class=mobile] {width: 100%!important; padding-left: 20px; padding-right: 20px; clear: both; }
            body table[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
            body td[class=fullCenter] {width: 100%!important; text-align: center!important; clear: both; }
            body *[class=erase] {display: none;}
            body *[class=buttonScale] {float: none!important; text-align: center!important; display: inline-block!important; clear: both;}
            body .eraseMob {display: none!important;}
            body .font44 {font-size: 36px!important; line-height: 40px!important;}
            body .image600 img {width: 100%!important;}
            body td[class=image230] {width: 230!important; text-align: center!important; clear: both; }
            body .image298 img {width: 100%!important;}
            body .image280 img {width: 100%!important; text-align: center!important; clear: both; }
            body .image275 img {width: 100%!important; text-align: center!important; clear: both; }
            body table[class=image110] {text-align:center; float:none; width:100%!important;}
            body td[class=pad30] {padding-left: 25px!important; padding-right: 25px!important; text-align: center!important; clear: both; }
            body .break {display: block!important;}
            body table[class=mcenter] {text-align:center; vertical-align:middle; clear:both!important; float:none; margin: 0px!important;}
            body .h30 {width: 100%!important; height: 30px!important;}
            body .h15 {width: 100%!important; height: 15px!important;}
            body table[class=sponsor] {text-align:center; float:none; width:100%!important;}
            body .w10 {width: 8%!important; height: 10px!important;}
            body .pad20 {padding-left: 20px!important; padding-right: 20px!important;}
            body .h65 {width: 100%; height: 65px!important;}
        }</style>
        
        </head>
        <body style='margin: 0; padding: 0;'>
        
        <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full" bgcolor="#f6f6f6" style="background-color: rgb(246, 246, 246);">
          <tbody><tr>
            <td width="100%" valign="top" align="center">
            
              
              <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="mobile">
                <tbody><tr>
                  <td align="center">
                  
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
                      <tbody><tr>
                        <td width="100%" height="65"></td>
                      </tr>
                    </tbody></table>
                    
                    
                    <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
                      <tbody><tr>
                        <td width="100%" align="center">
                        
                          <!-- Image 250px - 2 -->
                          <table width="250" border="0" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; text-align: center;" class="fullCenter">
                            <tbody><tr>
                              <td width="100%" align="center" class="image250">
                                <a href="#" style="text-decoration: none;">
                                  <img src="images/165931700114952OzM2aJcQ.png" editable="true" width="250" alt="" border="0" class="hover toModifyImage" >
                                </a>
                              </td>
                            </tr>
                          </tbody></table>
                          
                          <table width="1" border="0" cellpadding="0" cellspacing="0" align="left" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="full">
                            <tbody><tr>
                              <td width="100%" height="65" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                            </tr>
                          </tbody></table> 
                          
                          <!-- Text Right -->
                          <table width="310" border="0" cellpadding="0" cellspacing="0" align="right" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" class="fullCenter">
                            <tbody><tr>
                              <td valign="middle" width="100%" style="text-align: left; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 22px; color: #27272b; line-height: 28px; font-weight: 700;" class="fullCenter">
                                Prolegal Case Management System - Account Verification
                              </td>
                            </tr>
                            <tr>
                              <td width="100%" height="25"></td>
                            </tr>
                            <tr>
                              <td valign="middle" width="100%" style="text-align: left; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 14px; color: #828282; line-height: 22px; font-weight: 400;" class="fullCenter">
                                <span style="color: rgb(0, 0, 0);" >Dear ${user_name},</span></p><p><br><span style="color: rgb(0, 0, 0);" >  <p>Your account on the Prolegal Case Management System has been created successfully. To verify your account and set your password, please click on the following link:</p>
                                  <a href="https://prolegal-02d79a24b17b.herokuapp.com/set-password?email=${email}">ACTIVATION LINK</a>
                                  <p>Once you have clicked on the link, you will be prompted to enter a new password for your account. Please choose a strong password that is at least 8 characters long and includes a mix of upper and lowercase letters, numbers, and symbols.</p>
                                  <p>After you have entered your new password, you will be able to log in to your account.</p>
                                  <p>If you have any questions, please do not hesitate to contact us.</p>
                                  <p>Thank you,</p>
                                  <p>Prolegal Case Management Team</p></span>
                              </td>
                            </tr>
                            <tr>
                              <td width="100%" height="35"></td>
                            </tr>
                            <!-- Button Left, Scale Center -->
                            <tr>
                              <td class="buttonScale" width="auto" align="left">
                                
                                <table border="0" cellpadding="0" cellspacing="0" align="left" class="buttonScale">
                                  <tbody><tr>
                                    <td width="auto" align="center" height="37" bgcolor="#27272b" style="border-top-left-radius: 25px; border-top-right-radius: 25px; border-bottom-right-radius: 25px; border-bottom-left-radius: 25px; padding-left: 20px; padding-right: 20px; font-weight: 600; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; color: #ffffff; text-transform: uppercase; background-color: #27272b; font-size: 12px;">
                                      <multiline><a href="http://localhost:8080/compliance-survey?id=${results1.rows[0].id}" style="color: #ffffff; font-size: 12px; text-decoration: none; line-height: 34px; width: 100%;">complete survey</a></multiline>
                                    </td>
                                  </tr>
                                </tbody></table>
                              
                              </td>
                            </tr>
                            <!-- Button Left, Scale Center -->
                          </tbody></table>
                          
                        </td>
                      </tr>
                    </tbody></table>
                    
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full">
                      <tbody><tr>
                        <td width="100%" height="65"></td>
                      </tr>
                    </tbody></table>
                    
                  </td>
                </tr>
              </tbody></table>
            
            </td>
          </tr>
        <!--—EndModule--></tbody></table><table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" class="full" bgcolor="#27272b" style="background-color: rgb(39, 39, 43);">
          <tbody><tr>
            <td width="100%" valign="top" align="center"> 
                
                <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="mobile">
                  <tbody><tr>
                    <td width="100%" align="center">
                      
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" align="left" style="text-align: center;" class="fullCenter">
                      <tbody><tr>
                        <td width="100%" height="25"></td>
                      </tr>
                        <tr>
                          <td width="100%" style="text-align: center; font-family: Helvetica, Arial, sans-serif, 'Open Sans'; font-size: 12px; color: #ffffff; font-weight: 400;" class="fullCenter">
                            © 2023 All rights Reserved - ProLegal Legal Management System | Powered by Soxfort Solutions&nbsp;
                            </td>
                        </tr>
                        <tr>
                        <td width="100%" height="24"></td>
                      </tr>
                      <tr>
                        <td width="100%" height="1" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                      </tbody></table></td>
                  </tr>
                </tbody></table>
                
              </td>
          </tr>
        <!--—EndModule--></tbody></table>`,
      };
      // send mail with defined transport object and mail options
      SENDMAIL(options, (info) => {
        //console.log("Email sent successfully");
        req.flash(
          "success",
          "New User has been created and an email sent to them to activate their account"
        );
        // console.log("MESSAGE ID: ", info.messageId);
        res.redirect("/settings/users");
      });
    }
  );
});
app.post("/delete-department", checkNotAuthenticated, (req, res) => {
  let id = req.query.id;
  pool.query(`DELETE FROM department WHERE id = $1`, [id], (err, results) => {
    if (err) {
      errors.push({ message: err });
    }
    req.flash("success", "You have successfully deleted a Department");
    res.redirect("/settings/departments");
  });
});
app.get("/delete-case-status", checkNotAuthenticated, (req, res) => {
  let id = req.query.id;
  pool.query(`DELETE FROM case_status WHERE id = $1`, [id], (err, results) => {
    if (err) {
      errors.push({ message: err });
    }
    req.flash("success", "You have successfully deleted a Case Status");
    res.redirect("/settings/case-status");
  });
});
app.get("/delete-contract-status", checkNotAuthenticated, (req, res) => {
  let id = req.query.id;
  pool.query(
    `DELETE FROM contract_status WHERE id = $1`,
    [id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      req.flash("success", "You have successfully deleted a Contract Status");
      res.redirect("/settings/case-status");
    }
  );
});
app.get("/users/logout", (req, res) => {
  req.logOut();
  authed = false;
  usrId = "";
  nam = "";
  req.session.destroy();
  req.flash("success", "You logged out");
  res.redirect("/login");
});
app.post("/users/register", async (req, res) => {
  errors = [];
  let { name, email, password, password2 } = req.body;
  console.log({ name, email, password, password2 });

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }
  if (password.length < 6) {
    errors.push({ message: "Password must be at least 6 characters long" });
  }
  if (password != password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    console.log(errors);
    res.render("login", {
      layout: "./layouts/login-layout",
      user_role,
      authed: authed,
      user: req.session.user,
      errors: errors,
    });
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);

    pool.query(
      `SELECT * FROM users
           WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          errors.push({ message: err });
        }
        //console.log(results.rows);
        if (results.rows.length > 0) {
          errors.push({ message: `Email: ${email} is already registered` });
          res.render("login", {
            layout: "./layouts/login-layout",
            user_role,
            authed: authed,
            user: req.session.user,
            errors: errors,
          });
        } else {
          pool.query(
            `INSERT INTO users (name, email, password, role)
                      VALUES ($1, $2, $3, $4)
                      RETURNING id, password`,
            [name, email, hashedPassword, "Admin"],
            (err, results) => {
              if (err) {
                errors.push({ message: err });
              }
              console.log(results.row);
              req.flash("success", "You are now registered. Please log in");
              res.render("login", {
                layout: "./layouts/login-layout",
                user_role,
                authed: authed,
                user: req.session.user,
                errors: errors,
              });
            }
          );
        }
      }
    );
  }
});
app.post(
  "/users/login",
  passport.authenticate("local", {
    //successRedirect: '/',

    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    usrId = req.user.id;
    authed = true;
    req.session.userId = req.user.id;
    req.session.user = req.user.name;
    req.session.email = req.user.email;
    req.session.role = req.user.role;
    req.session.activated = req.user.activated;
    req.session.id = req.user.id;

    res.redirect("/");
  }
);
app.post("/update-compliance-export", async (req, res) => {
  export_compliance_id = req.body.id;
});
app.post("/update-contact-person-count", async (req, res) => {
  contact_person_count = req.body.count;
});
app.post("/reduce-contact-person-count", async (req, res) => {
  contact_person_count -= 1;
});
app.post("/update-line-budget-count", async (req, res) => {
  line_budget_count = req.body.count;
});
app.post("/reduce-line-budget-count", async (req, res) => {
  line_budget_count -= 1;
});

app.post("/update-compliance-question-count", async (req, res) => {
  compliance_count = req.body.count;
});
app.post("/reduce-compliance-question-count", async (req, res) => {
  compliance_count -= 1;
});

app.post("/budget_statement", async (req, res) => {
  console.log(req.body.data);
  let id = req.body.data;
  pool.query(
    "SELECT * FROM budget_items WHERE budget_id = $1",
    [id],
    (err, results) => {
      if (err) {
        errors.push({ message: err });
      }
      budget_statement = results.rows[0].expenditure;
      console.log(budget_statement);
    }
  );
});
app.listen(PORT, console.log(`Server running on port ${PORT}`));
