const models = [ 'translation', 'text-generation', 'masked-language-modelling', 'sequence-classification', 'question-answering', 'summarization', 'code-completion', 'automatic-speech-recognition', 'image-to-text', 'image-classification', 'zero-shot-image-classification', 'object-detection' ];

let app = {

  task: getParameterByName( 'task' ) || '',
  language: getParameterByName( 'l' )|| 'en',
  arg1: getParameterByName( 'arg1' ) || '',
  arg2: getParameterByName( 'arg2' ) || '',
  arg3: getParameterByName( 'arg3' ) || '',

}

if ( valid( app.task) ){

  //console.log( app.task );

  if ( models.includes( app.task ) ){

    // select model-task
    $('#task').val( app.task ).trigger('input');

    // update task UI
    updateParams( app.task )
    updateVisibility();

    // model context / options
    if ( app.task === 'summarization' ){

      $('#summarization-input-textbox').val( app.arg1 ).change();

    }
    else if ( app.task === 'question-answering' ){

      $('#qa-context-textbox').val( app.arg1 ).change();
      $('#qa-question-textbox').val( app.arg2 ).change();

    }

    $('#generate').click();

  }

}
