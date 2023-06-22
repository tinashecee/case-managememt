const PDFGenerator = require('pdfkit')
const fs = require('fs')
const moment = require("moment");
class InvoiceGenerator {
    constructor(invoice) {
        this.invoice = invoice
    }
    
    generateHeaders(doc) {

        doc
            .image('./public/img/logo.png', 50, 0, { width: 150})
            .fillColor('#000')
            .fontSize(20)
            .text('Nust Case Management System Report', 255, 50, {align: 'right'})
            .fontSize(10)
                
        const beginningOfPage = 50
        const endOfPage = 550

        doc.moveTo(beginningOfPage,200)
            .lineTo(endOfPage,200)
            .stroke()
                
        doc.text(`Budget Expenditure Report :  from ${moment(this.invoice.expenditure_date).format('Do MMMM, YYYY')}`, 50, 210,{bold: true})

        doc.moveTo(beginningOfPage,250)
            .lineTo(endOfPage,250)
            .stroke()

    }

    generateTable(doc) {
        const tableTop = 270
        const aX = 50
        const bX = 150
        const cX = 350
        const dX = 450

        doc
            .fontSize(10)
            .text('Expenditure Date', aX, tableTop, {bold: true})
            .text('Expenditure Description', bX, tableTop, {bold: true})
            .text('Expenditure', cX, tableTop, {bold: true})
            .text('Balance', dX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0

        let dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD", 
        });
        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)

            doc
                .fontSize(10)
                .text(moment(item.expenditure_date).format('Do MMMM, YYYY'), aX, y)
                .text(item.expenditure_desc, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 185,
                    align: 'justify'
                  })
                .text(dollarUS.format(item.expenditure), cX, y)
                .text(dollarUS.format(item.balance), dX, y)
        }
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(`Budget Expenditure Report. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        let theOutput = new PDFGenerator 


        const fileName = `BudgetExpenditureReport.pdf`

        // pipe to a writable stream which would save the result into the same directory
        theOutput.pipe(fs.createWriteStream(fileName))

        this.generateHeaders(theOutput)

        theOutput.moveDown()

        this.generateTable(theOutput)

        this.generateFooter(theOutput)
        

        // write out file
        theOutput.end()
       

    }
}

module.exports = InvoiceGenerator