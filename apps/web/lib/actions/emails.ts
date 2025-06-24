"use server";

import { createTransport } from "nodemailer";

const BASE_URL = process.env.BASE_URL;

const transport = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT as string),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
});

export async function sendTeamInviteEmail({ email, teamName, inviteId }: { email: string, teamName: string, inviteId: string }) {
  const url = `${BASE_URL}/teaminvite/${inviteId}`;
  const result = await transport.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Invitation to join team ${teamName}`,
    text: `You have been invited to join team ${teamName} on Cookieless.\nAccept the invitation: ${url}\n\n`,
    html: teamInviteEmailHtml(url, teamName)
  });
  return await result;
}

export async function sendResetPasswordEmail({ email, url }: { email: string, url: string }) {
  const result = await transport.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Reset your password`,
    text: `Click the link to reset your password: ${url}`,
    html: resetPasswordEmailHtml(url)
  });
  return await result;
}

const COLOR = {
  background: "#f9f9f9",
  text: "#444",
  textDark: "#fff",
  mainBackground: "#fff",
  mainBackgroundDark: "#000",
  buttonBackground: "#dbac5c",
  buttonBorder: "#dbac5c",
  buttonText: "#fff"
};

const LOGO = `${BASE_URL}/cookielogo.png`;

const teamInviteEmailHtml = (url: string, className: string): string => {
  return `
    <html lang="en" style="COLOR-scheme: light dark;">
      <body style="background: light-dark(${COLOR.mainBackground}, ${COLOR.mainBackgroundDark}); COLOR-scheme: light dark;">
        <table width="100%" border="0" cellspacing="20" cellpadding="0"
          style="background: light-dark(${COLOR.mainBackground}, ${COLOR.mainBackgroundDark}); COLOR-scheme: light dark; max-width: 600px; margin: auto; border-radius: 10px;">
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 22px;">
              <img src=${LOGO} width="55" height="55" alt="Financedu LOGO">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; COLOR: light-dark(${COLOR.text}, ${COLOR.textDark});">
              You have been invited to join the class <strong>${className}</strong> as a teacher.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; COLOR: light-dark(${COLOR.text}, ${COLOR.textDark})">
              Accept the invitation by clicking the button below.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 5px;" bgCOLOR="${COLOR.buttonBackground}">
                    <a href="${url}" target="_blank"
                      style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; COLOR: ${COLOR.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${COLOR.buttonBorder}; display: inline-block; font-weight: bold;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; COLOR: light-dark(${COLOR.text}, ${COLOR.textDark})">
              Don't recognize this request? Please ignore this email.
            </td>
          </tr>
        </table>
      </body>
    </html>
    `
};

const resetPasswordEmailHtml = (url: string): string => {
  return `
    <html lang="en" style="COLOR-scheme: light dark;">
      <body style="background: light-dark(${COLOR.mainBackground}, ${COLOR.mainBackgroundDark}); COLOR-scheme: light dark;">
        <table width="100%" border="0" cellspacing="20" cellpadding="0"
          style="background: light-dark(${COLOR.mainBackground}, ${COLOR.mainBackgroundDark}); COLOR-scheme: light dark; max-width: 600px; margin: auto; border-radius: 10px;">
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 22px;">
              <img src=${LOGO} width="55" height="55" alt="Financedu LOGO">       
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; COLOR: light-dark(${COLOR.text}, ${COLOR.textDark});">
              You have requested to reset your password.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; COLOR: light-dark(${COLOR.text}, ${COLOR.textDark})">
              Click the button below to reset your password.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr> 
                  <td align="center" style="border-radius: 5px;" bgCOLOR="${COLOR.buttonBackground}">
                    <a href="${url}" target="_blank"
                      style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; COLOR: ${COLOR.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${COLOR.buttonBorder}; display: inline-block; font-weight: bold;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>  
            <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; COLOR: light-dark(${COLOR.text}, ${COLOR.textDark})">
              Don't recognize this request? Please ignore this email.
            </td>
          </tr>
        </table>
      </body>
    </html>
    `
};