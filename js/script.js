$(function() {

  $(".headerOptions").click(function(e) {
    switch (e.currentTarget.id) {

      case "headerOptionsCS":
        choosingSurvey();
        break;

      case "headerOptionsC":
        contactSurvey();
        break;
    }
  });

  $("#headerIcon").click(function() {
    choosingSurvey();
  });

  $("#surveyDownloadSettings").click(function() {
    console.log("Donwloading Function not applied yet");
  });

  $("#tallyDownloadSettings").click(function() {
    console.log("Donwloading Function not applied yet");
  });

  $("#publishButton").click(function() {
    saveSettings();
  });

  $("#dueDateAdd").click(function() {
    addDueDate();
  });

  $("#teachersAdd").click(function(){
    addTeacher();
  });

  $("#classesAdd").click(function(){
    addClass();
  });

  $("#deleteButton").click(function() {
    removeClasses();
  });

  $("#setDate").click(function() {
    setDate();
  });

  $(".dates").on("click", function(e) {
    $("#calendarPicker").datepicker();
    $(".setDateButton").css("visibility", "visible");
    var char = e.target.id
    var lastChar = char[char.length - 1];
    currentSelectedPage = parseInt(lastChar);

    activeDateToggle($(this),parseInt(lastChar));
  });

  initScreen();

});

var currentTeacher = "";
var currentClass = "";
var currentSelectedPage = -1;

function choosingSurvey() {
  closeAll();
  $(".choosing").css("display", "inline-block");
  $("#headerOptionsCS").addClass('activeHeader');
}

function contactSurvey() {
  closeAll();
  $(".contact").css("display", "inline-block");
  $("#headerOptionsC").addClass('activeHeader');
}

function closeAll() {
  $(".choosing").css("display", "none");
  $(".contact").css("display", "none");

  $("#headerOptionsC").removeClass('activeHeader');
  $("#headerOptionsCS").removeClass('activeHeader');
}

function initScreen() {
  closeAll();
  $("#content").css("width", "100%");
  $(".choosing").css("display", "inline-block");

  $.ajax({
    url: "api/getTeachers"
  }).done(function(keydata) {
    data = JSON.parse(keydata);
    populateTeachers(data);
    $("#classList").addClass("hidden");
    $("#settingsList").addClass("hidden");
  });
}

function addClass(){
  $.ajax({
    url: "api/addClass"
  }).done(function(keydata) {
    console.log("Heres a new class");
    populateClasses(currentTeacher)
  });
}

function addTeacher(){
}

function populateTeachers(keydata) {
  $("#teachers").html("");
  $("#classList").addClass("hidden");
  $("#settingsList").addClass("hidden");

  currentTeacher = "";
  currentClass = "";

  for (var i = 0; i < keydata.length; i++) {
    if (keydata[i] != "EmptyProject" && keydata[i] != "SourceFiles") {

      var button = createButton("teacherButton" + i, "teacherButton", keydata[i]);
      var teacher = keydata[i];
      linkTeacherButton(button, $("#teachers"), teacher);
      $("#teachers").append(button);

      $("#teacherButton" + i).css({
        "margin-top": "2%",
        "margin-left": "5%",
        "margin-right": "5%",
        "width": "90%"
      });


    }
  }
}

function createButton(id, classes, html) {
  var button = $("<div></div>");
  button.attr("id", id);
  button.attr("class", classes);
  button.html(html);
  return button;
}

function linkButton(button, parentEl, callback) {
  parentEl.append(button);
  button.on("click", callback);
}

function linkTeacherButton(button, parentEl, teacher) {
  parentEl.append(button);
  button.on("click", function() {
    populateClasses(teacher);
    $("#classList").removeClass("hidden");
  });
}

function linkClassButton(button, parentEl, classes, teacher) {
  parentEl.append(button);
  button.on("click", function() {
    resetSettings(classes, teacher);
    populateSettings(teacher, classes);
    $("#settingsList").removeClass("hidden");
  });
}

function populateClasses(teacher) {
  $.ajax({
    url: "api/getClasses/" + teacher
  }).done(function(keydata) {
    data = JSON.parse(keydata)
    setClassesButton(data, teacher);
  });
}

function populateSettings(teacher, classes) {
  $.ajax({
    url: "api/getSettings/" + teacher + "/" + classes
  }).done(function(keydata) {

    if (keydata == "NOPE") {
      resetSettings(classes, teacher)
    } else {
      data = JSON.parse(keydata);
      setSettings(data, classes, teacher);
    }

  });
}

