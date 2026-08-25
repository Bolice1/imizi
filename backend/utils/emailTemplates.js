const welcomeEmailTemplate = (fullName, loginUrl) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome to Imizi</title>
    <style type="text/css">
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5EFE6; }
      table { border-collapse: collapse; }
      a { color: #8B5E3C; }

      .email-wrapper {
        background-color: #F5EFE6;
        padding: 30px 10px;
      }
      .email-container {
        width: 50%;
        margin: 0 auto;
        background-color: #FFFDFA;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #EDE3D3;
      }
      .header {
        background-color: #4A3428;
        padding: 26px 22px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #FFFFFF;
      }
      .content {
        padding: 24px 22px;
        color: #3A2E22;
        line-height: 1.55;
        font-size: 14px;
      }
      .btn {
        display: inline-block;
        margin: 20px 0 4px;
        padding: 12px 26px;
        background-color: #4A3428;
        color: #FFFFFF !important;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        text-decoration: none !important;
      }
      .link-fallback {
        margin-top: 16px;
        font-size: 12px;
        color: #A6987F;
        word-break: break-all;
      }
      .notice {
        margin-top: 20px;
        font-size: 12px;
        color: #A6987F;
      }
      .footer {
        padding: 18px 22px;
        text-align: center;
        font-size: 11px;
        color: #A6987F;
        border-top: 1px solid #EDE3D3;
      }
    </style>
  </head>
  <body>

    <div class="email-wrapper">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <div class="email-container">

              <div class="header">
                <h1>Welcome to Imizi</h1>
              </div>

              <div class="content">
                <p>Hi ${fullName},</p>

                <p>Welcome to Imizi — the home for your family's photos, stories, and memories, all in one place.</p>

                <p>Get started by adding your first memory or inviting a family member.</p>

                <center>
                  <a href="${loginUrl}" class="btn">Go to Your Family Home</a>
                </center>

                <p class="link-fallback">If the button doesn't work, copy and paste this link into your browser:<br>${loginUrl}</p>

                <p class="notice">If you didn't create an Imizi account, you can safely ignore this email.</p>
              </div>

              <div class="footer">
                &copy; ${new Date().getFullYear()} Imizi
              </div>

            </div>
          </td>
        </tr>
      </table>
    </div>

  </body>
  </html>
  `;
};



const resetPasswordEmailTemplate = (fullName, resetUrl) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Your Password</title>
    <style type="text/css">
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5EFE6; }
      table { border-collapse: collapse; }
      a { color: #8B5E3C; }

      .email-wrapper {
        background-color: #F5EFE6;
        padding: 30px 10px;
      }
      .email-container {
        width: 50%;
        margin: 0 auto;
        background-color: #FFFDFA;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #EDE3D3;
      }
      .header {
        background-color: #4A3428;
        padding: 26px 22px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #FFFFFF;
      }
      .content {
        padding: 24px 22px;
        color: #3A2E22;
        line-height: 1.55;
        font-size: 14px;
      }
      .btn {
        display: inline-block;
        margin: 20px 0 4px;
        padding: 12px 26px;
        background-color: #4A3428;
        color: #FFFFFF !important;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        text-decoration: none !important;
      }
      .link-fallback {
        margin-top: 16px;
        font-size: 12px;
        color: #A6987F;
        word-break: break-all;
      }
      .notice {
        margin-top: 20px;
        font-size: 12px;
        color: #A6987F;
      }
      .footer {
        padding: 18px 22px;
        text-align: center;
        font-size: 11px;
        color: #A6987F;
        border-top: 1px solid #EDE3D3;
      }
    </style>
  </head>
  <body>

    <div class="email-wrapper">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <div class="email-container">

              <div class="header">
                <h1>Reset Your Password</h1>
              </div>

              <div class="content">
                <p>Hi ${fullName},</p>

                <p>We received a request to reset the password for your Imizi account. Click the button below to choose a new password.</p>

                <center>
                  <a href="${resetUrl}" class="btn">Reset Password</a>
                </center>

                <p class="link-fallback">If the button doesn't work, copy and paste this link into your browser:<br>${resetUrl}</p>

                <p class="notice">This link will expire in 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
              </div>

              <div class="footer">
                &copy; ${new Date().getFullYear()} Imizi
              </div>

            </div>
          </td>
        </tr>
      </table>
    </div>

  </body>
  </html>
  `;
};

export default {
    welcomeEmailTemplate,
    resetPasswordEmailTemplate
}