let NGC = 3000;
let maxExp = 6;
for (let i = 0; i < maxExp; i++) {
  console.log("Expedición ", i + 1, maxExp - i);
  let toSend = parseInt((NGC - 200) / (maxExp - i));
  console.log(`Mandando ${toSend}`);
  NGC -= toSend;
  console.log("Quedan ", NGC);
}
