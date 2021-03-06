//  Update Values When Checkbox is clicked / unclicked
function updateValues(data, id) {
  $("#current_streak" + id).text(data.current_streak);
  $("#longest_streak" + id).text(data.longest_streak);
  $("#weekly_count" + id).text(data.weekly_count);
}

function resetCurrentStreak(habit_id) {
  $.post("/_reset_current_streak", {
    id: habit_id
  });
}

// Run upon page load, checks if habit has been completed today and determines
// The current week count
function todayStatus(json) {
  // TODO: Also user to adjust start of week, currently set to Monday
  var start_day = moment().startOf('isoweek');
  var yesterday = moment()
    .subtract(1, "days")
    .startOf("day");
  var habit_list = json.habit_list;
  for (var i = 0; i < habit_list.length; i++) {
    var habit_id = habit_list[i];
    if (json.hasOwnProperty(habit_id)) {
      var week_count = 0;
      json[habit_id].forEach(function(element) {

        var timestamp_local_time = moment(element);

        if (timestamp_local_time >= start_day) {
          week_count++;
        }
        if (timestamp_local_time.isSame(moment(), "day")) {
          $("#button" + habit_id)
            .removeClass("habitButton incomplete")
            .addClass("habitButton complete");
          $("#button" + habit_id).text("Nice work!");
        }
        if (timestamp_local_time < start_day.subtract(7, "days")) {
          resetCurrentStreak(habit_id);
        }
      });
      if (week_count > 0) {
        $("#weekly_count" + habit_id).text(week_count);
      } else {
        $("#weekly_count" + habit_id).text(0);
      }
    } else {
      $("#weekly_count" + habit_id).text(0);

      if (+$("#current_streak" + habit_id).text() > 0) {
        resetCurrentStreak(habit_id);
      }
    }
  }
}

$(".habitButton").click(function() {
  var id = $(this).attr("name");
  var weekly_count = +$("#weekly_count" + id).text();
  var object = $(this);
  var timestamp = moment().format('YYYY-MM-DD');

  if ($(this).hasClass("habitButton incomplete")) {
    $(this)
      .removeClass("habitButton incomplete")
      .addClass("habitButton complete");
    $(this).text("Nice work!");
    $.post("/_complete", {
      id: id,
      timestamp: timestamp,
      weekly_count: weekly_count
    }).done(function(data, object) {
      updateValues(data, id);
    });
  } else {
    $(this)
      .removeClass("habitButton complete")
      .addClass("habitButton incomplete");
    $(this).text("Mark as Done");
    $.post("/_undo", {
      id: $(this).attr("name"),
      weekly_count: weekly_count,
      timestamp: timestamp,
    }).done(function(data) {
      updateValues(data, id);
      $(this).removeClass("habitButton complete");
      $(this).addClass("habitButton incomplete");
    });
  }
});

$(function() {
  $.ajax({
    url: "/_check_status"
  }).done(function(json) {
    todayStatus(json);
  });
});

