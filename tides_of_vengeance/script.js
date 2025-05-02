/// Precomputed styles
const mediaQuery = window.matchMedia("screen and (max-width: 768px)");
const isMobile = mediaQuery.matches;
const style = getComputedStyle(document.documentElement);
const defaultArenaHeight = parseInt(style.getPropertyValue('--arena-default-height'));
const arenaStartLeft = parseInt(style.getPropertyValue('--arena-start-left'));
const paddingHorizontal = parseInt(style.getPropertyValue('--padding-horizontal'));
const timeLabelLongest = parseInt(style.getPropertyValue('--time-label-longest'));
const minLaneHeight = parseInt(
  isMobile
  ? style.getPropertyValue('--lane-min-height-mobile')
  : style.getPropertyValue('--lane-min-height-desktop')
);

// Fetch the event data
fetch('./data/results.json')
  .then(response => response.json())
  .then(data => {
    const eventName = data.event;
    document.getElementById('title-bar').textContent = eventName; /* TODO: Put in lower function */
    simulateEvent(data.results, data.lapDistanceMetres); /* TODO: Pass all data */
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById('arena').textContent = 'Failed to load event data.';
 });


/**
 * Initializes the arena element
 * @param {list} events - List of events in json format
 * @returns 
 */
function setArenaElement(arenaHeight) {
  const arena = document.getElementById('arena');
  arena.setAttribute('arena-sport', 'Swimming'); /* TODO: fix */
  arena.style.height = `${arenaHeight}px`;
  arena.innerHTML = ''; // Clear existing lanes
  return arena;
}

/**
 * Initializes the lane element
 * @param {object} result - Dictionary with details of the lane's result
 * @param {number} laneHeightPercent - Percentage of the arena taken up by the lane
 * @returns {HTMLDivElement} Lane element
 */
function setLaneElement(result, laneHeightPercent) {
  const lane = document.createElement('div');
  lane.className = 'lane';
  lane.id = `lane-${result.lane}`;
  lane.style.height = laneHeightPercent + '%';
  return lane;
}

/**
 * Initializes the lane label element
 * @param {object} result - Dictionary with details of the lane's result
 * @returns {HTMLDivElement} Lane label element
 */
function setLaneLabelElement(result) {
  const laneLabel = document.createElement('div');
  laneLabel.className = 'lane-label';
  laneLabel.id = `lane-label-${result.lane}`;
  laneLabel.innerHTML = result.team + '<br>&nbsp;';
  return laneLabel;
}

/**
 * Initializes the dot element
 * @param {object} result - Dictionary with details of the lane's result
 * @returns {HTMLDivElement} Dot element
 */
function setDotElement(result) {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.id = `dot-${result.lane}`;
  dot.setAttribute('dot-team', result.team);
  return dot;
}

/**
 * Initializes the total time label element
 * @param {object} result - Dictionary with details of the lane's result
 * @returns {HTMLDivElement} Total time label element
 */
function setTotalTimeLabelElement(result) {
  const totalTimeLabel = document.createElement('div');
  totalTimeLabel.className = 'total-time-label';
  totalTimeLabel.id = `total-time-label-${result.lane}`;
  totalTimeLabel.textContent = '';  // Initially blank
  return totalTimeLabel;
}

/**
 * Calculates the maximum lane label width in the document
 * @returns {number} Maximum lane label width in the document
 */
function calculateMaxLaneLabelWidth() {
  const labels = document.querySelectorAll('.lane-label');
  let maxWidth = 0;
  labels.forEach(label => {
    const width = label.offsetWidth;
    if (width > maxWidth) maxWidth = width;
  });
  return maxWidth;
}

/**
 * Indicates whether an event finishes on the right-hand side of the arena
 * @param {number} totalLaps 
 * @returns {boolean} True if the event finishes on the right-hand side of the arena; false otherwise
 */
function eventFinishesOnRight(totalLaps) {
  return (totalLaps % 2 === 1);
}

/**
 * Sets dynamic positions of objects in document based on the maximum lane label width
 * @param {object} event - Dictionary containing event details 
 */
