// Order form: answers are sent straight to the Google Form, so every order
// still shows up in Google Forms (and its spreadsheet) like before.
//
// If you change a question or an answer choice in the Google Form, update it
// here too. Answer text has to match the Google Form exactly, emoji included.
// The website can't see whether Google accepted an order, so after any change,
// place a test order and check that it arrives.

(function () {
  var GOOGLE_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSe2nE1hvzCH94SDjlFpOxnTPec5F9eKnjJlxPvgDbkuqbSfCw/formResponse";

  // Question IDs from the Google Form
  var QUESTIONS = {
    name: "entry.525963068",
    email: "entry.668126318",
    phone: "entry.1012476030",
    box: "entry.1845016377",
    address: "entry.808687894",
    notes: "entry.1726545982",
    total: "entry.1527445305",
    venmo: "entry.17094681",
    allergies: "entry.2094843500"
  };

  // "Choose your box" answers, by box size and flavor.
  // SEASONAL FLAVOR: update the "seasonal" and "half" answers each season.
  var BOXES = {
    "6": {
      signature: "🍪 6 — Brown Butter Chocolate Chip",
      seasonal: "🎃 6 — Pumpkin Spice"
    },
    "12": {
      signature: "🍪 12 — Brown Butter Chocolate Chip",
      seasonal: "🎃 12 — Pumpkin Spice",
      half: "🤎 12 — Half Chocolate Chip + Half Pumpkin Spice"
    }
  };

  // "Your order total" answers, by box size
  var TOTALS = {
    "6": { price: 15, answer: "$15 — 6 cookies" },
    "12": { price: 25, answer: "$25 — 12 cookies" }
  };

  var form = document.getElementById("order-form");
  var done = document.getElementById("order-done");
  if (!form) return;

  // Outside the ordering window (worked out in js/main.js), the cookies stay
  // on the page as a menu, but they can't be picked and the rest of the form is hidden
  if (document.body.getAttribute("data-order-state") !== "open") {
    form.classList.add("is-closed");
    form.querySelectorAll("input").forEach(function (input) { input.disabled = true; });
    form.querySelectorAll("[data-order-only]").forEach(function (el) { el.hidden = true; });
    form.addEventListener("submit", function (event) { event.preventDefault(); });
    return;
  }

  var halfAndHalf = form.querySelector('input[name="flavor"][value="half"]');
  var boxOf6 = form.querySelector('input[name="size"][value="6"]');
  var boxOf12 = form.querySelector('input[name="size"][value="12"]');
  var payTotal = form.querySelector("[data-pay-total]");
  var submitButton = form.querySelector('button[type="submit"]');
  var sendError = form.querySelector(".form-message");
  var requiredFields = form.querySelectorAll(".field[data-message]");

  function answer(name) {
    return form.elements[name].value.trim();
  }

  // Link each error message to its inputs so screen readers read it out
  requiredFields.forEach(function (field, i) {
    var error = field.querySelector(".field-error");
    error.id = "order-error-" + i;
    field.querySelectorAll("input, textarea").forEach(function (input) {
      var described = input.getAttribute("aria-describedby");
      input.setAttribute("aria-describedby", described ? described + " " + error.id : error.id);
    });
  });

  function isAnswered(field) {
    return Array.prototype.every.call(field.querySelectorAll("input, textarea"), function (input) {
      if (input.type === "radio") return input.checkValidity();
      if (!input.value.trim()) return false;
      if (input.type === "tel") return input.value.replace(/\D/g, "").length >= 10;
      return input.checkValidity();
    });
  }

  function checkField(field) {
    var ok = isAnswered(field);
    field.querySelector(".field-error").textContent = ok ? "" : field.getAttribute("data-message");
    field.querySelectorAll("input, textarea").forEach(function (input) {
      if (input.type !== "radio") input.setAttribute("aria-invalid", ok ? "false" : "true");
    });
    return ok;
  }

  // Once an error is showing, clear it as soon as the answer is fixed
  function recheck(field) {
    if (field && field.querySelector(".field-error").textContent) checkField(field);
  }

  function buttonLabel() {
    var total = TOTALS[answer("size")];
    return total ? "Place order · $" + total.price : "Place order";
  }

  // Half and half only comes in a box of 12: picking it selects the 12 box
  // and makes the 6 box unavailable
  function matchBoxToFlavor() {
    boxOf6.disabled = halfAndHalf.checked;
    if (halfAndHalf.checked) {
      boxOf6.checked = false;
      boxOf12.checked = true;
    }
    var total = TOTALS[answer("size")];
    payTotal.textContent = total ? "$" + total.price : "your total";
    submitButton.textContent = buttonLabel();
  }

  form.addEventListener("input", function (event) {
    recheck(event.target.closest(".field[data-message]"));
  });
  form.addEventListener("change", function (event) {
    matchBoxToFlavor();
    requiredFields.forEach(function (field) { recheck(field); });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstProblem = null;
    requiredFields.forEach(function (field) {
      if (!checkField(field) && !firstProblem) firstProblem = field;
    });
    if (firstProblem) {
      firstProblem.querySelector("input, textarea").focus();
      return;
    }

    var size = answer("size");
    var total = TOTALS[size];
    var data = new URLSearchParams();
    data.append(QUESTIONS.name, answer("name"));
    data.append(QUESTIONS.email, answer("email"));
    data.append(QUESTIONS.phone, answer("phone"));
    data.append(QUESTIONS.box, BOXES[size][answer("flavor")]);
    data.append(QUESTIONS.address, answer("address"));
    data.append(QUESTIONS.notes, answer("notes") || "None");         // required in the Google Form
    data.append(QUESTIONS.total, total.answer);
    data.append(QUESTIONS.venmo, "@" + answer("venmo").replace(/^@+/, ""));
    data.append(QUESTIONS.allergies, answer("allergies") || "None"); // required in the Google Form
    data.append("fvv", "1");
    data.append("pageHistory", "0,1"); // the Google Form has a thank-you page after the questions

    submitButton.disabled = true;
    submitButton.textContent = "Sending your order…";
    sendError.hidden = true;

    // Google doesn't let other websites read its reply, so a request that
    // finishes counts as sent. Only a network failure shows an error.
    fetch(GOOGLE_FORM, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        showThankYou(answer("name").split(/\s+/)[0], total.price);
      })
      .catch(function () {
        sendError.textContent = "Your order didn't go through. Check your internet connection and try again.";
        sendError.hidden = false;
        submitButton.disabled = false;
        submitButton.textContent = buttonLabel();
      });
  });

  function showThankYou(firstName, price) {
    // Opens Venmo's payment screen with Sophie and the amount filled in. On a phone
    // with the Venmo app it opens the app; on a computer Venmo asks to log in first.
    var venmoLink = done.querySelector("[data-venmo-link]");
    venmoLink.textContent = "Pay $" + price + " on Venmo";
    venmoLink.href = "https://venmo.com/SophieChongg?txn=pay&amount=" + price +
      "&note=" + encodeURIComponent("A Sweet Pause cookies");

    done.querySelector("[data-done-name]").textContent = firstName;
    done.querySelector("[data-done-total]").textContent = "$" + price;
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ block: "start" });
    done.focus({ preventScroll: true });
  }

  matchBoxToFlavor();
})();
