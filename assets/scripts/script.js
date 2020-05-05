
      let timeEl;
      let timeBarEl;
      const events = [];


      $(document).ready(function(){

          $("#dayOfTheWeek").text(moment().format("dddd"));
          
          $("#date").text(moment().format("MMMM Do, YYYY"));
          
          addPlannerRows();

          renderTimeIndicator();

          populateStartTimeDropwdown();

          window.setInterval(function(){

            var s = moment().format("s");

            printTime();

            setTimeIndicatorTop();

            updateEvents();

            },1000);

      });


      $("#startTime").change(function(){

        const idx = this.selectedIndex;

        populateEndTimeDropDown(idx);

      });


      $("#dismiss").click(function(){

        $("#eventName").val("");

      });

      $("#addEvent").click(function(){

          const eventName = $("#eventName").val();

          const startMoment = moment($("#startTime").val(),'LT');

          const endMoment = moment($("#endTime").val(),'LT');

          if(!checkTimeConficts(startMoment, endMoment, events)){



            events.push(new Event(eventName, startMoment, endMoment));
            
          }

        // Reset form
        $("#startTime").selectedIndex = 0;
        $("#eventName").val("");

      });

      // Draw current time along with horizontal bar
      function renderTimeIndicator(){

        timeBarEl = $("<div>").addClass("position-absolute time-bar");
        
        timeEl = $("<div>").addClass("position-absolute time");

        timeBarEl.append(timeEl);

        const bodyEl = $("body");

        setTimeIndicatorTop();

        bodyEl.append(timeBarEl);
      }

      // Set top of time inticator to correct location, relative to schedule hour row elements
      function setTimeIndicatorTop(){

        const firstRow = $(".row:first");

        const firstRowTop = firstRow.position().top;

        const rowHeight = firstRow.outerHeight();

        const barTop = firstRowTop + getTimeInHours() * rowHeight;

        timeBarEl.css({top: barTop + "px"});
      }

      // set tet of timeEl to current time
      function printTime(){

        timeEl.text(moment().format("LT"));
      }

      // Populate start time dropdown options
      function populateStartTimeDropwdown(){

        const startTimeEl = $("#startTime");

        for (i = 0; i < 49; i++){
    
          let time = moment("0:00","h:mm").add(i*30,'minutes').format("LT");

          if(i < 48) {
            let startTimeOption = $("<option>").text(time);

            startTimeEl.append(startTimeOption);
          }
        }

        startTimeEl.prop("selectedIndex",18);

        populateEndTimeDropDown(18);
        
      }

      // Populate end time dropdown options
      function populateEndTimeDropDown(startHour){

        const endTimeEl = $("#endTime");

        endTimeEl.empty();

        for(i = startHour + 1; i < 48; i++){

          let time = moment("0:00","h:mm").add(i*30,'minutes').format("LT");

          if(i < 48) {
            let endTimeOption = $("<option>").text(time);

            endTimeEl.append(endTimeOption);
          }
        }
      }

      // Add rows to planner for each hour of the day
      function addPlannerRows(){

        const schedule = $(".schedule");

        for(i = 0; i <= 24; i++){

          schedule.append(drawHourRow(i));
        }
      }

      // Render row for a given hour in the schedule
      function drawHourRow(hour) {

        const row = $("<div>").addClass("row");

        const infoCol = $("<div>").addClass("col-md-2 hour").text(moment(hour + ":00","H:mm").format("LT"));

        const bodyCol = $("<div>").addClass("col-md-10 body-col").attr("id",`hour-${hour}`,);

        row.append(infoCol);

        row.append(bodyCol);

        return row;
      }

      // Get Current time in fractional hours
      function getTimeInHours() {

        const timeInHours = moment().hours() + moment().minutes()/60;

        return timeInHours;
      }

      // Add "past-event" class to event elements when the current time exceedds its start time
      function updateEvents(){

        events.forEach(event => {

          const eventStartTime = moment(event.startMoment,"LT");

          const isPastEvent = moment().isAfter(eventStartTime);

          if(!event.eventEl.hasClass("past-event") &&  isPastEvent){

            event.eventEl.addClass("past-event");
        } 
      }); 
    }

    // Event class
    class Event{
      constructor (name, startMoment, endMoment){
        
        this.name = name;
        
        this.startMoment = startMoment;

        this.endMoment = endMoment;

        this.eventEl = Event.renderEvent(this);
      }

      // render the event and return its new DOM element
      static renderEvent(event){

        const startTimeInHours = Event.getTimeInFractionalHours(event.startMoment);

        const firstRow = $(".row:first");

        const firstRowTop = firstRow.position().top;

        const rowHeight = firstRow.outerHeight();

        const durationInHours = moment(event.endMoment).diff(event.startMoment, "minutes") / 60;

        const top = firstRowTop + startTimeInHours * rowHeight;

        const eventEl = $("<div>").addClass("event position-absolute");

        eventEl.css({"top" : top + "px", "height" : durationInHours * rowHeight + "px"});
          
        const nameEl = $("<h5>").addClass("event-text").text(event.name);
        
        eventEl.append(nameEl);

        $(".schedule").append(eventEl);

        return eventEl;

      }
    
      // Convert a time to fractional hours (eg (9:30 = 9.5 hours))
      static getTimeInFractionalHours(inputMoment){

        const hour = moment(inputMoment).format("H");

        const halfHours = moment(inputMoment).format("m") === "30" ? 0.5 : 0;

        const fractionalHourTime = parseInt(hour) + parseFloat(halfHours);

        return fractionalHourTime;
      }
    }

      // check if a potential event's start and end times would create a conflict
      // with any existing events
      function checkTimeConficts(testStartMoment, testEndMoment,existingEvents){

        existingEvents.forEach((existingEvent => {

          if(isTimeConflict(testStartMoment, testEndMoment, existingEvent))
            return true;

        }));

        return false;
      }

      // check if a potential event's start and end times would create a conflict
      // with a single existing event
      function isTimeConflict(testStartMoment, testEndMoment, existingEvent){

        if(testEndMoment.isSameOrBefore(existingEvent.startMoment) || 
          existingEvent.endMoment.isSameOrBefore(testStartMoment)){

            return false;
        }

        return true;
      }