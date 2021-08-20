// console.log(autobahn);

// import autobahn from 'autobahn';

console.log('driver file loaded');

function getDriver() {


  const _3Dconnexion = function (client) {
    _3Dconnexion.instance = this;
    console.log("object instantiated");
    this.debug = true;

    this.client = client;
    this.connected = false;
    this.connection = null;

    this.url = "localhost";
    this.port = 8080;
    // this.realm = '3dmouse';

    setTimeout(() => console.log(client.onStopMotion), 7000);

    this.clientFnRead = {
      "view.affine": client.getViewMatrix,
      "view.constructionPlane": client.getConstructionPlane,
      "view.extents": client.getViewExtents,
      "view.fov": client.getFov,
      "view.frustum": client.getViewFrustum,
      "view.perspective": client.getPerspective,
      "view.target": client.getViewTarget,
      "view.rotatable": client.getViewRotatable,
      "model.extents": client.getModelExtents,
      "pivot.position": client.getPivotPosition,
      "hit.lookat": client.getLookAt,
      "selection.empty": client.getSelectionEmpty,
      "selection.extents": client.getSelectionExtents,
      "pointer.position": client.getPointerPosition,
      coordinateSystem: client.getCoordinateSystem,
      "views.front": client.getFrontView,
    };

    this.clientFnUpdate = {
      motion: client.putMoving,
      "view.affine": client.putViewMatrix,
      "view.extents": client.putViewExtents,
      "view.fov": client.putFov,
      "view.target": client.putTarget,
      "commands.activeCommand": client.putCommand,
      "pivot.position": client.putPivotPosition,
      "pivot.visible": client.putPivotVisible,
      "hit.lookfrom": client.putLookFrom,
      "hit.direction": client.putLookDirection,
      "hit.aperture": client.putLookAperture,
      "hit.selectionOnly": client.putSelectionOnly,
      "events.keyPress": client.putKeyPress,
      "events.keyRelease": client.putKeyRelease,
    };
  };

  _3Dconnexion.instance = undefined;

  _3Dconnexion.prototype.connect = function () {
    // console.log(this.url, this.realm);

    // this.connection = new autobahn.Connection({
    // 	url: `ws://${this.url}:${this.port}/`,
    // 	realm: this.realm
    // });

    // console.log(Object.keys(this.clientFnRead));

    // this.connection.onopen = session => {
    //   console.log('onopen');
    //   Object.keys(this.clientFnRead).forEach(funcName => {
    //     session.register(funcName, this.clientFnRead[funcName]);
    //   });
    //   Object.keys(this.clientFnUpdate).forEach(funcName => {
    //     session.register(funcName, this.clientFnUpdate[funcName]);
    //   });

    //   console.log("FUNCTIONS REGISTERED");
    // };
    console.log("connection begun");
    this.connection = new WebSocket(`ws://${this.url}:${this.port}/ws/`);
    this.connection.addEventListener("open", (event) => {
      console.log("websocket open");
      // this.connection.send("test data");
    });

    this.connection.addEventListener("message", (event) => {
      // console.log(event.data);

      let data = {};
      try {
        data = JSON.parse(event.data).data;
      } catch {
        console.log(event.data);
      }

      function matrixDifference(m1, m2) {
        let diff = [];
        for(let i = 0; i < m1.length; i++) {
          diff.push(m2[i] - m1[i]);
        }
        return diff;
      }

      if(!controllerDeadzone(data.leftX, data.rightY) || !controllerDeadzone(data.rightX, data.rightY)){
        this.client.onStartMotion();
      }
      else {
        this.client.onStopMotion();
        // console.log(this.client.getViewMatrix());
      }

      if (!controllerDeadzone(data.leftX, data.leftY)) {
      let newMatrix = relativeMovementMatrix(data, this.client.getViewMatrix(), this.client);
      // newMatrix = [
      //   0, 0, 0, 1,
      //   0, 0, 0, 1,
      //   0, 0, 0, 1,
      //   0, 0, 0, 1
      // ]
      // console.log(matrixDifference(this.client.getViewMatrix(), newMatrix));
      // console.log(this.client.getViewMatrix());
      // console.log(newMatrix);
      this.client.setViewMatrix(newMatrix);
      }

      if (!controllerDeadzone(data.rightX, data.rightY)) {
        const newMatrix = relativeRotation_new(data, this.client.getViewMatrix(), this.client);
        this.client.setViewMatrix(newMatrix);
      }

      // this.client.onStopMotion();
      // console.log(data);

      // console.log(this.client.getViewMatrix());
    });

    this.connection.addEventListener('close', event => {
      console.log("Connection closed");
    });



    // this.connection.open();
  };

  _3Dconnexion.prototype.blur = function () {
    this.debug && console.log("blur on");
  };

  _3Dconnexion.prototype.focus = function () {
    this.debug && console.log("focus on");
  };

  _3Dconnexion.prototype.onKeyPress = function (e) {
    this.debug && console.log("onKeyPress" + e);
  };

  _3Dconnexion.prototype.onKeyRelease = function (e) {
    this.debug && console.log("onKeyRelease" + e);
  };

  _3Dconnexion.prototype.onMotion = function (e) {
    this.debug && console.log("onMotion" + e);
  };

  _3Dconnexion.prototype.onEvent = function (e, n) {
    this.debug && console.log("onEvent" + e, n);
  };

  _3Dconnexion.prototype.read3dcontroller = function (e, n) {
    this.debug && console.log("read3dcontroller" + e, n);
  };

  _3Dconnexion.prototype.update3dcontroller = function (e) {
    this.debug && console.log("update3dcontroller" + e);
  };

  _3Dconnexion.prototype.delete3dcontroller = function () {
    this.debug && console.log("delete3dmouse");
  };


  function relativeMovementMatrix(data, viewMatrix, client) {
    const { leftX, leftY } = data;

    const cx = viewMatrix[12];
    const cy = viewMatrix[13];
    const cz = viewMatrix[14];

    const cameraPos = new THREE.Vector3(cx, cy, cz);
    // console.log(cameraPos);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    let cameraDirection = cameraPos.sub(cameraTarget).normalize();
    // const cameraDirection = cameraPos.sub(cameraTarget);
    // console.log(cameraDirection);

    let cameraRight = relativeAxes(client).right;
    // let cameraRight = getRelativeAxes().up;
    // cameraRight.cross(cameraDirection);
    // cameraRight.normalize();
    // console.log(cameraRight);

    let cameraUp = new THREE.Vector3(
      cameraDirection.x,
      cameraDirection.y,
      cameraDirection.z
    );

    // cameraUp.cross(cameraRight);
    cameraUp = relativeAxes(client).up;
    // cameraUp.normalize();

    cameraRight.multiplyScalar(Math.abs(leftX) * 0.003);
    cameraUp.multiplyScalar(Math.abs(leftY) * 0.003);
    cameraDirection.multiplyScalar(0.25);


    if (!controllerDeadzone(leftX, leftY)) {
      if (Math.abs(leftY) > Math.abs(leftX)) {
        
        if (leftY > 0) {
          viewMatrix[12] += cameraUp.x;
          viewMatrix[13] += cameraUp.y;
          viewMatrix[14] += cameraUp.z;
        } else {
          viewMatrix[12] -= cameraUp.x;
          viewMatrix[13] -= cameraUp.y;
          viewMatrix[14] -= cameraUp.z;
        }
      } else {
        // console.log('modifiying translation matrix');
        // console.log(cameraUp);
        if (leftX > 0) {
          viewMatrix[12] += cameraRight.x;
          viewMatrix[13] += cameraRight.y;
          viewMatrix[14] += cameraRight.z;
        } else {
          viewMatrix[12] -= cameraRight.x;
          viewMatrix[13] -= cameraRight.y;
          viewMatrix[14] -= cameraRight.z;
        }
        // console.log(viewMatrix);
      }
    }

    // console.log(viewMatrix);

    const v = new THREE.Vector3(cx, cy, cz);

    // // console.log(data.rightTrigger, data.leftTrigger);

    cameraDirection = relativeAxes(client).front;
    // console.log(cameraDirection);

    const zoomCoef = 0.05;

    if (data.rightTrigger > 0.1) {
      viewMatrix[12] -= cameraDirection.x * data.rightTrigger * zoomCoef;
      viewMatrix[13] -= cameraDirection.y * data.rightTrigger * zoomCoef;
      viewMatrix[14] -= cameraDirection.z * data.rightTrigger * zoomCoef;
    } else if (data.leftTrigger > 0.1) {
      viewMatrix[12] += cameraDirection.x * data.leftTrigger * zoomCoef;
      viewMatrix[13] += cameraDirection.y * data.leftTrigger * zoomCoef;
      viewMatrix[14] += cameraDirection.z * data.leftTrigger * zoomCoef;
    }



    return viewMatrix;
  }


  function relativeAxes(client) {
    // viewMatrix = new THREE.Matrix4().fromArray(viewMatrix);
    viewMatrix = new THREE.Matrix4().fromArray(client.getViewMatrix());



    const rotationMatrix = extractRotation(viewMatrix.toArray());
    const existingEulerRotation = new THREE.Euler().setFromRotationMatrix(
      rotationMatrix,
      "XYZ"
    );

    const eulerRotation = new THREE.Euler(0, 0, 0, "XYZ");

    // const originalMatrixRotation = new THREE.Matrix4().fromArray(
    //   webGL.getViewMatrix()
    // );

    const inverseExistingEulerRotation = new THREE.Euler(
      -existingEulerRotation.x,
      -existingEulerRotation.y,
      -existingEulerRotation.z,
      "ZYX"
    );

    let upVec = new THREE.Vector3(0, 1, 0);
    let rightVec = new THREE.Vector3(1, 0, 0);
    let frontVec = new THREE.Vector3(0, 0, 1);

    upVec.applyEuler(existingEulerRotation);
    rightVec.applyEuler(existingEulerRotation);
    frontVec.applyEuler(existingEulerRotation);

    return { up: upVec, right: rightVec, front: frontVec };
  }


  function relativeRotation_new(data, viewMatrix, client) {
    const { rightX, rightY } = data;
    const { up, right, front } = relativeAxesRotation(viewMatrix);

    let rotationAngle = 0;

    // const rotationCoef = 0.1;
    // if(Math.abs(rightY) > Math.abs(rightX)) {
    //   // if(rightY > 0) {
    //     rotationAngle += rotationCoef * data.rightY;
    //   // } else {
    //     // rotationAngle -= rotationCoef * data.rightY;
    //   // }
    // } else {
    //   // if(rightX > 0) {
    //     rotationAngle += rotationCoef * data.rightX;
    //   // } else {
    //     // rotationAngle += rotationCoef * data.rightY;
    //   // }
    // }

    const rotationSens = 0.005;
    if (Math.abs(rightX) > Math.abs(rightY)) {
      if (rightX > 0) {
        rotationAngle -= rotationSens;
      } else {
        rotationAngle += rotationSens;
      }
    } else {
      if (rightY > 0) {
        rotationAngle += rotationSens;

      } else {
        rotationAngle -= rotationSens;
      }
    }

    // console.log(rotationAngle);

    const rotationMatrix = new THREE.Matrix4();

    if (Math.abs(rightX) > Math.abs(rightY)) {
      console.log("front", front);
      front.normalize();
      rotationMatrix.makeRotationAxis(up, rotationAngle);
    } else {
      console.log("right", right)
      rotationMatrix.makeRotationAxis(right, rotationAngle);
    }

    const t_viewMatrix = new THREE.Matrix4().fromArray(viewMatrix);
    t_viewMatrix.multiply(rotationMatrix);

    return t_viewMatrix.toArray();
  }

  function relativeAxesRotation(viewMatrix) {

    const rotationMatrix = extractRotationFromMatrix(viewMatrix);
    // const rotationMatrix = new THREE.Matrix4().set(viewMatrix);
    // const viewMatrix = new THREE.Matrix4().fromArray(client.getViewMatrix());
    // const rotationMatrix = extractRotation(viewMatrix.toArray());

    const existingEulerRotation = new THREE.Euler().setFromRotationMatrix(
      rotationMatrix,
      "XYZ"
    );

    // const eulerRotation = new THREE.Euler(0, 0, 0, "XYZ");

    // const originalMatrixRotation = new THREE.Matrix4().fromArray(viewMatrix);

    const inverseExistingEulerRotation = new THREE.Euler(
      -existingEulerRotation.x,
      -existingEulerRotation.y,
      -existingEulerRotation.z,
      "ZYX"
    );

    let upVec = new THREE.Vector3(0, 0, 1);
    let rightVec = new THREE.Vector3(1, 0, 0);
    let frontVec = new THREE.Vector3(0, -1, 0);


    upVec.applyEuler(inverseExistingEulerRotation);
    rightVec.applyEuler(inverseExistingEulerRotation);
    frontVec.applyEuler(inverseExistingEulerRotation);

    // upVec.applyEuler(existingEulerRotation);
    // rightVec.applyEuler(existingEulerRotation);
    // frontVec.applyEuler(existingEulerRotation);

    

    return { up: upVec, right: rightVec, front: frontVec };
  }

  function extractRotationFromMatrix(matrix) {
    let x1 = matrix[0];
    let x2 = matrix[4];
    let x3 = matrix[8];

    let y1 = matrix[1];
    let y2 = matrix[5];
    let y3 = matrix[9];

    let z1 = matrix[2];
    let z2 = matrix[6];
    let z3 = matrix[10];

    let xv = new THREE.Vector3(x1, x2, x3);
    let yv = new THREE.Vector3(y1, y2, y3);
    let zv = new THREE.Vector3(z1, z2, z3);

    let sx = xv.length();
    let sy = yv.length();
    let sz = xv.length();

    // prettier-ignore
    let rotationMatrix = [
      x1 / sx, y1 / sy, z1 / sz, 0,
      x2 / sx, y2 / sy, z2 / sz, 0,
      x3 / sx, y3 / sy, z3 / sz, 0,
      0, 0, 0, 1
    ];

    return new THREE.Matrix4().fromArray(rotationMatrix);
  }

  function extractRotation(matrix) {
    let x1 = matrix[0];
    let x2 = matrix[4];
    let x3 = matrix[8];

    let y1 = matrix[1];
    let y2 = matrix[5];
    let y3 = matrix[9];

    let z1 = matrix[2];
    let z2 = matrix[6];
    let z3 = matrix[10];

    let xv = new THREE.Vector3(x1, x2, x3);
    let yv = new THREE.Vector3(y1, y2, y3);
    let zv = new THREE.Vector3(z1, z2, z3);

    let sx = xv.length();
    let sy = yv.length();
    let sz = xv.length();

    // prettier-ignore
    let rotationMatrix = [
      x1 / sx, y1 / sy, z1 / sz, 0,
      x2 / sx, y2 / sy, z2 / sz, 0,
      x3 / sx, y3 / sy, z3 / sz, 0,
      0, 0, 0, 1
    ];

    return new THREE.Matrix4().fromArray(rotationMatrix);
  }

  // returns the quadrant that the controller stick is in
  function getControllerQuadrant(x, y) {
    if (x > 0 && y > 0) return 1;
    if (x < 0 && y > 0) return 2;
    if (x < 0 && y < 0) return 3;
    if (x > 0 && y < 0) return 4;

    console.error({ x, y }, "Does not fit in any quadrant");
  }

  const DEADZONE = 0.1;
  function controllerDeadzone(x, y) {
    // console.log(x, y);
    return Math.abs(x) < DEADZONE && Math.abs(y) < DEADZONE;
  }

  return _3Dconnexion;
}