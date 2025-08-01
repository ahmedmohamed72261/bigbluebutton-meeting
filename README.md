# BigBlueButton Meeting Platform

A modern Next.js application integrated with BigBlueButton Virtual Classroom Software for creating and managing online meetings, webinars, and virtual classrooms.

## Features

- **Create Meetings**: Set up new BigBlueButton meetings with customizable settings
- **Join Meetings**: Easy-to-use interface for joining existing meetings
- **Meeting Management**: View active meetings, participant counts, and end meetings
- **Multiple Room Types**: Support for meetings, classrooms, and webinars
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme switching

## BigBlueButton Integration

This application provides a complete integration with BigBlueButton, including:

- Meeting creation and management
- Participant join URLs generation
- Real-time meeting status checking
- Meeting termination capabilities
- Support for moderator and attendee roles

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- A BigBlueButton server (or use the demo server for testing)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd meeting
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure BigBlueButton settings:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your BigBlueButton server details:
```env
BBB_SERVER_URL=https://your-bbb-server.com/bigbluebutton
BBB_SHARED_SECRET=your-shared-secret-here
```

For testing, you can use the demo server (already configured in the code):
```env
BBB_SERVER_URL=https://demo.bigbluebutton.org/bigbluebutton
BBB_SHARED_SECRET=8cd8ef52e8e101574e400365b55e11a6
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Meeting

1. Navigate to the "Create Meeting" tab
2. Fill in the meeting details:
   - **Meeting ID**: Unique identifier for your meeting
   - **Meeting Name**: Display name for the meeting
   - **Your Name**: Your name as the moderator
   - **Room Type**: Choose between Meeting, Classroom, or Webinar
3. Click "Create & Join Meeting"
4. The meeting will be created and you'll automatically join as moderator

### Joining a Meeting

1. Navigate to the "Join Meeting" tab
2. Enter the meeting ID and your name
3. Select your role (Attendee or Moderator)
4. Click "Join Meeting"

### Managing Meetings

1. Navigate to the "Manage Meetings" tab
2. View all active meetings with participant counts
3. Join any meeting directly from the list
4. End meetings you have moderator access to

## API Endpoints

The application provides several API endpoints:

- `POST /api/meetings/create` - Create a new meeting
- `POST /api/meetings/join` - Generate join URL for a meeting
- `POST /api/meetings/end` - End an existing meeting
- `GET /api/meetings` - List all active meetings

## Configuration

### BigBlueButton Settings

The application supports various BigBlueButton configurations through the `src/config/bigbluebutton.js` file:

- Server URL and shared secret
- Default passwords for attendees and moderators
- Room type configurations (meeting, classroom, webinar)
- Recording settings
- Welcome messages

### Environment Variables

- `BBB_SERVER_URL`: Your BigBlueButton server URL
- `BBB_SHARED_SECRET`: Your BigBlueButton shared secret
- `BBB_DEFAULT_ATTENDEE_PW`: Default attendee password (optional)
- `BBB_DEFAULT_MODERATOR_PW`: Default moderator password (optional)

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Development

### Project Structure

```
src/
├── app/
│   ├── api/meetings/          # API routes
│   ├── globals.css            # Global styles
│   ├── layout.js              # Root layout
│   └── page.js                # Main application page
├── config/
│   └── bigbluebutton.js       # BBB configuration
└── lib/
    └── bigbluebutton.js       # BBB API client
```

### Adding Features

The BigBlueButton API client (`src/lib/bigbluebutton.js`) provides methods for:

- Creating meetings
- Generating join URLs
- Getting meeting information
- Checking meeting status
- Ending meetings
- Listing all meetings

You can extend these capabilities by adding new methods to the `BigBlueButtonAPI` class.

## Troubleshooting

### Common Issues

1. **Meeting creation fails**: Check your BigBlueButton server URL and shared secret
2. **Cannot join meetings**: Ensure the meeting is running and the meeting ID is correct
3. **API errors**: Check the browser console and server logs for detailed error messages

### Demo Server Limitations

The BigBlueButton demo server has limitations:
- Meetings may be automatically ended
- Limited concurrent users
- Not suitable for production use

For production deployments, set up your own BigBlueButton server.

## Learn More

- [BigBlueButton Documentation](https://docs.bigbluebutton.org/)
- [BigBlueButton API](https://docs.bigbluebutton.org/dev/api.html)
- [Next.js Documentation](https://nextjs.org/docs)

## License

This project is open source and available under the [MIT License](LICENSE).