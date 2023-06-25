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
                
        doc.text(`Lawfirm Report `, 20, 90,{bold: true})

        doc.moveTo(beginningOfPage,110)
        .lineTo(endOfPage,110)
        .stroke()

    }

    generateTable(doc) {
        const tableTop = 130
        const aX = 20
        const bX = 50
        const cX = 150
        const dX = 240
        const eX = 360
        const fX = 410
        const gX = 450
        const hX = 550

        doc
            .fontSize(6)
            .text('ID', aX, tableTop, {bold: true})
            .text('Name', bX, tableTop, {bold: true})
            .text('Email', cX, tableTop, {bold: true})
            .text('Address', dX, tableTop, {bold: true})
            .text('Phone Number', eX, tableTop, {bold: true})
            .text('Vat Number', fX, tableTop, {bold: true})
            .text('Website', gX, tableTop, {bold: true})
            .text('Date Added', hX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0

       
        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)
            
            doc
                .fontSize(6)
                .text(item.law_firm_id, aX, y)
                .text(item.name, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(item.email, cX, y)
                .text(item.address, dX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(item.phone_number, eX, y)
                .text(item.vat_number, fX, y)
                .text(item.website, gX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(moment(item.date_created).format('Do MMMM, YYYY'), hX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 50,
                    align: 'justify'
                  })
        }
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(`Lawfirm Report. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        let theOutput = new PDFGenerator 


        const fileName = `LawfirmsReport.pdf`

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