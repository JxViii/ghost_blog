export function startsWith(str, x){

  const x_name = x.toLowerCase();

  if(x_name.slice(0,str.length) === str){
    return true;
  }

  return false

}

// Not necessary u can do Date(<isoFormat>)
export function dateComparisonBinary(x, y){
  // 2026-03-02T22:53:04.000+00:00
  // 12345678901234567890123456789

  const rawX = x.published_at;
  const rawY = y.published_at;

  const yearX = parseInt(rawX.slice(0,4))
  const monthX  = parseInt(rawX.slice(5,7))
  const dayX = parseInt(rawX.slice(8,10))
  const hourX = parseInt(rawX.slice(11,13))
  const minuteX =parseInt(rawX.slice(15,17))
  const secondsX =parseInt(rawX.slice(18,20))

  const X = []
  X.push(secondsX,minuteX,hourX,dayX,monthX,yearX)
  console.log(X);

  const yearY = parseInt(rawY.slice(0,4))
  const monthY  = parseInt(rawY.slice(5,7))
  const dayY = parseInt(rawY.slice(8,10))
  const hourY = parseInt(rawY.slice(11,13))
  const minuteY =parseInt(rawY.slice(14,16))
  const secondsY =parseInt(rawY.slice(17,19))

  const Y = []
  Y.push(secondsY,minuteY,hourY,dayY,monthY,yearX)
  console.log(Y);

  let Xval = 0; let Yval = 0;

  for(let i = 0; i < 6; i++){

    const binary_val = Math.pow(2,i);

    if(X[i] > Y[i])
      Xval += binary_val;
    else if(X[i] < Y[i])
      Yval += binary_val;
    else continue;

    console.log(Xval, Yval);

  }

  return Xval - Yval;

}