function setDynamicPositions() {
  // Get document elements
  // const maxLaneLabelWidth = calculateMaxLaneLabelWidth() + 'px';
  const lanes = document.querySelectorAll('.lane');
  // const totalLaps = event.laps;
  // const finishOnRight = eventFinishesOnRight(totalLaps);
  const finishOnRight = false;
  console.log(paddingHorizontal);

  lanes.forEach(lane => {
    // Dot position
    dot = lane.querySelector('.dot');
    if (isMobile) {
      // Mobile
      dot.style.left = arenaStartLeft + paddingHorizontal;
    } else {
      // Desktop
      dot.style.left = (arenaStartLeft + paddingHorizontal) + 'px';
      // `calc(${arenaStartLeft} + ${paddingHorizontal})`;
    }
    dotLeft = parseInt(getComputedStyle(dot).left);
    dotWidth = parseInt(getComputedStyle(dot).width);

    // Total time label position
    totalTimeLabel = lane.querySelector('.total-time-label');

    if (isMobile) {
      // Mobile
      if (finishOnRight) {
        // Mobile, finishes on right
        totalTimeLabel.style.left = (arenaStartLeft + paddingHorizontal) + 'px';
        totalTimeLabel.style.right = 'auto';
      } else {
        // Mobile, finishes on left
        totalTimeLabel.style.left = (arenaStartLeft + dotWidth + 2 * paddingHorizontal) + 'px';
        totalTimeLabel.style.right = 'auto';
      }
    } else {
      // Desktop
      if (finishOnRight) {
        // Desktop, finishes on right
        totalTimeLabel.style.left = 'auto';
        totalTimeLabel.style.right = (arenaStartLeft + dotWidth + 2 * paddingHorizontal) + 'px';
      } else {
        // Desktop, finishes on left
        console.log(arenaStartLeft + dotLeft + dotWidth + paddingHorizontal);
        totalTimeLabel.style.left = (arenaStartLeft + dotWidth + 2 * paddingHorizontal) + 'px';
        totalTimeLabel.style.right = 'auto';
      }
    }
  });
}

/**
 * Populates the arena when an event is first loaded
 * @param {object} event - Dictionary containing event details 
 */
function populateArena(results) {

  // Calculate lane height and arena height
  const numberOfLanes = results.length;
  const laneHeightPercent = (100 / numberOfLanes).toFixed(2);
  const arenaHeight = Math.max(numberOfLanes * minLaneHeight, defaultArenaHeight);

  // Set arena element
  const arena = setArenaElement(arenaHeight);

  results.forEach(result => {
    // Set elements within the arena
    const lane = setLaneElement(result, laneHeightPercent);
    const laneLabel = setLaneLabelElement(result);
    const dot = setDotElement(result);
    const totalTimeLabel = setTotalTimeLabelElement(result)

    // Append to the arena element
    lane.appendChild(laneLabel);
    lane.appendChild(dot);
    lane.appendChild(totalTimeLabel);
    arena.appendChild(lane);
  });

  // Update positions based on finishing end and longest lane label
  setDynamicPositions();
}

/**
 * Sets the lap length annotation below the arena
 * @param {object} event - Dictionary containing event details 
 */
function setLapMarker(lapDistanceMetres) {
  const lapMarker = document.getElementById('lap-marker');
  lapMarker.textContent = `${lapDistanceMetres.toLocaleString()}m`;
}

/**
 * Adds a placing attribute to each result based on their finishing time
 * @param {list} results - List of each lane's results
 * @returns 
 */
function determinePlacings(results) {

    results.forEach(result => {
      const totalAthleteTime = result.athletes.reduce((acc, athlete) => acc + athlete.timeSeconds, 0);
      result.totalTimeSeconds = totalAthleteTime + result.handicapSeconds;
  });

    // Sort the results by timeSeconds in ascending order
    results.sort((a, b) => a.totalTimeSeconds - b.totalTimeSeconds);

    // Initialize placing and a counter for ties
    let placing = 1;
    let tieCount = 0;

    for (let i = 0; i < results.length; i++) {
        if (i > 0 && results[i].totalTimeSeconds === results[i - 1].totalTimeSeconds) {
            // If tied with the previous time, assign the same placing
            results[i].placing = placing;
            tieCount++; // Increase the tie count
        } else {
            // If not tied, update placing, taking into account previous ties
            placing += tieCount;
            results[i].placing = placing;
            tieCount = 1; // Reset tie count for next sequence
        }
    }

    // Sort the results by lane again
    results.sort((a, b) => a.lane - b.lane);
    return results;
}

