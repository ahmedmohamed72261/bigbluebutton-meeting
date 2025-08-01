import { NextResponse } from 'next/server';
import BigBlueButtonAPI from '@/lib/bigbluebutton';
import { getConfig } from '@/config/bigbluebutton';

export async function POST(request) {
  try {
    const { meetingID, fullName, role } = await request.json();

    if (!meetingID || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: meetingID, fullName' },
        { status: 400 }
      );
    }

    const config = getConfig();
    const bbb = new BigBlueButtonAPI(config.serverUrl, config.sharedSecret);

    // Check if meeting is running
    const isRunning = await bbb.isMeetingRunning(meetingID);
    
    if (!isRunning.running) {
      // If meeting doesn't exist and user is trying to join as moderator, create it
      if (role === 'moderator') {
        try {
          const meetingOptions = {
            attendeePW: config.defaultSettings.attendeePW,
            moderatorPW: config.defaultSettings.moderatorPW,
            welcome: `Welcome to ${meetingID}!`,
            record: 'false',
            maxParticipants: 50,
            duration: 120,
            logoutURL: config.defaultSettings.logoutURL,
            meta: {
              'meta_createdBy': fullName,
              'meta_createdAt': new Date().toISOString(),
              'meta_autoCreated': 'true'
            }
          };

          const createResult = await bbb.createMeeting(meetingID, meetingID, meetingOptions);
          
          if (createResult.returncode !== 'SUCCESS') {
            return NextResponse.json(
              { error: 'Failed to create meeting automatically' },
              { status: 500 }
            );
          }
        } catch (createError) {
          console.error('Error auto-creating meeting:', createError);
          return NextResponse.json(
            { error: 'Failed to create meeting automatically' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Meeting is not currently running. Please ask the moderator to start the meeting first.' },
          { status: 404 }
        );
      }
    }

    // Determine password based on role
    const password = role === 'moderator' 
      ? config.defaultSettings.moderatorPW 
      : config.defaultSettings.attendeePW;

    // Generate join URL
    const joinUrl = bbb.generateJoinUrl(meetingID, fullName, password);

    return NextResponse.json({
      success: true,
      joinUrl,
      meetingID,
      fullName,
      role,
      message: role === 'moderator' && !isRunning.running 
        ? 'Meeting created and join URL generated successfully'
        : 'Join URL generated successfully'
    });

  } catch (error) {
    console.error('Error joining meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join meeting' },
      { status: 500 }
    );
  }
}