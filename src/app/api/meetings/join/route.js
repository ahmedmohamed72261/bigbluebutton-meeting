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

    console.log(`Join request: ${fullName} (${role}) wants to join meeting: ${meetingID}`);

    const config = getConfig();
    const bbb = new BigBlueButtonAPI(config.serverUrl, config.sharedSecret);

    // Check if meeting exists and is running
    let meetingExists = false;
    let meetingRunning = false;

    try {
      // First check if meeting is running
      const runningCheck = await bbb.isMeetingRunning(meetingID);
      meetingRunning = runningCheck.running === true;
      console.log(`Meeting ${meetingID} running status: ${meetingRunning}`);

      if (meetingRunning) {
        meetingExists = true;
      } else {
        // If not running, try to get meeting info to see if it exists but not started
        try {
          const meetingInfo = await bbb.getMeetingInfo(meetingID, config.defaultSettings.moderatorPW);
          meetingExists = meetingInfo.returncode === 'SUCCESS';
          console.log(`Meeting ${meetingID} exists but not running: ${meetingExists}`);
        } catch (infoError) {
          console.log(`Meeting info check failed: ${infoError.message}`);
          meetingExists = false;
        }
      }
    } catch (error) {
      console.log(`Error checking meeting status: ${error.message}`);
      meetingExists = false;
      meetingRunning = false;
    }

    // Handle different scenarios
    if (!meetingExists && !meetingRunning) {
      if (role === 'moderator') {
        // Moderator can create a new meeting
        console.log(`Creating new meeting: ${meetingID} for moderator: ${fullName}`);
        
        try {
          const meetingOptions = {
            attendeePW: config.defaultSettings.attendeePW,
            moderatorPW: config.defaultSettings.moderatorPW,
            welcome: `Welcome to ${meetingID}! This meeting was started by ${fullName}.`,
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

          const createResult = await bbb.createMeeting(meetingID, `Meeting ${meetingID}`, meetingOptions);
          
          if (createResult.returncode !== 'SUCCESS') {
            console.error('Failed to create meeting:', createResult);
            return NextResponse.json(
              { error: `Failed to create meeting: ${createResult.message || 'Unknown error'}` },
              { status: 500 }
            );
          }
          
          console.log(`Meeting created successfully: ${meetingID}`);
          meetingExists = true;
          meetingRunning = true;
        } catch (createError) {
          console.error('Error creating meeting:', createError);
          return NextResponse.json(
            { error: `Failed to create meeting: ${createError.message}` },
            { status: 500 }
          );
        }
      } else {
        // Attendee cannot join non-existent meeting
        return NextResponse.json(
          { 
            error: `Meeting "${meetingID}" does not exist or is not running. Please check the Meeting ID or ask the moderator to start the meeting first.` 
          },
          { status: 404 }
        );
      }
    } else if (meetingExists && !meetingRunning) {
      // Meeting exists but not running - only moderator can start it
      if (role !== 'moderator') {
        return NextResponse.json(
          { 
            error: `Meeting "${meetingID}" exists but is not currently running. Please ask the moderator to start the meeting first.` 
          },
          { status: 404 }
        );
      }
    }

    // At this point, meeting should exist and be running (or about to be started by moderator)
    console.log(`Proceeding to join meeting: ${meetingID} as ${role}`);

    // Determine password based on role - this is crucial for joining the correct meeting
    const password = role === 'moderator' 
      ? config.defaultSettings.moderatorPW 
      : config.defaultSettings.attendeePW;

    console.log(`Using password for ${role}: ${password}`);

    // Generate join URL with minimal additional parameters to avoid conflicts
    const joinUrl = bbb.generateJoinUrl(meetingID, fullName, password);

    console.log(`Generated join URL for ${fullName} (${role}) to meeting ${meetingID}`);

    return NextResponse.json({
      success: true,
      joinUrl,
      meetingID,
      fullName,
      role,
      meetingExists,
      meetingRunning,
      message: role === 'attendee' 
        ? `Ready to join meeting "${meetingID}" as attendee. You will join the same meeting as the moderator.`
        : `Ready to join meeting "${meetingID}" as moderator.`
    });

  } catch (error) {
    console.error('Error in join meeting:', error);
    return NextResponse.json(
      { error: `Failed to join meeting: ${error.message}` },
      { status: 500 }
    );
  }
}