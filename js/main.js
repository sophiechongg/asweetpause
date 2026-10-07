// Order status: ordering runs Sunday 8 AM to Thursday 10 AM (Ann Arbor time),
// and cookies are delivered Friday 3 to 7 PM. The same times are written in the
// short list at the top of the Order section in index.html, so update both.
//
// To preview a different moment, add ?preview= to the URL:
//   index.html?preview=thu-11:00     a day and time this week
//   index.html?preview=2026-10-12    a date (noon), for checking a week off

(function () {
  var DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  var MINUTES_PER_DAY = 1440;

  var OPENS = 8 * 60;                                  // Sunday 8:00 AM
  var CLOSES = 4 * MINUTES_PER_DAY + 10 * 60;          // Thursday 10:00 AM
  var DELIVERY_ENDS = 5 * MINUTES_PER_DAY + 19 * 60;   // Friday 7:00 PM

  // If the week sells out early, change this to true to close the order form.
  // Change it back to false before ordering opens again on Sunday.
  var WEEK_IS_FULL = false;

  // Weeks off. Ordering stays closed from the "from" date through the "to" date,
  // so add one before a week you can't bake or deliver. Start it on the Saturday
  // before ordering would open, and end it on the Saturday after the delivery
  // you're skipping. Past weeks off can be deleted, or left here.
  var TIME_OFF = [
    {
      from: "2026-10-10",
      to: "2026-10-17",
      message: "No cookies this week: I'm running the Detroit Marathon. Ordering opens again Sunday, October 18 at 8 AM."
    }
  ];

  var MESSAGES = {
    open: "Ordering is open",
    full: "This week is sold out",
    closed: "Ordering is closed right now",
    waiting: "Ordering is closed right now"
  };

  function annArborParts(date, options) {
    options.timeZone = "America/Detroit";
    var p = {};
    new Intl.DateTimeFormat("en-US", options).formatToParts(date).forEach(function (part) {
      p[part.type] = part.value;
    });
    return p;
  }

  function annArborTime(date) {
    var p = annArborParts(date, {
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23"
    });

    return {
      day: DAYS[p.weekday.toLowerCase()],
      minutes: (Number(p.hour) % 24) * 60 + Number(p.minute)
    };
  }

  function annArborDate(date) {
    var p = annArborParts(date, { year: "numeric", month: "2-digit", day: "2-digit" });
    return p.year + "-" + p.month + "-" + p.day;
  }

  function previewTime() {
    var match = /^(sun|mon|tue|wed|thu|fri|sat)-(\d{1,2}):(\d{2})$/i
      .exec(new URLSearchParams(window.location.search).get("preview") || "");
    if (!match) return null;
    return { day: DAYS[match[1].toLowerCase()], minutes: Number(match[2]) * 60 + Number(match[3]) };
  }

  function previewDate() {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(new URLSearchParams(window.location.search).get("preview") || "");
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0);
  }

  function timeOffFor(today) {
    for (var i = 0; i < TIME_OFF.length; i++) {
      if (today >= TIME_OFF[i].from && today <= TIME_OFF[i].to) return TIME_OFF[i];
    }
    return null;
  }

  function orderState(time) {
    var t = time.day * MINUTES_PER_DAY + time.minutes;
    if (t >= OPENS && t < CLOSES) return WEEK_IS_FULL ? "full" : "open";
    if (t >= CLOSES && t < DELIVERY_ENDS) return "closed";
    return "waiting";
  }

  var now = previewDate() || new Date();
  var timeOff = timeOffFor(annArborDate(now));
  var state = timeOff ? "off" : orderState(previewTime() || annArborTime(now));
  var message = timeOff ? timeOff.message : MESSAGES[state];

  // js/order.js reads this to decide whether to show the order form
  document.body.setAttribute("data-order-state", state);

  document.querySelectorAll("[data-order-status]").forEach(function (el) {
    el.textContent = message;
    el.setAttribute("data-state", state);
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