/**
 * Adds a medal to a total time label if applicable
 * @param {HTMLDivElement} totalTimeLabel - HTML element of the athlete's total time label
 * @param {number} placing - Ordinal placing of the athlete 
 * @param {number} totalLaps - Total number of laps in the event
 * @returns
 */
function addMedalIfWon(totalTimeLabel, placing, totalLaps) {
  // Define the medal abbrevations for each placing. Note that this defines which medals are available.
  const placingAbbrevs = {
    1: 'G',
    2: 'S',
    3: 'B'
  };

  // Determine whether the athlete wins a medal
  const isMedalWinner = placingAbbrevs.hasOwnProperty(placing);
  const finishOnRight = eventFinishesOnRight(totalLaps);

  if (isMedalWinner) {
    // Create the medal
    const medal = document.createElement('span');
    medal.classList.add('medal');
    medal.textContent = placingAbbrevs[placing];
    medal.setAttribute('medal-placing', placing);

    // Set the medal's position
    if (isMobile) {
      // Mobile
      medal.style.left = (arenaStartLeft + timeLabelLongest) + 'px';
      medal.style.right = 'auto'; // Reset right
    } else if (finishOnRight) {
      // Desktop, finish on right
      medal.style.right = (arenaStartLeft + timeLabelLongest)  + 'px';
      medal.style.left = 'auto'; // Reset left
    } else {
      // Desktop, finish on left
      medal.style.left = (-100)  + 'px'; // TODO: make data-driven
      medal.style.right = 'auto'; // Reset right
    }

    totalTimeLabel.appendChild(medal); 
  }
}

/**
 * Calculates the distance of one lap based on the arena size, dot size, and padding
 * @param {HTMLDivElement} dot - Dot element 
 * @returns {number} Distance of one lap
 */
function calculateLapDistance(dot) {
  // Get document sizes
  const arenaWidth =  getComputedStyle(document.getElementById('arena')).width;
  const dotSize =  getComputedStyle(dot).width;
  const dotLeft = getComputedStyle(dot).left;

  // Calculate lap distance
  const lapDistance = parseInt(arenaWidth) - parseInt(dotLeft) - parseInt(dotSize) - parseInt(paddingHorizontal);
  return lapDistance;
}

/**
 * Formats a time in h:mm:ss.xx format
 * @param {number} timeInSeconds - the time in seconds
 * @returns {string} - Formatted time in h:mm:ss.xx format
 */
function formatTime(timeInSeconds) {
  const totalHundredths = Math.round(timeInSeconds * 100); // Convert to hundredths
  const hours = Math.floor(totalHundredths / 360000); // Total seconds in an hour
  const minutes = Math.floor((totalHundredths % 360000) / 6000); // Total seconds in a minute
  const seconds = Math.floor((totalHundredths % 6000) / 100); // Total seconds
  const hundredths = totalHundredths % 100; // Remaining hundredths

  // Construct the formatted time based on the values of hours and minutes
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;//.${String(hundredths).padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;//.${String(hundredths).padStart(2, '0')}`;
  } else {
    return `${seconds}.${String(hundredths).padStart(2, '0')}`;
  }
}

