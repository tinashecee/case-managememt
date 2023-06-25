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
            .text('Prolegal Case Management System Report', 275, 5, {align: 'right'})
            .fontSize(10)
                
        const beginningOfPage = 50
        const endOfPage = 550

        doc.moveTo(beginningOfPage,80)
        .lineTo(endOfPage,80)
        .stroke()
                
        doc.text(`Cases Report | ${this.invoice.status} : From ${moment(this.invoice.start_date).format('Do MMMM, YYYY')} to ${moment(this.invoice.end_date).format('Do MMMM, YYYY')}`, 50, 90,{bold: true})

        doc.moveTo(beginningOfPage,110)
        .lineTo(endOfPage,110)
        .stroke()

    }

    generateTable(doc) {
        const tableTop = 130
        const aX = 50
        const bX = 80
        const cX = 180
        const dX = 260
        const eX = 340
        const fX = 420

        doc
            .fontSize(8)
            .text('ID', aX, tableTop, {bold: true})
            .text('Case Name', bX, tableTop, {bold: true})
            .text('Date Started', cX, tableTop, {bold: true})
            .text('Department', dX, tableTop, {bold: true})
            .text('Assigned To', eX, tableTop, {bold: true})
            .text('Deadline', fX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0


        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)

            doc
                .fontSize(8)
                .text(item.case_id, aX, y)
                .text(item.case_name, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(moment(item.start_date).format('Do MMMM, YYYY'), cX, y)
                .text(item.department, dX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 70,
                    align: 'justify'
                  })
                .text(item.staff_members, eX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 50,
                    align: 'justify'
                  })
                .text(moment(item.end_date).format('Do MMMM, YYYY'), fX, y)
        }
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(`Case Report. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        let theOutput = new PDFGenerator 


        const fileName = `CasesReport.pdf`

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