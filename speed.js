let timeout = millisecs =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, millisecs);
  });
let func1 = async () => {
  console.log("dentro de func1");
  await timeout(3000);
  return false;
};
(async () => {
  if (false && !(await func1())) console.log("es verdadero");
  else console.log("es falso");
})();
