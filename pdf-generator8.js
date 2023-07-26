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
                
        doc.text(`My Timesheets Report :  from ${moment(this.invoice.start_date).format('Do MMMM, YYYY')} to ${moment(this.invoice.end_date).format('Do MMMM, YYYY')}`, 20, 90,{bold: true})

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
        const fX = 460
        const gX = 530

        doc
            .fontSize(7)
            .text('Owner', aX, tableTop, {bold: true})
            .text('Task Name', bX, tableTop, {bold: true})
            .text('Task Description', cX, tableTop, {bold: true})
            .text('Case', dX, tableTop, {bold: true})
            .text('Contract', eX, tableTop, {bold: true})
            .text('Start Date', fX, tableTop, {bold: true})
            .text('End Date', gX, tableTop, {bold: true})

        const items = this.invoice.items
        let i = 0

       
        for (i = 0; i < items.length; i++) {
            const item = items[i]
            const y = tableTop + 25 + (i * 25)
            
            doc
                .fontSize(7)
                .text(item.timesheet_owner, aX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 100,
                    align: 'left'
                  })
                .text(item.task_name, bX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 100,
                    align: 'left'
                  })
                  .text(item.task_description, cX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 100,
                    align: 'left'
                  })
                .text(item.case_name, dX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 70,
                    align: 'left'
                  })
                  .text(item.contract_name, eX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 80,
                    align: 'left'
                  })
                .text(moment(item.start_date).format('Do MMMM, YYYY'), fX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 50,
                    align: 'left'
                  })
                  .text(moment(item.end_date).format('Do MMMM, YYYY'), gX, y,{
                    columns: 1,
                    columnGap: 10,
                    rowGap:10,
                    height: 200,
                    width: 50,
                    align: 'left'
                  })
        }
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(` My Timesheets Report. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        let theOutput = new PDFGenerator 


        const fileName = `MyTimesheetsReport.pdf`

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