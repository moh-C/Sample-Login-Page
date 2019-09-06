$(document).ready(function() {
    $('input#password').focus(() => {
        $('#userIcon').css({
            'position': 'relative',
            'left': '-10px',
            'color': '#f33a92',
            'font-size': '22px'
        });

        $('#first').addClass('special')

    })
    $('input#password').blur(() => {
        $('#userIcon').css({
            'position': 'relative',
            'left': '0',
            'color': '#000',
            'font-size': '18px'
        })
        $('#first').removeClass('special')
    })
})