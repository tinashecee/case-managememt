const PDFGenerator = require('pdfkit')
const fs = require('fs')
const moment = require("moment");
class InvoiceGenerator {
    constructor(invoice) {
        this.invoice = invoice
    }
    
    generateHeaders(doc) {

        doc
            .image('./public/img/logo.png', 50, 5, { width: 45})
            .fillColor('#000')
            .fontSize(20)
            .text('Prolegal Case Management System Report', 255, 5, {align: 'right'})
            .fontSize(10)
                
        const beginningOfPage = 20
        const endOfPage = 570

        doc.moveTo(beginningOfPage,80)
            .lineTo(endOfPage,80)
            .stroke()
                
        doc.text(`Compliance Survey Report `, 20, 90,{bold: true})

        doc.moveTo(beginningOfPage,110)
            .lineTo(endOfPage,110)
            .stroke()

    }

    generateTable(doc) {
        const tableTop = 130
        const aX = 20
        const bX = 120
        const cX = 220
        const dX = 320
        const eX = 400

        doc
            .fontSize(6)
            .text('Department', aX, tableTop, {bold: true})
            .text('Contact Person', bX, tableTop, {bold: true})
            .text('Contact Email', cX, tableTop, {bold: true})
            .text('Score', dX, tableTop, {bold: true})
            .text('Date Completed', eX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0

       
        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)
            
            doc
                .fontSize(6)
                .text(item.department, aX, y)
                .text(item.contact_person, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(item.contact_email, cX, y)
                .text(item.score, dX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 80,
                    align: 'justify'
                  })
                .text(moment(item.date_completed).format('Do MMMM, YYYY'), eX, y)
        }
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(` Report. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        let theOutput = new PDFGenerator 


        const fileName = `ComplianceSurveyReport.pdf`

        // pipe to a writable stream which would save the result into the same directory
        theOutput.pipe(fs.createWriteStream(fileName))

        this.generateHeaders(theOutput)

        theOutput.moveDown()

        this.generateTable(theOutput)

        //this.generateFooter(theOutput)
        

        // write out file
        theOutput.end()
       

    }
}

module.exports = InvoiceGenerator