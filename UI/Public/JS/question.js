document.getElementById("QuestionForm").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const formData = new FormData(this); 

    try {
        const response = await fetch("/keeper/askQuestion", {
            method: "POST",
            body: {
                email: formData.get("email"),
                message: formData.get("message")
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        if (!result.success.status) {
            alert(result.message);
            return;
        }
        else {
            alert("Your message has been sent successfully.");
            document.getElementById("QuestionForm").reset(); 
        }
       
    } catch (error) {
        alert("There was an error submitting your message.");
    }
});
