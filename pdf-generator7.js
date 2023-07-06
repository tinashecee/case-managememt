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
            .text('Prolegal Case Management System Report : '+moment(this.invoice.date_created).format('Do MMMM, YYYY'), 255, 5, {align: 'right'})
            .fontSize(10)
                
        const beginningOfPage = 20
        const endOfPage = 570

        doc.moveTo(beginningOfPage,80)
            .lineTo(endOfPage,80)
            .stroke()
                
        doc.text(`Vendors Report `, 20, 90,{bold: true})

        doc.moveTo(beginningOfPage,110)
            .lineTo(endOfPage,110)
            .stroke()

    }

    generateTable(doc) {
        const tableTop = 130
        const aX = 20
        const bX = 60
        const cX = 120
        const dX = 220
        const eX = 300
        const fX = 380
        const gX = 480

        doc
            .fontSize(6)
            .text('ID', aX, tableTop, {bold: true})
            .text('Name', bX, tableTop, {bold: true})
            .text('Address', cX, tableTop, {bold: true})
            .text('Phone', dX, tableTop, {bold: true})
            .text('Contact', eX, tableTop, {bold: true})
            .text('Email', fX, tableTop, {bold: true})
            .text('VAT Number', gX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0

       
        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)
            
            doc
                .fontSize(6)
                .text(item.vendor_id, aX, y)
                .text(item.company_name, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(item.physical_address, cX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(item.phone_number, dX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 70,
                    align: 'justify'
                  })
                .text(item.contact_person, eX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 70,
                    align: 'justify'
                  })
                .text(item.email, fX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 90,
                    align: 'justify'
                  })
                .text(item.vat_number, gX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 60,
                    align: 'justify'
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


        const fileName = `VendorsReport.pdf`

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