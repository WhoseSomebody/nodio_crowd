
var generated = '';
var step = 1;

var count = [1,1];

$("#generator textarea").ready(function() {
    if ($("#generator textarea").length > 0)
        generateRandom();
    })
$( document ).ready(function(){
    setTimeout(function(){
        $("body, html").css('overflow-y','auto');
        $('.container, .footer').removeClass("hidden");
    },150);

    $('.container, .footer').fadeIn(500);

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

    $('textarea').on("keydown", function(event){
      // Ignore controls such as backspace
      var arr = [8,16,17,20,32,35,36,37,38,39,40,45,46];

      // Allow letters
      for(var i = 65; i <= 90; i++){
        arr.push(i);
      }

      if(jQuery.inArray(event.which, arr) === -1){
        event.preventDefault();
      }
    });

    $('textarea').on("input", function(){
        var regexp = /[^\sa-zA-Z]|\n|\r|\t/g;
        $(this).val( $(this).val().replace(regexp,'') );

    });

    $('textarea').bind("enterKey",function(e){
       $('#new:not(.disabled) a').click();
    });


    $('#logout').click(function (e) {
        $.get( "/logout",function(res){
            if (res.session == "closed")
                $( location ).attr("href", "/");
        });
    });
    // 
    $('#signin:not(.disabled) a').click(function(e){
        e.preventDefault();
        var password = $('#login .password').val();

        $.post( "/login", { key: password }, function(res) {
            console.log(res.session);
            $( location ).attr("href", "/account");
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

    function walltetCopy() {
        $("#walcop").click(function(e){
            e.preventDefault();

            var selector = document.querySelector('#wallet-number');
            selector.select();
            document.execCommand('copy');
            window.getSelection().removeAllRanges();

            $(this).text("Copied!");
            $(".left-part .copy").css("border-color", "#17e6b2");

            setTimeout(function(){
                $("#walcop").html('<span class="desktop">Copy wallet number to clipboard</span><span class="mobile tablet">Copy number</span>');
                $(".left-part .copy").css("border-color", "rgba(28,206,156,0.22)");
                
            }, 3000);
        });
    }

    // allows to copy after generation of the password

    function nextStep() {
        step = 2;
        $('.container, .footer').fadeOut(170).addClass('hidden');
        setTimeout(function() {
            $('.group2').removeClass('group2');
            $('.step1').removeClass('closed').addClass("open");
            $('.invisible2').removeClass('invisible2');
            $('.group1').css({"visibility":"hidden","opacity":"0",'display':'none'});
            $('.invisible1').css('opacity','0', 'cursor', 'pointer');
            $(".second .line").addClass("active");
            $(".first .line").removeClass("active");
            $(".second .desktop.tablet svg").css("margin","-4.7px 0px 0px -5.7px");
            $('.container, .footer').fadeIn(250).removeClass('hidden');
        }, 80);
        

        if ($(window).width() < 601) {
            $("#backw").css({"visibility":"hidden","opacity":"0"});
        }
    }

    function prevStep() {
        step = 1;
        $('.container, .footer').fadeOut(170).addClass('hidden');
        setTimeout(function() {
            $('.step1').addClass('closed').removeClass("open");
            $(".second .line").removeClass("active");
            $(".first .line").addClass("active");
            $('.back').addClass('group2');
            $('.back_inv, #forw').addClass('invisible2');
            $('.group1:not(#copy)').css({"visibility":"visible", "opacity":"1",'display':'block'});
            $('#copy').css({"visibility":"visible", "opacity":"1","display": "-webkit-flex", "display": "-ms-flexbox", "display": "flex"});
            $(".second .desktop.tablet svg").css("margin","-4.7px 0px 0px -4px");
            $('.invisible1').css({'opacity':'1','cursor':'default'});
            $('.container, .footer').fadeIn(250).removeClass('hidden');
        }, 80);
        if ($(window).width() < 601) {
            $("#backw").css({"visibility":"visible","opacity":"1"});
        }
    }


    $(".step1 div").click(function() {
        prevStep();
    });
    $(".step2 div").click(function() {
        nextStep();
    });

    var client = new ClientJS();
    var os = client.getOS();
    console.log(client.getDevice());
    if (os.indexOf("iOS") >= 0){
      $("#copy .button .tablet").text("Next Step");
      $("#copy .button .mobile").text("Next");
      $(".copy pblue").css("display","none");
      $(".bar-item .passive .line").css("margin","1px 0 -1px 0");
      $(".qr img").css("padding", "7px 7px 6px 8px");
      $('body,  #nods-tip').click(function(){
        if ($('#nods-tip:not(.hidden)').length == 1){
            $('#nods-tip').hide();
            $('#nods-tip').addClass("hidden");            
        }
      })
    }
    if (client.isMobileAndroid() || client.isMobileIOS()){
        $('#walcop').text("Refill");
        $('#walcop').attr('href',"bitcoin:"+$('#wallet-number').val());
        if (client.isMobileAndroid()){
            $('#walcop').click(function(){
                setTimeout(function () { window.location = "https://play.google.com/store/apps/details?id=com.bitpay.copay"; }, 50);
                window.location = "bitcoin:"+$('#wallet-number').val();
            });
        } else {
            $('#walcop').click(function(){
                setTimeout(function () { window.location = "https://itunes.apple.com/us/app/copay-bitcoin-wallet/id951330296"; }, 50);
                window.location = "bitcoin:"+$('#wallet-number').val();
            });
        }
    } else {
        walltetCopy();
    }
        
    $(".paste").click(function(){
      $("#login_new .password").val($("#generator .password").val()).trigger('input');
    })

    $('#nods-amount .label.info').hover(
        function () {
            $('#nods-tip').stop().slideDown(100);
            $('#nods-amount .line').css("opacity",0);
            $('#nods-tip').removeClass("hidden");
        },
        function () {
            $('#nods-tip').stop().slideUp(100);
            $('#nods-amount .line').css("opacity",1);
            $('#nods-tip').addClass("hidden");
    });



    $( window ).resize(function() {
        if ($(window).width() > 600) {
                $("#backw").css({"visibility":"visible","opacity":"1"});
        } else {
            if (step == 1)
                $("#backw").css({"visibility":"visible","opacity":"1"});
            else
                $("#backw").css({"visibility":"hidden","opacity":"0"});
        }
    });

    $("#arrow-to-first").click(function(){
        prevStep();
    })


})
 // chenl if user copied the generated password and var him to to account
    function checkIfCopied() {
        $('#login_new textarea.password').bind('input', function() {
            if (generated == $(this).val()) {
                $("#new.signin span").text("Sign In As A New StakeHolder");
                $("#new.signin").removeClass("disabled").css("opacity", "1");
                $('style.progress-point').text(".second svg,active {right:0} @media (min-width:901px) \
                    {.second svg,active{ right:56px }}");
                $('#new:not(.disabled) a').click(function(e){
                    e.preventDefault();

                    if (count[0] == 1) {
                        $.post( "/signup", { key: generated }, function(res){
                            // window.setTimeout( function(){
                                $( location ).attr("href", "/account");
                            // }, 1000);
                        } );
                        count[0] = 0;
                    }
                    
                })}
            else {
                $("#new.signin:not(.disabled)").addClass("disabled");
                $('style.progress-point').text("");
                if ($(this).val().length == 69) {
                    $('#new.signin').css({"opacity":"1","border-color":"#ff004d"});
                    $('#new.signin .point').css({"background-color":"#ff004d"});
                    $('#new.signin span').text("Mismatch").css("color","#ff004d");
                    setTimeout(function(){
                        $('#new.signin').css({"opacity":"0.2"});
                        setTimeout(function(){
                            $('#new.signin').css({"opacity":"0"});
                            $('#new.signin span').css({"opacity" : "0.2"});

                        },100);
                        setTimeout(function(){
                            $('#new.signin').css({"border-color":"#17e6b2","opacity":"0.2"});
                            $('#new.signin .point').css({"background-color":"#17e6b2"});
                            $('#new.signin span').text("Sign In As A New StakeHolder").css({"color":"#17e6b2", "opacity" : "1"});

                        },200);


                    }, 3000)
                } else {
                    // $("#new.signin span").text("Sign In As A New StakeHolder");
                }

            }


        });
    }

// check if user with such password exists and var him come in

     function checkIfExists() {
        $('#login textarea.password').bind('input', function() {
        var area = $(this);
        if (area.val().length == 69) {
            $.post( "/login", { key: $(this).val()}, function(res) {
                if (res.success) {
                    $( location ).attr("href", "/account");
                    $('.signin').removeClass("disabled").css("opacity", "1");
                    $('.signin a').text("Success!").css("opacity","1");
                } else {
                    $('#signin').css({"opacity":"1","border-color":"#ff004d"});
                    $('.signin .point').css({"background-color":"#ff004d"});
                    $('.signin a').text("Mismatch").css("color","#ff004d");
                    setTimeout(function(){
                        $('.signin').css({"opacity":"0.2"});
                        setTimeout(function(){
                            $('#new.signin').css({"opacity":"0"});
                            $('#new.signin a').css({"opacity" : "0.2"});

                        },100);
                        setTimeout(function(){
                            $('.signin').css({"border-color":"#17e6b2","opacity":"0.2"});
                            $('.signin .point').css({"background-color":"#17e6b2"});
                            $('.signin a').text("Sign In").css({"color":"#17e6b2", "opacity" : "1"});

                        },200);
                    }, 3000)
                    $('.signin:not(.disabled)').addClass("disabled");
                }
            });
            count[1] = 0;
        } else {
            // setTimeout(function(){
            //     $('.signin a').text("").css("color","#17e6b2");
            //     $('#signin').css({"opacity":"0.2","border-color":"rgba(28,206,156,0.22)"});
            //     $('.signin a').text("Sign In");
            // }, 3000)
            $('.signin:not(.disabled)').addClass("disabled");
        }
        });
    }
  
// upload password from txt

function onFileSelected(event, me) {
  var result = $(me.closest(".pass-phrase")).find("textarea")

  var selectedFile = event.target.files[0];
  // console.log(selectedFile);
  if (selectedFile.name.split('.').pop().toLowerCase() == "txt"){
      var reader = new FileReader();
      
      reader.onload = function(event) {
        console.log("write from the file");
        result.text(event.target.result.replace(/(\r\n|\n|\r)/gm,"").substring(0, 69));
        result.val(event.target.result.replace(/(\r\n|\n|\r)/gm,"").substring(0, 69));
      };

      reader.readAsText(selectedFile);
      resetFormElement($('.file input'));
      setTimeout(function() {result.trigger('input')}, 100);
    } else {
        var text = $(me.closest(".pass-phrase")).attr('id') == "formspace_new" ? "SIGN IN AS A NEW STAKEHOLDER" : "SIGN IN";
        $('.signin').css({"opacity":"1","border-color":"#ff004d"});
        $('.signin .point').css({"background-color":"#ff004d"});
        $('.signin a').text("Should be a *.txt file format.").css("color","#ff004d");
        setTimeout(function(){
            $('.signin').css({"opacity":"0.2"});
            setTimeout(function(){
                $('.signin').css({"opacity":"0"});
                $('.signin a').css({"opacity" : "0.2"});

            },100);
            setTimeout(function(){
                $('.signin').css({"border-color":"#17e6b2","opacity":"0.2"});
                $('.signin .point').css({"background-color":"#17e6b2"});
                $('.signin a').text(text).css({"color":"#17e6b2", "opacity" : "1"});

            },200);
        }, 3000)
    }
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

