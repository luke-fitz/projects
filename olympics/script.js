// Helper function to create a random time between 3 and 4 seconds
function getRandomTime() {
  return 1 + Math.random();
}

// Function to animate a dot in its lane
function animateDot(dot, time, poolWidth, totalTimeElement) {
  let laps = 0;
  const distance = poolWidth - 100; // Total distance minus dot's start position (left margin of 60px + dot width of 20px)

  function move() {
    if (laps >= 4) {
      // Display the total time after completing the 4th lap
      totalTimeElement.textContent = `${time.toFixed(2)}`;
      return; // Stop after 4 laps
    }

    // Determine the position based on lap (even laps go "out of sight")
    const position = laps % 2 === 0 ? distance : 0; // Odd laps to distance, even laps to starting position
    dot.style.transitionDuration = `${time / 2}s`;
    dot.style.transform = `translateX(${position}px)`;

    // Move the dot and increment laps count
    setTimeout(() => {
      laps++;
      move(); // Continue to the next lap
    }, (time / 2) * 1000); // Wait half the time before each lap move
  }

  move();
}

// Select the pool width dynamically and assign times to dots
const pool = document.getElementById('pool');
const poolWidth = pool.offsetWidth;
const dots = document.querySelectorAll('.dot');

dots.forEach((dot, index) => {
  let time;
  if (index === 0) time = 2;       // 200F_1 lane
  else if (index === 1) time = 1.5;   // 200F_2 lane
  else time = getRandomTime();      // Random time between 3 and 4 for others

  const totalTimeElement = document.getElementById(`time-${index + 1}`);
  animateDot(dot, time, poolWidth, totalTimeElement);
});
