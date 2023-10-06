(function() {
  var board = document.getElementById('game-board');
  var settingsForm = document.getElementById('settings-form');
  var resetForm = document.getElementById('reset-form');
  var adContainerWrap = document.getElementById('ad-container-wrap');
  var message = document.getElementById('message');
  var resultMessage = document.getElementById('result-message');
  var leaveGameBtn = document.getElementById('leave-game');
  var cells = [];
  var playerSymbol;
  var currentPlayer;
  var gameOver = false;
  var activeCell = 0;
  var blockedMoves = true;
  var mode = 'settings';

  // check if combination can be winner
  function checkWinnerCombination(cells, markWinner) {
    var winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (var i = 0; i < winningCombos.length; i++) {
      var combination = winningCombos[i];
      var cell1 = cells[combination[0]];
      var cell2 = cells[combination[1]];
      var cell3 = cells[combination[2]];
      var symbol1 = cell1.textContent;
      var symbol2 = cell2.textContent;
      var symbol3 = cell3.textContent;

      if (symbol1 !== '' && symbol1 === symbol2 && symbol2 === symbol3) {
        if (markWinner) {
          cell1.classList.add('win');
          cell2.classList.add('win');
          cell3.classList.add('win');
        }

        return true;
      }
    }

    checkDraw();

    return false;
  }

  function checkDraw() {
    if (!cells.some(function(cell) {
      return cell.textContent === '';
    })) {
      resetForm.classList.remove('hidden');
      resultMessage.textContent = 'It\'s a draw!';
      setGameOver();
      setActiveCell();
    }
  }

  // Gave over
  function setGameOver() {
    resetForm.classList.remove('hidden');
    gameOver = true;
    mode = 'reset';
    message.textContent = 'Game over!';
  }

  function makeMove(cell) {
    if (!gameOver && cell.textContent === '') {
      blockedMoves = true;

      message.textContent = '';
      cell.textContent = playerSymbol;
      cell.classList.add(playerSymbol === 'X' ? 'cross' : 'zero');

      if (checkWinnerCombination(cells, true)) {
        resultMessage.textContent = currentPlayer + ' wins!';
        setGameOver();
      } else {
        currentPlayer = changeCurrentPlayer();
        setTimeout(computerMove, 500);
      }
    }
  }

  // check if next move can be winner
  function checkNextMove(cells, symbol) {
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].textContent === '') {
        cells[i].textContent = symbol;

        if (checkWinnerCombination(cells)) {
          cells[i].textContent = '';

          return i;
        } else {
          cells[i].textContent = '';
        }
      }
    }
  }

  // computer's move
  function computerMove() {
    if (gameOver) return;

    var emptyCells = cells.filter(function(cell) {
      return cell.textContent === '';
    });

    if (emptyCells.length > 0) {
      var index;
      var nextCell;
      var copyCells = cells.slice();

      // check if computer can win with the next move
      index = checkNextMove(copyCells, currentPlayer);

      // check if player can win with next move and block it
      if (index === undefined) {
        index = checkNextMove(copyCells, changeCurrentPlayer());
      }

      if (index !== undefined) {
        nextCell = cells[index];
      } else {
        var randomIndex = Math.floor(Math.random() * emptyCells.length);
        nextCell = emptyCells[randomIndex];
      }

      message.textContent = 'Your turn!';
      nextCell.textContent = currentPlayer;
      nextCell.classList.add(currentPlayer === 'X' ? 'cross' : 'zero');

      if (checkWinnerCombination(cells, true)) {
        resultMessage.textContent = currentPlayer + ' wins!';
        setGameOver();
      } else {
        currentPlayer = changeCurrentPlayer();
        blockedMoves = false;
      }
    }
  }

  // change player symbol to opposite
  function changeCurrentPlayer() {
    return currentPlayer === 'X' ? '0' : 'X';
  }

  // mark active cell
  function setActiveCell(index) {
    for (var i = 0; i < 9; i++) {
      cells[i].classList.remove('active');
    }

    if (index !== undefined) {
      cells[index].classList.add('active');
    }
  }

  // Add cells
  for (var i = 0; i < 9; i++) {
    var cell = document.createElement('div');

    cell.className = i === activeCell ? 'cell-item active' : 'cell-item';
    cells.push(cell);

    cell.addEventListener('click', function() {
      if (!blockedMoves) {
        activeCell = cells.indexOf(this);

        setActiveCell(activeCell);
        makeMove(this);
      }
    });

    board.appendChild(cell);
  }

  // keyboard events
  document.addEventListener('keydown', function(event) {
    if (mode === 'settings' || mode === 'reset') {
      getSettingsKeysNavigation(event, mode === 'settings' ? settingsForm : resetForm);
    } else if (mode === 'game') {
      getGaveKeysNavigation(event);
    }
  });

  // settings keys navigation
  function getSettingsKeysNavigation(event, section) {
    var currentIndex = document.activeElement.tabIndex || 0;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        currentIndex++;

        if (currentBtn()) {
          currentBtn().focus();
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        currentIndex--;
        if (currentBtn()) {
          currentBtn().focus();
        }
        break;
      case 'Enter':
        if (currentBtn()) {
          currentBtn().click();
          currentBtn().focus();
        }
        break;
    }

    function currentBtn() {
      return section.querySelectorAll("[tabindex='" + currentIndex + "']")[0];
    }
  }

  // game keys navigation
  function getGaveKeysNavigation(event) {
    if (!blockedMoves) {
      switch (event.key) {
        case 'ArrowDown':
          if (activeCell < 6) {
            activeCell += 3;
            setActiveCell(activeCell);
          }
          break;
        case 'ArrowUp':
          if (activeCell > 2) {
            activeCell -= 3;
            setActiveCell(activeCell);
          }
          break;
        case 'ArrowLeft':
          if (activeCell > 0) {
            activeCell --;
            setActiveCell(activeCell);
          }
          break;
        case 'ArrowRight':
          if (activeCell < 8) {
            activeCell ++;
            setActiveCell(activeCell);
          }
          break;
        case 'Enter':
          makeMove(cells[activeCell]);
          break;
      }
    }
  }

  // get settings
  function findSelection(field) {
    var fields = document.getElementsByName(field);

    for (i = 0; i < fields.length; i++) {
      if (fields[i].checked === true) {
        return fields[i].value;
      }
    }
  }

  // play again
  resetForm.addEventListener('submit', reset);

  function reset(e) {
    e.preventDefault();

    setUpIMA();

    for (i = 0; i < cells.length; i++) {
      cells[i].classList.remove('zero', 'cross', 'win', 'active');
      cells[i].textContent = '';
    }

    cells[0].classList.add('active');

    resetForm.classList.add('hidden');
    settingsForm.classList.remove('hidden');
    mode = 'settings';
    message.textContent = 'Select game options!';
    gameOver = false;
    blockedMoves = false;
    activeCell = 0;
  }

  // leave game
  settingsForm.addEventListener('submit', initAds);

  leaveGameBtn.addEventListener('click', function () {
    if (window) {
      window.location.href = 'http://www.google.com';
    }
  });

  // init/reset game params
  function initGame() {
    if (adsManager) {
      adsManager.destroy();
    }
    var computerFirst = findSelection('first') === '1';

    playerSymbol = currentPlayer = findSelection('symbol');

    if (computerFirst) {
      currentPlayer = changeCurrentPlayer();
      computerMove();
    } else {
      message.textContent = 'Your turn!';
    }

    adContainerWrap.classList.add('hidden');
    settingsForm.classList.add('hidden');
    blockedMoves = false;
    mode = 'game';
  }

  // Google IMA
  var adsManager;
  var adsLoader;
  var adDisplayContainer;
  var intervalTimer;
  var isAdPlaying;
  var isContentFinished;
  var videoContent;

  videoContent = document.getElementById('contentElement');
  setUpIMA();

  /**
   * Initializes IMA setup.
   */
  function initAds(e) {
    e.preventDefault();

    message.textContent = 'Please wait for the ad to finish.';
    adContainerWrap.classList.remove('hidden');

    playAds();
  }

  /**
   * Sets up IMA ad display container, ads loader, and makes an ad request.
   */
  function setUpIMA() {
    // Create the ad display container.
    createAdDisplayContainer();
    // Create ads loader.
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded, false);
    adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

    // An event listener to tell the SDK that our content video
    // is completed so the SDK can play any post-roll ads.
    var contentEndedListener = function() {
      // An ad might have been playing in the content element, in which case the
      // content has not actually ended.
      if (isAdPlaying) return;
      isContentFinished = true;
      adsLoader.contentComplete();
    };
    videoContent.onended = contentEndedListener;

    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
      'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
      'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&' +
      'output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = 1280;
    adsRequest.linearAdSlotHeight = 720;

    adsRequest.nonLinearAdSlotWidth = 1280;
    adsRequest.nonLinearAdSlotHeight = 720;

    adsLoader.requestAds(adsRequest);
  }

  /**
   * Sets the 'adContainer' div as the IMA ad display container.
   */
  function createAdDisplayContainer() {
    // We assume the adContainer is the DOM id of the element that will house
    // the ads.
    adDisplayContainer = new google.ima.AdDisplayContainer(document.getElementById('adContainer'));
  }

  /**
   * Loads the video content and initializes IMA ad playback.
   */
  function playAds() {
    // Initialize the container. Must be done through a user action on mobile
    // devices.
    adDisplayContainer.initialize();

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      adsManager.init(1280, 720, google.ima.ViewMode.NORMAL);
      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      adsManager.start();
    } catch (adError) {
      initGame();
    }
  }

  /**
   * Handles the ad manager loading and sets ad event listeners.
   * @param {!google.ima.AdsManagerLoadedEvent} adsManagerLoadedEvent
   */
  function onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    // videoContent should be set to the content video element.
    adsManager =
      adsManagerLoadedEvent.getAdsManager(videoContent, adsRenderingSettings);

    // Add listeners to the required events.
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
    adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdEvent);
    adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdEvent);
    adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdEvent);
  }

  /**
   * Handles actions taken in response to ad events.
   * @param {!google.ima.AdEvent} adEvent
   */
  function onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (for example,
    // ALL_ADS_COMPLETED) don't have ad object associated.
    var ad = adEvent.getAd();
    switch (adEvent.type) {
      case google.ima.AdEvent.Type.LOADED:
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          // Use ad.width and ad.height.
          videoContent.play();
        }
        break;
      case google.ima.AdEvent.Type.STARTED:
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear()) {
          // For a linear ad, a timer can be started to poll for
          // the remaining time.
          intervalTimer = setInterval(
            function() {
              // Example: const remainingTime = adsManager.getRemainingTime();
            },
            300);  // every 300ms
        }
        break;
      case google.ima.AdEvent.Type.COMPLETE:
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.
        if (ad.isLinear()) {
          clearInterval(intervalTimer);
        }
        initGame();

        break;
    }
  }

  /**
   * Handles ad errors.
   * @param {!google.ima.AdErrorEvent} adErrorEvent
   */
  function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError());

    if (adsManager) {
      adsManager.destroy();
    }
  }
})();