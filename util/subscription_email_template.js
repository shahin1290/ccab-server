const subscriptionEmailTemplate = (user, invoice, subscription) => {
  //functions next payment due

  const nextPaymentAttempt = () => {
    const date2 = new Date(invoice.next_payment_attempt * 1000).toString()

    return (
      new Date(date2).getMonth() +
      1 +
      '/' +
      new Date(date2).getDate() +
      '/' +
      new Date(date2).getFullYear()
    )
  }

  const invoiceCreated = () => {
    const date1 = new Date(subscription.created * 1000).toString()

    return (
      new Date(date1).getMonth() +
      1 +
      '/' +
      new Date(date1).getDate() +
      '/' +
      new Date(date1).getFullYear()
    )
  }

  return `
  <!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <title>
  
      </title>
      <!--[if !mso]><!-- -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
          #outlook a {
              padding: 0;
          }
  
          .ReadMsgBody {
              width: 100%;
          }
  
          .ExternalClass {
              width: 100%;
          }
  
          .ExternalClass * {
              line-height: 100%;
          }
  
          body {
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
          }
  
          table,
          td {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
          }
  
          img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
          }
  
          p {
              display: block;
              margin: 13px 0;
          }
      </style>
      <!--[if !mso]><!-->
      <style type="text/css">
          @media only screen and (max-width:480px) {
              @-ms-viewport {
                  width: 320px;
              }
              @viewport {
                  width: 320px;
              }
          }
      </style>
      <!--<![endif]-->
      <!--[if mso]>
          <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
      <!--[if lte mso 11]>
          <style type="text/css">
            .outlook-group-fix { width:100% !important; }
          </style>
          <![endif]-->
  
  
      <style type="text/css">
          @media only screen and (min-width:480px) {
              .mj-column-per-100 {
                  width: 100% !important;
              }
          }
      </style>
  
  
      <style type="text/css">
      </style>
  
  </head>
  
  <body style="background-color:#f9f9f9;">
  
  
      <div style="background-color:#f9f9f9;">
  
  
          <!--[if mso | IE]>
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
  
  
          <div style="background:#f9f9f9;background-color:#f9f9f9;Margin:0px auto;max-width:600px;">
  
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#f9f9f9;background-color:#f9f9f9;width:100%;">
                  <tbody>
                      <tr>
                          <td style="border-bottom:#333957 solid 5px;direction:ltr;font-size:0px;padding:20px 0;text-align:center;vertical-align:top;">
                              <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
          </tr>
        
                    </table>
                  <![endif]-->
                          </td>
                      </tr>
                  </tbody>
              </table>
  
          </div>
  
  
          <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
  
  
          <div style="background:#fff;background-color:#fff;Margin:0px auto;max-width:600px;">
  
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff;background-color:#fff;width:100%;">
                  <tbody>
                      <tr>
                          <td style="border:#dddddd solid 1px;border-top:0px;direction:ltr;font-size:0px;padding:20px 0;text-align:center;vertical-align:top;">
                              <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
              <td
                 style="vertical-align:bottom;width:600px;"
              >
            <![endif]-->
  
                              <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:bottom;width:100%;  ">
  
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:bottom; " width="100%">
  
                                      <tr style="background: #6566DA;">
                                          <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
  
                                              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px; ">
                                                  <tbody>
                                                      <tr>
                                                          <td style="width:64px;">
  
                                                              <img height="auto" src="https://res.cloudinary.com/dq2nawkx9/image/upload/v1624349506/whiteLogo_j0yxbv.jpg" style="border:0;display:block;outline:none;text-decoration:none;width:100%;" width="64" />
  
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
  
                                          </td>
                                      </tr>
  
                                      <tr style="background: #6566DA;">
                                          <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:40px;word-break:break-word;">
  
                                              <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:bold;line-height:1;text-align:center;color:#fff; ">
                                                  Coding for better life
                                              </div>
  
                                          </td>
                                      </tr>
  
      
  
                                      <tr>
                                          <td align="center" style="font-size:0px;padding:10px 25px;padding-top:30px;padding-bottom:50px;word-break:break-word;">
  
                                             
                                            
                                             <table width="100%" border="0" cellpadding="0" cellspacing="0"
        style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif;">
        <tr>
            <td>
                <!-- // START CONTAINER -->
                <table class="container" width="600px" align="center" border="0" cellpadding="0" cellspacing="0"
                    style="background-color: #ffffff;">
                    <tr>
                        <td>
                            <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
                                style="background-color: #ffffff;">
                                <tr>
                                   
                                    <td align="left">
                                        <p style="font-size: 32px; color: #888888;">Subscription</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0"
                                style="background-color: #fafafa;">
                                <tr>
                                    <td>
                                        <table class="invoice-left" width="50%" align="left" border="0" cellpadding="0"
                                            cellspacing="0" style="padding-top: 10px; padding-left: 20px;">
                                           
                                            <tr>
                                                <td style="border: 1px #ffffff solid">
                                                    <p
                                                        style="margin-bottom: 0; font-size: 10px; text-transform: uppercase; color: #666666;">
                                                        Purchase
                                                        DATE</p>
                                                    <p style="margin-top: 0; font-size: 12px;">${invoiceCreated()}</p>
                                                </td>
                                                <td align="center" style="border: 1px #ffffff solid">
                                                    <p
                                                        style="margin-bottom: 0; font-size: 10px; text-transform: uppercase; color: #666666;">
                                                        CUSTOMER NAME</p>
                                                    <p style="margin-top: 0; font-size: 12px;">${user.name}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <p
                                                        style="margin-bottom: 0; font-size: 10px; text-transform: uppercase; color: #666666;">
                                                        CUSTOMER ID</p>
                                                    <p style="margin-top: 0; font-size: 12px;">${
                                                      invoice.customer
                                                    }</p>
                                                </td>
                                                <td align="center">
                                                    <p
                                                        style="margin-bottom: 0; font-size: 10px; text-transform: uppercase; color: #666666;">
                                                        SUBSCRIPTION ID</p>
                                                    <p style="margin-top: 0; font-size: 12px;">${
                                                      invoice.subscription
                                                    }</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <table class="invoice-right" width="50%" align="right" border="0"
                                            cellpadding="0" cellspacing="0" style="padding-left: 20px;">
                                           
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 30px;">
                            <table class="apple-services" border="0" cellpadding="0" cellspacing="0">
                                <p style="padding: 7px; font-size: 14px; font-weight: 500; background-color: #fafafa;">
                                    PURCHASED COURSE
                                </p>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="padding: 0 0 15px;">
                                <tr>
                                    <td>
                                        <table align="left" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <img src="https://i.postimg.cc/cLrds0x6/image-3.png" alt="iTunes">
                                                </td>
                                                <td align="left" style="padding-left: 20px;">
                                                    <p
                                                        style="margin: 0; font-size: 12px; font-weight: 600; color: #333333;">
                                                        Codify Course
                                                        Subscription
                                                    </p>
                                                    <p style="margin: 0; font-size: 12px; color: #666666;">${
                                                      subscription.plan.interval
                                                    } Plan</p>
                                                    <p style="margin: 0; font-size: 12px; color: #666666;">Renews ${nextPaymentAttempt()}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <table align="right" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="right">
                                                    <p style="margin: 10px; font-size: 12px; font-weight: 600;">${
                                                      invoice.total / 100
                                                    } ${subscription.plan.currency}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    
                
             
                    <tr>
                        <td>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="padding-top: 5px;">
                              

                      
                </table>
            </td>
        </tr>
    </table>
    <!-- END CONTAINER \\ -->

    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%; margin-top: 40px;">
    <tr>
        <td align="center" bgcolor="#2F67F6" role="presentation" style="border:none;border-radius:3px;color:#ffffff;cursor:auto;padding:15px 25px;" valign="middle">
            <a href="https://ccab.tech/profile" style="background:#2F67F6;color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:normal;line-height:120%;Margin:0;text-decoration:none;text-transform:none;">
                Go to your Profile
            </a>
        </td>
    </tr>
</table>
    </td>
    </tr>
    </table>
  
                                          </td>
                                      </tr>
  
                                      <tr>
                                          <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
  
                                              <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:20px;text-align:left;color:#525252;">
                                              <hr><a href="mailto:info@codifycollege.se" target="_blank" style="text-decoration:none">info@codifycollege.se</a><br><br></p><p>Tel: <a href="tel:+46723338723" style="text-decoration:none">+46 723338723</a></p><p>Visit us at: <a href="https://ccab.tech/">ccab.tech</a></p><p><a href="https://www.linkedin.com/company/codify-college/">LinkedIn</a> ,<a href="https://www.facebook.com/codifyCollege">Facebook</a> ,<a href="https://www.youtube.com/channel/UCXi6GEt0yD0ZXmlrnHgKfPA/featured">YouTube</a> ,<a href="https://www.instagram.com/codify.college/">Instagram</a></p><p >Cheers,<br>Codify College AB</p></div>

                                              </div>
  
                                          </td>
                                      </tr>
  
                                  </table>
  
                              </div>
  
                              <!--[if mso | IE]>
              </td>
            
          </tr>
        
                    </table>
                  <![endif]-->
                          </td>
                      </tr>
                  </tbody>
              </table>
  
          </div>
  
  
          <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        
        <table
           align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"
        >
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
  
  
          <div style="Margin:0px auto;max-width:600px;">
  
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                      <tr>
                          <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;vertical-align:top;">
                              <!--[if mso | IE]>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  
          <tr>
        
              <td
                 style="vertical-align:bottom;width:600px;"
              >
            <![endif]-->
  
                              <div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:bottom;width:100%;">
  
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                      <tbody>
                                          <tr>
                                              <td style="vertical-align:bottom;padding:0;">
  
                                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
  
                                                      <tr>
                                                          <td align="center" style="font-size:0px;padding:0;word-break:break-word;">
  
                                                              <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:300;line-height:1;text-align:center;color:#575757;">
                                                              Röntgenvägen 1 141 52, Huddinge, Stockholm, Sweden
                                                              </div>
  
                                                          </td>
                                                      </tr>
  
  
                                                  </table>
  
                                              </td>
                                          </tr>
                                      </tbody>
                                  </table>
                                
                                
  
                              </div>
  
                              <!--[if mso | IE]>
              </td>
            
          </tr>
        
                    </table>
                  <![endif]-->
                          </td>
                      </tr>
                  </tbody>
              </table>
  
          </div>
  
  
          <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        <![endif]-->
  
  
      </div>
  
  </body>
  
  </html>
    `
}

module.exports = { subscriptionEmailTemplate }
