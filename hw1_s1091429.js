"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

uniform mat3 u_matrix;

// all shaders have a main function
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#c");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////// ??????????????? ////////////////////////////////////////////////////////////

  const startPos = [200,  -200 * Math.sqrt(3), 0, 0, 400,  0]; //????????????
  const constTrans = [150, 200]; //???????????????
  var translation = [150, 200];  //slider???????????????
  var angleInRadians = 0;        //?????????
  var scale = [1, 1];            //????????????
  var level = 0;                 //??????????????????

  drawScene();

  var _myData = [];              //???????????????????????????????????????????????????[level][point x or y]
  var totalNum = [];             //?????????????????????
  var hasNum = [];               //????????????????????????
  for (var i = 0; i < 10; i++) {
    _myData[i] = new Array();
  }
  for (var i = 0; i < 10; i++) {
    totalNum[i] = Math.pow(3, i);
  }
  for (var i = 0; i < 10; i++) {
    hasNum[i] = 0;
  }

  ///////////////////////////////////////////////// slider ///////////////////////////////////////////////////////////////

  // Setup a ui.
  webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle",  {slide: updateAngle, max: 360});
  webglLessonsUI.setupSlider("#scaleX",  {value: scale[0], slide: updateScale(0), min: 0, max: 3, step: 0.1, precision: 2});
  webglLessonsUI.setupSlider("#scaleY",  {value: scale[1], slide: updateScale(1), min: 0, max: 3, step: 0.1, precision: 2});
  webglLessonsUI.setupSlider("#level",  {slide: updateLevel, max: 9});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
      run();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
    run();
  }

  function updateScale(index) {
    return function(event, ui) {
      scale[index] = ui.value;
      drawScene();
      run();
    };
  }
  
  function updateLevel(event, ui){
    level = ui.value;
    run();
    console.log("?????? " + level + " ?????????????????????");
  }

  ////////////////////////////////////////////// ??????function ////////////////////////////////////////////////////////////

  function resetTriangle(x, y) { //???????????????
    setTriangle(gl, startPos[0] + x,  startPos[1] + y, startPos[2] + x, startPos[3] + y, startPos[4] + x,  startPos[5] + y);
    gl.uniform4f(colorLocation, 1, 1, 1, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function run(){ //??????????????????????????????????????????????????????level??????????????????????????????
    var x = constTrans[0];
    var y = constTrans[1];
    resetTriangle(x, y);
    if(hasNum[level] == totalNum[level]){ //???????????????????????????????????????????????????
      output(level);
    }
    else{
      recur(level, level, startPos[0] + x,  startPos[1] + y, startPos[2] + x, startPos[3] + y, startPos[4] + x,  startPos[5] + y, 0);
    }
  }

  function setArray(n, x1, y1, x2, y2, x3, y3){
    _myData[n].push(x1);
    _myData[n].push(y1);
    _myData[n].push(x2);
    _myData[n].push(y2);
    _myData[n].push(x3);
    _myData[n].push(y3);
  }

  function output(n){ //??????????????????level????????????
    for(var i = 0; i < _myData[n].length; i += 6){
      setTriangle(gl, _myData[n][i], _myData[n][i + 1], _myData[n][i + 2], _myData[n][i + 3], _myData[n][i + 4], _myData[n][i + 5]);
      gl.uniform4f(colorLocation, 0, 0, 0, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  function recur(maxD, d, x1, y1, x2, y2, x3, y3, n) { //???????????????
    if(hasNum[n] < totalNum[n]){ //???????????????
      hasNum[n] = hasNum[n] + 1; //??????????????????
      if(n == maxD) //???????????????????????????
        console.log("?????????" + "level " + n + " " + (hasNum[n] * 100 / totalNum[n]) + "%"); //????????????????????????????????????????????????????????????????????????
      setArray(n, x1, y1, x2, y2, x3, y3); //?????????????????????
      if(d == 0) { //????????????????????????????????????????????????
        setTriangle(gl, x1, y1, x2, y2, x3, y3);
        gl.uniform4f(colorLocation, 0, 0, 0, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    }
    else if(d == 0) {
      output(n);
    }
    
    if(d > 0){
      recur(maxD, d-1, x1, y1, (x2+x1)/2, (y2+y1)/2, (x3+x1)/2, (y3+y1)/2, n+1);
      recur(maxD, d-1, x2, y2, (x2+x1)/2, (y2+y1)/2, (x3+x2)/2, (y3+y2)/2, n+1);
      recur(maxD, d-1, x3, y3, (x2+x3)/2, (y2+y3)/2, (x3+x1)/2, (y3+y1)/2, n+1);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the matrix
    var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var offset = 0;
    var count = 3;
    
    setTriangle(gl, startPos[0] + constTrans[0],  startPos[1] + constTrans[1], startPos[2] + constTrans[0], startPos[3] + constTrans[1], startPos[4] + constTrans[0],  startPos[5] + constTrans[1]);
    gl.uniform4f(colorLocation, 0, 0, 0, 1);
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }
}

function setTriangle(gl, x1, y1, x2, y2, x3, y3) { //??????setGeometry
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y2,
      x3, y3,
    ]), gl.STATIC_DRAW);
}

main();
