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
                
        const beginningOfPage = 5
        const endOfPage = 580

        doc.moveTo(beginningOfPage,80)
        .lineTo(endOfPage,80)
        .stroke()
                
        doc.text(`Contracts Report | ${this.invoice.status} :  From End Date ${moment(this.invoice.end_date).format('Do MMMM, YYYY')}`, 5, 90,{bold: true})

        doc.moveTo(beginningOfPage,110)
        .lineTo(endOfPage,110)
        .stroke()

    }

    generateTable(doc) {
        const tableTop = 130
        const aX = 5
        const bX = 70
        const cX = 170
        const dX = 230
        const eX = 300
        const fX = 370
        const gX = 430
        const hX = 500

        doc
            .fontSize(6)
            .text('Name', aX, tableTop, {bold: true})
            .text('Description', bX, tableTop, {bold: true})
            .text('End Date', cX, tableTop, {bold: true})
            .text('Vendor', dX, tableTop, {bold: true})
            .text('Department', eX, tableTop, {bold: true})
            .text('Payment Cycle', fX, tableTop, {bold: true})
            .text('Payment Type', gX, tableTop, {bold: true})
            .text('Contract Value', hX, tableTop, {bold: true})

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
                .fontSize(6)
                .text(item.name, aX, y,{
                    columns: 1,
                    columnGap: 15,
                    height: 50,
                    width: 50,
                    align: 'justify'
                  })
                .text(item.notes, bX, y,{
                    columns: 1,
                    columnGap: 15,
                    height: 50,
                    width: 85,
                    align: 'justify'
                  })
                .text(moment(item.end_date).format('Do MMMM, YYYY'), cX, y)
                .text(item.vendor, dX, y,{
                    columns: 1,
                    columnGap: 15,
                    height: 50,
                    width: 65,
                    align: 'justify'
                  })
                .text(item.department, eX, y,{
                    columns: 1,
                    columnGap: 15,
                    height: 50,
                    width: 75,
                    align: 'justify'
                  })
                .text(item.payment_cycle, fX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 50,
                    align: 'justify'
                  })
                .text(item.payment_type, gX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 70,
                    align: 'justify'
                  })
                .text(dollarUS.format(item.contract_value), hX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 70,
                    align: 'justify'
                  })
        }
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(`Contract Report. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        let theOutput = new PDFGenerator 


        const fileName = `ContractsReport.pdf`

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