window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type === "BIGO_GET_CODE") {
    if (window.monaco && window.monaco.editor) {
      const models = window.monaco.editor.getModels();
      if (models.length > 0) {
        window.postMessage({ 
          type: "BIGO_CODE_RESULT", 
          code: models[0].getValue(), 
          language: models[0].getLanguageId() 
        }, "*");
      }
    }
  } else if (event.data.type === "BIGO_SET_CODE") {
    if (window.monaco && window.monaco.editor) {
      const models = window.monaco.editor.getModels();
      if (models.length > 0) {
        models[0].setValue(event.data.code);
      }
    }
  }
});
