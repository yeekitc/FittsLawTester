"use strict";
//=====================================================================
//=====================================================================
// Skeleton Code for:
// Fitts Law Data Collection User Interface (AKA SSUI Project #1) v1.0a 
// by Scott Hudson  8/2023
//
// This code provides a small "micro-toolkit" for building very simple 
// interfaces, primarily via subclasses of the provided UIClass and 
// ScreenObject base-classes.  (These should not be changed.)
//
// Also provided are various piece of class definition and other code
// which provide a "skeleton" that you can fill out to complete Project #1
// (a "Fitts Law Data Collection" UI).  Please refer to the project handout
// and the insructions given in lab for details on what your interface 
// should do when it is completed.
//
// The places in the code skeleton which you should provide include 
// (at least) all those which are marked with a comments of the form:
//    // === YOUR CODE HERE ===
//
//=====================================================================
//========================================
//========================================
// === DON't MODIFY THE FOLLOWING CODE ===
//========================================
//========================================
///=====================================================================
// Utility functions
//=====================================================================
// Function to run a type narrowing validation.  Parameters are: a value to be 
// type checked, a type guard function, and an error message string to be used 
// for the error message for an exception if the test fails.  This returns the 
// value it is passed (the first parameter).
// 
// Note that the compiler's type inference is good enough that if the given 
// function is a type guard (i.e., declared with a "parameter is type" style 
// return type declaration), then it will narrow the result of this function to 
// match the type of the type guard.
function validate(value, tester, errMsg) {
    if (!tester(value))
        throw Error(errMsg);
    return value;
}
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
// Type guard function for HTMLCanvasElement
function isHTMLCanvasElement(canv) {
    // return (canv && (canv as HTMLCanvasElement).getContext !== undefined); 
    return (canv && (canv instanceof HTMLCanvasElement));
}
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
// Type guard function for CanvasRenderingContext
function isCanvasRenderingContext2D(ctx) {
    // return (ctx && (ctx as CanvasRenderingContext2D).fillRect !== undefined);
    return (ctx && (ctx instanceof CanvasRenderingContext2D));
}
//=====================================================================
// Base class for managing a (very simple) UI
//=====================================================================
// This class provides a generic base class that manages a set of objects (of type 
// ScreenObject) making up a UI.  It provides generic functions for drawing, handling 
// input, etc. with the details handled by a specialized sub-class and the objects making 
// up the interface
class UIClass {
    get currentState() { return this._currentState; }
    set currentState(v) { this._currentState = v; }
    get canvas() { return this._canvas; }
    set canvas(v) { this._canvas = v; }
    get context() { return this._context; }
    set context(v) { this._context = v; }
    get needsRedraw() { return this._needsRedraw; }
    set needsRedraw(v) { this._needsRedraw = v; }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Construct the UI to operate within the canvas HTML element with the given ID
    constructor(canvasTagID) {
        // A string indicating one of several global states that the UI can be in
        // The meaning of these strings is detrmined by the sub-class.
        this._currentState = '';
        // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
        // Has something been changed such that we need to redraw?
        this._needsRedraw = false;
        // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
        // Set of interactive objects this UI is currently made up of
        // In this simple framework these are treated as a flat set of objects 
        // (no hierarchy) and are drawn in the order they appear in the list.
        this.childObjects = [];
        // find and validate the canvas element and it's drawing context
        this._canvas = validate(document.getElementById(canvasTagID), isHTMLCanvasElement, `Can't find a canvas element with id: "${canvasTagID}"`);
        this._context = validate(this.canvas.getContext("2d"), isCanvasRenderingContext2D, "Can't get main canvas drawing context");
        // create the initial set of UI objects that make up the interface
        this.buildUIObjects();
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Build all the initial objects needed by the UI.
    // This method is called from the constructor here in the base class and
    // should not be called again in sub-class constructors.
    buildUIObjects() {
        // no child objects here in the base class
        // sub-class will build it's objects here
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Start the UI running by configuring it with the state 'start', doing a 
    // redraw, and setting up event handling (currently only of clicks)
    run() {
        // configure the interface initial state and draw it
        this.configure('start');
        this.needsRedraw = true;
        this.redraw();
        // set up an event handler for the canvas to start processing events
        this.canvas.onclick = (evt) => {
            this.handleClick(evt.offsetX, evt.offsetY);
        };
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Configure the UI to match a new global state
    configure(newState) {
        this.currentState = newState;
        // hopefully more configuration in subclasses...
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Redraw the interface within its host canvas if needed.  If the damage indicator 
    // needsRedraw is false, this does nothing.  needsRedraw is reset to false
    redraw() {
        // only redraw if something indicated we need it
        if (this.needsRedraw) {
            // clear the background, then redraw each of the child objects
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (const childObj of this.childObjects) {
                childObj.draw(this.context);
            }
        }
        // display is now up-to-date
        this.needsRedraw = false;
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Dispatch input from a click to child objects
    handleClick(x, y) {
        // try to dispatch this to each object (in reverse drawing order) 
        // until one handles it
        for (let i = this.childObjects.length - 1; i >= 0; i--) {
            if (this.childObjects[i].handleClickAt(x, y)) {
                // If something indicated a change to screen contents, redraw
                if (this.needsRedraw)
                    this.redraw();
                // indicate that we processed the event
                return true;
            }
        }
        // nobody handled it so indicate that it was not handled
        return false;
    }
}
//=====================================================================
// Base class for interactive objects that can appear in the UI
//=====================================================================
// Class for (very simple) interactive objects.  Each object has a position (x,y) 
// within the parent UI, and a size (w,h).  It also links back to the overall UI
// object that it is contained in.  Methods are provided for drawing
// the object on the screen, "picking" the object (determining if a point is 
// inside the object), and handling input (currently only clicks).  Most of the
// details of those operations will need to be provided by code in specialized
// subclasses.
class ScreenObject {
    get x() { return this._x; }
    set x(v) { this._x = v; this.declareDamaged(); }
    get centerX() { return this.x + this.w / 2; }
    set centerX(v) { this.x = v - this.w / 2; }
    get y() { return this._y; }
    set y(v) { this._y = v; this.declareDamaged(); }
    get centerY() { return this.y + this.h / 2; }
    set centerY(v) { this.y = v - this.h / 2; }
    get w() { return this._w; }
    set w(v) { this._w = v; this.declareDamaged(); }
    get h() { return this._h; }
    set h(v) { this._h = v; this.declareDamaged(); }
    get visible() { return this._visible; }
    set visible(v) { this._visible = v; this.declareDamaged(); }
    ;
    get parentUI() { return this._parentUI; }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Declare that this object has been changed in a way that may require 
    // its screen appearance to change (so requires a redraw of the interface)
    declareDamaged() {
        this.parentUI.needsRedraw = true;
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Construct based on size and position.  All objects are initially visible.
    constructor(x, y, w, h, parent) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._parentUI = parent;
        this._visible = true;
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    draw(ctx) {
        // nothing to do here in the base class
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Indicates if the given point (x,y screen location) "picks" the object 
    // (is over the top of it's active contents).  Here in the base class we
    // pick the object if the point is inside the bounding box of the object.
    // Currently non-visible objects are not picked.
    pickedBy(ptX, ptY) {
        if (!this.visible)
            return false;
        return ptX >= 0 && ptY >= 0 && ptX < this.w && ptY < this.h;
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Respond to (very simple) input (just clicks at a position) potentially 
    // directed to this object.  True is returned if the object has processed
    // the input -- indicating that other objects should not process the input.
    handleClickAt(ptX, ptY) {
        // only process inputs if we are visible and picked at that position
        if (!this.visible || !this.pickedBy(ptX, ptY))
            return false;
        // in subclasses we would do something to process the input here
        // here in the base class we never process it
        return false;
    }
}
//=====================================================================
// Helper functions for picking random target locations
//=====================================================================
// Pick a random number within a range
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
// Pick a position of a target of the given diameter that fits entirely 
// in a rectangle of the given size
function pickPositionInBox(boundW, boundH, diam) {
    return [Math.round(randomInRange(diam, boundW - diam)),
        Math.round(randomInRange(diam, boundH - diam))];
}
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
// The minimum distance that we allow between the (edges of) the reticle and the target
const MIN_DIST_APART = 30;
// Pick a center location for a start reticle and a target along with a diameter 
// for the target such that both fit within a rectangle of the given size and 
// are at least a minimum distance apart (as defined by MIN_DIST_APART).
// We return this as an object that can be used in a destructuring assignment.
function pickLocationsAndSize(boundW, boundH) {
    // pick a position for the reticle that fits in the bounding box
    const [rx, ry] = pickPositionInBox(boundW, boundH, Reticle.RETICLE_DIAM);
    // try positions for a randomly sized target 
    // looking for one that fits in the box and isn't too close to the reticle
    let tx = 0;
    let ty = 0;
    let tsz = 0;
    // we keep trying until we find one 
    for (;;) {
        // pick a random diameter and position for the target
        tsz = randomInRange(50, 200);
        [tx, ty] = pickPositionInBox(boundW, boundH, tsz);
        // how far apart is that?
        const dx = Math.abs(rx - tx);
        const dy = Math.abs(ry - ty);
        const dist = Math.hypot(dx, dy);
        // if it's not too close we are done
        if (dist > (tsz / 2 + Reticle.RETICLE_DIAM / 2) + MIN_DIST_APART)
            break;
    }
    // return the selected positions and size 
    return { retX: rx, retY: ry, targX: tx, targY: ty, targD: tsz };
}
//=====================================================================
// Trial Data Related
//=====================================================================
class FittsTrialRecord {
    // the duration of the movement
    get duration() { return this.endTime - this.startTime; }
    // the index of difficulty 
    // (using the "Shannon Formulation" of Fitts' law ID = log2(D/W+1))
    get indexOfDiff() {
        return Math.log2(this.dist / this.targetDiam + 1);
    }
    constructor(startT, endT, dist, sz) {
        this.startTime = 0;
        this.endTime = 0;
        this.dist = 0;
        this.targetDiam = 0;
        this.startTime = startT;
        this.endTime = endT;
        this.dist = dist;
        this.targetDiam = sz;
    }
    toString() {
        // Excel friendly (CSV) format...
        return `${twoPlaces(this.startTime)}, ${twoPlaces(this.endTime)}, ` +
            `${twoPlaces(this.dist)}, ${twoPlaces(this.targetDiam)}`;
        // more human readable format...
        // return `[start:${twoPlaces(this.startTime)}, end:${twoPlaces(this.endTime)}, ` +
        //         `dist:${twoPlaces(this.dist)}, w:${twoPlaces(this.targetDiam)}] ` + 
        //         `dur=${twoPlaces(this.duration)}msec ID=${twoPlaces(this.indexOfDiff)}`;
    }
}
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
// Convenience function to return a number that has been rounded to two 
// places after the decimal point.
function twoPlaces(n) { return Math.round(n * 100) / 100; }
//=====================================================================
// Code for running the UI from the HTML page
//=====================================================================
// Single object for our UI implementation
let UI;
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
// External interface to be called from page script to start the interface 
function runFittsDataCollector() {
    UI = new FittsTestUI("p1-main-canvas");
    UI.run();
}
//==================================================
//==================================================
// === SKELETON CODE TO BE MODIFIED STARTS BELOW ===
//==================================================
//==================================================
//=====================================================================
// Sub-class implementing our actual interface
//=====================================================================
// Class implementing our Fitts law data collector interface
class FittsTestUI extends UIClass {
    constructor(canvasTagID) {
        super(canvasTagID); // note: this will call this.buildUIObjects()
        // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
        // Tracking for how many trials we've done, so we know when to quit
        this.MAX_TRIALS = 10;
        this.trialCount = 0;
        // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
        // When did we start the current/last trial
        this.lastStartTime = 0;
        // Where did we start the current/last trial from
        this.lastTrialLocation = [0, 0];
        // List of records, one for each recorded trial.  These are pushed by recordTrailEnd()
        this._trialData = [];
    }
    get theReticle() { return this._theReticle; }
    get theTarget() { return this._theTarget; }
    get theBackground() { return this._theBackground; }
    // Note: the previous 3 instance variables  are initialized in 
    //   buildUIObjects() which is called from the super-class constructor.  
    //   The "!" here tells the compiler that these values will not stay 
    //   undefined even though it can't tell that on it's own, and so shuts 
    //   down an error that it would otherwise be erroneously report.  However, 
    //   this is turning off some static checking, so you should be careful that 
    //   this initialization is actually happening.
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Build the objects for this UI.
    // Here we create three static objects that we modify as the interaction 
    // progresses:
    //  theBackground -- a background area where we display messages
    //  theReticle    -- an object that we click to start a trial 
    //  theTarget     -- an object that the user is supposed to click on for 
    //                   the trial
    // The background object is always visible, but we change the messages it 
    // shows based on the UI state.  The Reticle is only visible at start of a trial 
    // and disappears when clicked near its center. The Target is only visible once the 
    // reticle has been clicked on, and goes invisible once it is clicked on (and hence
    // the trial ends).
    buildUIObjects() {
        // create the background object (sized to match the whole canvas) the 
        // proper with initial prompt
        this.childObjects.push(this._theBackground =
            new BackgroundDisplay(this.canvas.width, this.canvas.height, this));
        // create the reticle and target at new random locations
        const { retX: retX, retY: retY, targX: targX, targY: targY, targD: targDiam } = pickLocationsAndSize(this.canvas.width, this.canvas.height);
        this.childObjects.push(this._theReticle = new Reticle(retX, retY, this));
        this.childObjects.push(this._theTarget = new Target(targX, targY, targDiam, this));
        // NOTE: if this method is changed or overriden,  recheck the assertion 
        //   that theReticle, theTarget, and theBackground are actually 
        //   initialized since we have disabled compiler checking of that 
        //   (with postfix ! in the declaration.
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Configure the UI to match the current state.  This moves the interface to it's new 
    // state by changing our (static) UI objects as needed, and settng the 
    // visibilty of objects.  This interface understands the following global states:
    //   'start'         -- we have not started the first trial
    //   'begin_trial'   -- a trial has begun (reticle should up awaiting click)
    //   'in_trial'      -- trial has started (target should be up awaitig click)
    //   'ended'         -- all trials are done
    //
    configure(newState) {
        // Be a bit tolerant of variant forms...
        newState = newState.toLowerCase();
        newState = newState.replace('-', '_');
        this.currentState = newState;
        switch (this.currentState) {
            case 'start':
                this.theBackground.msg1 = "Press anywhere to begin";
                this.theBackground.msg2 =
                    "  For each trial click the center of the blue target to begin";
                this.theBackground.msg3 =
                    "  Then click inside the green circle that appears";
                // Make sure the reticle and target are invisible
                this.theReticle.visible = false;
                this.theTarget.visible = false;
                // Display the background and wait for a click to start trials
                this.theBackground.visible = true;
                break;
            case 'begin_trial':
                // === YOUR CODE HERE ===
                break;
            case 'in_trial':
                // === YOUR CODE HERE ===
                break;
            case 'ended':
                // === YOUR CODE HERE ===
                // produce a dump of our data records on the console
                this.presentData();
                break;
            default:
                throw Error(`Unknown UI state ${newState} passed to FittsTestUI.configure()`);
        }
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Start the display of a new trial in the interface by setting new positions for our 
    // reticle and target and changing the global state to 'begin_trial' (or 'ended' if 
    // we have already done all our trials).
    newTrial() {
        // count the trial and go to the end state if we've done them all
        this.trialCount++;
        if (this.trialCount > this.MAX_TRIALS) {
            this.configure('ended');
        }
        else { // otherwise we have a normal trial...
            // make new random locations for reticle and target 
            const { retX: retX, retY: retY, targX: targX, targY: targY, targD: targDiam } = pickLocationsAndSize(this.canvas.width, this.canvas.height);
            // === YOUR CODE HERE ===
        }
    }
    get trialData() { return this._trialData; }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Do bookkeeping for start of the current trial 
    startTrial(startLocX, startLocY) {
        // Remember where we started the movement from and the current time so we
        // can record those at the end of the trial
        this.lastTrialLocation = [startLocX, startLocY];
        this.lastStartTime = performance.now(); // get msec past the epoc
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Stop the trial timer and make a record of the trial
    recordTrialEnd(endLocX, endLocY, endSz) {
        // record the current time in msec since the epoc
        const endT = performance.now();
        // work out the distance from the start location to our end point
        const dist = Math.hypot(this.lastTrialLocation[0] - endLocX, this.lastTrialLocation[1] - endLocY);
        // create a record for the trial and append to the data
        const rec = new FittsTrialRecord(this.lastStartTime, endT, dist, endSz);
        this.trialData.push(rec);
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Present the data we have collected after a set of trials completes.
    // This currently just prints the data to the console in a CSV format.
    presentData() {
        // console.log("Data dump...");
        for (let i = 0; i < this.trialData.length; i++) {
            // console.log("" + i + ":" + this.trialData[i].toString());
            console.log(this.trialData[i].toString());
        }
    }
}
//=====================================================================
// Sub-classes implementing the types of interactive objects we use
//=====================================================================
// Class implementing a round clickable target.  This is specified in terms
// of a center position and diameter, which is translated into a square bounding box
// for the super-class.  The object is displayed as a filled circle with an outline.
// Input is only accpet within the circle (not the entire bounding box).
// This object is used when the interface is in the 'in_trial' state and clicking
// on it ends the trial.
class Target extends ScreenObject {
    get parentUI() { return this._parentUI; }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Accessors for diameter and radius of our circle 
    // (reconstructed from our width)
    get diam() { return this._w; }
    set diam(v) { this.w = this.h = v; }
    get radius() { return this.diam / 2; }
    set radius(v) { this.w = this.h = v * 2; }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // set a new bounding box for the object based on a center location and an 
    // optional diameter.  If diameter is not include the size is left unchanged.
    // If the diameter is supplied, both the width and height are set to that value.
    newGeom(newCentX, newCentY, newDiam) {
        // === YOUR CODE HERE ===
        this.declareDamaged();
    }
    get color() { return this.TARGET_COLOR; }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Construtor based on center and diameter
    constructor(centX, centY, diam, parent) {
        super(centX - diam / 2, centY - diam / 2, diam, diam, parent);
        // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
        // Color we are drawn with
        this.TARGET_COLOR = 'palegreen';
        this._parentUI = parent;
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Draw the object as a filled and outlined circle
    draw(ctx) {
        // === YOUR CODE HERE ===
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Pick function.  We only pick within our circle, not the entire bounding box
    pickedBy(ptX, ptY) {
        // === YOUR CODE HERE ===
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Handle click input.  The interface should be in the 'in_trial' state,
    // in which case we respond to this input by ending the current trial
    // and starting a new one.
    handleClickAt(ptX, ptY) {
        // === YOUR CODE HERE ===
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }
}
//---------------------------------------------------------------------
// This class implements the specialized target that is clicked
// on to start a trial.  This target has a fixed size and draws a 
// reticle (AKA "gun sight" or "cross hair") type pattern which includes
// a small inner cicle.  It only responds to inputs (clicks) within that 
// small circle.  This forces the user to click near the center of the 
// target.
class Reticle extends Target {
    get color() { return Reticle.RETICLE_COLOR; }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Constructor based on center and diameter
    constructor(centerX, centerY, parent) {
        // let the super-class create and initialize it's part
        super(centerX, centerY, 42 /*placeholder value*/, parent);
        // use a fixed diameter and different color
        this._w = this._h = Reticle.RETICLE_DIAM;
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Draw the reticle.  This includes cross hair lines and an inner "aiming"
    // circle that indicates the active clickable region of the object.
    draw(ctx) {
        // === YOUR CODE HERE ===
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Picking function. We are only picked within our small center region.
    pickedBy(ptX, ptY) {
        // === YOUR CODE HERE ===
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Handle a potential click input.  When responding to this input we 
    // expect to be in the 'begin_trial' interface state and will respond 
    // by starting the trial timer and moving to the 'in_trial' state.
    handleClickAt(ptX, ptY) {
        // === YOUR CODE HERE ===
        // === REMOVE THE FOLLOWING CODE (which is here so the skeleton code compiles) ===
        return false;
        // === END OF CODE TO BE REMOVED ===
    }
}
// Fixed diameter for all Reticle objects
Reticle.RETICLE_DIAM = 100;
// Diameter of inner "aiming" cicle that defines clickable region
Reticle.RETICLE_INNER_DIAM = 20;
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
// Color we are drawn with
Reticle.RETICLE_COLOR = 'lightsteelblue';
//---------------------------------------------------------------------
// Class implementing a background text prompting display which covers the 
// whole canvas. This object presents up to three lines of text messages near its 
// top left.  When the interface is in the 'start' state it responds to a click anywhere
// within its bounds, and responds to this by starting the first trial.  At other times
// clicks are ignored and not processed.
class BackgroundDisplay extends ScreenObject {
    get parentUI() { return this._parentUI; }
    get msg1() { return this._msg1; }
    set msg1(v) { this._msg1 = v; this.declareDamaged(); }
    get msg2() { return this._msg2; }
    set msg2(v) { this._msg2 = v; this.declareDamaged(); }
    get msg3() { return this._msg3; }
    set msg3(v) { this._msg3 = v; this.declareDamaged(); }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    constructor(w, h, parent) {
        super(0, 0, w, h, parent);
        this._visible = true;
        this._msg1 = "";
        this._msg2 = "";
        this._msg3 = "";
        this._parentUI = parent;
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Draw the object -- up to three lines of text in a large font near the top left
    // of our bounds (which should be covering the overall canvas).
    draw(ctx) {
        if (!this.visible)
            return;
        // Establish font and get measurements
        ctx.font = "24pt Arial";
        ctx.fillStyle = 'black';
        const metrics = ctx.measureText("Texty");
        const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        const leading = 10;
        // Track line positions
        let ypos = 20 + fontHeight;
        let xpos = 10;
        // Draw the first line of text near the top left
        if (this.msg1.length > 0) {
            ctx.fillText(this.msg1, xpos, ypos);
            ypos += fontHeight + leading;
        }
        // Draw the second line of text underneath the first
        if (this.msg2.length > 0) {
            ctx.fillText(this.msg2, xpos, ypos);
            ypos += fontHeight + leading;
        }
        // Draw the third line of text underneath the second
        if (this.msg3.length > 0) {
            ctx.fillText(this.msg3, xpos, ypos);
            ypos += fontHeight + leading;
        }
    }
    // . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
    // Handle click input.  The interface should be in the 'start' state,
    // in which case we respond to this input by starting a new trial
    handleClickAt(ptX, ptY) {
        if (this.visible && this.parentUI.currentState === 'start') {
            this.parentUI.configure('begin_trial');
            return true;
        }
        return false;
    }
}
// . . . . . . . . . . . .  . . . . . . . . . . . . . . . . . . . . . . 
//# sourceMappingURL=p1_skel.js.map