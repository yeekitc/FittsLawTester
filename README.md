# Fitts' Law Tester (https://github.com/yeekitc/FittsLawTester)

This repository contains an implementation of a **Fitts' Law Tester**, designed to measure and test user interaction efficiency based on Fitts' Law. The project simulates a game where users interact with various UI elements to evaluate how different target sizes and distances affect the speed and accuracy of user inputs.

## Game Workflow

1. **Start**: Displays background instructions to guide the user on how to interact with the game.
2. **Begin Trial**: A reticle is shown for the user to click on to initiate the trial.
3. **In Trial**: Randomly sized targets are displayed, which the user must select to proceed through the trial.
4. **End**: The final screen displays the results of the test, summarizing the user's performance.

## How to Use

1. Upon launching the app, follow the on-screen instructions.
2. Click on the reticle to begin the trial.
3. Select the randomly appearing targets as quickly and accurately as possible.
4. Once the trial is completed, your results will be displayed.

## Project Structure

- **p1-skel.ts**:  
  The main TypeScript file where the logic for the Fitts' Law Tester is implemented. It includes the following classes:
  - `FittsTestUI`: Manages the state transitions and overall flow of the test.
  - `Target`: Represents the clickable targets in the game.
  - `Reticle`: A special type of target used at the beginning of each trial.
  - `BackgroundDisplay`: Handles the display of instructions and the results screen.

- **index.html**:  
  The main HTML file used to launch the Fitts' Law Tester after transpiling the TypeScript code.

- **tsconfig.json**:  
  Configuration file for setting up the TypeScript environment.




