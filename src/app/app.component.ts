import { Component, ElementRef, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3400'); // Replace with your server address

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  @ViewChild('canvas', { static: true }) canvas!: ElementRef;
  context!: CanvasRenderingContext2D;
  isDrawing = false;
  lastX = 0;
  lastY = 0;

  constructor(private changeDetector: ChangeDetectorRef) {
    // Listen for drawing data from the server
    socket.on('draw', (data) => {
      try {
        this.draw(data); // Draw the received data in Client
        this.drawLine(data); // Draw the broadcasted data
        this.changeDetector.detectChanges(); // Trigger change detection
      } catch (error) {
        console.error('I got some Error : ', error);
      }
    });
  }

  ngOnInit() {
    // Get the 2D rendering context for the canvas
    this.context = this.canvas.nativeElement.getContext('2d');
    // Add event listeners for drawing
    this.canvas.nativeElement.addEventListener('mousedown', this.startDrawing);
    this.canvas.nativeElement.addEventListener('mousemove', this.draw);
    this.canvas.nativeElement.addEventListener('mouseup', this.stopDrawing);
    this.canvas.nativeElement.addEventListener('mouseout', this.stopDrawing);
  }

  // Start drawing
  startDrawing = (e: MouseEvent) => {
    // Initialize the isDrawing variable
    this.isDrawing = true;

    // Get the initial coordinates
    this.lastX = e.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    this.lastY = e.clientY - this.canvas.nativeElement.getBoundingClientRect().top;
  }

  // Draw on the canvas
  draw = (e: MouseEvent) => {
    if (!this.isDrawing || !this.context) return;

    try {
      // Calculate current coordinates from MouseEvent
      const x = e.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
      const y = e.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

      // Begin a path and draw a line
      this.context.beginPath();
      this.context.moveTo(this.lastX, this.lastY);
      this.context.lineTo(x, y);
      this.context.strokeStyle = 'black';
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.closePath();

      // Emit drawing data to the server
      const data = { x1: this.lastX, y1: this.lastY, x2: x, y2: y };
      socket.emit('draw', data);

      // Update the last coordinates
      this.lastX = x;
      this.lastY = y;
    } catch (error) {
      console.error('I got some Error : ' , error);
    }
  }

  // Stop drawing
  stopDrawing = () => {
    this.isDrawing = false;
  }

  // Draw the broadcatsted data
  drawLine(data: { x1: number, y1: number, x2: number, y2: number }) {
    // Begin a path and draw a line
    this.context.beginPath();
    this.context.moveTo(data.x1, data.y1);
    this.context.lineTo(data.x2, data.y2);
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();
  }
}