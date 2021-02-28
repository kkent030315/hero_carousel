function IntervalTimer(callback, interval) {
  var timerId,
    startTime,
    remaining = 0;
  var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

  this.pause = function () {
    if (state != 1) return;

    remaining = interval - (new Date() - startTime);
    window.clearInterval(timerId);
    state = 2;
  };

  this.resume = function () {
    if (state != 2) return;

    state = 3;
    window.setTimeout(this.timeoutCallback, remaining);
  };

  this.timeoutCallback = function () {
    if (state != 3) return;

    callback();

    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
  };

  startTime = new Date();
  timerId = window.setInterval(callback, interval);
  state = 1;
}

$(function () {
  // event handler for play/pause button
  $(".carousel-toggle-button").on("click", function () {
    let isPlaying = $(".carousel-toggle-play").css("display") === "none";
    $(".carousel-toggle-pause").css("display", isPlaying ? "none" : "block");
    $(".carousel-toggle-play").css("display", isPlaying ? "block" : "none");
  });

  // reset all progressbars
  $(".carousel-pager-progress").each((i, v) => {
    $(v).css("transform", "translate3d(0px, 0px, 0px) scale(0, 1)");
  });
});
