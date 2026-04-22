const weddingDate = new Date("2026-12-06T00:00:00+05:30").getTime();
const rsvpWebhookUrl = "https://script.google.com/macros/s/AKfycbwmtCMyhxOWD5uPTpEjqKhTQMjhOvd2oTcM8G9WMxt7dGA9Lg28IFe8uRnDJLcac-D5og/exec";
const submittedPhonesStorageKey = "wedding-rsvp-submitted-phones-v1";

const entryScreen = document.getElementById("entry-screen");
const invitationContent = document.getElementById("invitation-content");
const openInvitationButton = document.getElementById("open-invitation");

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const countdownMessage = document.getElementById("countdown-message");

const peopleCountSelect = document.getElementById("people-count");
const attendeeFields = document.getElementById("attendee-fields");
const attendingFieldsGroup = document.getElementById("attending-fields-group");
const rsvpForm = document.getElementById("rsvp-form");
const showRsvpFormButton = document.getElementById("show-rsvp-form");
const showDeclineFormButton = document.getElementById("show-decline-form");
const rsvpDetails = document.getElementById("rsvp-details");
const contactNameInput = document.getElementById("contact-name");
const rsvpStatusEl = document.getElementById("rsvp-status");
const rsvpSubmitButton = rsvpForm.querySelector('button[type="submit"]');
const thankYouScreen = document.getElementById("thank-you-screen");
const thankYouMessage = document.getElementById("thank-you-message");

let rsvpResponseType = "Attending";

function getSubmittedPhones() {
  const rawData = localStorage.getItem(submittedPhonesStorageKey);
  if (!rawData) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSubmittedPhone(normalizedPhone) {
  const existingPhones = getSubmittedPhones();
  if (!existingPhones.includes(normalizedPhone)) {
    existingPhones.push(normalizedPhone);
    localStorage.setItem(submittedPhonesStorageKey, JSON.stringify(existingPhones));
  }
}

function normalizePhoneNumber(phoneNumber) {
  return phoneNumber.replace(/[^\d]/g, "");
}

function showRsvpStatus(message) {
  rsvpStatusEl.textContent = message;
  rsvpStatusEl.classList.remove("hidden");
}

async function submitRsvpToWebhook(payload) {
  const formBody = new URLSearchParams({
    submittedAt: payload.submittedAt,
    responseType: payload.responseType,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    peopleCount: String(payload.peopleCount),
    attendeeNames: payload.attendeeNames.join(" | ")
  }).toString();

  await fetch(rsvpWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body: formBody,
    mode: "no-cors"
  });
}

openInvitationButton.addEventListener("click", () => {
  entryScreen.classList.add("hidden");
  invitationContent.classList.remove("hidden");
  invitationContent.setAttribute("aria-hidden", "false");
  // restart animation
  invitationContent.style.animation = "none";
  invitationContent.offsetHeight; // reflow
  invitationContent.style.animation = "";
});

showRsvpFormButton.addEventListener("click", () => {
  rsvpResponseType = "Attending";
  attendingFieldsGroup.classList.remove("hidden");
  peopleCountSelect.required = true;
  rsvpSubmitButton.textContent = "Submit RSVP";
  rsvpDetails.classList.remove("hidden");
  showRsvpFormButton.disabled = true;
  showDeclineFormButton.disabled = false;
  rsvpStatusEl.classList.add("hidden");
  contactNameInput.focus();
});

showDeclineFormButton.addEventListener("click", () => {
  rsvpResponseType = "Not Attending";
  attendingFieldsGroup.classList.add("hidden");
  peopleCountSelect.required = false;
  peopleCountSelect.value = "";
  attendeeFields.innerHTML = "";
  rsvpSubmitButton.textContent = "Submit Response";
  rsvpDetails.classList.remove("hidden");
  showDeclineFormButton.disabled = true;
  showRsvpFormButton.disabled = false;
  rsvpStatusEl.classList.add("hidden");
  contactNameInput.focus();
});

function updateCountdown() {
  const now = Date.now();
  const difference = weddingDate - now;

  if (difference <= 0) {
    daysEl.textContent = "0";
    hoursEl.textContent = "0";
    minutesEl.textContent = "0";
    secondsEl.textContent = "0";
    countdownMessage.textContent = "The wedding day is here!";
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  daysEl.textContent = String(days);
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();

function renderAttendeeFields(count) {
  attendeeFields.innerHTML = "";

  for (let index = 1; index <= count; index += 1) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = `attendee-${index}`;
    input.placeholder = `Attendee ${index} Name`;
    input.required = true;
    attendeeFields.appendChild(input);
  }
}

peopleCountSelect.addEventListener("change", (event) => {
  const selectedCount = Number(event.target.value || 0);
  renderAttendeeFields(selectedCount);
});

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(rsvpForm);
  const contactName = String(formData.get("contact-name") || "").trim();
  const contactPhone = String(formData.get("contact-phone") || "").trim();
  const normalizedPhone = normalizePhoneNumber(contactPhone);
  const selectedPeopleCount = Number(formData.get("people-count") || 0);
  const isAttending = rsvpResponseType === "Attending";
  const peopleCount = isAttending ? selectedPeopleCount : 0;

  if (!contactName || !contactPhone || (isAttending && peopleCount <= 0)) {
    showRsvpStatus(isAttending ? "Please complete all RSVP fields." : "Please complete your details.");
    return;
  }

  if (normalizedPhone.length < 8) {
    showRsvpStatus("Please enter a valid phone number.");
    return;
  }

  const existingPhones = getSubmittedPhones();
  if (existingPhones.includes(normalizedPhone)) {
    showRsvpStatus("This phone number has already submitted an RSVP.");
    return;
  }

  const attendeeNames = [];
  if (isAttending) {
    for (let index = 1; index <= peopleCount; index += 1) {
      const attendeeName = String(formData.get(`attendee-${index}`) || "").trim();
      if (!attendeeName) {
        showRsvpStatus("Please enter all attendee names.");
        return;
      }
      attendeeNames.push(attendeeName);
    }
  }

  const submissionPayload = {
    submittedAt: new Date().toISOString(),
    responseType: rsvpResponseType,
    contactName,
    contactPhone,
    peopleCount,
    attendeeNames
  };
  const submittedResponseType = rsvpResponseType;

  const hasConfiguredWebhook = rsvpWebhookUrl && !rsvpWebhookUrl.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE");
  if (!hasConfiguredWebhook) {
    showRsvpStatus("Add your Google Sheets webhook URL in script.js before sharing.");
    return;
  }

  try {
    rsvpSubmitButton.disabled = true;
    await submitRsvpToWebhook(submissionPayload);
    saveSubmittedPhone(normalizedPhone);
    rsvpForm.reset();
    peopleCountSelect.required = true;
    attendeeFields.innerHTML = "";
    attendingFieldsGroup.classList.remove("hidden");
    rsvpResponseType = "Attending";
    showRsvpFormButton.disabled = false;
    showDeclineFormButton.disabled = false;
  } catch {
    showRsvpStatus("Unable to submit now. Please try again.");
    return;
  } finally {
    rsvpSubmitButton.disabled = false;
  }

  invitationContent.classList.add("hidden");
  invitationContent.setAttribute("aria-hidden", "true");
  thankYouMessage.textContent = submittedResponseType === "Attending"
    ? "Thank you for confirming your presence. We look forward to celebrating with you."
    : "Thank you for letting us know. We will miss your presence at the celebration.";
  thankYouScreen.classList.remove("hidden");
  thankYouScreen.setAttribute("aria-hidden", "false");
});
