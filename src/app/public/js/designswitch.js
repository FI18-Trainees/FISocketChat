$('#theme-toggle').change(function() {
    if($('#theme-toggle').is(':checked')) {
        $('#maincss').attr('href', '/public/css/fioratheme.css');
    } else {
        $('#maincss').attr('href', '/public/css/general.css');
    }
});