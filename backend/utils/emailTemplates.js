const welcomeEmailTemplate = (fullName,email)=>{
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Imizi!</title>
  <style type="text/css">
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5EFE6; }
    table { border-collapse: collapse; }
    a { color: #8B5E3C; }

    .email-wrapper {
      background-color: #F5EFE6;
      padding: 30px 10px;
    }
    .email-container {
      width:50%;
      margin: 0 auto;
      background-color: #FFFDFA;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #EDE3D3;
    }
    .header {
      background-color: #4A3428;
      padding: 32px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #FFFFFF;
    }
    .content {
      padding: 36px;
      color: #3A2E22;
      line-height: 1.6;
      font-size: 16px;
    }
    .btn {
      display: inline-block;
      margin: 24px 0 4px;
      padding: 14px 32px;
      background-color: #4A3428;
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none !important;
    }
    .footer {
      padding: 24px 36px;
      text-align: center;
      font-size: 12px;
      color: #A6987F;
      border-top: 1px solid #EDE3D3;
    }
  </style>
</head>
<body>

  <div class="email-wrapper">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" class="email-container">

          <div class="header">
            <h1>Welcome to Imizi</h1>
          </div>

          <div class="content">
            <p>Hi ${fullName},</p>

            <p>Welcome to Imizi — the home for your family's photos, stories, and memories, all in one place.</p>

            <p>Get started by adding your first memory or inviting a family member.</p>

            <center>
              <a href="#" class="btn">Go to Your Family Home</a>
            </center>

            <p style="margin-top: 28px;">Warmly,<br>The Imizi Team</p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Imizi
          </div>

        </td>
      </tr>
    </table>
  </div>

</body>
</html>

          `
}

export default {
    welcomeEmailTemplate
}