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
  TESTING_MOCK_DISABLE_NETWORK: false,

  TASK_BIRTH_QUESTIONAIRE_ID: 25,
  CHOICE_BABY_ALIVE_ID: 613,
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
  BASE_DEVELOPMENT_URL: 'https://staging-api.babystepsapp.net/api',
  //BASE_DEVELOPMENT_URL: 'https://api.babystepsapp.net/api',
  //BASE_DEVELOPMENT_URL: 'http://10.1.10.99:3000/api',
};
