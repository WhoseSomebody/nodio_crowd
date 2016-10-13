function focusLink(isOnFocus)
{
    if (isOnFocus)
      document.getElementById('formspace').className = "pass-phrase focused";
    else
      document.getElementById('formspace').className = "pass-phrase";
}

function toggle_pass(){
    var pass = document.getElementsByClassName('showhide')[0].innerHTML;
        if(pass=="show")
         {
            document.getElementsByClassName('password')[0].type = "text";
            pass= "Hide";
         }
        else
         {
            document.getElementsByClassName('password')[0].type = "password";
            pass = "Show";
         }
}