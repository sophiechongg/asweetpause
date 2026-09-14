// Contact form: messages are emailed to Sophie through FormSubmit (formsubmit.co),
// a free service that needs no account.
//
// The first message sent from the site makes FormSubmit email Sophie an
// "Activate Form" link. Messages only arrive after she clicks it.

(function () {
  var SEND_TO = "https://formsubmit.co/ajax/sophiechongg@gmail.com";

  var form = document.getElementById("contact-form");
  var done = document.getElementById("contact-done");
  if (!form) return;

  var submitButton = form.querySelector('button[type="submit"]');
  var sendError = form.querySelector(".form-message");
  var fields = form.querySelectorAll(".field[data-message]");

  function value(name) {
    return form.elements[name].value.trim();
  }

  // Link each error message to its input so screen readers read it out
  fields.forEach(function (field, i) {
    var error = field.querySelector(".field-error");
    error.id = "contact-error-" + i;
    field.querySelector("input, textarea").setAttribute("aria-describedby", error.id);
  });

  function checkField(field) {
    var input = field.querySelector("input, textarea");
    var ok = input.value.trim() !== "" && input.checkValidity();
    field.querySelector(".field-error").textContent = ok ? "" : field.getAttribute("data-message");
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  // Once an error is showing, clear it as soon as the answer is fixed
  form.addEventListener("input", function (event) {
    var field = event.target.closest(".field[data-message]");
    if (field && field.querySelector(".field-error").textContent) checkField(field);
  });

  function showError(message) {
    sendError.textContent = message;
    sendError.hidden = false;
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstProblem = null;
    fields.forEach(function (field) {
      if (!checkField(field) && !firstProblem) firstProblem = field;
    });
    if (firstProblem) {
      firstProblem.querySelector("input, textarea").focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    sendError.hidden = true;

    fetch(SEND_TO, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        name: value("name"),
        email: value("email"),
        message: value("message"),
        _subject: "A Sweet Pause website: message from " + value("name"),
        _template: "table",
        _honey: form.elements._honey.value
      })
    })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (String(result.success) === "true") {
          done.querySelector("[data-contact-name]").textContent = value("name").split(/\s+/)[0];
          form.hidden = true;
          done.hidden = false;
          done.focus();
        } else if (/activat/i.test(result.message || "")) {
          // Only happens before Sophie has activated the form
          showError("Almost ready: check sophiechongg@gmail.com for an \"Activate Form\" email from FormSubmit, click it, then send this again.");
        } else {
          throw new Error(result.message);
        }
      })
      .catch(function () {
        showError("Your message didn't send. Please try again, or email sophiechongg@gmail.com.");
      });
  });
})();
