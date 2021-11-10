const contact = (data) => {
  return `
    <!DOCTYPE html>
   <html style="margin: 0; padding: 0;">
   
       <head>
           <title>Craft Academy</title>
       </head>
   
           <body style="margin: 0; padding: 0;">
              <br />
                <p>You have new contact requests</p>
                <h3>Contact Details </h3>
                <ul>
                    <li><span style="font-weight: bold">Name: </span>  ${data.Name}</li>
                    <li><span style="font-weight: bold">Email:</span> ${data.Email}</li>
                    <li><span style="font-weight: bold">Phone:</span> ${data.Phone}</li>
                    <li><span style="font-weight: bold">Industry:</span> ${data.industry||'no data'}</li>
                    <li><span style="font-weight: bold">Category:</span> ${data.category ||'no data' }</li>
                    <li><span style="font-weight: bold">Message:</span> ${data.Message}</li>
                </ul>  
              <br />
           </body>
   
     </html>
    `
}

module.exports = { contact }