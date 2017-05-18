$(function() {
  // A pool of 20 cities I've selected for a random generator
  var cities = [
    "New York, NY",
    "Chicago, IL",
    "Philadelphia, PA",
    "San Antonio, TX",
    "Phoenix, AZ",
    "Seattle, WA",
    "San Francisco, CA",
    "Denver, CO",
    "Orlando, FL",
    "Honolulu, HI",
    "Quebec, CA",
    "London, GB",
    "Cairo, EG",
    "Moscow, RU",
    "Lisbon, PT",
    "Glasgow, GB",
    "Bern, CH",
    "Helsinki, FI",
    "Riyadh, SA",
    "Sydney, AU",
  ];

  // The city being displayed currently. Picks a random city as a default
  var city = cities[Math.floor(Math.random() * 20)];

  // The current temperature scale being used. Defaults to Fahrenheit
  var tempScale = "imperial"

  // Part of the URL of the current city's JSON data. Initially, it's set to a randomized city.
  // Uses the API Key set up in config.js
  var cityUrlInfo = city + "&units=" + tempScale + "&appid=" + config.API_Key

  // The CSS color scheme currently being used, with day mode as the default
  var colorMode = "day"

  // Compiles both of my Handlebars templates.
  updateCurrent();
  updateForecast();

  // Changes the displayed temperature scale depending on which button is clicked.
  $(".tempChange").click(function() {
    var buttonId = $(this).attr('id');
    if (buttonId === "kelvin") {
      tempScale = "kelvin"
      var display = "&deg;K"
    };

    if (buttonId === "celsius") {
      tempScale = "metric"
      var display = "&deg;C"
    };

    if (buttonId === "fahrenheit") {
      tempScale = "imperial"
      var display = "&deg;F"
    };

    cityUrlInfo = city + "&units=" + tempScale + "&appid=" + config.API_Key
    updateCurrent();
    updateForecast();
  });


  // Displays a different city's information depending on what is submitted into the form.
  // preventDefault() stops the page from reloading.

  $("#citySearch").submit(function(e) {
    e.preventDefault();
    var searchInfo = $(this).serialize();
    city = searchInfo.slice(6);

    cityUrlInfo = city + "&units=" + tempScale + "&appid=" + config.API_Key
    updateCurrent();
    updateForecast();
  });

  // Execute these 2 functions to refresh both templates whenever the weather information needs to be updated.
  function updateCurrent(){
    // Resets the color scheme to day mode to make sure the template and background colors are consistent
    if (colorMode === "night") {
      $(".colorChanged").removeClass("nightMode");
      colorMode = "day";
    }

    var template = $("#current-template").html();
    var templateScript = Handlebars.compile(template);


    $.getJSON("http://api.openweathermap.org/data/2.5/weather?q=" + cityUrlInfo, function(data){
      var compiledTemplate = templateScript(data);
      $('#currentWeather').html(compiledTemplate);
    });
  }

  function updateForecast(){
    var template = $("#forecast-template").html();
    var templateScript = Handlebars.compile(template);

    $.getJSON("http://api.openweathermap.org/data/2.5/forecast?q=" + cityUrlInfo, function(data){
      // Filters the JSON for every 8th 3 hour forecast, for a daily forecast instead (3*8 for 24 hours).
      for (var i=0; i<data.list.length; i++) {
        // Filters out the 1st forecast, which is for the current date.
        var listIndex = i-1
        if (listIndex%8 === 0) {
          // Converts the date from UTC to a MM/DD format.
          var forecastDate = new Date(data.list[i].dt_txt.slice(0, 10));
          var month = forecastDate.getMonth() + 1;
          var date = forecastDate.getDate() + 1;
          var forecastDateDisplay = month + "/" + date;

          data.list[i].dt_txt = forecastDateDisplay;
        }

        else {
          // Removes the 3 hour forecasts I don't need from the JSON.
          delete data.list[i];
        }
      }

      var compiledTemplate = templateScript(data);
      $('#5DayForecast').html(compiledTemplate);
    });
  }

  // A custom Handlebars helper that filters through the 3-hour forecast data for each individual day.
//   Handlebars.registerHelper('ifEighth', function(index, options) {
//     if(index%8 == 0) {
//       return options.fn(this);
//     }
//   });

  // Displays some information about the app when the About button is clicked.
  $("#about").click(function() {
    alert("Up to date weather information and forecasts by OpenWeatherMap.\nCreated with Javascript.");
  });

  // Swaps the CSS between normal and night modes when that switch is clicked.
  $("#modeiconContainer").click(function() {
    $(".colorChanged").toggleClass("nightMode");

    if (colorMode === "day") {
      colorMode = "night";
    }

    else {
      colorMode = "day";
    }
  });

});
