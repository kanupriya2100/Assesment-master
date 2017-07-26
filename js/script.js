var quizQuestions = [];

$(function() {

  var quizQuestionIndex = 0;
  var studentInfo = [];
  var userInfo = [];
  var netId;

  if (location.hash) {
    quizQuestionIndex = location.hash.split("#")[1];
  }

  $.ajaxSetup({
    cache: false
  });

  $.ajax({
    url: "api/getUser"
  }).done(function(keydata) {

    studentInfo = organizeKey(keydata);
    netId = studentInfo[2];

    $.getJSON("json/SurveyQuestions.json", function(data) {
      testData = data;
      loadTestData(testData, studentInfo, quizQuestionIndex, netId);
    }).fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log("Request Failed: " + err);
    });;

  });


  $("#prevButton").click(function() {
    quizQuestionIndex = setQuestionIndex(-1, quizQuestionIndex);
    loadAnswer(quizQuestionIndex, studentInfo);
  });

  $("#nextButton").click(function() {
    quizQuestionIndex = setQuestionIndex(1, quizQuestionIndex);
    loadAnswer(quizQuestionIndex, studentInfo);
  });

  $("#fillOutput").on("input", function() {
    updateTextBar(quizQuestionIndex);
  });

  $(".hamburger").click(function() {
    $("#settingsScreen").addClass("settingsActive");
    $(".hamburger").css("display", "none");
    $(".settingsCross").css("display", "block");
  });

  $(".settingsCross").click(function() {
    $("#settingsScreen").removeClass("settingsActive");
    $(".settingsCross").css("display", "none");
    $(".hamburger").css("display", "block");
  });

  $(".userCross").click(function() {
    $("#userSettingsScreen").removeClass("userSettingsOverlayShow");
    saveUserSettings(studentInfo, netId);
  });

  $("#wipeButton").click(function() {
    $("#cleardataModal").css("display", "block");
  });

  $("#exitButton").click(function() {
    $("#cleardataModal").css("display", "none");
  });

  $("#eraseButton").click(function() {
    WIPE(netId);
  });

  $("#userButton").click(function() {

    $("#userSettingsScreen").addClass("userSettingsOverlayShow");
    $(".settingsCross").click();

  });

  $("#sliderOutput").mousemove(function() {
    $("#valueShower").html(sliderOutput.value + "% ");
  });

  $("#settingsScreen").mouseleave(function() {
    $(".settingsCross").click();
  });

  $(".button").click(function() {
    submitAnswer(quizQuestionIndex, event.currentTarget.id, studentInfo);
  });

  $("#questionsText").click(function(e) {
    showHover(quizQuestionIndex, e);
  });

  $("#questionsText").mouseover(function(e) {
    showHover(quizQuestionIndex, e);
  });

  $("#questionsText").mousemove(function(e) {
    showHover(quizQuestionIndex, e);
  });

  $("#questionsText").mouseout(function() {
    $("#hoverText").css("display", "none");
  });

  $(document).keydown(function(e) {
    keyHandler(quizQuestionIndex, e);
  });

  $(".pageContents").on('mousewheel', function(event) {
    if (event.originalEvent.wheelDelta >= 0) {
      $("#prevButton").click();
    } else {
      $("#nextButton").click();
    }
  });

});

