import {registerAs} from '@nestjs/config';

export default registerAs('microservices', () => ({
  account: {
    security: {
      ipLoginLimiter: {points: 10, durationSeconds: 600},
      userLoginLimiter: {points: 5, durationSeconds: 600},
      ipAccessLimiter: {points: 20, durationSeconds: 60},
    },
    token: {
      userAccess: {
        expiresIn: '10m',
        secret:
          process.env.ACCOUNT_USER_ACCESS_TOKEN_SECRET ||
          'your-access-token-secret',
      },
      userRefresh: {
        expiresIn: '1440m',
        secret:
          process.env.ACCOUNT_USER_REFRESH_TOKEN_SECRET ||
          'your-refresh-token-secret',
      },
    },
    verificationCode: {timeoutMinutes: 1, resendMinutes: 1},
    aws: {
      accessKeyId: process.env.ACCOUNT_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.ACCOUNT_AWS_SECRET_ACCESS_KEY,
      region: process.env.ACCOUNT_AWS_REGION || 'us-east-1',
      pinpointApplicationId:
        process.env.ACCOUNT_AWS_PINPOINT_APPLICATION_ID || 'default',
      pinpointFromAddress:
        process.env.ACCOUNT_AWS_PINPOINT_FROM_ADDRESS || 'default',
      pinpointSenderId: process.env.ACCOUNT_AWS_PINPOINT_SENDER_ID || 'default',
    },
  },
  notification: {
    aws: {
      accessKeyId: process.env.NOTIFICATION_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NOTIFICATION_AWS_SECRET_ACCESS_KEY,
      region: process.env.NOTIFICATION_AWS_REGION || 'us-east-1',
    },
    email: {
      awsPinpointApplicationId:
        process.env.NOTIFICATION_EMAIL_AWS_PINPOINT_APPLICATION_ID || 'default',
      awsPinpointFromAddress:
        process.env.NOTIFICATION_EMAIL_AWS_PINPOINT_FROM_ADDRESS || 'default',
    },
    sms: {
      awsPinpointApplicationId:
        process.env.NOTIFICATION_SMS_AWS_PINPOINT_APPLICATION_ID || 'default',
      awsPinpointSenderId:
        process.env.NOTIFICATION_SMS_AWS_PINPOINT_SENDER_ID || 'default',
    },
    traceableEmail: {
      awsSqsQueueUrl:
        'https://sqs.us-east-1.amazonaws.com/196438055748/traceable-email-service-email-queue-level1',
    },
  },
  googleAuth: {
    clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
  },
}));
