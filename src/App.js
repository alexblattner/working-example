import './App.css';
import { useEffect, useRef } from 'react'

function App() {
  // Create refrences to elements
  const canvasRef = useRef(null) // In order to access the canvas (and by extension the context super-object) we create a reference to it

  // In order to add event listeners and be able to access events that has to do with our buttons we create these references
  const undoRef = useRef(null)
  const clearRef = useRef(null)


  // Setting canvas height/width, storing it in a variable and storing the context super object in a variable "ctx" in order to use its many methods
  useEffect(() => {
    const canvas = canvasRef.current;

    // The window object contains properties (such as height and width) of our current user;
    // By taking our user's window dimensions and setting our canvas to be the same size we ensure that our canvas takes up the whole screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.9; // Multiplied by 0.9 to slightly decrease canvas size for asthetics
    const ctx = canvas.getContext('2d'); // Getting context super-object

    let clearBtn = clearRef.current; // Storing our refrence to the button in a variable to access it later and control events
    let undoBtn = undoRef.current; // Storing our refrence to the button in a variable to access it later and control events

    // Creating our array into which we'll push savings of our canvas for later restoration
    let undoArray = [];

    // creating an index and setting it to -1 so that upon first increment it will equal to zero. 
    // Since array index starts at 0 we can use this variable to save each iteration of our canvas from the beginning of the session starting from array[0]
    let index = -1;

    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clearing our canvas upon clicking "clear canvas" button, first two parameters are where the clear starts, the last two parameteres are the width and height of our clearing scope
      localStorage.setItem('canvas', canvas.toDataURL()) // Saving canvas to local storage
    })

    // Upon clicking restore we retrieve our data from local storage and create a new Image object and insert our data into it, then drawing on our canvas upon load
      let dataURL = localStorage.getItem('canvas') // Retrieving our canvas drawings from local storage
      let img = new Image(); // Creating a new img object
      img.src = dataURL; // Setting our img to equal our retrieved canvas

      // When the browser successfully loaded our image we can draw it on our canvas
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
    // Each time the restore button is clicked we restore the previous version of our canvas
    undoBtn.addEventListener('click', () => {
      if (index > 0) {
        index--;
        undoArray.pop();
        ctx.putImageData(undoArray[index], 0, 0);
        localStorage.setItem('canvas', canvas.toDataURL()) // Make sure we save our canvas upon undoing
      }

    })
    // Creating a mouse object where we'll later store our cursor's coordinates
    let mouse = {
      x: null,
      y: null
    }

    // This event listener keeps track of our cursor's location and updates it into our mouse object
    canvas.addEventListener('mousemove', (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    })
    let counter = 1;

    // Creating an interval that increases counter every arbitrary amount of time
    let increaseCounter = 
      setInterval(() => {
        counter += 0.1;
      }, 500)
    
    // Creating a variable to stop that interval
    let stopIncreasingCounter = 
      clearInterval(() => {
        counter += 0.1;
      }, 500)
    

    // When the mouse is held, a counter is incremented an arbitrary amount every arbitrary epoch
    const onMouseDown = () => {
      setInterval(increaseCounter); // Starting counter increment
      canvas.addEventListener('mouseup', onMouseUp)
    }

    canvas.addEventListener('mousedown', onMouseDown); 

    // When the mouse is released a new triangle is drawn whose dimensions are based on the counter's value
    const onMouseUp = () => {

      ctx.beginPath(); // Start a new drawing
      ctx.moveTo(mouse.x, mouse.y) // Start the triangle at cursor's position

      // The first line we draw is a certain distance from our cursor's position (here it is set to -100 on the X axis and -150 on the Y axis)
      // The length of our line is also multiplied by our counter to determine size based on cursor hold time
      ctx.lineTo(mouse.x + 100 * counter, (mouse.y + 150) * counter) 
      // The second line we draw is the same position on the Y axis (horizontal line) and is set to be the same length as our first line
      // This line is also multiplied by our counter to maintain a triangular shape
      ctx.lineTo(mouse.x - 100 * counter, (mouse.y + 150) * counter)

      // Our third and last line always returns to our starting point and completes our triangle
      ctx.lineTo(mouse.x, mouse.y)
      // Drawing method
      ctx.stroke()

      undoArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Saving canvas
      localStorage.setItem('canvas', canvas.toDataURL()) // Saving canvas to local storage
      
      index++; // Increasing our index to restore correct version each time the button is clicked

      counter = 1; // Reset the counter each time the mouse is released (otherwise you'd get increasingly larger triangles)

      clearInterval(stopIncreasingCounter); // Stopping counter increment
      canvas.removeEventListener('mouseup', onMouseUp) // Removing the event listener to make sure we're not getting multiple triangles per mouseup
    }
  }, [])

  return (
    <div>
      <canvas ref={canvasRef} />
      <button ref={undoRef}>Undo</button>
      <button ref={clearRef}>Clear Canvas</button>
    </div>
  )

}
export default App;