function keyHandler(quizQuestionIndex, e) {

  var pass = $("#settingsScreen").hasClass("settingsActive") || $("#userSettingsScreen").hasClass("userSettingsOverlayShow");

  if (pass == false) {
    switch (e.which) {

      case 37: //Left
        var currentQuestion = quizQuestions[quizQuestionIndex];

        switch (currentQuestion.type) {

          case "slider":
            var x = $("#sliderOutput").val();
            x -= 1;
            $("#sliderOutput").val(x * 1);
            $("#valueShower").html(sliderOutput.value + "% ");
            break;

          case "intfill":
            var x = $("#intfillOutput").val();
            if (x > 0) {
              x -= 1;
            }
            $("#intfillOutput").val(x * 1);
            break;
        }
        break;

      case 38: // up
        $("#prevButton").click();
        break;

      case 39: //Right

        var currentQuestion = quizQuestions[quizQuestionIndex];

        switch (currentQuestion.type) {

          case "slider":
            var x = $("#sliderOutput").val();
            x -= -1;
            $("#sliderOutput").val(x * 1);
            $("#valueShower").html(sliderOutput.value + "% ");
            break;

          case "intfill":
            var x = $("#intfillOutput").val();
            x -= -1;
            $("#intfillOutput").val(x * 1);
            break;
        }

        break;

      case 40: // down
        $("#nextButton").click();
        break;

      case 13: //enter

        var currentQuestion = quizQuestions[quizQuestionIndex];

        switch (currentQuestion.type) {
          case "ok":
            $("#answermc0").click();
            break;
          case "fill":
            $("#fillButton").click();
            break;
          case "intfill":
            $("#intfillButton").click();
            break;
          case "slider":
            $("#sliderButton").click();
            break;
        }
        break;

      default:
        return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
  }
}

function clearFields() {
  $("#questionsHeaderText").html("Question");
  $("#questionsText").empty();

  $("#answermc").addClass("hide");
  $("#answermc").removeClass("flex");
  $("#answerslider").addClass("hide");
  $("#answerfill").addClass("hide");
  $("#answerintfill").addClass("hide");
  $("#answerlist").addClass("hide");

  $("#answermc").empty();
  $("#hoverText").empty();
  $("#listOutputOptions").empty();

  $("#fillOutput").val("");
  $("#intfillOutput").val("0");
  $("#sliderOutput").val("50");
  $("#listOutputTitle").html("[Select Answer]");

  $(".completedQuestion").css("visibility", "hidden");
  $("#sliderButton").removeClass("completeButton");
  $("#intfillButton").removeClass("completeButton");
  $("#fillButton").removeClass("completeButton");
  $("#listButton").removeClass("completeButton");
  $("#dropdownButton").removeClass("dropdownCompleted");
  $("#answermc").removeClass("completeButton");
  $("#questionsHeaderText").removeClass("completeHeader");

}

function createButton(id, classes, html) {
  var button = $("<div></div>");
  button.attr("id", id);
  button.attr("class", classes);
  button.html("<span>" + html + "</span>");
  // button.html(html);
  return button;
}

function clearFollowups(quizQuestionIndex) {

  var i = quizQuestionIndex + 1;

  do {

    if (quizQuestions[i]) {
      quizQuestions.splice(i, 1);
    }

  } while (quizQuestions[i].followupPart == true);
}

function initQuizQuestions(qd) {
  var question = new setQuizQuestions(qd);
  quizQuestions.push(question);
}

function linkButton(button, parentEl, callback) {
  parentEl.append(button);
  button.on("click", callback);
}

function loadTestData(td, studentInfo, quizQuestionIndex, netId) {

  for (var i = 0; i < td.questions.length; i++) {
    initQuizQuestions(td.questions[i]);
  }

  loadUserSettings(studentInfo, quizQuestionIndex, netId);
  loadAnswer(quizQuestionIndex, studentInfo);

}

function loadAnswer(quizQuestionIndex, studentInfo) {

  var id = quizQuestions[quizQuestionIndex].questionId;
  var studentId = studentInfo[2];
  var getUrl = "api/getQuestion/" + studentId + "/" + id;

  $.ajax({
    type: "post",
    url: getUrl,
    cache: false,
    data: JSON.stringify(quizQuestions[quizQuestionIndex]),
    dataType: "json"
  }).done(function(questionData) {

    quizQuestions[quizQuestionIndex] = questionData;
    setQuestion(quizQuestionIndex, studentInfo);

  });

}

function mcFillTransition(quizQuestionIndex, id) {
  var id = id.slice(8);

  $("#answermc").addClass("hide");
  $("#answermc").empty();
  $("#answerfill").removeClass("hide");

  quizQuestions[quizQuestionIndex].mcMultiAnswer = id;
}

function setButtons(currentQuestion, quizQuestionIndex, studentInfo) {

  var choices = currentQuestion.choices;

  if (currentQuestion.type == "ok" || currentQuestion.choices.length == 1) {

    if (currentQuestion.type == "ok") {

      var button = createButton("mcButton0", "button answerButton", "OK");

      linkButton(button, $("#answermc"), function() {
        submitAnswer(quizQuestionIndex, event.currentTarget.id, studentInfo);
      });
      $("#mcButton" + 0).css("font-size", "2rem");

    } else if (currentQuestion.type == "mcfill") {

      var button = createButton("mcButton0", "button answerButton", choices[0]);

      linkButton(button, $("#answermc"), function() {
        mcFillTransition(quizQuestionIndex, event.currentTarget.id);
      });

    } else {

      var button = createButton("mcButton0", "button answerButton", choices[0]);

      linkButton(button, $("#answermc"), function() {
        submitAnswer(quizQuestionIndex, event.currentTarget.id, studentInfo);
      });
    }

    $("#mcButton" + 0).css({
      "margin-top": "2%",
      "margin-left": "25%",
      "margin-right": "25%",
      "width": "50%"
    });

  } else {
    var incrementForSizing = (1 / choices.length) * 100 * 0.7;
    var incrementForPlacing = (1 / choices.length) * 100 * 0.07;

    for (var i = 0; i < choices.length; i++) {
      var button = createButton("mcButton" + i, "button answerButton", choices[i]);

      if (currentQuestion.type == "mcfill") {
        linkButton(button, $("#answermc"), function() {
          mcFillTransition(quizQuestionIndex, event.currentTarget.id);
        });
      } else {
        linkButton(button, $("#answermc"), function() {
          submitAnswer(quizQuestionIndex, event.currentTarget.id, studentInfo);
        });
      }


      $("#mcButton" + i).css({
        "margin-top": "2%",
        "margin-left": incrementForPlacing + "%",
        "margin-right": incrementForPlacing + "%",
        "width": incrementForSizing + "%"
      });

    }
  }
}

function showCompleted(currentQuestion) {

  var answer = currentQuestion.answer;
  var buttonPressed = "#mcButton" + answer;

  $("#questionsHeaderText").html("Question (Complete)");
  $(".completedQuestion").css("visibility", "visible");
  $("#questionsHeaderText").addClass("completeHeader");

  switch (currentQuestion.type) {
    case "ok":
      $(buttonPressed).addClass("completeButton");
      break;
    case "mc":
      $(buttonPressed).addClass("completeButton");
      break;
    case "mcfill":
      buttonPressed = "#mcButton" + currentQuestion.answer[0];
      $(buttonPressed).addClass("completeButton");
      $("#fillOutput").val(currentQuestion.answer[1]);
      $("#fillButton").addClass("completeButton");
      break;
    case "fill":
      $("#fillOutput").val(answer);
      $("#fillButton").addClass("completeButton");
      break;
    case "intfill":
      $("#intfillOutput").val(answer);
      $("#intfillButton").addClass("completeButton");
      break;
    case "slider":
      $("#sliderOutput").val(answer);
      $("#valueShower").html(sliderOutput.value + "%");
      $("#sliderButton").addClass("completeButton");
      break;
    case "list":
      $("#listOutputTitle").html(answer);
      $("#listButton").addClass("completeButton");
      $("#dropdownButton").addClass("dropdownCompleted");
      break;

  }

}

function setCompleted(quizQuestionIndex, answer, studentInfo) {
  var selectedQuestion = quizQuestions[quizQuestionIndex];

  selectedQuestion.complete = true;
  selectedQuestion.answer = answer;

  var id = quizQuestions[quizQuestionIndex].questionId;
  var studentId = studentInfo[2];

  $.ajax({
    type: "post",
    url: "api/setQuestion/" + studentId + "/" + id,
    data: JSON.stringify(selectedQuestion),
    dataType: "json"
  }).done(function(questionData) {

    $("#nextButton").click();

  });
}

function setUserSettings(studentInfo, userdata) {

  if (userdata !== "N/A") {
    $("#firstNameOutput").empty();
    $("#lastNameOutput").empty();
    $("#userEmailAddress").empty();

    $("#firstNameOutput").val(userdata.firstName);
    $("#lastNameOutput").val(userdata.lastName);

    for (var i = 0; i < userdata.major.length; i++) {
      console.log(i,userdata.major[i]);
      $("#majorOptionInfo").selectivity('add', {
        id: i,
        text: userdata.major[i]
      });
    }
    for (var i = 0; i < userdata.minor.length; i++) {
      $("#minorOptionInfo").selectivity('add', {
        id: i,
        text: userdata.minor[i]
      });
    }


    $("#birthdayTitle").html(userdata.birthday);
    $("#userEmailAddress").val(userdata.emailAddress);

    if (userdata.consentOption == true) {
      $("#consentOptionCheckbox").prop("checked", true);
    } else {
      $("#consestOptionCheckbox").prop("checked", false);
    }

    if (userdata.emailResponses == true) {
      $("#emailResponsesSwitch").prop("checked", true);
    } else {
      $("#emailResponsesSwitch").prop("checked", false);
    }

    if (userdata.emailReminders == true) {
      $("#emailRemindersSwitch").prop("checked", true);
    } else {
      $("#emailRemindersSwitch").prop("checked", false);
    }

  } else {

    $("#firstNameOutput").empty();
    $("#lastNameOutput").empty();
    $("#userEmailAddress").empty();

    $("#firstNameOutput").val(studentInfo[0]);
    $("#lastNameOutput").val(studentInfo[1]);
    $("#userEmailAddress").val(studentInfo[3]);

  }

}

function saveUserSettings(studentInfo, netId) {
  var userdata = {};

  userdata.firstName = studentInfo[0]; // $("#firstNameOutput").val();
  userdata.lastName = studentInfo[1]; //$("#lastNameOutput").val();

  var major = $("#majorOptionInfo").selectivity('data');
  var minor = $("#minorOptionInfo").selectivity('data');

  for (var i = 0; i < major.length; i++) {
    major[i] = major[i].text;
  }

  for (var i = 0; i < minor.length; i++) {
    minor[i] = minor[i].text;
  }

  userdata.major = major;
  userdata.minor = minor;

  userdata.birthday = $("#birthdayTitle").html();
  userdata.emailAddress = studentInfo[3]; //$("#userEmailAddress").val();

  if ($("#consentOptionCheckbox").prop("checked")) {
    userdata.consentOption = true;
  } else {
    userdata.consentOption = false;
  }

  if ($("#emailResponsesSwitch").prop("checked")) {
    userdata.emailResponses = true;
  } else {
    userdata.emailResponses = false;
  }

  if ($("#emailRemindersSwitch").prop("checked")) {
    userdata.emailReminders = true;
  } else {
    userdata.emailReminders = false;
  }

  $.ajax({
    type: "post",
    url: "api/setUserPreferences/" + netId,
    data: JSON.stringify(userdata),
    dataType: "json"
  }).done(function(questionData) {

    console.log(questionData);

  });

}

function loadUserSettings(studentInfo, quizQuestionIndex, netId) {

  $.getJSON("json/majors.json", function(data) {

    buttonData = data;

    setUserButtonsData(buttonData, studentInfo, quizQuestionIndex);

  }).done(function() {

    $.ajax({
      url: "api/getUserPreferences/" + netId,
      dataType: "json",
      cache: false
    }).done(function(userdata) {

      setUserSettings(studentInfo, userdata);

    }).fail(function() {

      setUserSettings(studentInfo, "N/A");

    });

  });;
}

function setUserButtonsData(buttonData, studentInfo, quizQuestionIndex) {

  var majorData = buttonData.majors;
  var minorData = buttonData.minors;
  var birthdayData = [];

  var birthdayOptions = "";

  $('#majorOptionInfo').selectivity({
    items: majorData,
    multiple: true,
    placeholder: 'Type to search a major'
  });

  $('#minorOptionInfo').selectivity({
    items: minorData,
    multiple: true,
    placeholder: 'Type to search a minor'
  });

  for (var i = 0; i < 200; i++) {
    birthdayData.push(new Date().getFullYear() - i);
  }

  $('#birthdayOptionInfo').selectivity({
    items: birthdayData,
    multiple: false,
    placeholder: 'Type to select a year'
  });

}

function setFollowups(currentQuestion, choice, quizQuestionIndex) {
  var needsFollowup = false;
  var needsToBePushed = 0;

  for (var i = 0; i < currentQuestion.followups.length; i++) {

    var questionFollowups = [];
    questionFollowups = currentQuestion.followups[i].dependant;

    for (var k = 0; k < questionFollowups.length; k++) {
      if (questionFollowups[k] == choice) {

        // currentQuestion.followups[i].questionId = quizQuestions[quizQuestionIndex].questionId + "_" + currentQuestion.followups[i].questionId;

        needsToBePushed++;

        quizQuestions.splice(quizQuestionIndex + needsToBePushed, 0, currentQuestion.followups[i]);
        break;
      }
    }
  }
}

function setHover(hoverText) {
  $("#hoverText").html("<span>" + hoverText + "</span>");
}

function showHover(quizQuestionIndex, e) {
  if (quizQuestions[quizQuestionIndex].hover != false && e.pageX > ($('body').width() / 2) + (($('body').width() * 0.10)) && e.pageX + $("#hoverText").width() < ($('body').width() * 0.95)) {

    $("#hoverText").offset({
      left: e.pageX + 8,
      top: e.pageY + 8
    });

    $("#hoverText").css("display", "block");

  } else if (quizQuestions[quizQuestionIndex].hover != false && e.pageX < ($('body').width() / 2) + (($('body').width() * 0.10)) && e.pageX - $("#hoverText").width() > ($('body').width() * 0.20)) {

    $("#hoverText").offset({
      left: e.pageX - $("#hoverText").width(),
      top: e.pageY + 8
    });
    $("#hoverText").css("display", "block");

  } else {

    $("#hoverText").css("display", "none");

  }
}

function setQuestion(quizQuestionIndex, studentInfo) {
  clearFields();

  $("#quizTitle").html(studentInfo[0] + " " + studentInfo[1] + "'s Self-Assessment Quiz")
  // var currentQuestion = quizQuestions[quizQuestionIndex];
  var currentQuestion = quizQuestions[quizQuestionIndex];

  // console.log(currentQuestion);

  if (currentQuestion.multi != false) {

    for (var i = 0; i < currentQuestion.multi.length; i++) {
      var currentMulti = currentQuestion.multi[i];

      currentMulti.questionId = quizQuestions[quizQuestionIndex + i].questionId + "_" + currentMulti.questionId;
      quizQuestions.splice(quizQuestionIndex + i, 0, currentMulti);
    }
    quizQuestions.splice(quizQuestionIndex + currentQuestion.multi.length, 1);
    currentQuestion = quizQuestions[quizQuestionIndex];

    loadAnswer(quizQuestionIndex, studentInfo);
  }

  if (currentQuestion.followups != false && currentQuestion.complete == true) {
    setFollowups(currentQuestion, currentQuestion.answer, quizQuestionIndex);
  }

  if (studentInfo.indexOf(currentQuestion.questionId + ".json")) {
    console.log(currentQuestion.questionId + ".json", "(" + currentQuestion.type + ")");
  }

  $("#questionsText").html("<span>" + currentQuestion.text + "</span>");

  if (currentQuestion.hover != false) {
    setHover(currentQuestion.hover);
  }

  switch (currentQuestion.type) {
    case "ok":
      setButtons(currentQuestion, quizQuestionIndex, studentInfo);
      $("#answermc").removeClass("hide");
      break;
    case "mc":
      setButtons(currentQuestion, quizQuestionIndex, studentInfo);
      $("#answermc").removeClass("hide");
      $("#answermc").addClass("flex");
      break;
    case "mcfill":
      setButtons(currentQuestion, quizQuestionIndex, studentInfo);
      $("#answermc").removeClass("hide");
      break;
    case "fill":
      updateTextBar(quizQuestionIndex);
      $("#answerfill").removeClass("hide");
      break;
    case "intfill":
      $("#answerintfill").removeClass("hide");
      break;
    case "slider":
      $("#leftExtremes").html(currentQuestion.extremes[0]);
      $("#rightExtremes").html(currentQuestion.extremes[1]);
      $("#answerslider").removeClass("hide");
      $("#valueShower").html(sliderOutput.value + "%");
      break;
    case "list":
      setOptions(currentQuestion, quizQuestionIndex);
      $("#answerlist").removeClass("hide");
      break;
  }

  if (currentQuestion.complete == true) {
    showCompleted(currentQuestion);
  }
}

function setOptions(currentQuestion, quizQuestionIndex) {

  var options = "";
  var choices = currentQuestion.choices;

  for (var i = 0; i < choices.length; i++) {
    options += "<a class='listA' id='option" + i + "'>" + choices[i] + "</a>";
  }

  $("#listOutputOptions").html(options);

  $('.listA').click(function(e) {
    e.preventDefault();
    $("#listOutputTitle").html($("#" + e.target.id).html());
  });
}

function setQuestionIndex(change, quizQuestionIndex) {

  var newIndex = change + quizQuestionIndex;

  if (newIndex > -1 && newIndex < quizQuestions.length) {
    updateProgressBar(newIndex, quizQuestions.length);
    $(".sideButton").removeClass("stopButton");

    if (newIndex == 0) {
      $("#sideButtonUp").addClass("stopButton");
    } else if (newIndex == quizQuestions.length - 1) {
      $("#sideButtonDown").addClass("stopButton");
    }

    return newIndex;
  } else {

    updateProgressBar(newIndex, quizQuestions.length);

    if (quizQuestionIndex < 0) {
      $("#sideButtonUp").addClass("stopButton");
    } else if (quizQuestionIndex > quizQuestions.length - 1) {
      $("#sideButtonDown").addClass("stopButton");
    }

    return quizQuestionIndex;
  }
}

function submitAnswer(quizQuestionIndex, id, studentInfo) {
  var currentQuestion = quizQuestions[quizQuestionIndex];

  if (currentQuestion.followups != false && currentQuestion.complete == false) {
    setFollowups(currentQuestion, id.slice(8), quizQuestionIndex);
  } else if (currentQuestion.followups != false && currentQuestion.complete == true) {
    clearFollowups(quizQuestionIndex);
    setFollowups(currentQuestion, id.slice(8), quizQuestionIndex);
  }

  switch (currentQuestion.type) {
    case "fill":
      var input = $.trim($('#fillOutput').val());

      if (input.length == 0) {
        console.log("No Empty Spaces");
      } else {
        console.log("Question " + quizQuestionIndex + " Submitted");
        setCompleted(quizQuestionIndex, input, studentInfo);
      }
      break;

    case "mc":
      var choice = id.slice(8);

      console.log("Question " + quizQuestionIndex + " Submitted");
      setCompleted(quizQuestionIndex, choice, studentInfo);
      break;

    case "mcfill":
      var input = $.trim($('#fillOutput').val());

      if (input.length == 0) {
        console.log("No Empty Spaces");
      } else {
        console.log("Question " + quizQuestionIndex + " Submitted");
        var answerArray = [];
        answerArray.push(currentQuestion.mcMultiAnswer);
        answerArray.push(input);
        setCompleted(quizQuestionIndex, answerArray, studentInfo);
      }
      break;

    case "intfill":
      var input = $('#intfillOutput').val();

      if (input == 0) {
        console.log("No Empty Numbers");
      } else {
        console.log("Question " + quizQuestionIndex + " Submitted");
        setCompleted(quizQuestionIndex, input, studentInfo);
      }
      break;

    case "slider":
      console.log("Question " + quizQuestionIndex + " Submitted");
      setCompleted(quizQuestionIndex, sliderOutput.value, studentInfo);
      break;

    case "ok":
      console.log("Question " + quizQuestionIndex + " Submitted");
      setCompleted(quizQuestionIndex, 0, studentInfo);
      break;

    case "list":
      if ($("#listOutputOptions").html() != "[Select Answer]") {
        console.log("Question " + quizQuestionIndex + " Submitted");
        setCompleted(quizQuestionIndex, $("#listOutputTitle").html(), studentInfo);
      }
      break;

  }

}

function updateProgressBar(index, questionArrayLength) {

  $(".progressPoints").removeClass("complete");
  $(".progressPoints").removeClass("incomplete");

  var numProgressDots = $('.progressPoints').length;

  for (var i = 0; i < numProgressDots; i++) {

    var percentageStep = 1 / numProgressDots;
    var percentageNeeded = i * percentageStep * questionArrayLength;
    var percentage = Math.round(i * percentageStep * 100);

    if (index > percentageNeeded) {
      $("#progress" + percentage).addClass("complete");
    } else {
      $("#progress" + percentage).addClass("incomplete");
    }
  }
}

function updateTextBar(quizQuestionIndex) {
  var input = $('#fillOutput').val().length;
  var min;

  switch (quizQuestions[quizQuestionIndex].type) {
    case "name":
      min = 1;
      break;

    case "major":
      min = 3;
      break;

    case "fill":
      min = 100;
      break;
  }

  if (input > min) {
    $("#completedBarCheck").removeClass("hide");
  } else {
    $("#completedBarCheck").addClass("hide");
  }

  var percentage = (input / 400) * 90;

  $(".cursor").css("left", percentage + "%");

}

function WIPE(netId) {
  $.ajax({
    url: "api/wipeQuestions/" + netId
  }).done(function() {
    location.reload();
  });
}