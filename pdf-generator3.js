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
                
        const beginningOfPage = 50
        const endOfPage = 550

        doc.moveTo(beginningOfPage,80)
        .lineTo(endOfPage,80)
        .stroke()
                
        doc.text(`Budget Line Item Report `, 50, 90,{bold: true})

        doc.moveTo(beginningOfPage,110)
        .lineTo(endOfPage,110)
        .stroke()

    }

    generateTable(doc) {
        const tableTop = 130
        const aX = 50
        const bX = 80
        const cX = 180
        const dX = 280
        const eX = 380
        const fX = 480

        doc
            .fontSize(10)
            .text('ID', aX, tableTop, {bold: true})
            .text('Item Name', bX, tableTop, {bold: true})
            .text('Budget', cX, tableTop, {bold: true})
            .text('Actual', dX, tableTop, {bold: true})
            .text('Variance', eX, tableTop, {bold: true})
            .text('Expenditure', fX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0

        let dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD", 
        });
       
        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)
            let count = 0
            if(item.expenditure.length > 0){
                item.expenditure.forEach(element => {
                    count += parseFloat(element.expenditure)
                });
            }
            doc
                .fontSize(10)
                .text(item.budget_id, aX, y)
                .text(item.budget_name, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(dollarUS.format(item.budget), cX, y)
                .text(dollarUS.format(item.actual), dX, y)
                .text(dollarUS.format(item.variance), eX, y)
                .text(dollarUS.format(count), fX, y)
        }
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(`Budget Line Item Report. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        let theOutput = new PDFGenerator 


        const fileName = `BudgetItemsReport.pdf`

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