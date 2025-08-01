import { NextResponse } from 'next/server';
import BigBlueButtonAPI from '@/lib/bigbluebutton';
import { getConfig } from '@/config/bigbluebutton';

export async function POST(request) {
  try {
    const { meetingID, meetingName, roomType, moderatorName } = await request.json();

    if (!meetingID || !meetingName || !moderatorName) {
      return NextResponse.json(
        { error: 'Missing required fields: meetingID, meetingName, moderatorName' },
        { status: 400 }
      );
    }

    const config = getConfig();
    const bbb = new BigBlueButtonAPI(config.serverUrl, config.sharedSecret);

    // Get room type configuration
    const roomConfig = config.roomTypes[roomType] || config.roomTypes.meeting;

    const meetingOptions = {
      attendeePW: config.defaultSettings.attendeePW,
      moderatorPW: config.defaultSettings.moderatorPW,
      welcome: `Welcome to ${meetingName}! ${roomConfig.description}`,
      record: roomConfig.record,
      maxParticipants: roomConfig.maxParticipants,
      duration: roomConfig.duration,
      logoutURL: config.defaultSettings.logoutURL,
      description: roomConfig.description,
      meta: {
        'meta_roomType': roomType,
        'meta_createdBy': moderatorName,
        'meta_createdAt': new Date().toISOString()
      }
    };

    const result = await bbb.createMeeting(meetingID, meetingName, meetingOptions);

    if (result.returncode === 'SUCCESS') {
      // Generate join URLs for moderator and attendees
      const moderatorJoinUrl = bbb.generateJoinUrl(
        meetingID,
        moderatorName,
        config.defaultSettings.moderatorPW,
        { role: 'moderator' }
      );

      return NextResponse.json({
        success: true,
        meetingID: result.meetingID,
        internalMeetingID: result.internalMeetingID,
        moderatorJoinUrl,
        attendeePassword: config.defaultSettings.attendeePW,
        moderatorPassword: config.defaultSettings.moderatorPW,
        roomType,
        message: 'Meeting created successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to create meeting' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}