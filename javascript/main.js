/**
 * Collection of HTML elements used throughout the application.
 * @constant {Object}
 */
const elements = {
  selectTag: document.querySelectorAll("select"), 
  inputLanguage: document.querySelector("#input-language"), 
  outputLanguage: document.querySelector("#output-language"), 
  inputText: document.querySelector("#input-text"),
  outputText: document.querySelector("#output-text"), 
  exchangeIcon: document.querySelector(".swap-position"), 
  icons: document.querySelectorAll(".control i"), 
  downloadButton: document.querySelector("#download-button"), 
  uploadDocument: document.querySelector("#upload-document"),
  uploadTitle: document.querySelector("#upload-title"),
  toggleMode: document.querySelector(".toggle-mode"), 
  toggleIcon: document.querySelector(".toggle-mode i"), 
};

/**
 * Toggles between light and dark modes.
 */
elements.toggleMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  elements.toggleIcon.classList.toggle("bx-moon");
  elements.toggleIcon.classList.toggle("bx-sun");
});

/**
 * Populates language selection dropdowns with available languages.
 */
elements.selectTag.forEach((tag, id) => {
  for (const country_code in countries) {
    let selected = (id === 0 && country_code === "en-GB") || (id === 1 && country_code === "ar-SA") ? "selected" : "";
    let option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

/**
 * Translates text using the Google Translate API.
 */
function translate() {
  const text = elements.inputText.value;
  const translateFrom = elements.selectTag[0].value;
  const translateTo = elements.selectTag[1].value;

  if (!text) {
    elements.outputText.value = "";
    return;
  }

  const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${translateFrom}&tl=${translateTo}&dt=t&q=${encodeURIComponent(text)}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      elements.outputText.value = data[0].map((item) => item[0]).join("");
    })
    .catch((error) => {
      console.error("Error in translation", error);
      elements.outputText.value = "Error in translation.";
    });
}

/**
 * Swaps input and output languages and text.
 */
elements.exchangeIcon.addEventListener("click", () => {
  const tempText = elements.inputText.value;
  elements.inputText.value = elements.outputText.value;
  elements.outputText.value = tempText;

  const tempLanguage = elements.selectTag[0].value;
  elements.selectTag[0].value = elements.selectTag[1].value;
  elements.selectTag[1].value = tempLanguage;
});

/**
 * Handles copy and speech functionalities for input and output text.
 */
elements.icons.forEach((icon) => {
  icon.addEventListener("click", ({ target }) => {
    if (icon.classList.contains("bx-copy-alt")) {
      navigator.clipboard.writeText(target.id === "from" ? elements.inputText.value : elements.outputText.value);
    } else {
      const utterance = new SpeechSynthesisUtterance(
        target.id === "from" ? elements.inputText.value : elements.outputText.value
      );
      utterance.lang = target.id === "from" ? elements.selectTag[0].value : elements.selectTag[1].value;
      window.speechSynthesis.speak(utterance);
    }
  });
});

/**
 * Handles document upload and reads content for translation.
 */
elements.uploadDocument.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    elements.uploadTitle.textContent = file.name;

    if (file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        elements.inputText.value = e.target.result;
        translate();
      };
      reader.readAsText(file);
    } else {
      Swal.fire({
        icon: "error",
        title: "Unsupported File Type",
        text: "Please upload a .txt file.",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        position: "top-end",
      });
      elements.uploadDocument.value = "";
      elements.uploadTitle.textContent = "Choose File";
    }
  }
});

/**
 * Downloads the translated text as a .txt file.
 */
elements.downloadButton.addEventListener("click", () => {
  const translatedText = elements.outputText.value;
  if (!translatedText) {
    Swal.fire({
      icon: "error",
      title: "No translated content available to download.",
      toast: true,
      timer: 3000,
      position: "top-end",
    });
    return;
  }

  const blob = new Blob([translatedText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "translated_file.txt";
  link.click();
});

/**
 * Automatically triggers translation when input text or output language changes.
 */
elements.inputText.addEventListener("input", translate);
elements.outputLanguage.addEventListener("change", translate);
