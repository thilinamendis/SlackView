# SlackView

SlackView is a web-based tool for viewing and exploring Slack workspace export data directly in your browser. No server setup required - just open in any modern web browser and drag-and-drop your Slack export files.

## ✨ Features

- **📁 Drag & Drop Interface**: Simply select your Slack export folder
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔍 Message Search**: Find messages across channels with real-time search
- **📊 Workspace Statistics**: View detailed analytics about your workspace
- **👥 User Directory**: Browse all workspace members
- **📈 Progress Tracking**: Visual progress bar during file processing
- **🎨 Slack-like UI**: Familiar interface that matches Slack's design language
- **🔗 Rich Formatting**: Support for links, mentions, code blocks, and basic formatting
- **📎 Attachment Preview**: View message attachments and images

## 🛠️ Getting Started

### How to Get Slack Export Data

1. **Request Export** (Admin Required):
   - Go to your Slack workspace settings
   - Navigate to "Settings & administration" → "Workspace settings"
   - Click on "Import/Export Data"
   - Select "Export" and choose date range
   - Download the ZIP file when ready (e.g., `@YourWorkspace Slack export <date_range>.zip`)

2. **Extract the ZIP File**:
   - Extract the downloaded ZIP file to a folder
   - You'll get a structure like this:
   ```
   @YourWorkspace Slack export <date_Range>/
   ├── channels.json
   ├── users.json
   ├── canvases.json
   ├── file_conversations.json
   ├── huddle_transcripts.json
   ├── integration_logs.json
   ├── lists.json
   ├── channel-name-1/
   │   ├── 2024-01-01.json
   │   ├── 2024-01-02.json
   │   └── ...
   ├── channel-name-2/
   │   ├── 2024-01-01.json
   │   └── ...
   └── ...
   ```

3. **Important**: You need to extract the ZIP file first, then upload the extracted folder contents to SlackView.

### Using SlackView

1. **Download SlackView**: Download or clone this repository
2. **Open the App**: Open `index.html` in your web browser
3. **Extract Your Export**: First, extract your Slack export ZIP file (e.g., `@YourWorkspace Slack export <date_range>.zip`)
4. **Upload the Folder**: Click "Upload your Slack export files" and select the **extracted folder** (not the ZIP file)
5. **Wait for Processing**: The app will process all channel folders and JSON files
6. **Browse and Explore**: Browse channels, search messages, and view statistics!

> **Note**: Only public channels are included in exports. Private channels and DMs require special admin permissions and may not be included.

## 📁 Project Structure

```
SlackView/
├── index.html          # Main application page
├── style.css           # Styling and responsive design
├── script.js           # Core JavaScript functionality
├── README.md           # This file
└── .gitignore         # Git ignore rules
```

## 🔒 Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Data Upload**: Your Slack data never leaves your computer
- **No External Dependencies**: Works completely offline
- **No Analytics**: No tracking or data collection

## 🤝 Contributing

Contributions are welcome! Make sure you fork the repository


## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues & Limitations

- Large workspaces (10k+ messages) may take longer to process
- Some advanced Slack formatting may not be fully supported
- Emoji reactions are not currently displayed
- Thread replies are shown as individual messages

## 🔮 Future Enhancements

- [ ] Thread view support
- [ ] Emoji reaction display
- [ ] Advanced search filters (date range, user, etc.)
- [ ] Export filtered results
- [ ] Dark/light theme toggle
- [ ] Message bookmarking
- [ ] Advanced statistics and visualizations
- [ ] Support for Canvas, huddle transcripts, and other export files

## 🐛 Troubleshooting

### Common Issues

**"No channels found"**
- Make sure you extracted the ZIP file first
- Verify the folder contains `channels.json` and `users.json` files
- Check that channel folders exist (e.g., `general/`, `random/`)

**"No messages in channels"**
- Ensure channel folders contain daily JSON files (e.g., `2024-01-01.json`)
- Verify you have permission to export the channels (admin required)
- Some channels may be empty if no messages were sent during the export period

**"Processing stuck"**
- Large exports may take time to process
- Try refreshing the page and uploading again
- Consider using a smaller date range for the export

**"File format not recognized"**
- Ensure you're uploading the extracted folder, not the ZIP file
- Modern Slack exports use the folder structure described above
- Legacy exports may have a different format and might not be fully supported

### Browser Requirements
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- JavaScript must be enabled
- File API support required (all modern browsers)

## 📞 Support

If you encounter issues or have feature requests:

1. Check the [Issues](https://github.com/thilinamendis/SlackView/issues) page
2. Create a new issue with detailed information
3. Include browser version and export file size if relevant

---

**Made with ❤️ for the Slack community**