
var generated = '';

var count = [1,1];

$("#generator textarea").ready(function() {
    if ($("#generator textarea").length > 0)
        generateRandom();
    })
$( document ).ready(function(){
    var show = true;


    function checkWidth() {
        if ($(window).width() > 900) {
            $('textarea').attr("wrap","Off");
        } else {
            $('textarea').attr("wrap","on");
        }
    }
    checkIfExists();
    checkIfCopied();



    checkWidth();
    $(window).resize(checkWidth);

    $('textarea').keyup(function(){ 
        $(this).val( $(this).val().replace( /\r?\n/gi, '' )); 
    });

    $('textarea').bind("enterKey",function(e){
       $('#new:not(.disabled) a').click();
    });
    $('textarea').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });


    $('#logout').click(function (e) {
        $.get( "/logout", function(res){
            console.log(res.no_session);
            if (res.no_session)
                $( location ).attr("href", "/");
            else {
                $('#logout').click();
            }

        });
    });
    // 
    $('#signin:not(.disabled) a, #new:not(.disabled) a').click(function(e){
        e.preventDefault();
        var password = $('#login .password').val();

        $.post( "/login", { key: password }, function(res) {
            console.log(res.session);
            if (res.success)
                window.setTimeout( function(){
                    $( location ).attr("href", "/account");
                }, 400);
    } );
    
    });
$('textarea').focus(
    function(){
        $(this).parent('div').css('border-color','#fff');
    }).blur(
    function(){
        $(this).parent('div').css('border-color','#fff');
    });
    $('textarea').focusout(
    function(){
        $(this).parent('div').css('border-color','rgba(255,255,255,0.2)');
    }).blur(
    function(){
        $(this).parent('div').css('border-color','rgba(255,255,255,0.2');
    });
    
    // save generated into the txt file

    $('.save-to-file').click(function() {
        contentType =  'data:application/octet-stream,';
        var area = $(this.closest(".pass-phrase")).find("textarea");
        uriContent = contentType + encodeURIComponent(area.val());
        this.setAttribute('href', uriContent);
        var filename = "key.txt";
        $("<a download='" + filename + "' href='" + uriContent + "'></a>")[0].click();
    });

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
    $("#walcop").click(function(e){
        e.preventDefault();
        // creating new textarea element and giveing it id 't'
        var t = document.createElement('textarea');
        t.id = 't';
        // Optional step to make less noise in the page, if any!
        t.style.height = 0;
        // You have to append it to your page somewhere, I chose <body>
        document.body.appendChild(t);
        // Copy whatever is in your div to our new textarea
        t.value = $('#code').text();
        // Now copy whatever inside the textarea to clipboard
        var selector = document.querySelector('#t');
        selector.select();
        document.execCommand('copy');
        // Remove the textarea
        document.body.removeChild(t);
        window.getSelection().removeAllRanges()
 ;       nextStep();
    });

    // allows to copy after generation of the password

    function nextStep() {
        $('.group2').removeClass('group2');
        $('.invisible2').removeClass('invisible2');
        $('.group1').css({"visibility":"hidden","opacity":"0",'display':'none'});
        $('.invisible1').css('opacity','0');
    }

    function prevStep() {
        $('.back').addClass('group2');
        $('.back_inv, #forw').addClass('invisible2');
        $('.group1:not(#copy)').css({"visibility":"visible", "opacity":"1",'display':'block'});
        $('#copy').css({"visibility":"visible", "opacity":"1","display": "-webkit-flex", "display": "-ms-flexbox", "display": "flex"});
        $('.invisible1').css({'opacity':'1','cursor':'pointer'});
    }


    $("#forw, #backw").click(function() {
        if ($(this).attr('id') == "forw"){
            nextStep();
        } else {
            prevStep();
        }
    });

    var client = new ClientJS();
    var os = client.getOS();
     console.log(client);
    if (os.indexOf("iOS") >= 0 || os.indexOf("Mac") >= 0){
      $("#copy .button .tablet").text("Next Step")
      $("#copy .button .mobile").text("Next")
      $("#walcop, .copy, .file").css("display","none");
    }
        
    $(".paste").click(function(){
      $("#login_new .password").val($("#generator .password").val()).keyup();
    })


})
 // chenl if user copied the generated password and var him to to account
    function checkIfCopied() {
        $('#login_new textarea.password').bind('input propertychange paste keyup', function() {
            console.log(generated);
            console.log($(this).val());
            if (generated == $(this).val()) {
                $("#new.signin").removeClass("disabled")
                $(".second .line").addClass("active");
                $('style.progress-point').text(".second svg,active {right:0} @media (min-width:901px) \
                    {.second svg,active{ right:56px }}");
                $('#new:not(.disabled) a').click(function(e){
                    e.preventDefault();

                    if (count[0] == 1) {
                        $.post( "/signup", { key: generated }, function(res){

                        } );
                        count[0] = 0;
                    }

                    // $.post( "/new_user", { key: generated }, (res) =>{
                    //     console.log(res.success);
                    //     if (res.success)
                    //         $( location ).attr("href", "/account");
                    // } );
                    window.setTimeout( function(){
                        $( location ).attr("href", "/account");
                    }, 400);

                    
                })}
            else {
                $("#new.signin:not(.disabled)").addClass("disabled");
                $(".second .line").removeClass("active");
                $('style.progress-point').text("");

            }


        });
    }

// check if user with such password exists and var him come in

     function checkIfExists() {
        $('#login textarea.password').bind('input propertychange paste keyup', function() {
        var area = $(this);
          if (area.val().length == 69) {
            console.log( $(this).val());
            $.post( "/login", { key: $(this).val()}, function(res) {
                if (res.success) {
                    $('.signin').removeClass("disabled");

                    $( location ).attr("href", "/account");
                } else {
                    $('.signin:not(.disabled)').addClass("disabled");
                }
            });
            count[1] = 0;
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
    $.get(file, function(whovarextFile) {
    var words = whovarextFile.split(/\n/);
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

