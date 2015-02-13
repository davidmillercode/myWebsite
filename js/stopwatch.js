/**
 * Created by D on 12/10/2014.
 */
//this will keep track of time since start button pressed
function OurClock() {
    //**STANDARD VARIABLES**
    //start at 0
    this.centiseconds=0;
    this.seconds=0;
    this.minutes=0;
    this.hours=0;
    this.clockMode = "digitalClock";
    var stopInput = []; //will hold arguments to stop setInterval/setTimeout

    //**UPDATE BROWSER CHANGES
    //shows the current seconds, minutes, and hours, on the browser
    var displayTime = (function(){
        //convert time into proper string formatting ex. 2 = "02"
        var tempCentiseconds = String(this.centiseconds),
            tempSeconds = String(this.seconds),
            tempMinutes = String(this.minutes),
            tempHours = String(this.hours);

        if (this.centiseconds < 10) {tempCentiseconds = "0" + tempCentiseconds;}
        if (this.seconds < 10) {tempSeconds = "0" + tempSeconds;}
        if (this.minutes < 10) {tempMinutes = "0" + tempMinutes;}
        if (this.hours < 10) {tempHours = "0" + tempHours;}

        //update the browser time
        document.getElementById("centiseconds").textContent = tempCentiseconds;
        document.getElementById("seconds").textContent = tempSeconds;
        document.getElementById("minutes").textContent = tempMinutes;
        document.getElementById("hours").textContent = tempHours;
    }).bind(this);


    //**STANDARD METHODS FOR STARTING/STOPPING CLOCK**
    //function that will keep hours, minutes, and seconds in proper format
    //if in stop watch mode then hours will go up until 99
    var formatTime  = (function () {
        //centisecond checker
        if(this.centiseconds === 100){
            this.centiseconds = 0;
            this.seconds += 1;
        }

        //second checker
        if (this.seconds === 60) {
            this.seconds = 0;
            this.minutes += 1;
        }
        //minute checker
        if (this.minutes === 60) {
            this.minutes = 0;
            this.hours +=1;
        }
        //hour checker
        if (this.hours === 24) {
            this.hours = 0;
        }
    }).bind(this);

    //increment time
    var addCentisecond = (function(){
        var that = this;
        stopInput[1] = setTimeout(function() {
            that.centiseconds += 1;
            formatTime();
            displayTime();
        }, 10);
    }).bind(this);

    //run clock and change button to stop button
    var runClock = (function() {
        //to make up for first centisecond delay

        addCentisecond();
        //this will start the clock after one second and the second for the first time @ 2secs then 3, 4, 5
        //
        stopInput[0]= setInterval(function() {addCentisecond();}, 10);
    });

    //stops clock
    var pauseClock = (function (){
        clearInterval(stopInput[0]);
        clearInterval(stopInput[1]);
        //now reset stopInput
        stopInput = [];
    });

    //**METHODS THAT HAVE TO DO WITH RESET**
    //reset the clock to zero time counted
    var resetClock = (function(){
        this.centiseconds = 0;
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        displayTime();
    }).bind(this);

    //**METHODS THAT INTERACT WITH USER**
    //control start/pause button action
    this.startPausePress = (function(){

        //control which function to call
        if(!stopInput[0]) { //clock will be started when stopInput[0] is undefined
            runClock();
            this.textContent = "Stop";
        } else { //clock will be paused
            pauseClock();
            this.textContent = "Start";
            document.getElementById("lap_reset").disabled = false; //enable reset button
        }
    });

    //controls reset button
    this.resetClock = (function(){
        resetClock();
        this.disabled = true;
    })
}
//create clock
var theClock = new OurClock();

//add handler for when start/stop button is pressed
document.getElementById("start_pause").onclick = theClock.startPausePress;

//add handler for when reset button is pressed
document.getElementById("lap_reset").onclick = theClock.resetClock;