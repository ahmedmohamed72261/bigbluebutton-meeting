import crypto from 'crypto-js';
import axios from 'axios';

class BigBlueButtonAPI {
  constructor(serverUrl, sharedSecret) {
    this.serverUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    this.sharedSecret = sharedSecret;
  }

  // Generate checksum for API calls
  generateChecksum(callName, queryString) {
    const data = callName + queryString + this.sharedSecret;
    return crypto.SHA1(data).toString();
  }

  // Build API URL with checksum
  buildApiUrl(callName, params = {}) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    const checksum = this.generateChecksum(callName, queryString);
    
    return `${this.serverUrl}/api/${callName}?${queryString}&checksum=${checksum}`;
  }

  // Create a meeting
  async createMeeting(meetingID, meetingName, options = {}) {
    const params = {
      meetingID,
      name: meetingName,
      attendeePW: options.attendeePW || 'attendee123',
      moderatorPW: options.moderatorPW || 'moderator123',
      welcome: options.welcome || `Welcome to ${meetingName}!`,
      dialNumber: options.dialNumber || '',
      voiceBridge: options.voiceBridge || Math.floor(Math.random() * 99999),
      maxParticipants: options.maxParticipants || 0,
      logoutURL: options.logoutURL || '',
      record: options.record || 'false',
      duration: options.duration || 0,
      meta_description: options.description || '',
      ...options.meta
    };

    try {
      const url = this.buildApiUrl('create', params);
      const response = await axios.get(url);
      const result = this.parseXmlResponse(response.data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }

  // Join a meeting
  generateJoinUrl(meetingID, fullName, password, options = {}) {
    const params = {
      meetingID,
      fullName,
      password,
      redirect: 'true',
      ...options
    };

    return this.buildApiUrl('join', params);
  }

  // Get meeting info
  async getMeetingInfo(meetingID, moderatorPW) {
    const params = {
      meetingID,
      password: moderatorPW
    };

    try {
      const url = this.buildApiUrl('getMeetingInfo', params);
      const response = await axios.get(url);
      return this.parseXmlResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to get meeting info: ${error.message}`);
    }
  }

  // Get meetings
  async getMeetings() {
    try {
      const url = this.buildApiUrl('getMeetings');
      const response = await axios.get(url);
      const result = this.parseXmlResponse(response.data);
      
      // Parse meetings from XML
      const meetings = this.parseMeetingsFromXml(response.data);
      result.meetings = meetings;
      result.success = result.returncode === 'SUCCESS';
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get meetings: ${error.message}`);
    }
  }

  // Parse meetings list from XML
  parseMeetingsFromXml(xmlString) {
    const meetings = [];
    const meetingRegex = /<meeting>(.*?)<\/meeting>/gs;
    let match;

    while ((match = meetingRegex.exec(xmlString)) !== null) {
      const meetingXml = match[1];
      const meeting = {};

      // Extract meeting details
      const meetingIDMatch = meetingXml.match(/<meetingID>(.*?)<\/meetingID>/);
      if (meetingIDMatch) meeting.meetingID = meetingIDMatch[1];

      const meetingNameMatch = meetingXml.match(/<meetingName>(.*?)<\/meetingName>/);
      if (meetingNameMatch) meeting.meetingName = meetingNameMatch[1];

      const participantCountMatch = meetingXml.match(/<participantCount>(.*?)<\/participantCount>/);
      if (participantCountMatch) meeting.participantCount = parseInt(participantCountMatch[1]);

      const moderatorCountMatch = meetingXml.match(/<moderatorCount>(.*?)<\/moderatorCount>/);
      if (moderatorCountMatch) meeting.moderatorCount = parseInt(moderatorCountMatch[1]);

      const runningMatch = meetingXml.match(/<running>(.*?)<\/running>/);
      if (runningMatch) meeting.running = runningMatch[1] === 'true';

      meetings.push(meeting);
    }

    return meetings;
  }

  // End meeting
  async endMeeting(meetingID, moderatorPW) {
    const params = {
      meetingID,
      password: moderatorPW
    };

    try {
      const url = this.buildApiUrl('end', params);
      const response = await axios.get(url);
      const result = this.parseXmlResponse(response.data);
      result.success = result.returncode === 'SUCCESS';
      return result;
    } catch (error) {
      throw new Error(`Failed to end meeting: ${error.message}`);
    }
  }

  // Check if meeting is running
  async isMeetingRunning(meetingID) {
    const params = { meetingID };

    try {
      const url = this.buildApiUrl('isMeetingRunning', params);
      const response = await axios.get(url);
      const result = this.parseXmlResponse(response.data);
      return {
        running: result.running === 'true',
        returncode: result.returncode,
        message: result.message
      };
    } catch (error) {
      throw new Error(`Failed to check meeting status: ${error.message}`);
    }
  }

  // Simple XML parser for BigBlueButton responses
  parseXmlResponse(xmlString) {
    const result = {};
    
    // Extract return code
    const returnCodeMatch = xmlString.match(/<returncode>(.*?)<\/returncode>/);
    if (returnCodeMatch) {
      result.returncode = returnCodeMatch[1];
    }

    // Extract message
    const messageMatch = xmlString.match(/<message>(.*?)<\/message>/);
    if (messageMatch) {
      result.message = messageMatch[1];
    }

    // Extract meeting ID
    const meetingIDMatch = xmlString.match(/<meetingID>(.*?)<\/meetingID>/);
    if (meetingIDMatch) {
      result.meetingID = meetingIDMatch[1];
    }

    // Extract internal meeting ID
    const internalMeetingIDMatch = xmlString.match(/<internalMeetingID>(.*?)<\/internalMeetingID>/);
    if (internalMeetingIDMatch) {
      result.internalMeetingID = internalMeetingIDMatch[1];
    }

    // Extract running status
    const runningMatch = xmlString.match(/<running>(.*?)<\/running>/);
    if (runningMatch) {
      result.running = runningMatch[1];
    }

    // Extract participant count
    const participantCountMatch = xmlString.match(/<participantCount>(.*?)<\/participantCount>/);
    if (participantCountMatch) {
      result.participantCount = parseInt(participantCountMatch[1]);
    }

    // Extract moderator count
    const moderatorCountMatch = xmlString.match(/<moderatorCount>(.*?)<\/moderatorCount>/);
    if (moderatorCountMatch) {
      result.moderatorCount = parseInt(moderatorCountMatch[1]);
    }

    return result;
  }
}

export default BigBlueButtonAPI;