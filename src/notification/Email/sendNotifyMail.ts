import { mailSender } from 'utils/mailSender';
import { sendNotifyEmailTemplate } from './sendNotifyEmailTemplate';

async function sendNotifyEmail(
  emailSendBy: string,
  userEmail: string,
  notificationType: string,
  taskTitle: string,
  projectName: string,
) {
  try {
    const emailBody = sendNotifyEmailTemplate(
      emailSendBy,
      userEmail,
      notificationType,
      taskTitle,
      projectName,
    );
    const mailResponse = await mailSender(
      userEmail,
      'Notification mail',
      emailBody,
    );
    console.log('Email sent successfully', mailResponse);
    return 'success';
  } catch (err) {
    console.log('Error occurred while sending email:', err);
    return 'failure';
  }
}

export default sendNotifyEmail;
