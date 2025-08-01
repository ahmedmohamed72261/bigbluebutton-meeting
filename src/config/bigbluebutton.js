// BigBlueButton Configuration
// You can use a demo server or your own BigBlueButton installation

export const BBB_CONFIG = {
  // Demo server (for testing only - not for production)
  serverUrl: 'https://test-install.blindsidenetworks.com/bigbluebutton',
  sharedSecret: '8cd8ef52e8e101574e400365b55e11a6',
  
  // Default meeting settings
  defaultSettings: {
    attendeePW: 'attendee123',
    moderatorPW: 'moderator123',
    welcome: 'Welcome to the virtual classroom!',
    record: 'false',
    maxParticipants: 50,
    duration: 120, // minutes
    logoutURL: typeof window !== 'undefined' ? window.location.origin : '',
  },

  // Meeting room configurations
  roomTypes: {
    classroom: {
      name: 'Virtual Classroom',
      description: 'Interactive learning environment',
      maxParticipants: 30,
      record: 'true',
      duration: 90,
    },
    meeting: {
      name: 'Team Meeting',
      description: 'Collaborative workspace',
      maxParticipants: 20,
      record: 'false',
      duration: 60,
    },
    webinar: {
      name: 'Webinar',
      description: 'Large audience presentation',
      maxParticipants: 100,
      record: 'true',
      duration: 120,
    }
  }
};

// Environment-specific configuration
export const getConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      serverUrl: process.env.BBB_SERVER_URL || BBB_CONFIG.serverUrl,
      sharedSecret: process.env.BBB_SHARED_SECRET || BBB_CONFIG.sharedSecret,
      defaultSettings: {
        attendeePW: process.env.BBB_DEFAULT_ATTENDEE_PW || BBB_CONFIG.defaultSettings.attendeePW,
        moderatorPW: process.env.BBB_DEFAULT_MODERATOR_PW || BBB_CONFIG.defaultSettings.moderatorPW,
        welcome: BBB_CONFIG.defaultSettings.welcome,
        record: BBB_CONFIG.defaultSettings.record,
        maxParticipants: BBB_CONFIG.defaultSettings.maxParticipants,
        duration: BBB_CONFIG.defaultSettings.duration,
        logoutURL: BBB_CONFIG.defaultSettings.logoutURL,
      },
      roomTypes: BBB_CONFIG.roomTypes
    };
  }
  
  return BBB_CONFIG;
};