function setSettings(settings, classes, teacher) {
  currentTeacher = teacher;
  currentClass = classes;

  var classInfo = classes.split("-");

  if(classInfo[0] != "Temporary"){
    $("#courseOutput").val(classInfo[0]);
    $("#courseNumberOutput").val(classInfo[1]);
    $("#courseSectionOutput").val(classInfo[2].substring(3));
  }

  loadSettings(settings);

}

function resetSettings(classes, teacher) {
  currentTeacher = teacher;
  currentClass = classes;

  $("#courseOutput").val("");
  $("#courseNumberOutput").val("");
  $("#courseSectionOutput").val("");

  $('.datesHolder').each(function() {
    $(this).remove();
  });

  for(var i = 0; i < 3;i++){
    currentSelectedPage = -1;

    var length = ($("#dueDate").children().length);
    var dateLabel = $("<div></div>");
    dateLabel.attr("class", "datesLabel");
    dateLabel.attr("id", "datesLabel" + length);
    dateLabel.html("XX/XX/XX");

    var dateSurvey = $("<div></div>");
    dateSurvey.attr("class", "datesSurvey");
    dateSurvey.attr("id", "datesSurvey" + length);
    dateSurvey.html(i+1);

    var dueDate = $("<div></div>");
    dueDate.attr("id", "dueDate" + length);
    dueDate.attr("class", "dates inactiveDueDate");
    dueDate.append(dateLabel);
    dueDate.append(dateSurvey);
    dueDate.on("click", function(e) {
      $("#calendarPicker").datepicker();
      $(".setDateButton").css("visibility", "visible");
      var char = e.target.id
      var lastChar = char[char.length - 1];
      currentSelectedPage = parseInt(lastChar);

      activeDateToggle($(this),parseInt(lastChar));
    });

    var dueDateHolder = $("<div></div>");
    dueDateHolder.attr("class", "datesHolder");
    dueDateHolder.attr("id", "datesHolder" + length);
    dueDateHolder.append(dueDate);

    $("#dueDate").append(dueDateHolder);
  }


}

function saveSettings() {
  var classes = currentClass;
  var teacher = currentTeacher;
  var savable = true;

  const settings = new Object();

  settings.teacher = teacher;
  settings.course = $("#courseOutput").val();
  settings.courseNumber = $("#courseNumberOutput").val();
  settings.courseSection = $("#courseSectionOutput").val();
  settings.dates = [];


  $('.dates').each(function() {
    if ($(this).children(".datesLabel").html() == "XX/XX/XX") {
      savable = false;
    } else {
      settings.dates.push($(this).children(".datesLabel").html());
    }
  });

    for(var i = 1; i < settings.dates.length; i++){
      if(Date.parse(settings.dates[i]) < Date.parse(settings.dates[i-1])){
        savable = false;
      }
    }

  if (savable) {
    var getUrl = "api/setSettings/" + teacher + "/" + classes;

    $.ajax({
      type: "post",
      url: getUrl,
      cache: false,
      data: JSON.stringify(settings),
      dataType: "json"
    }).done(function(questionData) {

      console.log(questionData, settings);
      populateClasses(currentTeacher);
    });
  }else{
    console.log("Couldn't save!")
  }
}

function loadSettings(settings) {
  var classes = currentClass;
  var teacher = currentTeacher;

  console.log(settings);

  $("#courseOutput").val(settings.course);
  $("#courseNumberOutput").val(settings.courseNumber);
  $("#courseSectionOutput").val(settings.courseSection);

  for(var i = 0;i < (settings.dates.length-3);i++){
    addDueDate();
  }

  var i = 0;
  $('.dates').each(function() {
    $(this).children(".datesLabel").html(settings.dates[i]);
    i++;
  });
}

function removeClasses() {
  console.log("NO NO NO! NO DELETE FOR YOU!");
}

