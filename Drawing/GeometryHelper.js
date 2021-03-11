import { getDistanceOf } from "../Structure/Utilities.js";

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

/**
 * Checa se o retângulo R, definido pelos seus lados, colide com o quadrado S,
 * definido pelo ponto central e o tamanho dos lados.
 *
 *  ┌───────┐
 *  │   R   │   ┌───┐
 *  └───────┘   │ S │
 *              └───┘
 */
export function checkRectangleSquareCollision({rectLeft, rectTop, rectRight, rectBottom},
                                              squareMid, squareLength) {
    let offset = squareLength/2;
    return squareMid.x + offset > rectLeft && squareMid.x - offset < rectRight
           && squareMid.y + offset > rectTop && squareMid.y - offset < rectBottom;
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
        left = cornerA.x
        right = cornerB.x
    } else {
        right = cornerA.x
        left = cornerB.x
    }
    if (cornerA.y < cornerB.y) {
        top = cornerA.y
        bottom = cornerB.y
    } else {
        bottom = cornerA.y
        top = cornerB.y
    }
    return left < point.x && top < point.y && right > point.x && bottom > point.y;
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