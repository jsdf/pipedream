function Pipedream(opts) {
  this.background_color = opts.background_color || "gray";
  this.grid_color = opts.grid_color || "white";
  this.pipe_color = opts.pipe_color || "black";
  this.width = opts.canvas_width || 750;
  this.height = opts.canvas_height || 525;
  this.grid_width = opts.grid_width || 10; // how wide the grid is, in number of cells
  this.grid_height = opts.grid_height || 7; // how tall the grid is, in number of cells
  this.grid_line_width = opts.grid_line_width || 1;
  this.pipe_width = opts.pipe_width || 8;
  this.cell_width = this.width / this.grid_width;
  this.cell_height = this.height / this.grid_height;

  var $canvas = $("#" + opts.canvas_id);
  var canvas = $canvas[0];
  var context = canvas.getContext("2d");

  $canvas.attr({ width: this.width, height: this.height });

  var draw_grid = (function draw_grid() {
    context.beginPath();
    context.rect(0, 0, this.width, this.height);
    context.fillStyle = this.background_color;
    context.fill();
    for (var i = 0; i < this.grid_width; i++) {
      for (var j = 0; j < this.grid_height; j++) {
        var x = i * this.cell_width;
        var y = j * this.cell_height;
        context.beginPath();
        context.strokeStyle = this.grid_color;
        context.lineWidth = this.grid_line_width;
        context.rect(x, y, this.cell_width, this.cell_height);
        context.stroke();
      }
    }
  }).bind(this);

  var draw_animated_line = (function draw_animated_line() {
    // put some sleeps between the strokes
    for (var x_offset = 0; x_offset < this.cell_width / 2 - this.pipe_width; x_offset++) {
      context.save();
      context.strokeStyle = this.pipe_color;
      context.beginPath();
      context.translate(0 + x_offset, this.cell_height / 2 + this.pipe_width / 2);
      context.lineWidth = 1;
      context.moveTo(0, 0);
      context.lineTo(0, -1 * this.pipe_width);
      context.stroke();
      context.restore();
    }
  }).bind(this);

  var draw_elbow = (function draw_elbow() {
    draw_animated_line();
    
    for (var degrees = 0; degrees < 90; degrees++) {
      context.save();
      context.beginPath();
      context.translate(this.cell_width / 2 - this.pipe_width, this.cell_height / 2 + this.pipe_width / 2);
      context.rotate(degrees * Math.PI / 180);
      context.strokeStyle = this.pipe_color;
      context.lineWidth = 1;
      context.moveTo(0, 0);
      context.lineTo(0, -1 * this.pipe_width);
      context.stroke();
      context.restore();
    }

    context.save();
    context.translate(this.cell_width - this.pipe_width / 2, this.cell_height / 2 + this.pipe_width / 2);
    context.rotate(90 * Math.PI / 180);
    draw_animated_line();
    context.restore();
  }).bind(this);

  draw_grid();
  draw_elbow();
}
