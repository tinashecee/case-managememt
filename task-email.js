const SENDMAIL = require("./mailer.js");

const SENDTASKEMAIL = async (email, a, b, c, d, e, f) => {
  const message = "New Task Assignment";
  const options = {
    from: "Prolegal <mochonam19@gmail.com>", // sender address
    to: email, // receiver email
    subject:
      "A new task has been assigned to you by " + e + " with priority: " + f, // Subject line
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
                                                      <span style="color: rgb(0, 0, 0);" >Dear ${a},</span></p><p><br><span style="color: rgb(0, 0, 0);" > <p>A new task has been assigned to you in the ProLegal Case Management System. Please review the details below:</p>
                                                      <ul>
                                                          <li><strong>Task:</strong> ${b}</li>
                                                          <li><strong>Description:</strong> ${c}</li>
                                                          <li><strong>Due Date:</strong> ${d}</li>
                                                          <li><strong>Assigned By:</strong> ${e}</li>
                                                      </ul>
                                                      <p>Please log in to the system to access the task and view any associated files or instructions. Promptly complete the task within the specified deadline to ensure smooth case progress and effective collaboration.</p>
                                                      <p>If you have any questions, feel free to reach out to the assigner or our support team.</p>
                                                      <p>Thank you,</p>
                                                      <p>Prolegal Team<br></span>
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
  SENDMAIL(options, (info) => {});
};

module.exports = SENDTASKEMAIL;
