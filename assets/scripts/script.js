
      let timeEl;
      let timeBarEl;
      const events = [];


      $(document).ready(function(){

          $("#dayOfTheWeek").text(moment().format("dddd"));
          
          $("#date").text(moment().format("MMMM Do, YYYY"));
          
          addPlannerRows();

          renderTimeIndicator();

          populateTimeDropwdowns();

          window.setInterval(function(){

            var s = moment().format("s");

            printTime();

            setTimeIndicatorTop();

            updateEvents();

            },1000);

      });


      $("#startTime").change(function(){

        const idx = this.selectedIndex;

        $("#endTime").prop("selectedIndex",idx);

      });


      $("#addEvent").click(function(){

          const eventName = $("#eventName").val();

          const startMoment = moment($("#startTime").val(),'LT');

          const endMoment = moment($("#endTime").val(),'LT');

          Event.isConflict(startMoment,endMoment,null);

          events.push(new Event(eventName, startMoment, endMoment));
      });


      function renderTimeIndicator(){

        timeBarEl = $("<div>").addClass("position-absolute time-bar");
        
        timeEl = $("<div>").addClass("position-absolute time");

        timeBarEl.append(timeEl);

        const bodyEl = $("body");

        setTimeIndicatorTop();

        bodyEl.append(timeBarEl);
      }


      function setTimeIndicatorTop(){

        const firstRow = $(".row:first");

        const firstRowTop = firstRow.position().top;

        const rowHeight = firstRow.outerHeight();

        const barTop = firstRowTop + getTimeInHours() * rowHeight;

        timeBarEl.css({top: barTop + "px"});
      }


      function printTime(){

        timeEl.text(moment().format("LT"));
      }


      function populateTimeDropwdowns(){

        const startTimeEl = $("#startTime");
        
        const endTimeEl = $("#endTime");

        for (i = 0; i < 49; i++){
    
          let time = moment("0:00","h:mm").add(i*30,'minutes').format("LT");

          if(i < 48) {
            let startTimeOption = $("<option>").text(time);

            startTimeEl.append(startTimeOption);
          }

          if(i > 0) {
            let endTimeOption = $("<option>").text(time);

            endTimeEl.append(endTimeOption);
          }
        }

        startTimeEl.prop("selectedIndex",18);

        endTimeEl.prop("selectedIndex",18);

      }


      function addPlannerRows(){

        const schedule = $(".schedule");

        for(i = 0; i <= 24; i++){

          schedule.append(drawHourRow(i));

        }
      }

      function drawHourRow(hour) {

        const row = $("<div>").addClass("row");

        const infoCol = $("<div>").addClass("col-md-2 hour").text(moment(hour + ":00","H:mm").format("LT"));

        const bodyCol = $("<div>").addClass("col-md-10 body-col").attr("id",`hour-${hour}`,);

        row.append(infoCol)

        row.append(bodyCol);

        return row;
      }


      function getTimeInHours() {

        const timeInHours = moment().hours() + moment().minutes()/60;

        return timeInHours;
      }


      function updateEvents(){

        events.forEach(event => {

          const eventStartTime = moment(event.startTime,"LT");

          const currentTime = moment();

          const isPastEvent = moment(currentTime).isAfter(eventStartTime);

        if(!event.eventEl.hasClass("past-event") &&  isPastEvent){

          event.eventEl.addClass("past-event");

        } 
      }); 
    }

    class Event{
      constructor (name, startMoment, endMoment){
        this.name = name;
        
        this.startMoment = startMoment;

        this.endMoment = endMoment;

        console.log(startMoment, endMoment);

        this.eventEl = Event.renderEvent(this);
      }

      static renderEvent(event){

        const startTimeInHours = Event.getTimeInFractionalHours(event.startMoment);

        const firstRow = $(".row:first");

        const firstRowTop = firstRow.position().top;

        const rowHeight = firstRow.outerHeight();

        const durationInHours = moment(event.endMoment).subtract(event.startMoment).minutes() / 60;

        const top = firstRowTop + startTimeInHours * rowHeight;

        const eventEl = $("<div>").addClass("event position-absolute");

        eventEl.css({"top" : top + "px", "height" : durationInHours * rowHeight + "px"});
          
        const nameEl = $("<h5>").addClass("event-text").text(name);
        
        eventEl.append(nameEl);

        $(".schedule").append(eventEl);

        return eventEl;

      }

      static getTimeInFractionalHours(startMoment){

        const startHour = moment(startMoment).format("H");

        const startHalfHours = moment(startMoment).format("m") === "30" ? 0.5 : 0;

        return parseInt(startHour) + parseFloat(startHalfHours);
      }


      static isConflict(testStartTime, testEndMoment, existingEvent){

        const testStartMoment = moment(testStartTime,'LT');

        testEndMoment = moment(moment(testStartMoment).clone().add(testDuration));

        //console.log(testStartMoment, testDuration, testEndMoment);


      }
    }
