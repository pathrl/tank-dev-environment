"use strict";

// Globals
let enemyAngle = -1; // Last Angle Found Enemy
let enemyDistance = 0; // Distance Found Enemy

/**
 * @method calculateAngle
 * Auxiliar function to calculate the angle
 * @param angle 
 */
function calculateAngle(angle) {
  return (angle + 360) % 360;
}

/**
 * @method getPrecisionAngle
 * Escanea dos veces con 5 angulos de diferencia para encontrar un angulo más preciso del enemigo
 * @param tank 
 */
async function getPrecisionAngle(tank) {
  let angle = calculateAngle(enemyAngle + 5);
  enemyDistance = await tank.scan(angle, 5);
  
  if (enemyDistance <= 0) angle = calculateAngle(enemyAngle - 5);
  if (enemyDistance > 0) enemyAngle = angle;
}

/**
 * @method binaryScan
 * Escaneo binariamente, va comprobando los bordes de 10 en 10 hasta encontrar el angulo
 * @param tank
 */
async function binaryScan(tank) {
  let edges = 0;
  let angle = 0;

  while (edges <= 180 && enemyDistance <= 0) {
    angle = calculateAngle(enemyAngle + edges);
    enemyDistance = await tank.scan(angle, 10);
    
    if (enemyDistance <= 0) {
      angle = calculateAngle(enemyAngle - edges) % 360;
      enemyDistance  = await tank.scan(angle, 10);
    }
    edges += 10;
  }

  enemyAngle = (enemyDistance > 0) ? angle : -1;
}

/**
 * @method scanAllAngles
 * Scan all angles between 0 and 359
 * @param tank 
 */
async function scanAllAngles(tank) {
  let angle = (enemyAngle > -1) ? enemyAngle : -10;
  while (angle < 360 && enemyDistance <= 0) {
    angle += 10;
    enemyDistance = await tank.scan(angle, 10);
  }
  enemyAngle = (enemyDistance > 0) ? angle : -1;
}

/**
 * @method main
 * @param tank 
 */
async function main(tank) {
  // main loop
  while (true) {
    if (enemyDistance > 0) await getPrecisionAngle(tank);
    else if (enemyAngle > -1) await binaryScan(tank);
    else await scanAllAngles(tank);

    // Shoot twice if found enemy
    if (enemyDistance > 0) {
      await tank.shoot(calculateAngle(enemyAngle + 2), 700);
      await tank.shoot(calculateAngle(enemyAngle - 2), 700);
    }
  }
}
