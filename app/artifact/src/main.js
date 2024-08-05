let localKey = localStorage.getItem('_immortal|api_key_openai');

const app = {

  user_prompt:          getParameterByName('prompt'),
  language:             getParameterByName('l') || 'en',
  supported_languages:  [ 'en', 'fr', 'nl' ],
  url:                  '',

};

// tab functionality
function openTab(tabId) {
  const tabBtn = document.getElementById(`button-${tabId}`);
  const tabSection = document.getElementById(tabId);
  // remove from all tabs
  document.querySelectorAll('.tab-btn').forEach(tabBtn => {
      tabBtn.classList.remove('current');
  });
  document.querySelectorAll('.tab-section').forEach(tabSection => {
      tabSection.classList.remove('current');
  });
  tabBtn.classList.add('current');
  tabSection.classList.add('current');
}


const form = document.getElementById('api-form');

function saveToLocalStorage() {
  const formData = {};
  form.querySelectorAll('input, textarea').forEach(element => {
      formData[element.name] = element.value;
  });
  localStorage.setItem('apiFormData', JSON.stringify(formData));
}

function loadFromLocalStorage() {
  const storedData = localStorage.getItem('apiFormData');

  if (storedData) {

    const formData = JSON.parse(storedData);
    Object.keys(formData).forEach(key => {
      const element = form.elements[key];

      if (element) {
          element.value = formData[key];
      }

    });

  }

}

window.addEventListener('load', loadFromLocalStorage);

form.addEventListener('input', saveToLocalStorage);

form.addEventListener('submit', function (e) {
  e.preventDefault();
  saveToLocalStorage();
});


// submit form on enter key press, except shift+enter
form.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveToLocalStorage();
      $('#loader').show();
      $('#download').hide();
      form.dispatchEvent(new Event('submit'));
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  $('#loader').show();
  $('#download').hide();

  const prompt = form.prompt.value;
  // empty prompt
  // form.prompt.value = '';

  const fullprompt = `You are an expert front-end developer. Don't use css files, only javascript/react (jsx). You can use styled-components if you want styling. Generate a React component (called App) that follows the following specifications: ${prompt}\n\nQuickly list methods you'll likely need for the component(s) and then immediately generate the code in a single code block. Once code is generated, no further explanation is required. Make sure all libraries are imported (i.e. it's common to forget three.js addons), or module addons registered if needed (such as chart.js registrables).`;

  const apiKey = valid( localKey )? localKey : ''; // document.querySelector('#key').value;

  const apiEndpoint = document.querySelector('#api-endpoint').value;
  const modelName = document.querySelector('#model-name').value;
  const output = document.querySelector('#code');

  output.textContent = '';
  //openTab('tab-code');

  const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: fullprompt }],
          max_tokens: 4096,
          temperature: 0,
          stream: true
      })
  });

  if (response.ok) {

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let responseText = '';

      while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });

          // Assuming chunk contains a JSON string, process it
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
              let json;

              if (line.startsWith('data: [DONE]')) {
                  done = true;
                  break;
              }
              try {
                  json = JSON.parse(line.replace(/^data: /, ''));
              } catch (error) {
                  console.error('Error parsing JSON:', line, error);
                  continue;
              }
              if (json.choices && json.choices.length > 0) {
                  const content = json.choices[0].delta.content;
                  if (content) {
                      output.textContent += content;
                      responseText += content;
                      // scroll to bottom
                      output.scrollTop = output.scrollHeight;
                  }
              }
          }
      }

      // strip ```jsx and ``` from the response
      //console.log(responseText);
      // responseText = responseText.replace(/```\w+\s*/g, '').replace(/```\s*$/g, '');

      const regex = /```(?:\w+\n)?([\s\S]*?)```/g;
      let matches;
      while ((matches = regex.exec(responseText)) !== null) {
          responseText = matches[1].trim();
      }

      //console.log("//////////////////////");
      //console.log(responseText);
      renderGeneratedHtml(responseText);

      $('#loader').hide();
      $('#download').show();

      openTab('tab-app');


  }
  else {
      output.textContent = 'Error: ' + response.statusText;

      $('#loader').text('error: failed response ', response.statusText );

  }


});


const htmlWrapper = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">
<title>React TypeScript Without Bundler</title>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script type="importmap">
{
  "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
      "three/examples/jsm/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
<\/script>
<style>
body {
  margin: 0;
  padding: 0;
}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/plain" id="jsx-code">
import ReactDOM from 'react-dom';

[[APP_CODE]]

ReactDOM.render(<App />, document.getElementById('root'));
<\/script>
<script>
// Get the JSX code
const jsxCode = document.getElementById('jsx-code').textContent;

// Transpile JSX to JavaScript using Babel
const compiledCode = Babel.transform(jsxCode, { presets: ['react'] }).code;

// Log the compiled JavaScript code to the console
//console.log(compiledCode);

// Create a new script element and execute the compiled code
const script = document.createElement('script');
script.type = 'module';
script.text = compiledCode;
document.body.appendChild(script);
<\/script>
</body>
</html>
`;

function renderGeneratedHtml(appHtml) {
  const htmlContent = htmlWrapper.replace('[[APP_CODE]]', appHtml);

  const htmlContentUpdatedImports = htmlContent.replace(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g, (match, p1) => {
      if (p1.startsWith('https://')) return match;
      if (p1.startsWith('three/')) return match;
      if (p1 == 'three') return match;
      return match.replace(p1, `https://cdn.skypack.dev/${p1}`);
  });

  // Create a Blob from the HTML content
  const blob = new Blob([htmlContentUpdatedImports], { type: 'text/html' });

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);
  app.url   = url;

  // Get the iframe element and set its src to the temporary URL
  const iframeElem = document.querySelector('iframe');
  iframeElem.src = url;

  // Revoke the object URL after the iframe has loaded the content to free up memory
  iframeElem.onload = () => {
      // URL.revokeObjectURL(url);
  };

}

function downloadApp(){

  const link = document.createElement("a");
  link.href = app.url;
  let filename = $('#prompt').val().replace(' ', '_');
  link.download = `${filename}.html`;
  link.click();

}

$(document).ready(function(){

  if ( valid( app.user_prompt ) ){

    $('#loader').show();
    $('#download').hide();

    $('#prompt').val( app.user_prompt );

    form.dispatchEvent(new Event('submit'))

  }

});
