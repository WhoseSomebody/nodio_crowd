
$( document ).ready(function(){
    $('textarea.password').bind('input propertychange', function() {

          // $("#yourBtnID").hide();

          if(this.value.length){
            if ($('.show').hasClass('hidden'))
                $('.show').removeClass('hidden');
                $('.paste, .file').addClass('hidden');

          } else {
                $('.show').addClass('hidden');
                $('.paste, .file').removeClass('hidden');
          }
    });

    $('.save-to-file').click(function() {
        contentType =  'data:application/octet-stream,';
        var area = $(this.closest(".pass-phrase")).find("textarea");
        uriContent = contentType + encodeURIComponent(area.val());
        this.setAttribute('href', uriContent);
        var filename = "key.txt";
        $("<a download='" + filename + "' href='" + uriContent + "'></a>")[0].click();
    });
})

function onFileSelected(event, me) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();
  var result = $(me.closest(".pass-phrase")).find("textarea")
  
  reader.onload = function(event) {
    result.text(event.target.result.replace(/(\r\n|\n|\r)/gm,"").substring(0, 69));
  };

  reader.readAsText(selectedFile);
}