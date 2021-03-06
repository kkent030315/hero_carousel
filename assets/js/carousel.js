/**
 * MIT License
 * 
 * Copyright (c) 2021 Kento Oki
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function Carousel() {
    const CAROUSEL_STATES = {
        PLAYING: 1,
        PAUSED: 2,
    };

    var isDebug = false;
    var isInitialized = false;
    var playState = CAROUSEL_STATES.PAUSED;
    var carouselProgressTimer;
    var numberOfCarousels,
        numberOfDisplayImages = null;

    var currentProgress = 0;
    const MAX_PROGRESS = 1.0;
    const PROGRESS_INTERVAL = 50;

    // debug-dedicated logger function that just wraps `console.log`
    this.log = function() {
        if (isDebug) {
            console.log.apply(console, arguments);
        }
    };

    // initialize the carousel
    this.init = function() {
        if (isInitialized) {
            this.log("the carousel is already initialized");
            return;
        }

        this.log("initializing the carousel...");

        // event handler for play/pause button
        $(".carousel-toggle-button").on("click", () => {
            // should not be happened
            if (
                // repair if both "none"
                $(".carousel-toggle-play").css("display") === "none" &&
                $(".carousel-toggle-pause").css("display") === "none"
            ) {
                $(".carousel-toggle-play").css("display", "block");
            } else if (
                // repair if both "block"
                $(".carousel-toggle-play").css("display") === "block" &&
                $(".carousel-toggle-pause").css("display") === "block"
            ) {
                $(".carousel-toggle-play").css("display", "none");
            }

            let isPlaying = $(".carousel-toggle-play").css("display") === "none";

            // swap the icon
            $(".carousel-toggle-pause").css("display", isPlaying ? "none" : "block");
            $(".carousel-toggle-play").css("display", isPlaying ? "block" : "none");

            isPlaying ? this.pause() : this.play();
        });

        // event handler for dot pager buttons
        $(".carousel-pager-button").each((i, v) => {
            this.log(`register button event (${i})`);

            $(v).on("click", () => {
                let currentEntry = this.getCurrentEntryContextAndIndex();
                let currentDisplayImageEntry = this.getCurrentDisplayImageContextAndIndex();

                this.switchCurrentEntryByIndex(currentEntry.index, i);
                this.switchDisplayImageByIndex(currentDisplayImageEntry.index, i);

                // reset all of progressbars
                this.resetProgressBars();
                // reset current progress
                currentProgress = 0;

                // fill out all of previous progressbars
                if (i > 0) {
                    for (let w = 0; w < i; w++) {
                        this.setProgressBarProgressByIndex(w, 1.0);
                    }
                }
            });
        });

        this.resetProgressBars();
        this.checkAndSetCurrentEntry();
        this.checkAndSetCurrentDisplayImage();

        numberOfCarousels = this.getNumberOfCarousels();
        numberOfDisplayImages = this.getNumberOfDisplayImages();

        isInitialized = true;
        this.log("the carousel initialized successfully");
    };

    this.resetProgressBarByIndex = function(index) {
        $($(".carousel-pager-progress")[index]).css(
            "transform",
            "translate3d(0px, 0px, 0px) scale(0, 1)"
        );
    };

    this.resetProgressBars = function() {
        this.log("resetting progressbars...");
        let numberOfResetted = 0;
        $(".carousel-pager-progress").each((i, v) => {
            $(v).css("transform", "translate3d(0px, 0px, 0px) scale(0, 1)");
            numberOfResetted++;
        });
        this.log(`${numberOfResetted} progressbars have been reset`);
    };

    this.getEntryByIndex = function(index) {
        return $(".carousel-pagers").children(".carousel-pager-item")[index];
    };

    this.setCurrentEntryByIndex = function(index) {
        let x = $(this.getEntryByIndex(index));
        if (!x.hasClass("current")) {
            x.addClass("current");
        }
    };

    // switch into the next index and erase previous index
    this.switchCurrentEntryByIndex = function(prevIndex, nextIndex) {
        $(this.getEntryByIndex(prevIndex)).removeClass("current");
        this.setCurrentEntryByIndex(nextIndex);
    };

    this.getDisplayImageByIndex = function(index) {
        return $(".carousel-context").children(".carousel-item")[index];
    };

    this.setCurrentDisplayImageByIndex = function(index) {
        let x = $(this.getDisplayImageByIndex(index));
        if (!x.hasClass("current")) {
            x.addClass("current");
        }
        if (x.hasClass("prev")) {
            x.removeClass("prev");
        }
    };

    this.hideDisplayImageByIndex = function(index) {
        let x = $(this.getDisplayImageByIndex(index));
        if (x.hasClass("current")) {
            x.removeClass("current");
        }
        if (x.hasClass("prev")) {
            x.removeClass("prev");
        }
        x.addClass("prev");
    };

    this.hideAllDisplayImages = function() {
        for (let i = 0; i < numberOfDisplayImages; i++) {
            let x = $(this.getDisplayImageByIndex(i));
            if (x.hasClass("prev")) {
                x.removeClass("prev");
            }
        }
    };

    // switch into the next index and erase previous index
    this.switchDisplayImageByIndex = function(prevIndex, nextIndex) {
        this.hideDisplayImageByIndex(prevIndex);
        this.setCurrentDisplayImageByIndex(nextIndex);
    };

    this.getCurrentDisplayImageContextAndIndex = function() {
        let result = {};
        $(".carousel-context")
            .children(".carousel-item")
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

    this.checkAndSetCurrentDisplayImage = function() {
        let noCurrentDisplayImage = true;
        let numberOfCurrentDisplayImages = 0;

        $(".carousel-context")
            .children(".carousel-item")
            .each((i, v) => {
                if ($(v).hasClass("current")) {
                    noCurrentDisplayImage = false;
                    numberOfCurrentDisplayImages++;
                }
            });

        if (noCurrentDisplayImage) {
            // if there is no `current` entry found
            this.log("there is no `current` entry in the carousel image items");
            this.log("setting `current` entry in first image item...");

            // set `current` in first item of `carousel-context`
            this.setCurrentDisplayImageByIndex(0);

            this.log("`current` entry of image has been set in first item");
        } else if (numberOfCurrentDisplayImages > 1) {
            // should not be happened but if there are multiple numbers of `current` entry
            this.log(
                `there were ${numberOfCurrentDisplayImages} image entries found`
            );
            this.log("erasing `current` from all of image items...");

            // erase `current` from all of items
            $(".carousel-context")
                .children(".carousel-item")
                .each((i, v) => {
                    $(v).removeClass("current");
                });

            // and set `current` entry in first item
            this.setCurrentDisplayImageByIndex(0);

            this.log("repaired sccessfully");
        } else {
            // only one `current` entry found
            this.log("`current` entry found in the carousel image items");
        }
    };

    this.checkAndSetCurrentEntry = function() {
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
    this.getCurrentEntryContextAndIndex = function() {
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

    this.getNumberOfCarousels = function() {
        return $(".carousel-pagers").children(".carousel-pager-item").length;
    };

    this.getNumberOfDisplayImages = function() {
        return $(".carousel-context").children(".carousel-item").length;
    };

    this.moveToNextCarouselEntry = function() {
        let currentEntry = this.getCurrentEntryContextAndIndex();

        this.log(`there are ${numberOfCarousels} carousels`);

        // if we rearched last index, come back to the first index (zero)
        let nextCarouselIndex =
            currentEntry.index + 1 > numberOfCarousels - 1 ?
            0 :
            currentEntry.index + 1;

        this.log(`next carousel index is ${nextCarouselIndex}`);

        this.switchCurrentEntryByIndex(currentEntry.index, nextCarouselIndex);

        // reset the progressbars since we back into the first entry
        if (nextCarouselIndex == 0) {
            this.resetProgressBars();
        }
    };

    this.moveToNextDisplayImage = function() {
        let currentDisplayImageEntry = this.getCurrentDisplayImageContextAndIndex();

        this.log(`there are ${numberOfDisplayImages} carousel display images`);

        // if we rearched last index, come back to the first index (zero)
        let nextDisplayImageIndex =
            currentDisplayImageEntry.index + 1 > numberOfDisplayImages - 1 ?
            0 :
            currentDisplayImageEntry.index + 1;

        this.log(`next carousel display image index is ${nextDisplayImageIndex}`);

        this.switchDisplayImageByIndex(
            currentDisplayImageEntry.index,
            nextDisplayImageIndex
        );

        if (nextDisplayImageIndex === 0) {
            // clear all `prev` since we rearched the last entry
            this.hideAllDisplayImages();
        }
    };

    // set the specific progressbar progress by index
    this.setProgressBarProgressByIndex = function(index, progress) {
        let entry = this.getEntryByIndex(index);
        let pagerProgressBarElement = $(entry).children(".carousel-pager-progress");

        if (!pagerProgressBarElement) {
            this.log(
                "ERR: failed to locate `carousel-pager-progress` in its children"
            );
            return;
        }

        $(pagerProgressBarElement).css(
            "transform",
            `translate3d(0px, 0px, 0px) scale(${progress}, 1)`
        );
    };

    // increase progressbar of current entry
    // `progress` parameter must have 0.0 - 1.0 floating value
    this.setCurrentEntryProgressBar = function(progress) {
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

    // play the carousel
    this.play = function() {
        if (this.playState === CAROUSEL_STATES.PLAYING) {
            this.log("the carousel is already playing");
            return;
        }

        this.log("playing...");

        carouselProgressTimer = window.setInterval(() => {
            if (currentProgress >= MAX_PROGRESS) {
                this.log("carousel has ended");
                // to prevent floating number like 0.99000008 looked like a bit incomplete
                this.setCurrentEntryProgressBar(1.0);

                this.moveToNextCarouselEntry();
                this.moveToNextDisplayImage();

                // reset the progress
                currentProgress = 0;
                return;
            }

            // this.log(`progress: ${progress}`);
            this.setCurrentEntryProgressBar(currentProgress);

            currentProgress += 0.01;
        }, PROGRESS_INTERVAL);

        this.log("the carousel is now playing");
        playState = CAROUSEL_STATES.PLAYING;
    };

    // pause the carousel
    this.pause = function() {
        if (this.playState === CAROUSEL_STATES.PAUSED) {
            this.log("the carousel is already paused");
            return;
        }

        if (!carouselProgressTimer) {
            this.log("there are no progress timer available");
            return;
        }

        clearInterval(carouselProgressTimer);
        carouselProgressTimer = null;

        playState = CAROUSEL_STATES.PAUSED;
    };
}

$(function() {
    var carousel = new Carousel();
    carousel.init();
    carousel.play();
});