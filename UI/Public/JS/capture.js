const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const toggleDisplay = (el, show) =>
  el && (el.style.display = show ? "block" : "none");

let captureID = null

async function getPrediction(captureId) {
  if( $(`#button-${captureId}`).innerText == "Refresh"){
      $(`#image-${captureId}`).src=  `data:image/jpg;base64,${$(`#refresh-${captureId}`).innerText}`
      $(`#predictions-${captureId}`).innerText = "Click inspect to analyze image"
      $(`#button-${captureId}`).innerText = "Inspect"

  }
  else{
    const response = await fetch("/keeper/inspectYield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: captureId,
        }),
      });
  
      const result = await response.json();

      if(result.success.status){
        $(`#image-${captureId}`).src=  `data:image/jpg;base64,${result.data.frame}`
        if(result.data.labels.length == 0) $(`#predictions-${captureId}`).innerText = "No supers detected."
        else {
          let text = ""
          for (let i = 0; i < result.data.labels.length; i++) {
            const label = result.data.labels[i];
            const [type, count] = label.split(":").map(s => s.trim());
            const formattedType = type
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
      
          text += `Detected ${count} ${formattedType} Supers\n`;
          }
          $(`#predictions-${captureId}`).innerText = text;

          $(`#button-${captureId}`).innerText = "Refresh"
        }
      }
    }
}
