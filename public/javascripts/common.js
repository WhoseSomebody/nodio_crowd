
var generated = '';
$( document ).ready(function(){
    var show = true;
    checkIfExists();
    checkIfCopied();
    // $('textarea.password').bind('input propertychange', function() {
    //       $(this).data("code", this.value);
    //       var s = $(this).data("code").replace(/[^ ]/g, '♦');
    //       if (show) {
    //         $(this).val(this.value);
    //       } 
    //       else {
    //         $(this).val(s);
    //       }

    //       if(this.value.length){
    //         if ($('.show').hasClass('hidden'))
    //             $('.show').removeClass('hidden');
    //             $('.paste, .file').addClass('hidden');

    //       } else {
    //             $('.show').addClass('hidden');
    //             $('.paste, .file').removeClass('hidden');
    //       }
    // });

    // save generated into the txt file

    $('.save-to-file').click(function() {
        contentType =  'data:application/octet-stream,';
        var area = $(this.closest(".pass-phrase")).find("textarea");
        uriContent = contentType + encodeURIComponent(area.val());
        this.setAttribute('href', uriContent);
        var filename = "key.txt";
        $("<a download='" + filename + "' href='" + uriContent + "'></a>")[0].click();
    });

    // $('.show').click(function(){
    //     show = !show
    //     if (show) {
    //         $(this).text("Hide");
    //     } else {
    //         $(this).text("Show");
    //     }
    // });

    // write generated into the textbox
    $('.generate').click(function(){
        generated = generateRandom();
        $("#copy").removeClass("disabled");
    });

    // copy to clipboard
    $("#copy a").click(function(){
        var Field = $('#generator .password');
        Field.select();
        document.execCommand('copy'); 
        window.getSelection().removeAllRanges();
        nextStep();
    });

    // allows to copy after generation of the password

    function nextStep() {
        $('.group2').removeClass('group2');
        $('.invisible2').removeClass('invisible2');
        $('.group1').css('display', 'none');
        $('.invisible1').css({
            'opacity': '0',
            'cursor': 'default'});
    }



    // // copy to clipboard
    // $(".copy a").click(function(){
    //     var Field = $('#code');
    //     Field.select();
    //     document.execCommand('copy'); 
    // });

})
 // chenl if user copied the generated password and let him to to account
    function checkIfCopied() {
        $('#login_new textarea.password').bind('input propertychange paste keyup', function() {
            console.log(generated);
            console.log($(this).val());
            if (generated == $(this).val()) {
                $("#new.signin").removeClass("disabled")
                $(".second .line").addClass("active");
                $(".second svg,active").css("right", "0");
                $('#new:not(.disabled) a').click(function(e){
                    e.preventDefault();
                    $.post( "/new_user", { key: generated }, (res) =>{
                        console.log(res.success);
                        if (res.success)
                            $( location ).attr("href", "/account");
                    } );
                    
                    
                })}
            else {
                $("#new.signin:not(.disabled)").addClass("disabled");
                $(".second .line").removeClass("active");
                $(".second svg,active").css("right", "");
            }


        });
    }

// check if user with such password exists and let him come in

     function checkIfExists() {
        $('#login textarea.password').bind('input propertychange paste keyup', function() {
        console.log("chek textbox" + $(this));
        var area = $(this);
          if (area.val().length == 69) {
            $.post( "/check_user", { key: $(this).val()}, (res) =>{
                console.log(res.success);
                if (res.success) {
                    $('.signin').removeClass("disabled");
                } else {
                    $('.signin:not(.disabled)').addClass("disabled");
                }
            });
          } else {
                $('.signin:not(.disabled)').addClass("disabled");
          }
        });
    }
  
// upload password from txt

function onFileSelected(event, me) {
    console.log("write from the file _____");

  var selectedFile = event.target.files[0];
  var reader = new FileReader();
  var result = $(me.closest(".pass-phrase")).find("textarea")
  
  reader.onload = function(event) {
    console.log("write from the file");
    result.text(event.target.result.replace(/(\r\n|\n|\r)/gm,"").substring(0, 69));
    result.val(event.target.result.replace(/(\r\n|\n|\r)/gm,"").substring(0, 69));
  };

  reader.readAsText(selectedFile);
  resetFormElement($('.file input'));
  setTimeout(function() {result.keyup()}, 100);
}

// generate new password
function generateRandom() {
    var file = "/words.txt"
    $.get(file, function(wholeTextFile) {
    var words = wholeTextFile.split(/\n/);
    var random = [];
    
    for(var i=0; i<10; i++) {
        var rn = Math.floor(Math.random() * words.length);
        random.push(words[rn]);
        words.splice(rn, 1);
    }
    var password = random.join(' ').replace(/(\r\n|\n|\r)/gm,"");
    $('#generator .password').val(password);
    generated =  password;
});
}

// to reset file input (for txt files)
function resetFormElement(e) {
  e.wrap('<form>').closest('form').get(0).reset();
  e.unwrap();
}