function animateDot(result, playbackSpeedFactor) {
  const lapsPerAthlete = 2;
  const laneNumber = result.lane;
  const dot = document.getElementById(`dot-${laneNumber}`);
  const laneLabel = document.getElementById(`lane-label-${result.lane}`);
  const totalTimeLabel = document.getElementById(`total-time-label-${result.lane}`);
  // Calculate lap distance
  const lapDistance = calculateLapDistance(dot);
  dotLeft = parseFloat(getComputedStyle(dot).left);
  let laps = [];

  result.athletes.forEach(athlete => {
    laps.push({ leg: athlete.leg, direction: 1, duration: athlete.timeSeconds / 2, athleteName: athlete.athleteName }); // forward
    laps.push({ leg: athlete.leg, direction: -1, duration: athlete.timeSeconds / 2, athleteName: athlete.athleteName  }); // back
  });

  let startTime = null;
  let currentLap = 0;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    const lap = laps[currentLap];
    const lapDurationMs = lap.duration * 1000 / playbackSpeedFactor;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / lapDurationMs, 1); // 0 to 1

    const position = lap.direction === 1
      ? progress * (lapDistance - 20) + dotLeft
      : (1 - progress) * (lapDistance - 20) + dotLeft;

    dot.style.left =  `${position}px`;

    laneLabel.innerHTML = result.team + '<br>' + '(' + lap.leg + ') ' + lap.athleteName;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentLap++;
      if (currentLap < laps.length) {
        startTime = null;
        requestAnimationFrame(animate);
      } else {
        laneLabel.innerHTML = result.team + '<br>&nbsp;';
        totalTimeLabel.textContent = formatTime(result.totalTimeSeconds);
        addMedalIfWon(totalTimeLabel, result.placing, lapsPerAthlete);
      }
    }
  }

  setTimeout(() => {
    requestAnimationFrame(animate);
  }, result.handicapSeconds * 1000 / playbackSpeedFactor);

}
/**
 * Animates a dot along its lane for the whole event
 * @param {object} result - Dictionary with details of the lane's result
 * @param {number} totalLaps - Total number of laps in the race
 * @param {number} playbackSpeedFactor - Playback speed factor. 1 is real time; higher values are faster. 
 * @returns
 */
function animateDot2(result, playbackSpeedFactor) {
  // Initialise counter
  let completedLaps = 0;

  // TODO: Make data-driven
  const lapsPerAthlete = 2
  const numberOfLegs = result.athletes.length;
  const totalLaps = lapsPerAthlete * numberOfLegs;
  console.log(totalLaps);

  // Get objects from document
  const laneNumber = result.lane;
  const dot = document.getElementById(`dot-${laneNumber}`);
  const totalTimeLabel = document.getElementById(`total-time-label-${laneNumber}`);

  result.athletes.forEach(athlete => {
    console.log(completedLaps); 
    // Calculate real time and clock time
    const totalTime = athlete.timeSeconds;
    const totalClockTime = totalTime / playbackSpeedFactor;
    const lapClockTime = totalClockTime / lapsPerAthlete;

    // Calculate lap distance
    const lapDistance = calculateLapDistance(dot);

    function completeNextLap() {
      // Last lap: set time label and exit function
      if (completedLaps >= totalLaps) {
        // Set time label
        totalTimeLabel.textContent = formatTime(totalTime);

        // Add a medal (if applicable)
        // addMedalIfWon(totalTimeLabel, result.placing, lapsPerAthlete);
        return;
      }

      // Determine the position based on lap
      const newPosition = completedLaps % 2 === 0 ? lapDistance : 0;
      dot.style.transitionDuration = `${lapClockTime}s`;
      dot.style.transform = `translateX(${newPosition}px)`;

      // Move the dot and increment laps count
      setTimeout(() => {
        completedLaps++;
        completeNextLap(); // Continue to the next lap
      }, lapClockTime * 1000);
    }

    completeNextLap();
  });
}

/**
 * Animates all dots along their lanes for the whole event
 * @param {object} event - Dictionary containing event details 
 * @param {number} playbackSpeedFactor - Playback speed factor. 1 is real time; higher values are faster.
 * @returns
 */
function animateAllDots(results, playbackSpeedFactor) {
  // Total number of laps
  // const totalLaps = event.laps;

  // Animate each dot
  results.forEach(result => {
    animateDot(result, playbackSpeedFactor);
  });
}

/**
 * Simulates an event by moving each dot along the arena
 * @param {object} event - Dictionary containing event details
 * @returns
 */
function simulateEvent(results, lapDistanceMetres) {
  // Set the playback speed factor
  const playbackSpeedFactor = 2000;

  // Simulate the event
  determinePlacings(results);
  populateArena(results);
  setLapMarker(lapDistanceMetres);
  animateAllDots(results, playbackSpeedFactor);
}