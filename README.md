# My Electron App

## Description
This is an Electron application built with TypeScript. It serves as a template for creating cross-platform desktop applications.

## Project Structure
```
my-electron-app
├── src
│   ├── main.ts         # Main entry point for the Electron application
│   ├── preload.ts      # Preload script for the renderer process
│   ├── renderer.ts     # Renderer process handling the UI
│   └── types
│       └── index.ts    # Custom types and interfaces
├── package.json        # npm configuration file
├── tsconfig.json       # TypeScript configuration file
└── README.md           # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-electron-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

## Usage
- Modify the `src/renderer.ts` file to change the user interface.
- Use `src/preload.ts` to expose APIs to the renderer process.
- Customize the main process in `src/main.ts`.

## License
This project is licensed under the MIT License.