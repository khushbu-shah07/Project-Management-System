export const sendNotifyEmailTemplate = (
    emailSendBy: string,
    userEmail: string,
    notificationType: string,
    taskTitle: string,
    projectName: string,
  ) => {
    return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Management System Notification</title>
      <style>
          body, html {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              line-height: 1.5;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
          }
  
          .header {
              text-align: center;
              margin-bottom: 20px;
          }
  
          .header h1 {
              color: #333;
          }
  
          .content {
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 5px;
          }
  
          .footer {
              text-align: center;
              margin-top: 20px;
          }
  
          .footer p {
              font-size: 12px;
              color: #888;
          }
      </style>
  </head>
  
  <body>
      <div class="container">
          <div class="header">
              <h1>Project Management System</h1>
          </div>
          <div class="content">
              <h2>Notification about ${notificationType}</h2>
              <p>Hello ${userEmail},</p>
              <p>This is to inform you that ${notificationType}  </p>
              <p>Details:</p>
              <ul>
                  <li>Status change by :${emailSendBy}</li>
                  <li>Project: ${projectName} </li>
                  <li>Task Title: ${taskTitle} </li>
              </ul>
              <p>For more details, please log in to the system.</p>
          </div>
          <div class="footer">
              <p>This is an automated email, please do not reply.</p>
          </div>
      </div>
  </body>
  
  </html>`;
  };
  