// Order status: ordering runs Sunday 8 AM to Thursday 10 AM (Ann Arbor time),
// and cookies are delivered Friday 3 to 7 PM. The same times are written in the
// short list at the top of the Order section in index.html, so update both.
//
// To preview a different moment, add ?preview=day-HH:MM to the URL,
// e.g. index.html?preview=thu-11:00

(function () {
  var DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  var MINUTES_PER_DAY = 1440;

  var OPENS = 8 * 60;                                  // Sunday 8:00 AM
  var CLOSES = 4 * MINUTES_PER_DAY + 10 * 60;          // Thursday 10:00 AM
  var DELIVERY_ENDS = 5 * MINUTES_PER_DAY + 19 * 60;   // Friday 7:00 PM

  // If the week sells out early, change this to true to close the order form.
  // Change it back to false before ordering opens again on Sunday.
  var WEEK_IS_FULL = false;

  var MESSAGES = {
    open: "Ordering is open",
    full: "This week is sold out",
    closed: "Ordering is closed right now",
    waiting: "Ordering is closed right now"
  };

  function annArborTime(date) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Detroit",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23"
    }).formatToParts(date);

    var p = {};
    parts.forEach(function (part) { p[part.type] = part.value; });

    return {
      day: DAYS[p.weekday.toLowerCase()],
      minutes: (Number(p.hour) % 24) * 60 + Number(p.minute)
    };
  }

  function previewTime() {
    var match = /^(sun|mon|tue|wed|thu|fri|sat)-(\d{1,2}):(\d{2})$/i
      .exec(new URLSearchParams(window.location.search).get("preview") || "");
    if (!match) return null;
    return { day: DAYS[match[1].toLowerCase()], minutes: Number(match[2]) * 60 + Number(match[3]) };
  }

  function orderState(time) {
    var t = time.day * MINUTES_PER_DAY + time.minutes;
    if (t >= OPENS && t < CLOSES) return WEEK_IS_FULL ? "full" : "open";
    if (t >= CLOSES && t < DELIVERY_ENDS) return "closed";
    return "waiting";
  }

  var state = orderState(previewTime() || annArborTime(new Date()));

  // js/order.js reads this to decide whether to show the order form
  document.body.setAttribute("data-order-state", state);

  document.querySelectorAll("[data-order-status]").forEach(function (el) {
    el.textContent = MESSAGES[state];
    el.setAttribute("data-state", state);
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
