$('#theme-toggle').change(function() {
    if($('#theme-toggle').is(':checked')) {
        $('#themecss').attr('href', '/public/css/fioratheme.css');
    } else {
        $('#themecss').attr('href', '/public/css/normietheme.css');
    }
});