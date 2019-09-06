$(document).ready(function() {

    $('#username').focus(() => {
        $('#userIcon').css({
            'position': 'relative',
            'left': '-10px',
            'color': '#f33a92',
            'font-size': '22px'
        });
        $('#first').addClass('special');
        $('#username').attr('placeholder', '');
    })

    $('#username').blur(() => {
        $('#userIcon').css({
            'position': 'relative',
            'left': '0',
            'color': '#000',
            'font-size': '18px'
        })
        $('#first').removeClass('special');
        $('#username').attr('placeholder', 'Username');

        if (!$('#username').val()) {
            $('#userIcon').css({
                'color': 'red'
            })

        } else {
            $('#userIcon').css({
                'color': 'green'
            })
        }
    })



    $('#password').focus(() => {
        $('#passIcon').css({
            'position': 'relative',
            'left': '-10px',
            'color': '#f33a92',
            'font-size': '22px'
        });
        $('#second').addClass('special');
        $('#password').attr('placeholder', '');
    })

    $('#password').blur(() => {
        $('#passIcon').css({
            'position': 'relative',
            'left': '0',
            'color': '#000',
            'font-size': '18px'
        })
        $('#second').removeClass('special');
        $('#password').attr('placeholder', 'Password');

        if (!$('#password').val()) {
            $('#passIcon').css({
                'color': 'red'
            })
        } else {
            $('#passIcon').css({
                'color': 'green'
            })
        }
    })

})