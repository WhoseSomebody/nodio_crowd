var fn = function formatNumber(number) {
  var number = number.toString().replace(',','');
  var s = [number-number%1, number%1];
  var str = s[0].toString().split('')
                .reverse().join("").match(/.{1,3}/g)
                .join(" ").split('').reverse() .join("") + 
                "." + s[1].toString().substr(2,4);
  return str;
}

