function Carousel() {
  const CAROUSEL_STATES = {
    PLAYING: 1,
    PAUSED: 2,
  };

  var isDebug = true;
  var isInitialized = false;
  var playState = CAROUSEL_STATES.PAUSED;
  var carouselProgressTimer;
  var numberOfCarousels = null;

  // debug-dedicated logger function that just wraps `console.log`
  this.log = function () {
    if (isDebug) {
      console.log.apply(console, arguments);
    }
  };

  // initialize the carousel
  this.init = function () {
    if (isInitialized) {
      this.log("the carousel is already initialized");
      return;
    }

    this.log("initializing the carousel...");

    // event handler for play/pause button
    $(".carousel-toggle-button").on("click", () => {
      // should not be happened
      if (
        $(".carousel-toggle-play").css("display") === "none" &&
        $(".carousel-toggle-pause").css("display") === "none"
      ) {
        $(".carousel-toggle-play").css("display", "block");
      } else if (
        $(".carousel-toggle-play").css("display") === "block" &&
        $(".carousel-toggle-pause").css("display") === "block"
      ) {
        $(".carousel-toggle-play").css("display", "none");
      }

      let isPlaying = $(".carousel-toggle-play").css("display") === "none";
      $(".carousel-toggle-pause").css("display", isPlaying ? "none" : "block");
      $(".carousel-toggle-play").css("display", isPlaying ? "block" : "none");

      playState = isPlaying ? CAROUSEL_STATES.PLAYING : CAROUSEL_STATES.PAUSED;
      console.log(playState);
    });

    this.resetProgressBars();
    this.checkAndSetCurrentEntry();
    numberOfCarousels = this.getNumberOfCarousels();

    isInitialized = true;
    this.log("the carousel initialized successfully");
  };

  this.resetProgressBars = function () {
    this.log("resetting progressbars...");
    let numberOfResetted = 0;
    $(".carousel-pager-progress").each((i, v) => {
      $(v).css("transform", "translate3d(0px, 0px, 0px) scale(0, 1)");
      numberOfResetted++;
    });
    this.log(`${numberOfResetted} progressbars have been reset`);
  };

  this.getEntryByIndex = function (index) {
    return $(".carousel-pagers").children(".carousel-pager-item")[index];
  };

  this.setCurrentEntryByIndex = function (index) {
    $(this.getEntryByIndex(index)).addClass("current");
  };

  this.switchCurrentEntryByIndex = function (prevIndex, nextIndex) {
    $(this.getEntryByIndex(prevIndex)).removeClass("current");
    this.setCurrentEntryByIndex(nextIndex);
  };

  this.checkAndSetCurrentEntry = function () {
    let noCurrentEntry = true;
    let numberOfCurrentEntries = 0;

    $(".carousel-pagers")
      .children(".carousel-pager-item")
      .each((i, v) => {
        if ($(v).hasClass("current")) {
          noCurrentEntry = false;
          numberOfCurrentEntries++;
        }
      });

    if (noCurrentEntry) {
      // if there is no `current` entry found
      this.log("there is no `current` entry in the carousel pager items");
      this.log("setting `current` entry in first item...");

      // set `current` in first item of `carousel-pagers`
      this.setCurrentEntryByIndex(0);

      this.log("`current` entry has been set in first item");
    } else if (numberOfCurrentEntries > 1) {
      // should not be happened but if there are multiple number of `current` entry
      this.log(`there were ${numberOfCurrentEntries} entries found`);
      this.log("erasing `current` from all of items...");

      // erase `current` from all of items
      $(".carousel-pagers")
        .children(".carousel-pager-item")
        .each((i, v) => {
          $(v).removeClass("current");
        });

      // and set `current` entry in first item
      this.setCurrentEntryByIndex(0);

      this.log("repaired sccessfully");
    } else {
      // only one `current` entry found
      this.log("`current` entry found in the carousel pager items");
    }
  };

  // returns index and context for current entry
  this.getCurrentEntryContextAndIndex = function () {
    this.checkAndSetCurrentEntry();
    let result = {};
    $(".carousel-pagers")
      .children(".carousel-pager-item")
      .each((i, v) => {
        if ($(v).hasClass("current")) {
          result = {
            context: v,
            index: i,
          };
          return;
        }
      });
    return result;
  };

  this.getNumberOfCarousels = function () {
    return $(".carousel-pagers").children(".carousel-pager-item").length;
  };

  this.moveToNextCarouselEntry = function () {
    let currentEntry = this.getCurrentEntryContextAndIndex();

    this.log(`there are ${numberOfCarousels} carousels`);

    let nextCarouselIndex =
      currentEntry.index + 1 > numberOfCarousels - 1
        ? 0
        : currentEntry.index + 1;

    this.log(`next carousel index is ${nextCarouselIndex}`);

    this.switchCurrentEntryByIndex(currentEntry.index, nextCarouselIndex);

    // reset the progressbars since we back into the first entry
    if (nextCarouselIndex == 0) {
      this.resetProgressBars();
    }
  };

  // increase progressbar of current entry
  // `progress` parameter must have 0.0 - 1.0 floating value
  this.setCurrentEntryProgressBar = function (progress) {
    let currentEntry = this.getCurrentEntryContextAndIndex();
    if (!currentEntry.context) {
      this.log("ERR: context of current entry was not found");
      return;
    }

    let progressbarElement = $(currentEntry.context).children(
      ".carousel-pager-progress"
    );

    if (!progressbarElement) {
      this.log("ERR: progressbar element was not found");
      return;
    }

    progressbarElement.css(
      "transform",
      `translate3d(0px, 0px, 0px) scale(${progress}, 1)`
    );
  };

  this.play = function () {
    if (this.playState === CAROUSEL_STATES.PLAYING) {
      this.log("the carousel is already playing");
      return;
    }

    this.log("playing...");

    var progress = 0;
    var maxProgress = 1.0;
    var interval = 50;
    
    carouselProgressTimer = window.setInterval(() => {
      if (progress >= maxProgress) {
        this.log("carousel has ended");
        // to prevent floating number like 0.99000008 looked like a bit incomplete
        this.setCurrentEntryProgressBar(1.0);
        this.moveToNextCarouselEntry();
        // reset the progress
        progress = 0;
        return;
      }

      // this.log(`progress: ${progress}`);
      this.setCurrentEntryProgressBar(progress);

      progress += 0.01;
    }, interval);

    this.log("the carousel is now playing")
    playState = CAROUSEL_STATES.PLAYING
  };

  this.pause = function () {
    if (this.playState === CAROUSEL_STATES.PAUSED) {
      this.log("the carousel is already paused");
      return;
    }

    if (!carouselProgressTimer) {
      this.log("there are no progress timer available")
      return;
    }

    clearInterval(carouselProgressTimer)
    this.playState = CAROUSEL_STATES.PAUSED
  };
}

$(function () {
  // event handler for play/pause button
  //$(".carousel-toggle-button").on("click", function () {
  //  let isPlaying = $(".carousel-toggle-play").css("display") === "none";
  //  $(".carousel-toggle-pause").css("display", isPlaying ? "none" : "block");
  //  $(".carousel-toggle-play").css("display", isPlaying ? "block" : "none");
  //});

  // reset all progressbars
  //$(".carousel-pager-progress").each((i, v) => {
  //  $(v).css("transform", "translate3d(0px, 0px, 0px) scale(0, 1)");
  //});

  /*$(".carousel-pagers")
    .children(".carousel-pager-item")
    .each((i, v) => {
      console.log(`${i} => ${v}`);
    });*/

  var carousel = new Carousel();
  carousel.init();
  carousel.play();

  var execTests = function () {
    window.setTimeout(() => {
      console.log("`carousel.pause()` test");
      carousel.pause();

      window.setTimeout(() => {
        console.log("`carousel.play()` test");
        carousel.play();
      }, 3000);
    }, 8000);
  }
});
