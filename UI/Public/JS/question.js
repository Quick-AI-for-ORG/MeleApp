document
  .getElementById("QuestionForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending your question...`;

    const formData = new FormData(this);

    try {
      const response = await fetch("/keeper/askQuestion", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          message: formData.get("message"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!result.success.status) {
        Toastify({
          text: result.message,
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "#dc3545",
          },
        }).showToast();
      } else {
        Toastify({
          text: "Your message has been sent successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "#28a745",
          },
        }).showToast();
        document.getElementById("QuestionForm").reset();
      }
    } catch (error) {
      Toastify({
        text: "There was an error submitting your message.",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
          background: "#dc3545",
        },
      }).showToast();
    } finally {
      // Restore button state
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
