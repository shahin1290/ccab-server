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
                    <li><span style="font-weight: bold">Name: </span>  ${data.name}</li>
                    <li><span style="font-weight: bold">Email:</span> ${data.email}</li>
                    <li><span style="font-weight: bold">Phone:</span> ${data.phoneNumber}</li>
                    <li><span style="font-weight: bold">Industry:</span> ${data.industry}</li>
                    <li><span style="font-weight: bold">Category:</span> ${data.category}</li>
                    <li><span style="font-weight: bold">Message:</span> ${data.message}</li>
                </ul>  
              <br />
           </body>
   
     </html>
    `
}

module.exports = { contact }