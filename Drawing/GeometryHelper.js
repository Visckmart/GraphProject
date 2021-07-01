/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { getDistanceOf } from "../Utilities/Utilities.js";

/**
 * Checa se o quadrado S, definido pelo ponto central e o tamanho dos lados
 * colide com o ponto P.
 *
 *  ┌───┐
 *  │ S │   • P
 *  └───┘
 */
export function checkSquarePointCollision(squareMid, squareLength, point) {
    let offset = squareLength/2;
    return squareMid.x - offset < point.x && squareMid.x + offset > point.x
        && squareMid.y - offset < point.y && squareMid.y + offset > point.y;
}

// /**
//  * Checa se o retângulo R, definido pelos seus lados, colide com o quadrado S,
//  * definido pelo ponto central e o tamanho dos lados.
//  *
//  *  ┌───────┐
//  *  │   R   │   ┌───┐
//  *  └───────┘   │ S │
//  *              └───┘
//  */
// export function checkRectangleSquareCollision({rectLeft, rectTop, rectRight, rectBottom},
//                                               squareMid, squareLength) {
//     let offset = squareLength/2;
//     return squareMid.x + offset > rectLeft && squareMid.x - offset < rectRight
//            && squareMid.y + offset > rectTop && squareMid.y - offset < rectBottom;
// }
/**
  * Checa se o retângulo R, definido por dois cantos, colide com o quadrado S,
  * definido pelo ponto central e o tamanho dos lados.
  *
  *  ┌───────┐
  *  │   R   │   ┌───┐
  *  └───────┘   │ S │
  *              └───┘
  */
export function checkRectangleSquareCollision([rectCornerA, rectCornerB],
                                              squareMid, squareLength) {
    let offset = squareLength/2;
    let top, left, bottom, right;
    if (rectCornerA.x < rectCornerB.x) {
        left  = rectCornerA.x;
        right = rectCornerB.x;
    } else {
        left  = rectCornerB.x;
        right = rectCornerA.x;
    }
    if ((squareMid.x + offset > left && squareMid.x - offset < right) == false) {
        return false;
    }
    if (rectCornerA.y < rectCornerB.y) {
        top    = rectCornerA.y;
        bottom = rectCornerB.y;
    } else {
        top    = rectCornerB.y;
        bottom = rectCornerA.y;
    }
    return squareMid.y + offset > top && squareMid.y - offset < bottom;
}
/**
 * Checa se o retângulo R, definido por dois pontos opostos, colide com o ponto P.
 *
 *  ┌───────┐
 *  │   R   │   • P
 *  └───────┘
 */
export function checkRectanglePointCollision([cornerA, cornerB], point) {
    let top, left, bottom, right;
    if (cornerA.x < cornerB.x) {
        left  = cornerA.x;
        right = cornerB.x;
    } else {
        left  = cornerB.x;
        right = cornerA.x;
    }
    if (cornerA.y < cornerB.y) {
        top    = cornerA.y;
        bottom = cornerB.y;
    } else {
        top    = cornerB.y;
        bottom = cornerA.y;
    }
    return left < point.x && top < point.y && right > point.x && bottom > point.y;
}
export function createRectangleChecker(cornerA, cornerB) {
    let checker = {
        sides: [
            [cornerA, {x: cornerB.x, y: cornerA.y}], // Top
            [{x: cornerA.x, y: cornerB.y}, cornerB],   // Bottom
            [cornerA, {x: cornerA.x, y: cornerB.y}], // Left
            [{x: cornerB.x, y: cornerA.y}, cornerB],   // Right
        ],

        checkLineCollision(lineStart, lineEnd) {
            for (let [sideStart, sideEnd] of this.sides) {
                let edgeSideCollided = checkLineLineCollision(
                    [sideStart, sideEnd],
                    [lineStart, lineEnd]
                )
                if (edgeSideCollided) { return true; }
            }
            return false;
        }
    }
    return checker;
}

function checkRectangleBorderLineCollision([cornerA, cornerB], [lineStart, lineEnd]) {
    let topCollided = checkLineLineCollision(
        [cornerA, {x: cornerB.x, y: cornerA.y}],
        [lineStart, lineEnd]
    )
    if (topCollided) { return true; }
    let bottomCollided = checkLineLineCollision(
        [{x: cornerA.x, y: cornerB.y}, cornerB],
        [lineStart, lineEnd]
    )
    if (bottomCollided) { return true; }
    let leftCollided = checkLineLineCollision(
        [cornerA, {x: cornerA.x, y: cornerB.y}],
        [lineStart, lineEnd]
    )
    if (leftCollided) { return true; }
    let rightCollided = checkLineLineCollision(
        [{x: cornerB.x, y: cornerA.y}, cornerB],
        [lineStart, lineEnd]
    )
    if (rightCollided) { return true; }
    return false;
}
/**
 * Checa se a linha L, definida pelo ponto de início, fim e espessura,
 * colide com o ponto P.
 *
 *     ╱
 *  L ╱    • P
 *   ╱
 */
export function checkLinePointCollision(lineStart, lineEnd, lineWidth, point) {
    let edgeLength = getDistanceOf(lineStart, lineEnd);
    let distSum = getDistanceOf(point, lineStart)
                  + getDistanceOf(point, lineEnd);
    return distSum >= edgeLength - lineWidth
        && distSum <= edgeLength + lineWidth;
}

/**
 * Checa se a a linha L1 intersecta a linha L2.
 * Explicação: http://jeffreythompson.org/collision-detection/line-line.php
 *
 *      ╱
 *  L1 ╱     ╷
 *    ╱      │ L2
 */
export function checkLineLineCollision([startA, endA], [startB, endB]) {
    let denominator =   (endA.y - startA.y) * (endB.x - startB.x)
                      - (endA.x - startA.x) * (endB.y - startB.y);
    let uA = (  (endA.x - startA.x) * (startB.y - startA.y)
              - (endA.y - startA.y) * (startB.x - startA.x))
             / denominator;
    let uB = (  (endB.x - startB.x) * (startB.y - startA.y)
              - (endB.y - startB.y) * (startB.x - startA.x))
             / denominator;

    return    uA >= 0 && uA <= 1
           && uB >= 0 && uB <= 1;
}

/**
 * Calcula o ponto que a partir do centro do círculo, dado um ângulo, toca
 * na borda desse círculo.
 */
export function pointFromCircleAngle(circleMid, circleRadius, angle) {
    return {
        x: circleMid.x + (circleRadius * Math.cos(angle)),
        y: circleMid.y + (circleRadius * Math.sin(angle))
    }
}
/**
 * Rotaciona um ponto.
 */
export function rotatePoint(point, angle) {
    return {
        x: (point.x * Math.cos(angle)) - (point.y * Math.sin(angle)),
        y: (point.x * Math.sin(angle)) + (point.y * Math.cos(angle))
    }
}

/**
 *
 *
 */
export function translateWithAngle(point, angle, offsetX, offsetY) {
    return {
        x: point.x + Math.cos(angle) * offsetX,
        y: point.y + Math.sin(angle) * offsetY
    }
}