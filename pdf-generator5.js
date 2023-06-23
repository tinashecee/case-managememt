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
        const endOfPage = 570

        doc.moveTo(beginningOfPage,200)
            .lineTo(endOfPage,200)
            .stroke()
                
        doc.text(`Compliance Questions Report `, 50, 210,{bold: true})

        doc.moveTo(beginningOfPage,250)
            .lineTo(endOfPage,250)
            .stroke()

    }

    generateTable(doc) {
        const tableTop = 270
        const aX = 50
        const bX = 350

        doc
            .fontSize(7)
            .text('Question', aX, tableTop, {bold: true})
            .text('Answer', bX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0

       
        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)
            
            doc
                .fontSize(7)
                .text(item.title, aX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 290,
                    align: 'left'
                  })
                .text(item.response, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 200,
                    align: 'left'
                  })
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


        const fileName = `ComplianceReport.pdf`

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