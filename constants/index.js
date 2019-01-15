export default {
  RESET_STATE: false,
  DROP_MILESTONE_TABLES: false,
  DROP_MILESTONE_TRIGGERS_TABLE: false,
  DROP_REGISTRATION_TABLES: false,
  DROP_ANSWER_TABLE: false,
  DROP_BABYBOOK_TABLES: false,
  DROP_NOTIFICATIONS_TABLE: false,
  COMPRESS_MILESTONE_CALENDAR: false,
  TESTING_ENABLE_ALL_TASKS: true,

  TASK_BIRTH_QUESTIONAIRE_ID: 25,
  PRE_BIRTH_BEGINNING_OF_STUDY: 373,
  POST_BIRTH_END_OF_STUDY: 730,

  // Custom Directories
  BABYBOOK_DIRECTORY: 'babybook',
  REMOVE_BABYBOOK_DIRECTORY: false, // will delete all baby book assets!
  SIGNATURE_DIRECTORY: 'signature',
  REMOVE_SIGNATURE_DIRECTORY: false, // will delete the signature assets
  ATTACHMENTS_DIRECTORY: 'attachments',
  REMOVE_ATTACHMENTS_DIRECTORY: false, // will delete all answer attachments

  // API
  BASE_PRODUCTION_URL: 'https://app-8756.on-aptible.com/api',
  BASE_STAGING_URL: 'https://app-8756.on-aptible.com/api',
  BASE_DEVELOPMENT_URL: 'https://app-8756.on-aptible.com/api',
  //BASE_DEVELOPMENT_URL: 'http://10.1.10.140:3000/api',

  MILESTONE_TOKEN: '816fb58eb3ef6dc4dcf85a230b2049da33bac3b7a744d26f33ca3b89ae136d41',

  SENTRY_URL: 'https://193d4a8c3e6b4b3d974a3f4d1d6f598c@sentry.io/1204085',
};
