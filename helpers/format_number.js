
function formatNumber(number) {
  var s = [number-number%1, number%1];
  var str = s[1].toString().split('')
                .reverse().join("").match(/.{1,3}/g)
                .join(" ").split('').reverse() .join("") + 
                "." + (s[0]*10000-s[0]*10000%1 + s[0]).toString();
  return str;
}
var FormatNumber = formatNumber