// import africastalking from 'africastalking'

// const africastalkingClient = africastalking({
//   apiKey: process.env.AT_API_KEY,
//   username: process.env.AT_USERNAME,
// });

// const sms = africastalkingClient.SMS;

// export const sendSMS = async (to, message) => {
//   try {
//     const result = await sms.send({
//       to: [`+${to}`], // e.g., +2519XXXXXXX
//       message,
//       from: 'AtomicLMS', // Optional sender name
//     });
//     console.log("SMS sent:", result);
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//   }
// };
// utils/sendSMS.js (mock version)
export const sendSMS = async (to, message) => {
  console.log(`📱 MOCK SMS sent to +${to}: ${message}`);
  return { status: "mocked", to, message };
};
