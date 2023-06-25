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
            .text('Nust Case Management System Report', 255, 5, {align: 'right'})
            .fontSize(10)
                
        const beginningOfPage = 5
        const endOfPage = 580

        doc.moveTo(beginningOfPage,80)
        .lineTo(endOfPage,80)
        .stroke()
                
        doc.text(`Contracts Report | ${this.invoice.status} :  From ${moment(this.invoice.start_date).format('Do MMMM, YYYY')} to ${moment(this.invoice.end_date).format('Do MMMM, YYYY')}`, 5, 90,{bold: true})

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
        const fX = 380
        const gX = 440
        const hX = 500
        const iX = 550

        doc
            .fontSize(6)
            .text('Name', aX, tableTop, {bold: true})
            .text('Description', bX, tableTop, {bold: true})
            .text('Start Date', cX, tableTop, {bold: true})
            .text('End Date', dX, tableTop, {bold: true})
            .text('Vendor', eX, tableTop, {bold: true})
            .text('Department', fX, tableTop, {bold: true})
            .text('Payment Cycle', gX, tableTop, {bold: true})
            .text('Payment Type', hX, tableTop, {bold: true})
            .text('Contract Value', iX, tableTop, {bold: true})

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
                .text(moment(item.start_date).format('Do MMMM, YYYY'), cX, y)
                .text(moment(item.end_date).format('Do MMMM, YYYY'), dX, y)
                .text(item.vendor, eX, y,{
                    columns: 1,
                    columnGap: 15,
                    height: 50,
                    width: 65,
                    align: 'justify'
                  })
                .text(item.department, fX, y,{
                    columns: 1,
                    columnGap: 15,
                    height: 50,
                    width: 65,
                    align: 'justify'
                  })
                .text(item.payment_cycle, gX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 30,
                    align: 'justify'
                  })
                .text(item.payment_type, hX, y,{
                    columns: 1,
                    columnGap: 10,
                    height: 50,
                    width: 30,
                    align: 'justify'
                  })
                .text(dollarUS.format(item.contract_value), iX, y)
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