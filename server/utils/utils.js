function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

let timeTomiliseconds = time => {
  //7:05:15 3:32:40
  [hrs, min, sec] = time.split(":");
  return (
    (parseInt(hrs) * 60 * 60 + parseInt(min) * 60 + parseInt(sec)) * 1000 * 2
  );
};

let timeTomiliseconds2 = duration => {
  //1h:30min 5h 30min
  let matches = duration.match(/\d+/g);
  if (matches === undefined || matches === null) return;
  if (matches.length === 1 && duration.includes("h"))
    return (millisecs = matches[0] * 60 * 60 * 1000);
  if (matches.length === 1 && duration.includes("min"))
    return (millisecs = matches[0] * 60 * 1000);
  return (millisecs = (matches[0] * 60 * 60 + matches[1] * 60) * 1000);
};

let getCloserDurationIndex = (durations, goalDuration) => {
  //all in milliseconds
  if (goalDuration === undefined || goalDuration === null) return;
  let goalIsGreater = durations.every(e => e < goalDuration);
  let goalIsLess = durations.every(e => e > goalDuration);
  if (goalIsGreater) return 1;
  if (goalIsLess) return durations.length;
  let closerDuration, index;
  for (var i = durations.length - 1; i >= 0; i--) {
    if (goalDuration < durations[i]) {
      console.log("la siguiente hora es: ", durations[i]);
      console.log("la hora anterior es: ", durations[i + 1]);
      if (durations[i] - goalDuration < goalDuration - durations[i + 1]) {
        closerDuration = durations[i];
        index = i;
      } else {
        closerDuration = durations[i + 1];
        index = i + 1;
      }
      i = -1;
    }
  }
  return index + 1;
};

let msToTime = duration => {
  console.log("llego esta duracion: ", duration);
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return (
    (hours != 1 ? hours + " horas " : hours + " hora ") +
    minutes +
    " minutos " +
    seconds +
    " segundos"
  );
};

function Random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  timeout,
  msToTime,
  Random,
  timeTomiliseconds,
  timeTomiliseconds2,
  getCloserDurationIndex
};