function addDueDate() {
  $("#dueDate").children().last().remove();
  currentSelectedPage = -1;

  var length = ($("#dueDate").children().length - 2);
  var dateLabel = $("<div></div>");
  dateLabel.attr("class", "datesLabel");
  dateLabel.attr("id", "datesLabel" + length);
  dateLabel.html("XX/XX/XX");

  var dateSurvey = $("<div></div>");
  dateSurvey.attr("class", "datesSurvey");
  dateSurvey.attr("id", "datesSurvey" + length);
  dateSurvey.html(2);

  var dueDate = $("<div></div>");
  dueDate.attr("id", "dueDate" + length);
  dueDate.attr("class", "dates inactiveDueDate");
  dueDate.append(dateLabel);
  dueDate.append(dateSurvey);
  dueDate.on("click", function(e) {
    $("#calendarPicker").datepicker();
    $(".setDateButton").css("visibility", "visible");
    currentSelectedPage = length;
    activeDateToggle($(this),length);
  });

  var dueDateDelete = $("<div></div>");
  dueDateDelete.attr("class", "datesDelete");
  dueDateDelete.attr("id", "datesDelete" + length);
  dueDateDelete.html("-");
  dueDateDelete.on("click", function(e) {
    e.target.parentNode.remove()
  });

  var dueDateHolder = $("<div></div>");
  dueDateHolder.attr("class", "datesHolder");
  dueDateHolder.attr("id", "datesHolder" + length);
  dueDateHolder.append(dueDate);
  dueDateHolder.append(dueDateDelete);

  $("#dueDate").append(dueDateHolder);

  var length3 = ($("#dueDate").children().length - 2);
  var dateLabel3 = $("<div></div>");
  dateLabel3.attr("class", "datesLabel");
  dateLabel3.attr("id", "datesLabel" + length3);
  dateLabel3.html("XX/XX/XX");

  var dateSurvey3 = $("<div></div>");
  dateSurvey3.attr("class", "datesSurvey");
  dateSurvey3.attr("id", "datesSurvey" + length3);
  dateSurvey3.html(3);

  var dueDate3 = $("<div></div>");
  dueDate3.attr("id", "dueDate" + length3);
  dueDate3.attr("class", "dates inactiveDueDate");
  dueDate3.on("click", function(e) {
    $("#calendarPicker").datepicker();
    $(".setDateButton").css("visibility", "visible");
    currentSelectedPage = length3;
    activeDateToggle($(this),length3);
  });
  dueDate3.append(dateLabel3);
  dueDate3.append(dateSurvey3);

  var dueDateHolder3 = $("<div></div>");
  dueDateHolder3.attr("class", "datesHolder");
  dueDateHolder3.attr("id", "datesHolder" + length3);
  dueDateHolder3.append(dueDate3);

  $("#dueDate").append(dueDateHolder3);
}

function activeDateToggle(date,length){
  $('.activeDueDate').each(function() {
    $(this).removeClass("activeDueDate");
    $(this).addClass("inactiveDueDate");
  });
    date.removeClass("inactiveDueDate");
    date.addClass("activeDueDate");
    console.log(length);
}

function setDate() {
  var day = $(".ui-state-active").html();
  var month = $(".ui-datepicker-month").html();
  var year = $(".ui-datepicker-year").html();

  if (day.length == 1) {
    day = "0" + day;
  }

  switch (month) {
    case "December":
      month = 12;
      break;

    case "November":
      month = 11;
      break;

    case "October":
      month = 10;
      break;

    case "September":
      month = 09;
      break;

    case "August":
      month = 08;
      break;

    case "July":
      month = 07;
      break;

    case "June":
      month = 06;
      break;

    case "May":
      month = 05;
      break;

    case "April":
      month = 04;
      break;

    case "March":
      month = 03;
      break;

    case "February":
      month = 02;
      break;

    case "January":
      month = 01;
      break;
  }

  year = year[year.length - 2] + year[year.length - 1];

  $("#datesLabel" + currentSelectedPage).html(month + "/" + day + "/" + year);
  console.log(month + "/" + day + "/" + year);
}

function removeDueDate() {
  if (($("#dueDate").children().length - 2) > 3) {
    console.log("Remove");
  } else {
    console.log("No remove");
  }
}

function setClassesButton(data, teacher) {
  $("#classes").html("");
  $("#settingsList").addClass("hidden");

  currentTeacher = teacher;
  currentClass = "";
  currentSelectedPage = -1;
  for (var i = 0; i < data.length; i++) {
    var button = createButton("classButton" + i, "classButton", data[i]);
    var classes = data[i];
    linkClassButton(button, $("#classes"), classes, teacher);

    $("#classButton" + i).css({
      "margin-top": "2%",
      "margin-left": "5%",
      "margin-right": "5%",
      "width": "90%"
    });

  }
}
