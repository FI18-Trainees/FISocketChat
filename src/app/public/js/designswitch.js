$('#theme-toggle').change(function() {
    if($('#theme-toggle').is(':checked')) {
        $('#themecss').attr('href', '/public/css/fioratheme.css');
        theme = 'fiora';
    } else {
        $('#themecss').attr('href', '/public/css/normietheme.css');
        theme = 'normie';
    }
});