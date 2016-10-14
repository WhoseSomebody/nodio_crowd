
var generated = '';
$( document ).ready(function(){
    var show = true;
    
  
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

    $('.save-to-file').click(function() {
        contentType =  'data:application/octet-stream,';
        var area = $(this.closest(".pass-phrase")).find("textarea");
        uriContent = contentType + encodeURIComponent(area.val());
        this.setAttribute('href', uriContent);
        var filename = "key.txt";
        $("<a download='" + filename + "' href='" + uriContent + "'></a>")[0].click();
    });

    $('.show').click(function(){
        show = !show
        if (show) {
            $(this).text("Hide");
        } else {
            $(this).text("Show");
        }
    });
    $('.generate').click(function(){
        generated = generateRandom();
        $("#copy").removeClass("disabled");
    });
    $("#copy a").click(function(){
        var Field = $('#generator .password');
        Field.select();
        document.execCommand('copy'); 
        window.getSelection().removeAllRanges();

        $('.group2').removeClass('group2');
        $('.invisible2').removeClass('invisible2');
        $('.group1').css('display', 'none');
        $('.invisible1').css({
            'opacity': '0',
            'cursor': 'default'});
    });

    $('textarea.password').bind('input propertychange', function() {
        console.log(generated);
        console.log($(this).val());
        if (generated == $(this).val())
            $("#new.signin").removeClass("disabled")
        else
            if (!$("#new.signin").hasClass("disabled"))
                $("#new.signin").addClass("disabled")

    });

    $(".copy a").click(function(){
        var Field = $('#code');
        Field.select();
        document.execCommand('copy'); 
    });

    $('#new:not(.disabled)').click(function(){
        $.post( "/new_user", { key: generated } );
    })
})

// upload password from txt
function onFileSelected(event, me) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();
  var result = $(me.closest(".pass-phrase")).find("textarea")
  
  reader.onload = function(event) {
    result.text(event.target.result.replace(/(\r\n|\n|\r)/gm,"").substring(0, 69));
  };

  reader.readAsText(selectedFile);
}

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
    $('#generator .password').text(password);
    generated =  password;
});
}
